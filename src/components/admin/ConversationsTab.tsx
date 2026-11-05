import { useCallback, useEffect, useState } from "react";
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
} from "lucide-react";
import { useToast } from "../Toast";
import { get, post, fetchBlob, dateTimeFmt, errMsg } from "../../lib/admin";
import { Badge, Button, Card, EmptyState, SectionHeader, TableSkeleton, inputCls } from "./ui";

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

const QUICK_DB_QUESTIONS = [
  "Care a fost rezervarea de azi care a adus cei mai mulți bani?",
  "Care este rezervarea cu cea mai mare valoare din baza de date?",
  "Ce camere sunt libere în acest moment?",
  "Cine sosește azi la check-in?",
  "Care sunt încasările totale și câte rezervări active avem?",
];

export default function ConversationsTab() {
  const { toast } = useToast();
  const [subTab, setSubTab] = useState<"ask_db" | "conversations" | "escalations">("ask_db");

  // Natural Language DB Query state
  const [dbQuestion, setDbQuestion] = useState(
    "Care a fost rezervarea de azi care a adus cei mai mulți bani?",
  );
  const [dbAnswer, setDbAnswer] = useState<string | null>(null);
  const [askingDb, setAskingDb] = useState(false);

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

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

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
    if (!q) return;
    if (qOverride) setDbQuestion(qOverride);
    setAskingDb(true);
    try {
      const res = await post<{ response: string; intent: string }>("/api/telegram/ask-db", {
        question: q,
      });
      setDbAnswer(res.response || "Nu a fost returnat niciun răspuns.");
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setAskingDb(false);
    }
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
        eyebrow="Interogare Live DB & Dialog Oaspeți"
        title="Asistent Bază de Date & Inspector Conversații"
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => void loadOverview()}>
              <RefreshCw size={14} /> Reîmprospătează
            </Button>
            <Button variant="gold" onClick={handleExportCsv} disabled={exporting}>
              <Download size={14} /> {exporting ? "Se exportă..." : "Exportă Conversații CSV"}
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
          Întreabă Baza de Date (Live SQL)
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
          Conversații Oaspeți ({sessions.length})
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
          Alerte & Escaladări ({escalations.length})
        </button>
      </div>

      {/* ── SUB-TAB 1: ÎNTREABĂ BAZA DE DATE ÎN LIMBAJ NATURAL ── */}
      {subTab === "ask_db" && (
        <div className="space-y-6">
          <Card className="p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  className="text-[22px] font-semibold text-[#0d2c5c] flex items-center gap-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  <Sparkles size={20} className="text-[#c69a3f]" />
                  Interogare Directă în Baza de Date (Web & Telegram)
                </h3>
                <p className="text-[13px] text-[#6b7c99] mt-1">
                  Scrie orice întrebare despre rezervări, încasări, camere, oaspeți sau produse — sistemul interoghează tabelele SQL în timp real și îți răspunde exact. Aceeași logică funcționează acum și pe botul tău de Telegram!
                </p>
              </div>
              <Badge tone="gold">Live DB</Badge>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={dbQuestion}
                onChange={(e) => setDbQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleAskDatabase();
                }}
                placeholder="Ex: Care a fost rezervarea de azi care a adus cei mai mulți bani?"
                className={`${inputCls} flex-1 text-[14px]`}
              />
              <Button
                onClick={() => void handleAskDatabase()}
                disabled={askingDb || !dbQuestion.trim()}
                className="shrink-0"
              >
                <Send size={14} />
                {askingDb ? "Se interoghează DB..." : " Caută în Baza de Date"}
              </Button>
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4f6280] mb-2">
                Întrebări frecvente (Click pentru rulare instantanee):
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_DB_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void handleAskDatabase(q)}
                    className="rounded-xl border border-[#e1e8f0] bg-[#f8fafd] px-3 py-1.5 text-[12px] font-medium text-[#0d2c5c] hover:border-[#c69a3f] hover:bg-[#c69a3f]/10 transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {askingDb && <TableSkeleton rows={3} />}

            {!askingDb && dbAnswer && (
              <div className="rounded-2xl border border-[#e5dcc3] bg-gradient-to-br from-[#fcfdff] to-[#f4f7fb] p-6 shadow-sm">
                <div className="mb-3 flex items-center justify-between border-b border-[#e1e8f0] pb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c69a3f]">
                    Răspuns Extras Din Baza De Date
                  </span>
                  <Badge tone="green">Date Verificate</Badge>
                </div>
                <div
                  className="text-[14px] leading-relaxed text-[#0d2c5c] whitespace-pre-line space-y-1"
                  dangerouslySetInnerHTML={{ __html: dbAnswer }}
                />
              </div>
            )}
          </Card>
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
