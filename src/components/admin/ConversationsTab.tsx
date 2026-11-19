import { useCallback, useEffect, useRef, useState } from "react";
import {
  MessageSquare,
  AlertTriangle,
  Download,
  Database,
  Send,
  Sparkles,
  Clock,
  Globe,
  User,
  Bot,
  RefreshCw,
  Cpu,
  Save,
  RotateCcw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  DoorOpen,
  CheckCircle2,
  Trophy,
  Crown,
  Zap,
  Wand2,
} from "lucide-react";
import { useToast } from "../Toast";
import { get, post, put, fetchBlob, dateTimeFmt, errMsg } from "../../lib/admin";
import { createVoicePlayer, type VoicePlayer } from "../../lib/voicePlayer";
import AiVoiceWave from "../AiVoiceWave";
import { Badge, Button, Card, EmptyState, Field, SectionHeader, TableSkeleton, inputCls } from "./ui";

interface ConversationSummary {
  session_id: string;
  turns: number;
  created_at: string;
  updated_at: string;
  last_message?: string | null;
}

interface MessageDetail {
  id: number;
  role: "user" | "model" | string;
  text: string;
  intent?: string | null;
  language?: string | null;
  sentiment?: string | null;
  latency_ms?: number | null;
  created_at: string;
}

interface EscalationItem {
  message_id: number;
  session_id: string;
  intent?: string | null;
  sentiment?: string | null;
  reply: string;
  created_at: string;
  kb_miss?: boolean | null;
}

interface ConciergeConfig {
  custom_rules: string;
  house_rules: string;
  breakfast_and_dining_info: string;
  local_area_tips: string;
}

interface ConciergeStats {
  rooms_count: number;
  units_count: number;
  places_count: number;
  menu_items_count: number;
  facilities_count: number;
  coupons_count: number;
  knowledge_docs_count: number;
  tools_count: number;
}

interface UnitChoice {
  unit_number: string;
  room_title: string;
  base_price: number;
}

interface SimResult {
  reply: string;
  intent: string;
  language: string;
  tools_used: string[];
  retrieved_docs: string[];
  latency_ms: number;
  cta?: { label: string; url: string } | null;
}

interface ExecutiveSummary {
  today_date: string;
  most_expensive_booking?: {
    booking_code: string;
    guest_name: string;
    guest_email: string;
    guest_phone?: string;
    room_title: string;
    unit_number: string;
    total_price_ron: number;
    nights: number;
    check_in: string | null;
    check_out: string | null;
  } | null;
  top_room_type?: {
    room_title: string;
    total_revenue_ron: number;
    bookings_count: number;
    total_nights: number;
  } | null;
  top_unit?: {
    unit_number: string;
    room_title: string;
    total_revenue_ron: number;
    bookings_count: number;
  } | null;
  top_vip_guest?: {
    guest_name: string;
    guest_email: string;
    bookings_count: number;
    total_spent_ron: number;
    favorite_room: string;
  } | null;
  revenue_accommodation_total_ron: number;
  revenue_room_service_total_ron: number;
  room_service_orders_count: number;
  total_combined_revenue_ron: number;
  occupancy: {
    occupied: number;
    vacant: number;
    total: number;
  };
  telegram_configured: boolean;
}

interface DbTurn {
  id: string;
  question: string;
  responseHtml: string;
  plainSummary: string;
  intent: string;
  bookingCode?: string | null;
  telegramSent?: boolean;
}

const SIMULATOR_PRESETS = [
  "Ce paste și fructe de mare aveți la restaurant și cât costă?",
  "Ce pot face și ce nu am voie în cameră? Care este parola Wi-Fi?",
  "Trimite-mi în camera 201 un Aperol Spritz și un Tiramisu pe nota camerei.",
  "Avem nevoie de încă 2 prosoape mari în camera 201.",
  "Ce oferte, cupoane de reducere și atracții turistice aveți în zonă?",
];

const QUICK_DB_QUESTIONS = [
  "Care a fost cea mai scumpă cameră care s-a închiriat, cât mi-a adus și cine a făcut rezervarea?",
  "Care tip de cameră mi-a adus cei mai mulți bani în total și câte rezervări are?",
  "Cine este clientul care a cheltuit cei mai mulți bani la hotel (Top VIP)?",
  "Ce camere sunt libere în acest moment și ce camere sunt ocupate?",
  "Cine sosește azi la check-in și cine eliberează camera?",
  "Ce încasări și ce comenzi avem la Room Service?",
  "Avem vreo problemă sau tichet de mentenanță nerezolvat?",
];

const AGENTIC_ACTION_PRESETS = [
  "Marchează camera 201 ca igienizată și curată",
  "Creează un cupon de 15% reducere cu codul VARA15",
  "Schimbă ultima comandă de room service în livrată",
  "Trimite pe e-mail codul PIN și confirmarea către oaspetele din camera 301",
  "Generează un cod PIN nou pentru camera 301",
  "Marchează tichetul de mentenanță din camera 201 ca rezolvat",
];

export default function ConversationsTab() {
  const { toast } = useToast();
  const [subTab, setSubTab] = useState<"ask_db" | "ai_concierge" | "conversations" | "escalations">("ask_db");

  // Natural Language DB Query & Executive AI state
  const [dbSessionId, setDbSessionId] = useState<string>(() => `admin-web-${Date.now()}`);
  const [dbQuestion, setDbQuestion] = useState(
    "Care a fost cea mai scumpă cameră care s-a închiriat, cât mi-a adus și cine a făcut-o?",
  );
  const [dbTurns, setDbTurns] = useState<DbTurn[]>([]);
  const [askingDb, setAskingDb] = useState(false);
  const [execSummary, setExecSummary] = useState<ExecutiveSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [sendToTelegram, setSendToTelegram] = useState(false);
  const [dbVoiceEnabled, setDbVoiceEnabled] = useState(true);
  const [dbSpeaking, setDbSpeaking] = useState(false);
  const [dbListening, setDbListening] = useState(false);
  const dbVoiceRef = useRef(true);
  const dbVoicePlayerRef = useRef<VoicePlayer | null>(null);
  const dbRecRef = useRef<any>(null);

  // Smart Concierge Config & Simulator state
  const [conciergeCfg, setConciergeCfg] = useState<ConciergeConfig>({
    custom_rules: "",
    house_rules: "",
    breakfast_and_dining_info: "",
    local_area_tips: "",
  });
  const [conciergeDefaults, setConciergeDefaults] = useState<ConciergeConfig | null>(null);
  const [conciergeStats, setConciergeStats] = useState<ConciergeStats | null>(null);
  const [conciergeUnits, setConciergeUnits] = useState<UnitChoice[]>([]);
  const [loadingCfg, setLoadingCfg] = useState(false);
  const [savingCfg, setSavingCfg] = useState(false);

  const [simRoom, setSimRoom] = useState<string>("201");
  const [simInput, setSimInput] = useState<string>(SIMULATOR_PRESETS[0]);
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const [simListening, setSimListening] = useState(false);
  const [simVoiceEnabled, setSimVoiceEnabled] = useState(true);
  const [simSpeaking, setSimSpeaking] = useState(false);
  const simVoiceRef = useRef(true);
  const simVoicePlayerRef = useRef<VoicePlayer | null>(null);
  const simRecRef = useRef<any>(null);

  // Conversations & Escalations state
  const [sessions, setSessions] = useState<ConversationSummary[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageDetail[]>([]);
  const [escalations, setEscalations] = useState<EscalationItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadOverview = useCallback(async () => {
    setLoadingList(true);
    try {
      const [convData, escData] = await Promise.all([
        get<ConversationSummary[]>("/api/chat/admin/conversations?limit=50").catch(() => []),
        get<EscalationItem[]>("/api/chat/admin/escalations?limit=50").catch(() => []),
      ]);
      const convArr = Array.isArray(convData) ? convData : [];
      setSessions(convArr);
      setEscalations(Array.isArray(escData) ? escData : []);
      if (convArr.length > 0 && !selectedSessionId) {
        setSelectedSessionId(convArr[0].session_id);
      }
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setLoadingList(false);
    }
  }, [selectedSessionId, toast]);

  const loadConciergeConfig = useCallback(async () => {
    setLoadingCfg(true);
    try {
      const res = await get<{
        config: ConciergeConfig;
        defaults: ConciergeConfig;
        stats: ConciergeStats;
        units: UnitChoice[];
      }>("/api/chat/admin/concierge-config");
      if (res?.config) setConciergeCfg(res.config);
      if (res?.defaults) setConciergeDefaults(res.defaults);
      if (res?.stats) setConciergeStats(res.stats);
      if (Array.isArray(res?.units)) setConciergeUnits(res.units);
    } catch {
      // ignore if backend restarts
    } finally {
      setLoadingCfg(false);
    }
  }, []);

  const loadExecutiveSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const data = await get<ExecutiveSummary>("/api/telegram/executive-summary");
      if (data) setExecSummary(data);
    } catch {
      // ignore transient errors if not configured
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
    void loadConciergeConfig();
    void loadExecutiveSummary();
  }, [loadOverview, loadConciergeConfig, loadExecutiveSummary]);

  const handleSaveConciergeConfig = async () => {
    setSavingCfg(true);
    try {
      const res = await put<{ config: ConciergeConfig; stats: ConciergeStats }>(
        "/api/chat/admin/concierge-config",
        conciergeCfg,
      );
      if (res?.config) setConciergeCfg(res.config);
      if (res?.stats) setConciergeStats(res.stats);
      toast("Regulile și contextul AI Concierge au fost salvate live!", "success");
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setSavingCfg(false);
    }
  };

  const handleResetConciergeDefaults = () => {
    if (!conciergeDefaults) return;
    setConciergeCfg(conciergeDefaults);
    toast("Câmpurile au fost completate cu șablonul implicit. Apasă Salvează pentru a aplica.", "info");
  };

  useEffect(() => {
    simVoicePlayerRef.current = createVoicePlayer(setSimSpeaking);
    return () => {
      simVoicePlayerRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    simVoiceRef.current = simVoiceEnabled;
    if (!simVoiceEnabled) {
      simVoicePlayerRef.current?.stop();
    }
  }, [simVoiceEnabled]);

  const handleRunSimulator = async (qOverride?: string) => {
    const q = (qOverride ?? simInput).trim();
    if (!q || simLoading) return;
    if (qOverride) setSimInput(qOverride);
    simVoicePlayerRef.current?.stop();
    setSimLoading(true);
    try {
      const res = await post<any>("/api/chat/", {
        message: q,
        history: [],
        session_id: `admin-sim-${simRoom || "public"}`,
        context: { room_number: simRoom },
      });
      const finalReply = res.reply || "Fără răspuns.";
      const replyLang = res.language || "ro";
      setSimResult({
        reply: finalReply,
        intent: res.intent || "other",
        language: replyLang,
        tools_used: res.meta?.tools_used || [],
        retrieved_docs: res.meta?.retrieved_docs || [],
        latency_ms: res.meta?.latency_ms || 0,
        cta: res.cta || null,
      });
      if (simVoiceRef.current && res.reply) {
        void simVoicePlayerRef.current?.speak(finalReply, replyLang);
      }
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setSimLoading(false);
    }
  };

  const speakSimulatorReply = (text: string, lang: string = "ro") => {
    if (!text) return;
    if (simSpeaking) {
      simVoicePlayerRef.current?.stop();
      return;
    }
    void simVoicePlayerRef.current?.speak(text, lang);
  };

  useEffect(() => {
    dbVoicePlayerRef.current = createVoicePlayer(setDbSpeaking);
    return () => {
      dbVoicePlayerRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    dbVoiceRef.current = dbVoiceEnabled;
    if (!dbVoiceEnabled) {
      dbVoicePlayerRef.current?.stop();
    }
  }, [dbVoiceEnabled]);

  const startSpeechDictation = ({
    isListening,
    recRef,
    onStopVoice,
    onListeningChange,
    onTextUpdate,
    onSubmitFinal,
  }: {
    isListening: boolean;
    recRef: { current: any };
    onStopVoice: () => void;
    onListeningChange: (v: boolean) => void;
    onTextUpdate: (txt: string) => void;
    onSubmitFinal: (txt: string) => void;
  }) => {
    if (typeof window === "undefined") return;
    onStopVoice();
    if (isListening && recRef.current) {
      recRef.current.stop();
      onListeningChange(false);
      return;
    }
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      toast("Browserul tău nu suportă recunoașterea vocală nativă (folosește Chrome/Edge).", "error");
      return;
    }
    try {
      const rec = new SpeechRec();
      rec.lang = "ro-RO";
      rec.interimResults = true;
      let finalTxt = "";
      rec.onstart = () => onListeningChange(true);
      rec.onresult = (ev: any) => {
        let interim = "";
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const t = ev.results[i][0].transcript;
          if (ev.results[i].isFinal) finalTxt += t + " ";
          else interim += t;
        }
        onTextUpdate((finalTxt + interim).trim());
      };
      rec.onerror = () => onListeningChange(false);
      rec.onend = () => {
        onListeningChange(false);
        if (finalTxt.trim()) onSubmitFinal(finalTxt.trim());
      };
      recRef.current = rec;
      rec.start();
    } catch {
      onListeningChange(false);
    }
  };

  const toggleSimVoice = () => {
    startSpeechDictation({
      isListening: simListening,
      recRef: simRecRef,
      onStopVoice: () => simVoicePlayerRef.current?.stop(),
      onListeningChange: setSimListening,
      onTextUpdate: setSimInput,
      onSubmitFinal: (t) => void handleRunSimulator(t),
    });
  };

  const toggleDbVoice = () => {
    startSpeechDictation({
      isListening: dbListening,
      recRef: dbRecRef,
      onStopVoice: () => dbVoicePlayerRef.current?.stop(),
      onListeningChange: setDbListening,
      onTextUpdate: setDbQuestion,
      onSubmitFinal: (t) => void handleAskDatabase(t),
    });
  };

  useEffect(() => {
    if (!selectedSessionId) {
      setMessages([]);
      return;
    }
    let active = true;
    setLoadingMessages(true);
    get<MessageDetail[]>(`/api/chat/admin/conversations/${encodeURIComponent(selectedSessionId)}`)
      .then((res) => {
        if (active) setMessages(Array.isArray(res) ? res : []);
      })
      .catch(() => {
        if (active) setMessages([]);
      })
      .finally(() => {
        if (active) setLoadingMessages(false);
      });
    return () => {
      active = false;
    };
  }, [selectedSessionId]);

  const handleAskDatabase = async (qOverride?: string) => {
    const q = (qOverride ?? dbQuestion).trim();
    if (!q || askingDb) return;
    if (qOverride) setDbQuestion(qOverride);
    dbVoicePlayerRef.current?.stop();
    setAskingDb(true);
    try {
      const res = await post<{
        response: string;
        plain_summary?: string;
        intent: string;
        booking_code?: string | null;
        telegram_sent?: boolean;
      }>("/api/telegram/ask-db", {
        question: q,
        session_id: dbSessionId,
        send_to_telegram: sendToTelegram,
      });
      const htmlResp = res.response || "Nu a fost returnat niciun răspuns.";
      const plainResp =
        res.plain_summary || htmlResp.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      setDbTurns((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          question: q,
          responseHtml: htmlResp,
          plainSummary: plainResp,
          intent: res.intent || "db_query",
          bookingCode: res.booking_code ?? null,
          telegramSent: Boolean(res.telegram_sent),
        },
      ]);
      setDbQuestion("");
      if (res.intent?.startsWith("action_")) {
        void loadExecutiveSummary();
      }
      if (res.telegram_sent) {
        toast("Raportul a fost trimis și pe Telegram!", "success");
      }
      if (dbVoiceRef.current && plainResp) {
        void dbVoicePlayerRef.current?.speak(plainResp, "ro");
      }
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setAskingDb(false);
    }
  };

  const handleResetDbChat = async () => {
    dbVoicePlayerRef.current?.stop();
    try {
      await post("/api/telegram/ask-db/reset", { session_id: dbSessionId });
    } catch {
      // ignore
    }
    setDbSessionId(`admin-web-${Date.now()}`);
    setDbTurns([]);
    setDbQuestion("Care a fost cea mai scumpă cameră care s-a închiriat, cât mi-a adus și cine a făcut-o?");
    toast("Conversația executivă a fost resetată.", "info");
  };

  const speakDbReply = (plainText: string) => {
    if (!plainText) return;
    if (dbSpeaking) {
      dbVoicePlayerRef.current?.stop();
      return;
    }
    void dbVoicePlayerRef.current?.speak(plainText, "ro");
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const blob = await fetchBlob("/api/chat/admin/export");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `conversatii-oaspeti-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast("Exportul CSV a fost descărcat!", "success");
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Interogare directă și dialog cu oaspeții"
        title="Asistent pentru baza de date și conversații"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                void loadOverview();
                void loadConciergeConfig();
                void loadExecutiveSummary();
              }}
            >
              <RefreshCw size={14} /> Reîmprospătează
            </Button>
            <Button variant="gold" onClick={handleExportCsv} disabled={exporting}>
              <Download size={14} /> {exporting ? "Se exportă..." : "Exportă conversații CSV"}
            </Button>
          </div>
        }
      />

      {/* ── SELECTOR MODURI ── */}
      <div className="flex flex-wrap gap-2 border-b border-[#e1e8f0]">
        <button
          type="button"
          onClick={() => setSubTab("ask_db")}
          className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-[12px] font-bold uppercase tracking-[0.14em] transition-colors cursor-pointer ${
            subTab === "ask_db"
              ? "border-[#c69a3f] text-[#0d2c5c]"
              : "border-transparent text-[#6b7c99] hover:text-[#0d2c5c]"
          }`}
        >
          <Database size={15} className="text-[#c69a3f]" />
          Întreabă baza de date
        </button>

        <button
          type="button"
          onClick={() => setSubTab("ai_concierge")}
          className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-[12px] font-bold uppercase tracking-[0.14em] transition-colors cursor-pointer ${
            subTab === "ai_concierge"
              ? "border-[#c69a3f] text-[#0d2c5c]"
              : "border-transparent text-[#6b7c99] hover:text-[#0d2c5c]"
          }`}
        >
          <Cpu size={15} className="text-[#c69a3f]" />
          Configurare & Simulator AI
        </button>

        <button
          type="button"
          onClick={() => setSubTab("conversations")}
          className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-[12px] font-bold uppercase tracking-[0.14em] transition-colors cursor-pointer ${
            subTab === "conversations"
              ? "border-[#c69a3f] text-[#0d2c5c]"
              : "border-transparent text-[#6b7c99] hover:text-[#0d2c5c]"
          }`}
        >
          <MessageSquare size={15} />
          Conversații cu oaspeții ({sessions.length})
        </button>

        <button
          type="button"
          onClick={() => setSubTab("escalations")}
          className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-[12px] font-bold uppercase tracking-[0.14em] transition-colors cursor-pointer ${
            subTab === "escalations"
              ? "border-[#c69a3f] text-[#0d2c5c]"
              : "border-transparent text-[#6b7c99] hover:text-[#0d2c5c]"
          }`}
        >
          <AlertTriangle size={15} className="text-amber-600" />
          Alerte și escaladări ({escalations.length})
        </button>
      </div>

      {/* ── SUB-TAB: CONFIGURARE & SIMULATOR SMART AI CONCIERGE ── */}
      {subTab === "ai_concierge" && (
        <div className="space-y-6">
          {/* Statistici live creier AI */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <Card className="p-4 border-[#e1e8f0]">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#6b7c99] block">
                Camere & Unități Live
              </span>
              <span className="text-2xl font-bold text-[#0d2c5c] mt-1 block">
                {conciergeStats?.rooms_count ?? "—"} tipuri · {conciergeStats?.units_count ?? "—"} uși
              </span>
            </Card>
            <Card className="p-4 border-[#e1e8f0]">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#6b7c99] block">
                Meniu Restaurant, Bar & SPA
              </span>
              <span className="text-2xl font-bold text-[#0d2c5c] mt-1 block">
                {conciergeStats?.menu_items_count ?? "—"} produse
              </span>
            </Card>
            <Card className="p-4 border-[#e1e8f0]">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#6b7c99] block">
                Locații & Cupoane
              </span>
              <span className="text-2xl font-bold text-[#0d2c5c] mt-1 block">
                {conciergeStats?.places_count ?? "—"} locuri · {conciergeStats?.coupons_count ?? "—"} coduri
              </span>
            </Card>
            <Card className="p-4 border-[#c69a3f]/40 bg-[#fdf8ec]">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#8a6420] block">
                Unelte Gemini Active
              </span>
              <span className="text-2xl font-bold text-[#0d2c5c] mt-1 block">
                {conciergeStats?.tools_count ?? 9} funcții + {conciergeStats?.knowledge_docs_count ?? 15} RAG
              </span>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Coloana Stângă: Editor Reguli & Context Hotel */}
            <Card className="lg:col-span-6 p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#e1e8f0]">
                <div>
                  <h3 className="text-[19px] font-bold text-[#0d2c5c] flex items-center gap-2 font-['Outfit',sans-serif]">
                    <Sparkles size={18} className="text-[#c69a3f]" />
                    Reguli Cameră, Program & Creier AI
                  </h3>
                  <p className="text-[12.5px] text-[#6b7c99] mt-0.5">
                    Orice modifici și salvezi aici devine instant adevărul oficial folosit de Esy pentru oaspeții din camere și vizitatorii publici.
                  </p>
                </div>
                <Badge tone="green">Gratuit · Gemini + DB</Badge>
              </div>

              {loadingCfg ? (
                <TableSkeleton rows={4} />
              ) : (
                <div className="space-y-4">
                  <Field label="Reguli în Cameră (Ce are voie și ce NU are voie oaspetele)">
                    <textarea
                      rows={4}
                      value={conciergeCfg.house_rules}
                      onChange={(e) => setConciergeCfg((p) => ({ ...p, house_rules: e.target.value }))}
                      className={`${inputCls} resize-y text-[13px]`}
                      placeholder="Ex: Fumatul interzis în interior, permis pe balcon..."
                    />
                  </Field>

                  <Field label="Program Mese, Mic Dejun, Restaurant, Bar & Room Service">
                    <textarea
                      rows={4}
                      value={conciergeCfg.breakfast_and_dining_info}
                      onChange={(e) =>
                        setConciergeCfg((p) => ({ ...p, breakfast_and_dining_info: e.target.value }))
                      }
                      className={`${inputCls} resize-y text-[13px]`}
                    />
                  </Field>

                  <Field label="Recomandări Locale & Atracții Eforie Nord / Constanța">
                    <textarea
                      rows={3}
                      value={conciergeCfg.local_area_tips}
                      onChange={(e) =>
                        setConciergeCfg((p) => ({ ...p, local_area_tips: e.target.value }))
                      }
                      className={`${inputCls} resize-y text-[13px]`}
                    />
                  </Field>

                  <Field label="Instrucțiuni Suplimentare Personalizate (Parcare, Animale, Smart Lock)">
                    <textarea
                      rows={3}
                      value={conciergeCfg.custom_rules}
                      onChange={(e) => setConciergeCfg((p) => ({ ...p, custom_rules: e.target.value }))}
                      className={`${inputCls} resize-y text-[13px]`}
                    />
                  </Field>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                    <Button variant="ghost" onClick={handleResetConciergeDefaults} disabled={!conciergeDefaults}>
                      <RotateCcw size={14} /> Resetează la șablon
                    </Button>
                    <Button variant="gold" onClick={() => void handleSaveConciergeConfig()} disabled={savingCfg}>
                      <Save size={14} />
                      {savingCfg ? "Se salvează..." : "Salvează în Creierul AI"}
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Coloana Dreaptă: Simulator Interactiv Live Stil Alexa / In-Room */}
            <div className="lg:col-span-6 relative overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-br from-[#071126] via-[#0d1c3a] to-[#081225] p-6 sm:p-7 space-y-5 shadow-[0_24px_64px_rgba(6,13,31,0.34)] text-white">
              {/* Top Iridescent AI Aurora Bar */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-[2.5px]"
                style={{
                  background:
                    "linear-gradient(90deg, #38bdf8 0%, #6366f1 35%, #a855f7 65%, #e6b85c 100%)",
                }}
              />
              {/* Ambient Neural Glows */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#c69a3f]/15 blur-3xl"
              />

              {/* Header */}
              <div className="relative z-10 flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-white/10">
                <div className="flex items-start gap-3.5">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-violet-600 shadow-[0_0_28px_rgba(99,102,241,0.55)] ring-1 ring-white/25">
                    <Bot size={22} className="text-white drop-shadow" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#0a1630] bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-[19px] font-bold tracking-tight text-white font-['Outfit',sans-serif]">
                        Simulator Live · Voce &amp; Mod Cameră
                      </h3>
                    </div>
                    <p className="text-[12.5px] text-slate-300/85 mt-0.5 leading-relaxed">
                      Testează orice întrebare sau comandă de Room Service exact ca un oaspete din cameră.
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.18)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Funcții Reale Active
                </span>
              </div>

              {/* Room Context Keycard Selector */}
              <div className="relative z-10 rounded-2xl bg-white/[0.05] border border-white/12 p-3.5 backdrop-blur-md flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-[#f3cf7a] flex items-center gap-1.5 shrink-0">
                  <DoorOpen size={15} className="text-[#e6b85c]" /> Simulează din:
                </span>
                <select
                  value={simRoom}
                  onChange={(e) => setSimRoom(e.target.value)}
                  className="flex-1 rounded-xl border border-white/15 bg-[#0b172e]/90 px-3.5 py-2 text-[13px] font-medium text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 cursor-pointer"
                >
                  <option value="" className="bg-[#0b172a] text-white">
                    🌐 Vizitator Public (fără cameră)
                  </option>
                  {conciergeUnits.length > 0 ? (
                    conciergeUnits.map((u) => (
                      <option key={u.unit_number} value={u.unit_number} className="bg-[#0b172a] text-white">
                        🔑 Camera {u.unit_number} — {u.room_title} ({u.base_price} RON)
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="101" className="bg-[#0b172a] text-white">🔑 Camera 101 — Standard Twin Room</option>
                      <option value="201" className="bg-[#0b172a] text-white">🔑 Camera 201 — Deluxe Double Room</option>
                      <option value="301" className="bg-[#0b172a] text-white">🔑 Camera 301 — Luxury Suite</option>
                      <option value="401" className="bg-[#0b172a] text-white">🔑 Camera 401 — Family Room</option>
                    </>
                  )}
                </select>
              </div>

              {/* Glowing AI Prompt Bar */}
              <div className="relative z-10 flex flex-col sm:flex-row gap-2.5">
                <div className="flex flex-1 items-center gap-2.5 rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-2.5 backdrop-blur-md transition focus-within:border-cyan-400/60 focus-within:bg-white/[0.09] focus-within:ring-2 focus-within:ring-cyan-400/20">
                  <Wand2 size={16} className="text-cyan-300 shrink-0" />
                  <input
                    value={simInput}
                    onChange={(e) => setSimInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleRunSimulator();
                    }}
                    placeholder={simListening ? "Vorbește acum..." : "Întreabă sau comandă în cameră..."}
                    className="w-full bg-transparent text-[13.5px] text-white placeholder:text-slate-400 outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={toggleSimVoice}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-2xl px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider transition cursor-pointer ${
                    simListening
                      ? "bg-rose-500/90 text-white shadow-[0_0_24px_rgba(244,63,94,0.55)] animate-pulse"
                      : "border border-white/15 bg-white/[0.07] text-slate-200 hover:bg-white/[0.14] hover:border-cyan-400/40"
                  }`}
                >
                  {simListening ? <MicOff size={15} /> : <Mic size={15} />}
                  {simListening ? "Ascult..." : "Voce"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleRunSimulator()}
                  disabled={simLoading || !simInput.trim()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#d4a64a] via-[#e6b85c] to-[#c69a3f] px-5 py-2.5 text-[12px] font-extrabold uppercase tracking-wider text-[#081225] shadow-[0_8px_24px_rgba(230,184,92,0.35)] transition hover:brightness-110 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer shrink-0"
                >
                  <Send size={14} /> {simLoading ? "Gândește..." : "Testează"}
                </button>
              </div>

              {/* Scenarii Rapide */}
              <div className="relative z-10">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-slate-400 block mb-2.5">
                  Scenarii de test rapide:
                </span>
                <div className="flex flex-wrap gap-2">
                  {SIMULATOR_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => void handleRunSimulator(preset)}
                      className="text-left rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11.5px] font-medium text-slate-200 hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:text-white transition-all duration-150 cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative z-10">
                <AiVoiceWave
                  active={simSpeaking || simListening}
                  mode={simListening ? "listening" : "speaking"}
                  theme="dark"
                  label={
                    simListening
                      ? "Simulatorul ascultă vocea ta..."
                      : "Concierge AI redă răspunsul vocal..."
                  }
                  onStop={() => {
                    if (simListening) toggleSimVoice();
                    else simVoicePlayerRef.current?.stop();
                  }}
                  compact
                />
              </div>

              {simLoading && (
                <div className="relative z-10 rounded-2xl border border-indigo-400/25 bg-indigo-500/10 p-4 flex items-center gap-3 animate-pulse">
                  <span className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-violet-500 shadow-[0_0_18px_rgba(99,102,241,0.6)] shrink-0" />
                  <div className="space-y-1">
                    <div className="text-[13px] font-semibold text-white">Esy Concierge AI procesează...</div>
                    <div className="text-[11.5px] text-slate-300">Verifică baza de cunoștințe RAG, disponibilitatea și instrumentele live.</div>
                  </div>
                </div>
              )}

              {!simLoading && simResult && (
                <div className="relative z-10 rounded-2xl border border-[#e6b85c]/25 bg-white/[0.06] backdrop-blur-md p-5 shadow-lg space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#f3cf7a] flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-400" /> Răspuns Concierge AI
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setSimVoiceEnabled((v) => !v)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider transition cursor-pointer ${
                          simVoiceEnabled
                            ? "bg-[#e6b85c]/20 border border-[#e6b85c]/45 text-[#f3cf7a]"
                            : "bg-white/[0.06] border border-white/12 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        {simVoiceEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
                        {simVoiceEnabled ? "Auto-Voce ON" : "Auto-Voce OFF"}
                      </button>
                      <button
                        type="button"
                        onClick={() => speakSimulatorReply(simResult.reply, simResult.language)}
                        className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 border border-indigo-400/35 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-indigo-200 hover:bg-indigo-500/35 transition cursor-pointer"
                      >
                        {simSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                        {simSpeaking ? "Oprește" : "Ascultă"}
                      </button>
                      <span className="rounded-full bg-white/10 border border-white/15 px-2.5 py-1 text-[10.5px] font-mono font-semibold text-cyan-200">
                        {simResult.latency_ms} ms
                      </span>
                    </div>
                  </div>

                  <p className="text-[13.5px] leading-relaxed text-slate-100 whitespace-pre-line">
                    {simResult.reply}
                  </p>

                  <div className="pt-3 border-t border-white/10 flex flex-wrap gap-1.5 text-[10.5px]">
                    <span className="rounded-lg bg-white/10 border border-white/10 px-2.5 py-0.5 font-semibold text-slate-200">
                      Intent: {simResult.intent}
                    </span>
                    <span className="rounded-lg bg-white/10 border border-white/10 px-2.5 py-0.5 font-semibold text-slate-200">
                      Limbă: {simResult.language.toUpperCase()}
                    </span>
                    {simResult.tools_used.length > 0 ? (
                      simResult.tools_used.map((tl, idx) => (
                        <span
                          key={`${tl}-${idx}`}
                          className="rounded-lg bg-emerald-400/15 border border-emerald-400/35 px-2.5 py-0.5 font-bold text-emerald-300"
                        >
                          ⚡ Tool: {tl}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-lg bg-amber-400/15 border border-amber-400/30 px-2.5 py-0.5 font-semibold text-amber-200">
                        Context direct din System Prompt
                      </span>
                    )}
                    {simResult.cta && (
                      <span className="rounded-lg bg-[#e6b85c]/20 border border-[#e6b85c]/40 px-2.5 py-0.5 font-bold text-[#f3cf7a]">
                        CTA: {simResult.cta.label} ({simResult.cta.url})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 1: ÎNTREABĂ BAZA DE DATE ÎN LIMBAJ NATURAL ── */}
      {subTab === "ask_db" && (
        <div className="space-y-6">
          {/* Carduri Executive Live */}
          {loadingSummary && !execSummary ? (
            <TableSkeleton rows={2} />
          ) : (
            execSummary && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <button
                  type="button"
                  onClick={() =>
                    void handleAskDatabase(
                      "Care a fost cea mai scumpă cameră care s-a închiriat, cât mi-a adus și cine a făcut rezervarea?",
                    )
                  }
                  className="text-left rounded-2xl border border-[#e5dcc3] bg-gradient-to-br from-[#fffdf7] to-[#fdf6e2] p-4 shadow-xs hover:border-[#c69a3f] transition cursor-pointer"
                >
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#9a7222] flex items-center gap-1.5">
                    <Trophy size={13} className="text-[#c69a3f]" /> Cea Mai Scumpă Închiriere
                  </span>
                  {execSummary.most_expensive_booking ? (
                    <>
                      <span className="text-xl font-bold text-[#0d2c5c] mt-1.5 block">
                        {execSummary.most_expensive_booking.total_price_ron.toLocaleString("ro-RO", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        RON
                      </span>
                      <span className="text-[12px] font-semibold text-[#0d2c5c] block truncate mt-0.5">
                        {execSummary.most_expensive_booking.room_title} · Cam.{" "}
                        {execSummary.most_expensive_booking.unit_number}
                      </span>
                      <span className="text-[11px] text-[#6b7c99] block truncate">
                        Oaspete: {execSummary.most_expensive_booking.guest_name} (
                        {execSummary.most_expensive_booking.booking_code})
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-[#6b7c99] mt-2 block">Fără rezervări încă</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void handleAskDatabase(
                      "Care este clasamentul camerelor după încasări și câte rezervări are fiecare cameră?",
                    )
                  }
                  className="text-left rounded-2xl border border-[#e1e8f0] bg-white p-4 shadow-xs hover:border-[#c69a3f] transition cursor-pointer"
                >
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#6b7c99] flex items-center gap-1.5">
                    <DoorOpen size={13} className="text-[#2f6fd6]" /> Top Cameră (Venit Cumulat)
                  </span>
                  {execSummary.top_room_type ? (
                    <>
                      <span className="text-xl font-bold text-[#0d2c5c] mt-1.5 block">
                        {execSummary.top_room_type.total_revenue_ron.toLocaleString("ro-RO", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        RON
                      </span>
                      <span className="text-[12px] font-semibold text-[#0d2c5c] block truncate mt-0.5">
                        {execSummary.top_room_type.room_title}
                      </span>
                      <span className="text-[11px] text-[#6b7c99] block">
                        {execSummary.top_room_type.bookings_count} rezervări ·{" "}
                        {execSummary.top_room_type.total_nights} nopți
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-[#6b7c99] mt-2 block">Fără date încă</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void handleAskDatabase(
                      "Cine sunt top clienții VIP care au cheltuit cei mai mulți bani la hotel?",
                    )
                  }
                  className="text-left rounded-2xl border border-[#e1e8f0] bg-white p-4 shadow-xs hover:border-[#c69a3f] transition cursor-pointer"
                >
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#6b7c99] flex items-center gap-1.5">
                    <Crown size={13} className="text-[#c69a3f]" /> Top Oaspete VIP
                  </span>
                  {execSummary.top_vip_guest ? (
                    <>
                      <span className="text-xl font-bold text-[#0d2c5c] mt-1.5 block">
                        {execSummary.top_vip_guest.total_spent_ron.toLocaleString("ro-RO", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        RON
                      </span>
                      <span className="text-[12px] font-semibold text-[#0d2c5c] block truncate mt-0.5">
                        {execSummary.top_vip_guest.guest_name}
                      </span>
                      <span className="text-[11px] text-[#6b7c99] block truncate">
                        {execSummary.top_vip_guest.bookings_count} rezervări ·{" "}
                        {execSummary.top_vip_guest.favorite_room}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-[#6b7c99] mt-2 block">Fără oaspeți încă</span>
                  )}
                </button>

                <div className="rounded-2xl border border-[#e1e8f0] bg-white p-4 shadow-xs">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#6b7c99] flex items-center gap-1.5">
                    <Sparkles size={13} className="text-emerald-600" /> Venit Total & Bot Telegram
                  </span>
                  <span className="text-xl font-bold text-[#0d2c5c] mt-1.5 block">
                    {execSummary.total_combined_revenue_ron.toLocaleString("ro-RO", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    RON
                  </span>
                  <span className="text-[11.5px] text-[#4f6280] block mt-0.5">
                    Ocupare acum: <b>{execSummary.occupancy.occupied}</b>/{execSummary.occupancy.total} camere ·{" "}
                    {execSummary.room_service_orders_count} comenzi RS
                  </span>
                  <span
                    className={`mt-1 inline-flex items-center gap-1 text-[10.5px] font-bold ${
                      execSummary.telegram_configured ? "text-emerald-700" : "text-amber-700"
                    }`}
                  >
                    ●{" "}
                    {execSummary.telegram_configured
                      ? "Telegram Bot conectat (sync live)"
                      : "Telegram Webhook neconfigurat"}
                  </span>
                </div>
              </div>
            )
          )}

          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#060f22] via-[#0c1a36] to-[#081226] p-6 sm:p-8 space-y-6 shadow-[0_28px_72px_rgba(6,13,31,0.38)] text-white">
            {/* Top Iridescent AI Aurora Bar */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
              style={{
                background:
                  "linear-gradient(90deg, #38bdf8 0%, #6366f1 30%, #a855f7 60%, #e6b85c 100%)",
              }}
            />
            {/* Ambient Neural Orbs */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-28 right-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-[#c69a3f]/15 blur-3xl"
            />

            {/* Header */}
            <div className="relative z-10 flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-white/10">
              <div className="flex items-start gap-4">
                <div className="relative flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-violet-600 shadow-[0_0_32px_rgba(99,102,241,0.55)] ring-1 ring-white/25">
                  <Sparkles size={24} className="text-white drop-shadow" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#09142b] bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-[22px] sm:text-[24px] font-bold tracking-tight text-white font-['Outfit',sans-serif]">
                      Asistent Executiv AI · Bază de Date &amp; Telegram
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      Neural Live
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#e6b85c]/35 bg-[#e6b85c]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#f3cf7a]">
                      RAG Admin + SQL
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-300/85 mt-1 max-w-3xl leading-relaxed">
                    Întreabă orice în limbaj natural, cu memorie conversațională (poți continua cu{" "}
                    <i className="text-cyan-200">„Cine a făcut-o?”</i> sau{" "}
                    <i className="text-cyan-200">„Ce telefon are?”</i>). Același creier inteligent răspunde instant și pe botul tău de Telegram.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDbVoiceEnabled((v) => !v)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${
                    dbVoiceEnabled
                      ? "bg-gradient-to-r from-[#d4a64a] to-[#e6b85c] text-[#081225] shadow-[0_6px_20px_rgba(230,184,92,0.35)]"
                      : "border border-white/15 bg-white/[0.06] text-slate-300 hover:bg-white/[0.12]"
                  }`}
                >
                  {dbVoiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                  {dbVoiceEnabled ? "Auto-Voce ON" : "Auto-Voce OFF"}
                </button>
                {dbTurns.length > 0 && (
                  <button
                    type="button"
                    onClick={() => void handleResetDbChat()}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-200 hover:bg-white/[0.14] hover:border-white/25 transition cursor-pointer"
                  >
                    <RotateCcw size={13} /> Conversație nouă
                  </button>
                )}
              </div>
            </div>

            {/* Hero AI Command Input Bar */}
            <div className="relative z-10 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 backdrop-blur-md transition focus-within:border-indigo-400/70 focus-within:bg-white/[0.09] focus-within:ring-2 focus-within:ring-indigo-400/25">
                  <Sparkles size={17} className="text-[#f3cf7a] shrink-0" />
                  <input
                    value={dbQuestion}
                    onChange={(e) => setDbQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleAskDatabase();
                    }}
                    placeholder={
                      dbListening
                        ? "Te ascult... rostește întrebarea"
                        : "Ex: Care a fost cea mai scumpă cameră închiriată, cât a adus și cine a făcut-o?"
                    }
                    className="w-full bg-transparent text-[14px] text-white placeholder:text-slate-400 outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={toggleDbVoice}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-2xl px-4 py-3 text-[12px] font-bold uppercase tracking-wider transition cursor-pointer ${
                    dbListening
                      ? "bg-rose-500/90 text-white shadow-[0_0_24px_rgba(244,63,94,0.55)] animate-pulse"
                      : "border border-white/15 bg-white/[0.07] text-slate-200 hover:bg-white/[0.14] hover:border-indigo-400/50"
                  }`}
                >
                  {dbListening ? <MicOff size={15} /> : <Mic size={15} />}
                  {dbListening ? "Ascult..." : "Voce"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleAskDatabase()}
                  disabled={askingDb || !dbQuestion.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d4a64a] via-[#e6b85c] to-[#c69a3f] px-6 py-3 text-[12px] font-extrabold uppercase tracking-wider text-[#081225] shadow-[0_8px_28px_rgba(230,184,92,0.38)] transition hover:brightness-110 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer shrink-0"
                >
                  <Send size={14} />
                  {askingDb ? "Analizez..." : "Întreabă AI"}
                </button>
              </div>

              <label className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[12px] font-medium text-slate-300 hover:bg-white/[0.08] transition cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sendToTelegram}
                  onChange={(e) => setSendToTelegram(e.target.checked)}
                  className="h-4 w-4 rounded border-white/25 bg-white/10 text-[#e6b85c] focus:ring-[#e6b85c] accent-[#e6b85c]"
                />
                Trimite automat răspunsul și pe Telegram (raport rapid pe telefon)
              </label>
            </div>

            {/* Luminous Siri/Gemini Voice Waveform */}
            <div className="relative z-10">
              <AiVoiceWave
                active={dbSpeaking || dbListening}
                mode={dbListening ? "listening" : "speaking"}
                theme="dark"
                label={
                  dbListening
                    ? "Te ascult... rostește întrebarea"
                    : "Esy Executiv AI citește analiza..."
                }
                onStop={() => {
                  if (dbListening) toggleDbVoice();
                  else dbVoicePlayerRef.current?.stop();
                }}
                compact
              />
            </div>

            {/* Agentic AI Direct Actions Deck */}
            <div className="relative z-10 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.07] p-4 sm:p-5 backdrop-blur-sm">
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300 mb-3 flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-emerald-400/20 text-emerald-300">
                  <Zap size={12} />
                </span>
                Acțiuni Operaționale Directe (Agentic AI — execută modificări live în DB &amp; Email)
              </div>
              <div className="flex flex-wrap gap-2">
                {AGENTIC_ACTION_PRESETS.map((act) => (
                  <button
                    key={act}
                    type="button"
                    onClick={() => void handleAskDatabase(act)}
                    className="rounded-xl border border-emerald-400/25 bg-[#071923]/70 px-3.5 py-2 text-[12px] font-semibold text-emerald-100 hover:border-emerald-300/70 hover:bg-emerald-500/20 hover:text-white hover:shadow-[0_0_18px_rgba(52,211,153,0.22)] transition-all duration-150 cursor-pointer"
                  >
                    {act}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Executive Analytics Chips */}
            <div className="relative z-10">
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-2.5">
                Comenzi &amp; analize rapide:
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_DB_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void handleAskDatabase(q)}
                    className="rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2 text-[12px] font-medium text-slate-200 hover:border-[#e6b85c]/60 hover:bg-[#e6b85c]/15 hover:text-white transition-all duration-150 cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Thinking Shimmer */}
            {askingDb && (
              <div className="relative z-10 rounded-2xl border border-indigo-400/25 bg-indigo-500/10 p-4 flex items-center gap-3.5 animate-pulse">
                <span className="h-9 w-9 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-violet-500 shadow-[0_0_22px_rgba(99,102,241,0.65)] shrink-0" />
                <div className="space-y-1">
                  <div className="text-[13.5px] font-semibold text-white">Esy Executiv AI analizează baza de date...</div>
                  <div className="text-[12px] text-slate-300">Interoghează tabelele live, ghidurile operaționale RAG și compune raportul executiv.</div>
                </div>
              </div>
            )}

            {/* Conversation & Analysis Theater */}
            {dbTurns.length > 0 && (
              <div className="relative z-10 space-y-4">
                {[...dbTurns].reverse().map((turn) => (
                  <div
                    key={turn.id}
                    className="rounded-2xl border border-white/12 bg-white/[0.06] backdrop-blur-md p-5 shadow-lg space-y-3.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-white/10 pb-3">
                      <div className="text-[13.5px] font-bold text-white flex items-center gap-2.5">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/25 border border-indigo-400/40 text-indigo-300 shrink-0">
                          <User size={13} />
                        </span>
                        <span>{turn.question}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {turn.intent?.startsWith("action_") && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 border border-emerald-400/35 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-300">
                            ⚡ Acțiune Executată Live
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => speakDbReply(turn.plainSummary)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/35 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-200 hover:bg-indigo-500/35 transition cursor-pointer"
                        >
                          {dbSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
                          {dbSpeaking ? "Oprește" : "Ascultă Vocal"}
                        </button>
                        {turn.bookingCode && (
                          <span className="rounded-full bg-[#e6b85c]/20 border border-[#e6b85c]/40 px-2.5 py-0.5 text-[10.5px] font-bold text-[#f3cf7a]">
                            #{turn.bookingCode}
                          </span>
                        )}
                        {turn.telegramSent && (
                          <span className="rounded-full bg-cyan-400/15 border border-cyan-400/35 px-2.5 py-0.5 text-[10.5px] font-bold text-cyan-200">
                            Telegram ✓
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className="text-[14px] leading-relaxed text-slate-100 whitespace-pre-line space-y-1.5 [&_b]:text-[#f3cf7a] [&_strong]:text-[#f3cf7a] [&_code]:bg-white/10 [&_code]:text-cyan-300 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-[12.5px]"
                      dangerouslySetInnerHTML={{ __html: turn.responseHtml }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SUB-TAB 2: INSPECTOR CONVERSAȚII OASPEȚI ── */}
      {subTab === "conversations" && (
        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="lg:col-span-4 overflow-hidden flex flex-col max-h-[680px]">
            <div className="border-b border-[#eef2f7] bg-[#f8fafd] px-5 py-3.5 flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#0d2c5c]">
                Sesiuni Chat ({sessions.length})
              </span>
              <Badge tone="navy">Istoric</Badge>
            </div>
            {loadingList ? (
              <TableSkeleton rows={6} />
            ) : sessions.length === 0 ? (
              <EmptyState title="Nicio conversație" hint="Încă nu există sesiuni de chat înregistrate." />
            ) : (
              <div className="overflow-y-auto divide-y divide-[#eef2f7]">
                {sessions.map((s, idx) => {
                  const active = s.session_id === selectedSessionId;
                  return (
                    <button
                      key={s.session_id}
                      type="button"
                      onClick={() => setSelectedSessionId(s.session_id)}
                      className={`w-full p-4 text-left transition-colors cursor-pointer ${
                        active ? "bg-[#0d2c5c] text-white" : "hover:bg-[#f8fafd] text-[#0d2c5c]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-bold">
                          Convorbire Oaspete #{sessions.length - idx}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            active ? "bg-white/15 text-[#e6b85c]" : "bg-[#eef2f7] text-[#0d2c5c]"
                          }`}
                        >
                          {s.turns} mesaje
                        </span>
                      </div>
                      <p
                        className={`mt-1.5 text-[12px] line-clamp-2 ${
                          active ? "text-white/80" : "text-[#4f6280]"
                        }`}
                      >
                        {s.last_message || "Fără text previzualizare"}
                      </p>
                      <div
                        className={`mt-2 text-[10.5px] ${
                          active ? "text-white/60" : "text-[#94a3b8]"
                        }`}
                      >
                        {dateTimeFmt(s.updated_at)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="lg:col-span-8 flex flex-col max-h-[680px] overflow-hidden">
            <div className="border-b border-[#eef2f7] bg-[#f8fafd] px-6 py-3.5 flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#0d2c5c]">
                Transcriere Completă Dialog
              </span>
              {selectedSessionId && <Badge tone="gold">{messages.length} replici</Badge>}
            </div>

            {loadingMessages ? (
              <TableSkeleton rows={6} />
            ) : messages.length === 0 ? (
              <EmptyState
                title="Selectează o conversație"
                hint="Alege o sesiune din lista din stânga pentru a vedea întrebările oaspetelui și răspunsurile oferite."
              />
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#fafbfc]">
                {messages.map((m) => {
                  const isUser = m.role === "user";
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed shadow-sm ${
                          isUser
                            ? "bg-[#0d2c5c] text-white rounded-br-sm"
                            : "bg-white border border-[#e1e8f0] text-[#1e293b] rounded-bl-sm"
                        }`}
                      >
                        <div className="mb-1 flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-wider opacity-75">
                          {isUser ? (
                            <>
                              <User size={12} /> Oaspete
                            </>
                          ) : (
                            <>
                              <Bot size={12} className="text-[#c69a3f]" /> Concierge Casa Esy
                            </>
                          )}
                          <span>• {dateTimeFmt(m.created_at)}</span>
                        </div>
                        <div className="whitespace-pre-line">{m.text}</div>

                        {!isUser && (m.intent || m.language || m.sentiment || m.latency_ms) && (
                          <div className="mt-2.5 pt-2 border-t border-[#eef2f7] flex flex-wrap items-center gap-2 text-[10px] font-semibold text-[#6b7c99]">
                            {m.intent && (
                              <span className="rounded bg-[#f0f4f9] px-2 py-0.5 text-[#0d2c5c]">
                                Subiect: {m.intent}
                              </span>
                            )}
                            {m.language && (
                              <span className="inline-flex items-center gap-1 rounded bg-[#f0f4f9] px-2 py-0.5">
                                <Globe size={10} /> {m.language.toUpperCase()}
                              </span>
                            )}
                            {m.sentiment && (
                              <span
                                className={`rounded px-2 py-0.5 ${
                                  m.sentiment === "negative"
                                    ? "bg-red-50 text-red-700"
                                    : m.sentiment === "positive"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                Ton: {m.sentiment}
                              </span>
                            )}
                            {m.latency_ms != null && (
                              <span className="inline-flex items-center gap-1">
                                <Clock size={10} /> {m.latency_ms} ms
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── SUB-TAB 3: ALERTE & ESCALADĂRI ── */}
      {subTab === "escalations" && (
        <Card>
          {loadingList ? (
            <TableSkeleton rows={5} />
          ) : escalations.length === 0 ? (
            <EmptyState
              title="Nicio alertă sau nemulțumire detectată"
              hint="Toate întrebările oaspeților au primit răspunsuri complete fără escaladare."
            />
          ) : (
            <div className="divide-y divide-[#eef2f7]">
              {escalations.map((esc) => (
                <div key={esc.message_id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {esc.sentiment === "negative" && <Badge tone="red">Sentiment Negativ</Badge>}
                      {esc.kb_miss && <Badge tone="gold">Întrebare Nouă (Lipsă în Ghid)</Badge>}
                      {esc.intent && <Badge tone="navy">{esc.intent}</Badge>}
                      <span className="text-[11.5px] text-[#6b7c99]">{dateTimeFmt(esc.created_at)}</span>
                    </div>
                    <p className="text-[13.5px] text-[#0d2c5c] leading-relaxed">{esc.reply}</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedSessionId(esc.session_id);
                      setSubTab("conversations");
                    }}
                  >
                    Vezi Dialogul →
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
