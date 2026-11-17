import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BedDouble,
  Clock,
  Mic,
  MicOff,
  Send,
  Users,
  Volume2,
  VolumeX,
  X,
  ChevronRight,
} from "lucide-react";
import { ron } from "../lib/format";
import { API_URL } from "../lib/config";
import { getAccessToken } from "../lib/token";
import { createVoicePlayer, type VoicePlayer } from "../lib/voicePlayer";
import AiVoiceWave from "./AiVoiceWave";

const API_BASE = API_URL.replace(/\/$/, "");
const CHAT_URL = `${API_BASE}/api/chat/`;
const SESSION_KEY = "casaesy_chat_session";
const ROOM_KEY = "casaesy_chat_room";

type RoomImg = { image_url?: string; url?: string } | string;
type RoomCard = {
  room_id?: string | number;
  id?: string | number;
  title?: string;
  name?: string;
  image_url?: string;
  image?: string;
  thumbnail?: string;
  images?: RoomImg[];
  price_per_night?: number;
  base_price?: number;
  total_price?: number;
  estimated_total?: number;
  nights?: number;
  max_guests?: number;
  capacity?: number;
  booking_url?: string;
  url?: string;
};
type Cta = { label: string; url?: string; href?: string; message?: string };
type Msg = {
  id: string;
  role: "user" | "model";
  text: string;
  rooms?: RoomCard[];
  cards?: RoomCard[];
  ctas?: Cta[];
  suggestions?: string[];
  error?: boolean;
};

const QUICK = [
  {
    label: "Camere & Disponibilitate",
    sub: "Vezi tarifele și camerele libere",
    text: "Ce camere aveți disponibile și care sunt prețurile?",
    img: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=300&q=80",
  },
  {
    label: "Restaurant, Bar & Meniu",
    sub: "Paste, fructe de mare, cocktailuri și prețuri",
    text: "Ce preparate și băuturi aveți la restaurant și bar și cât costă?",
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80",
  },
  {
    label: "Comandă în Cameră (Room Service)",
    sub: "Comandă mâncare sau băuturi prin AI",
    text: "Vreau să comand mâncare sau băutură în cameră",
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80",
  },
  {
    label: "Reguli Cameră, Wi-Fi & PIN",
    sub: "Ce e permis, parola Wi-Fi și Smart Lock",
    text: "Ce pot face și ce nu am voie în cameră, care este parola Wi-Fi și cum funcționează PIN-ul?",
    img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=300&q=80",
  },
  {
    label: "Plajă, Piscină, SPA & Reduceri",
    sub: "Șezlonguri, masaj, VIP și coduri promo",
    text: "Ce facilități aveți la plajă și SPA și ce coduri de reducere sunt active?",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80",
  },
];

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = uid();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function absUrl(u?: string) {
  if (!u) return undefined;
  if (/^(https?:|data:|blob:)/.test(u)) return u;
  return `${API_BASE}${u.startsWith("/") ? "" : "/"}${u}`;
}

function roomImage(r: RoomCard) {
  const first = r.images?.[0];
  const fromArr =
    typeof first === "string" ? first : first?.image_url || first?.url;
  return absUrl(r.image_url || r.image || r.thumbnail || fromArr);
}

const WELCOME: Msg = {
  id: "welcome",
  role: "model",
  text: "Bună! Sunt Esy, asistentul virtual al Vilei Casa Esy. Te ajut cu drag cu detalii despre camere, prețuri și rezervări rapide.",
};

/* ── Bot avatar cu animatie de plutire, clipit si antena luminoasa ── */
function BotAvatar({ size = 32 }: { size?: number }) {
  return (
    <span
      className="inline-grid shrink-0 place-items-center overflow-hidden shadow-sm"
      style={{
        width: size,
        height: size,
        borderRadius: size >= 40 ? 16 : Math.round(size * 0.38),
        background: "linear-gradient(150deg, #16386b 0%, #07203f 100%)",
        border: "1px solid rgba(255,255,255,.2)",
      }}
      aria-hidden
    >
      <motion.svg
        viewBox="0 0 48 48"
        width={size}
        height={size}
        animate={{ y: [0, -1.8, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.circle
          cx="24"
          cy="9.5"
          r="2.4"
          fill="#7fd3ff"
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.2, 0.9] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <rect x="23.2" y="10.5" width="1.6" height="4" rx=".8" fill="#9cc4ff" />
        <rect x="9.5" y="14" width="29" height="22" rx="9.5" fill="#ffffff" />
        <rect
          x="14.5"
          y="18.5"
          width="19"
          height="11"
          rx="5.5"
          fill="#0d2c5c"
        />
        <motion.rect
          x="18"
          y="21"
          width="3.2"
          height="5.5"
          rx="1.6"
          fill="#7fd3ff"
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            times: [0, 0.46, 0.5, 0.54, 1],
          }}
          style={{ transformOrigin: "19.6px 23.75px" }}
        />
        <motion.rect
          x="26.8"
          y="21"
          width="3.2"
          height="5.5"
          rx="1.6"
          fill="#7fd3ff"
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            times: [0, 0.46, 0.5, 0.54, 1],
          }}
          style={{ transformOrigin: "28.4px 23.75px" }}
        />
        <rect x="6.5" y="21" width="3" height="6.5" rx="1.5" fill="#9cc4ff" />
        <rect x="38.5" y="21" width="3" height="6.5" rx="1.5" fill="#9cc4ff" />
        <path
          d="M20 32.5 q4 2.2 8 0"
          stroke="#9cc4ff"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      </motion.svg>
    </span>
  );
}

/* ── Teaser ── */
type TeaserPhase = "hidden" | "typing" | "message";

function EsyTeaser({ onOpen }: { onOpen: () => void }) {
  const [phase, setPhase] = useState<TeaserPhase>("hidden");

  useEffect(() => {
    const delay = { hidden: 3500, typing: 1400, message: 7000 }[phase];
    const t = setTimeout(() => {
      setPhase((p) =>
        p === "hidden" ? "typing" : p === "typing" ? "message" : "hidden",
      );
    }, delay);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <AnimatePresence>
      {phase !== "hidden" && (
        <motion.button
          key="teaser"
          type="button"
          onClick={onOpen}
          layout
          initial={{ opacity: 0, y: 10, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          whileHover={{ y: -2 }}
          className="text-left"
          style={{
            transformOrigin: "right bottom",
            background: "#fff",
            border: "1px solid rgba(7,32,63,0.08)",
            boxShadow: "0 12px 32px -14px rgba(7,32,63,0.3)",
            borderRadius: "18px 18px 4px 18px",
            padding: phase === "typing" ? "14px 16px" : "12px 18px 12px 16px",
          }}
        >
          {phase === "typing" ? (
            <span className="flex items-center gap-1" aria-label="Esy scrie">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="block h-1.5 w-1.5 rounded-full bg-slate-400"
                  animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </span>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="leading-snug"
            >
              <p
                className="text-[13.5px] font-semibold"
                style={{ color: "var(--navy)" }}
              >
                Salut! Cu ce te pot ajuta?
              </p>
              <p className="mt-0.5 text-[12px] text-slate-500">
                Scrie-mi, răspund imediat.
              </p>
            </motion.div>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function WelcomeBlock({
  onPick,
  disabled,
  showTopics,
  roomNumber,
}: {
  onPick: (t: string) => void;
  disabled: boolean;
  showTopics: boolean;
  roomNumber: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-4 px-1 py-2"
    >
      <div className="space-y-2">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color: "var(--navy)", opacity: 0.6 }}
        >
          Vila Casa Esy · Eforie Nord {roomNumber ? `· Camera ${roomNumber}` : ""}
        </span>
        <h3
          className="text-[22px] font-bold tracking-tight text-[#07203f]"
          style={{ fontFamily: "inherit" }}
        >
          {roomNumber ? `Bun venit în Camera ${roomNumber}! 🔑` : "Bun venit la malul mării! 🌊"}
        </h3>
        <p className="text-[13px] leading-relaxed text-slate-600 font-medium">
          {roomNumber
            ? `Sunt Esy, concierge-ul personal al Camerei ${roomNumber}. Îmi poți scrie sau dicta vocal pentru comenzi Room Service, parola Wi-Fi, reguli, prosoape sau meniu.`
            : "Sunt Esy, asistentul tău inteligent. Îți răspund la orice despre camere, restaurant, bar, plajă, SPA, comenzi în cameră și oferte."}
        </p>
      </div>

      {showTopics && (
        <div className="space-y-2.5 pt-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Alege un subiect sau întreabă prin voce/text:
          </p>
          <div className="flex flex-col gap-2">
            {QUICK.map(({ label, sub, text, img }, i) => (
              <motion.button
                key={label}
                type="button"
                disabled={disabled}
                onClick={() => onPick(text)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.04, duration: 0.25 }}
                whileHover={{ x: 3, backgroundColor: "#f8fbff" }}
                whileTap={{ scale: 0.98 }}
                className="group flex w-full items-center justify-between rounded-2xl bg-white p-2.5 text-left transition-all disabled:opacity-50"
                style={{
                  border: "1px solid rgba(29,82,156,0.12)",
                  boxShadow: "0 3px 10px -4px rgba(7,32,63,0.07)",
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl shadow-xs">
                    <img
                      src={img}
                      alt={label}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-[#1d529c]/10 group-hover:bg-transparent transition-colors" />
                  </div>

                  <div className="min-w-0 leading-tight">
                    <span className="block truncate text-[13.5px] font-bold text-[#07203f] group-hover:text-[#1d529c] transition-colors">
                      {label}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] font-medium text-slate-500">
                      {sub}
                    </span>
                  </div>
                </div>

                <div className="pr-1">
                  <ChevronRight
                    size={16}
                    className="shrink-0 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#1d529c]"
                    strokeWidth={2.5}
                  />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [hiddenByModal, setHiddenByModal] = useState(
    () =>
      typeof document !== "undefined" &&
      document.body.dataset.placeModalOpen === "true",
  );
  const [roomNumber, setRoomNumber] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      localStorage.removeItem(ROOM_KEY);
    } catch {
      // ignore storage errors
    }
    const params = new URLSearchParams(window.location.search);
    const urlRoom = params.get("room")?.trim();
    if (urlRoom) {
      try {
        sessionStorage.setItem(ROOM_KEY, urlRoom);
      } catch {
        // ignore storage errors
      }
      return urlRoom;
    }
    try {
      return sessionStorage.getItem(ROOM_KEY) || "";
    } catch {
      return "";
    }
  });
  const [voiceReplies, setVoiceReplies] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const voiceRepliesRef = useRef(true);
  const voicePlayerRef = useRef<VoicePlayer | null>(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onPlaceModalToggle = (e: Event) => {
      const isModalOpen = Boolean((e as CustomEvent).detail);
      setHiddenByModal(isModalOpen);
      if (isModalOpen) setOpen(false);
    };
    window.addEventListener("place-modal-toggle", onPlaceModalToggle);
    return () =>
      window.removeEventListener("place-modal-toggle", onPlaceModalToggle);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    if (open && !loading) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open, loading]);

  useEffect(() => {
    voicePlayerRef.current = createVoicePlayer(setSpeaking);
    return () => {
      voicePlayerRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    voiceRepliesRef.current = voiceReplies;
    if (!voiceReplies) {
      voicePlayerRef.current?.stop();
    }
  }, [voiceReplies]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("room")) return;
    const token = getAccessToken();
    if (!token) return;
    let cancelled = false;
    fetch(`${API_BASE}/orders/active-stay-rooms`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.eligible || !Array.isArray(data?.active_rooms)) return;
        const activeUnit = data.active_rooms.find((r: any) => r?.unit_number)?.unit_number;
        if (activeUnit) {
          setRoomNumber(String(activeUnit));
        }
      })
      .catch(() => {
        // ignore silent stay room lookup failures
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function send(text: string) {
    const msg = text.trim();
    if (!msg || loading) return;
    voicePlayerRef.current?.stop();
    const history = messages
      .filter((m) => m.id !== "welcome" && !m.error)
      .map((m) => ({ role: m.role, text: m.text }));
    setMessages((p) => [...p, { id: uid(), role: "user", text: msg }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          history,
          session_id: getSessionId(),
          context: { room_number: roomNumber },
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const reply: string =
        data.reply ?? data.response ?? data.text ?? data.message ?? "";
      const ctas = Array.isArray(data.ctas)
        ? data.ctas
        : Array.isArray(data.cta)
          ? data.cta
          : data.cta
            ? [data.cta]
            : undefined;
      const suggestions = Array.isArray(data.suggested_actions)
        ? data.suggested_actions
        : undefined;
      const finalText = reply || "Îmi pare rău, nu am un răspuns acum.";
      if (voiceRepliesRef.current) {
        void voicePlayerRef.current?.speak(finalText, data.language || "ro");
      }
      setMessages((p) => [
        ...p,
        {
          id: uid(),
          role: "model",
          text: finalText,
          rooms: Array.isArray(data.rooms) ? data.rooms : undefined,
          cards: Array.isArray(data.cards) ? data.cards : undefined,
          ctas,
          suggestions,
        },
      ]);
    } catch {
      setMessages((p) => [
        ...p,
        {
          id: uid(),
          role: "model",
          error: true,
          text: "Momentan nu mă pot conecta la server. Încearcă din nou în câteva clipe sau accesează pagina noastră de contact.",
          ctas: [{ label: "Contact", url: "/contact" }],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const toggleVoiceInput = () => {
    if (typeof window === "undefined") return;
    voicePlayerRef.current?.stop();
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setMessages((p) => [
        ...p,
        {
          id: uid(),
          role: "model",
          text: "Browserul tău nu suportă recunoașterea vocală nativă. Folosește Chrome, Edge sau Safari ori tastează întrebarea.",
        },
      ]);
      return;
    }
    try {
      const rec = new SpeechRec();
      rec.lang = "ro-RO";
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      let finalTranscript = "";
      rec.onstart = () => setListening(true);
      rec.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalTranscript += t + " ";
          else interim += t;
        }
        setInput((finalTranscript + interim).trim());
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => {
        setListening(false);
        const textToSend = finalTranscript.trim();
        if (textToSend) {
          void send(textToSend);
        }
      };
      recognitionRef.current = rec;
      rec.start();
    } catch {
      setListening(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  if (hiddenByModal) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9000] flex flex-col items-end gap-3.5">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.94, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="flex flex-col overflow-hidden rounded-[26px] w-[calc(100vw-2rem)] sm:w-[416px] h-[min(670px,calc(100vh-6rem))]"
            style={{
              background: "#ffffff",
              boxShadow:
                "0 25px 60px -15px rgba(7,32,63,0.35), 0 0 0 1px rgba(13,44,92,0.08)",
            }}
            role="dialog"
            aria-label="Vila Casa Esy · Asistent Virtual"
          >
            {/* Header */}
            <div
              className="relative flex flex-col gap-2.5 px-5 pt-4 pb-3.5"
              style={{
                background:
                  "linear-gradient(155deg, #1d529c 0%, var(--navy) 60%, var(--navy-deep) 100%)",
                boxShadow: "0 10px 25px -10px rgba(7,32,63,0.5)",
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-80"
                style={{
                  background:
                    "radial-gradient(160px 80px at 85% 10%, rgba(100,165,255,0.32), transparent 75%)",
                }}
              />
              <div className="relative flex items-center gap-3">
                <div className="relative">
                  <motion.span
                    className="absolute -inset-1.5 rounded-[20px]"
                    style={{ background: "rgba(46,204,113,0.28)" }}
                    animate={{ opacity: [0.2, 0.55, 0.2], scale: [1, 1.08, 1] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <BotAvatar size={42} />
                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2"
                    style={{ background: "#2ecc71", borderColor: "var(--navy)" }}
                  />
                </div>
                <div className="relative flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className="truncate text-[14.5px] font-bold tracking-tight text-white"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Esy · Smart Concierge
                    </p>
                    <span
                      className="flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        background: "rgba(46,204,113,0.18)",
                        color: "#7bed9f",
                        border: "1px solid rgba(46,204,113,0.45)",
                      }}
                    >
                      <motion.span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: "#2ecc71" }}
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity }}
                      />
                      AI
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span className="flex items-center gap-1 text-[11px] font-medium text-white/80">
                      <Clock size={10} className="text-[#a6cafd]" /> 24/7 Voce & Text
                      {roomNumber ? ` · Camera ${roomNumber}` : ""}
                    </span>
                    {speaking && (
                      <span className="rounded-full bg-[#c69a3f]/30 border border-[#e6b85c]/50 px-1.5 py-0.2 text-[9.5px] font-bold text-[#fde68a] animate-pulse">
                        Vorbește...
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setVoiceReplies((v) => !v)}
                  title={
                    voiceReplies
                      ? "Sonor pornit — apasă pentru a opri vocea"
                      : "Sonor oprit — apasă pentru a porni vocea"
                  }
                  aria-label={voiceReplies ? "Oprește sonorul" : "Pornește sonorul"}
                  className={`relative grid h-8 w-8 place-items-center rounded-full transition-colors cursor-pointer ${
                    voiceReplies
                      ? "bg-[#c69a3f] text-white shadow-sm"
                      : "text-white/75 hover:bg-white/10"
                  }`}
                >
                  {voiceReplies ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button
                  onClick={() => {
                    voicePlayerRef.current?.stop();
                    setOpen(false);
                  }}
                  aria-label="Închide chatul"
                  className="relative grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-white/10 active:scale-95 cursor-pointer"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>

              <div
                className="absolute inset-x-0 bottom-0 h-px"
                style={{ background: "rgba(255,255,255,0.15)" }}
              />
            </div>

            {/* Messages Area */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-4 overflow-y-auto px-5 py-5 scroll-smooth"
              style={{ background: "#f8fafc" }}
            >
              {messages.map((m) => {
                if (m.id === "welcome") {
                  return (
                    <WelcomeBlock
                      key={m.id}
                      onPick={send}
                      disabled={loading}
                      showTopics={messages.length === 1}
                      roomNumber={roomNumber}
                    />
                  );
                }

                const hasRooms =
                  (m.rooms?.length ?? 0) > 0 || (m.cards?.length ?? 0) > 0;
                const solo = !hasRooms && !m.ctas?.length;

                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-2.5 ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    } ${solo ? "items-center" : "items-start"}`}
                  >
                    {m.role === "model" && <BotAvatar size={28} />}
                    <div
                      className={`flex min-w-0 flex-col ${
                        m.role === "user"
                          ? "max-w-[82%] items-end"
                          : "max-w-[88%] items-start"
                      }`}
                    >
                      <div
                        className={`whitespace-pre-wrap px-4 py-3 text-[14px] leading-relaxed ${
                          m.role === "user"
                            ? "rounded-[18px] rounded-br-xs font-medium shadow-sm"
                            : "rounded-[18px] rounded-bl-xs font-normal"
                        }`}
                        style={
                          m.role === "user"
                            ? {
                                background:
                                  "linear-gradient(140deg, #225cc2, var(--navy))",
                                color: "#fff",
                              }
                            : {
                                background: "#ffffff",
                                color: "#1e293b",
                                border: m.error
                                  ? "1.5px solid #ef4444"
                                  : "1.5px solid rgba(29,82,156,0.14)",
                                boxShadow:
                                  "0 10px 30px -10px rgba(7,32,63,0.08)",
                              }
                        }
                      >
                        {m.role === "model" && hasRooms
                          ? (() => {
                              const paragraphs = m.text
                                .split(/\n\s*\n/)
                                .map((p) => p.trim())
                                .filter(Boolean);

                              const intro = paragraphs[0] || "";
                              const outro =
                                paragraphs.length > 1
                                  ? paragraphs[paragraphs.length - 1]
                                  : "";

                              return (
                                <div className="space-y-2.5">
                                  {intro && <p>{intro}</p>}

                                  <div className="my-2 flex w-full flex-col gap-3">
                                    {(m.rooms?.length ? m.rooms : m.cards)?.map(
                                      (r, i) => (
                                        <RoomCardView
                                          key={r.room_id ?? r.id ?? i}
                                          room={r}
                                        />
                                      ),
                                    )}
                                  </div>

                                  {outro && outro !== intro && (
                                    <p className="font-medium pt-1">{outro}</p>
                                  )}
                                </div>
                              );
                            })()
                          : m.text}
                      </div>

                      {m.ctas && m.ctas.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {m.ctas.map((c, i) => (
                            <CtaButton key={i} cta={c} onMessage={send} />
                          ))}
                        </div>
                      )}

                      {m.role === "model" &&
                        m.suggestions &&
                        m.suggestions.length > 0 &&
                        messages[messages.length - 1]?.id === m.id && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {m.suggestions.map((sug) => (
                              <button
                                key={sug}
                                type="button"
                                disabled={loading}
                                onClick={() => send(sug)}
                                className="rounded-full border border-[#c69a3f]/40 bg-amber-50/70 px-3 py-1 text-[11px] font-semibold text-[#0d2c5c] hover:bg-[#c69a3f]/15 transition cursor-pointer"
                              >
                                {sug}
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  </motion.div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-2.5">
                  <BotAvatar size={28} />
                  <div
                    className="flex gap-1.5 rounded-[18px] rounded-bl-xs px-4 py-3.5 shadow-sm"
                    style={{
                      background: "#ffffff",
                      border: "1px solid rgba(13,44,92,0.08)",
                    }}
                    aria-label="Esy scrie..."
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-2 w-2 rounded-full"
                        style={{ background: "#2f6fd6" }}
                        animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.16,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Siri-style Voice Wave Visualizer */}
            <AiVoiceWave
              active={speaking || listening}
              mode={listening ? "listening" : "speaking"}
              label={
                listening
                  ? "Te ascult... vorbește acum"
                  : "Esy · Concierge AI vorbește"
              }
              wrapperClassName="px-4 py-2 border-t border-slate-100 bg-white"
              onStop={() => {
                if (listening) toggleVoiceInput();
                else voicePlayerRef.current?.stop();
              }}
            />

            {/* Input Form */}
            <form
              onSubmit={onSubmit}
              className="px-4 py-3.5 border-t border-slate-100"
              style={{ background: "#ffffff" }}
            >
              <div
                className="flex items-center gap-1.5 rounded-full py-1.5 pl-4 pr-1.5 transition-all focus-within:shadow-[0_0_0_3px_rgba(47,111,214,0.15)] focus-within:border-[#2f6fd6]"
                style={{ background: "#f8fafc", border: "1px solid #cbd5e1" }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    listening
                      ? "Te ascult... vorbește acum"
                      : roomNumber
                        ? `Întreabă sau comandă în Camera ${roomNumber}...`
                        : "Scrie sau apasă microfonul și întreabă..."
                  }
                  maxLength={1000}
                  className="flex-1 min-w-0 bg-transparent text-[13.5px] font-medium outline-none placeholder:text-slate-400"
                  style={{ color: "var(--text-primary)" }}
                />
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  disabled={loading}
                  title={listening ? "Oprește dictarea vocală" : "Vorbește cu asistentul (stil Alexa)"}
                  aria-label={listening ? "Oprește dictarea" : "Dictare vocală"}
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-all cursor-pointer ${
                    listening
                      ? "text-white animate-pulse shadow-md"
                      : speaking
                        ? "text-white shadow-sm"
                        : "bg-slate-200/80 text-[#0d2c5c] hover:bg-[#6366f1]/15 hover:text-[#4f46e5]"
                  }`}
                  style={
                    listening || speaking
                      ? { background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #38bdf8 100%)" }
                      : undefined
                  }
                >
                  {listening ? <MicOff size={15} /> : <Mic size={15} />}
                </button>
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Trimite"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition-all hover:opacity-95 active:scale-95 disabled:opacity-40 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #2f6fd6, var(--navy))",
                    color: "#fff",
                    boxShadow: "0 4px 12px -2px rgba(13,44,92,0.4)",
                  }}
                >
                  <Send size={15} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-3">
        {!open && <EsyTeaser onOpen={() => setOpen(true)} />}

        <motion.button
          onClick={() => setOpen((o) => !o)}
          whileHover={{ y: -3, scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          aria-label={
            open ? "Închide asistentul" : "Deschide asistentul virtual"
          }
          className="relative grid h-16 w-16 place-items-center rounded-[22px] transition-shadow"
          style={{
            background: "linear-gradient(150deg, #1f4e94, var(--navy-deep))",
            color: "#fff",
            boxShadow: "0 16px 36px -8px rgba(7,32,63,0.55)",
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "x" : "bot"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="grid place-items-center"
            >
              {open ? (
                <X size={26} strokeWidth={2.2} />
              ) : (
                <BotAvatar size={52} />
              )}
            </motion.span>
          </AnimatePresence>
          {!open && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
            </span>
          )}
        </motion.button>
      </div>
    </div>
  );
}

function isExternal(url: string) {
  return /^https?:\/\//.test(url);
}

function RoomCardView({ room }: { room: RoomCard }) {
  const [broken, setBroken] = useState(false);
  const title = room.title || room.name || "Cameră";
  const img = roomImage(room);
  const perNight = room.price_per_night ?? room.base_price;
  const total =
    room.total_price ??
    room.estimated_total ??
    (perNight && room.nights ? perNight * room.nights : undefined);
  const guests = room.max_guests ?? room.capacity;
  const url =
    room.booking_url ||
    room.url ||
    (room.id != null ? `/camere/${room.id}` : "/camere");
  const btnCls =
    "flex items-center justify-center gap-1.5 rounded-full py-2.5 text-[13px] font-semibold transition-all hover:opacity-95 active:scale-98 shadow-sm";
  const btnStyle = {
    background: "linear-gradient(135deg, #2f6fd6, var(--navy))",
    color: "#fff",
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm transition-all hover:shadow-md">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        {img && !broken ? (
          <img
            src={img}
            alt={title}
            onError={() => setBroken(true)}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full place-items-center text-slate-400">
            <BedDouble size={30} />
          </div>
        )}
        {perNight != null && (
          <span
            className="absolute left-3 top-3 rounded-full px-3 py-1 text-[12px] font-bold backdrop-blur-md shadow-sm"
            style={{
              background: "rgba(255,255,255,0.94)",
              color: "var(--navy)",
            }}
          >
            {ron(perNight)}{" "}
            <span className="font-medium opacity-65">/ noapte</span>
          </span>
        )}
      </div>
      <div className="space-y-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <p
            className="text-[15px] font-bold leading-snug"
            style={{ color: "var(--navy)", fontFamily: "var(--font-body)" }}
          >
            {title}
          </p>
          {guests != null && (
            <span className="flex shrink-0 items-center gap-1 text-[12px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              <Users size={12} /> {guests} oaspeți
            </span>
          )}
        </div>
        {total != null && (
          <div className="flex items-center justify-between rounded-xl px-3 py-2 bg-slate-50 border border-slate-100">
            <span className="text-[12px] font-medium text-slate-600">
              Total estimat{room.nights ? ` · ${room.nights} nopți` : ""}
            </span>
            <span
              className="text-[14px] font-bold"
              style={{ color: "var(--navy)" }}
            >
              {ron(total)}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 pt-0">
        {isExternal(url) ? (
          <a href={url} className={btnCls} style={btnStyle}>
            Rezervă acum <ArrowUpRight size={14} />
          </a>
        ) : (
          <Link to={url} className={btnCls} style={btnStyle}>
            Rezervă acum <ArrowUpRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}

function CtaButton({
  cta,
  onMessage,
}: {
  cta: Cta;
  onMessage: (t: string) => void;
}) {
  const url = cta.url || cta.href;
  const cls =
    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-all hover:bg-slate-50 active:scale-95 shadow-sm";
  const style = {
    background: "#fff",
    color: "var(--navy)",
    border: "1px solid #cbd5e1",
  };
  if (!url) {
    return (
      <button
        className={cls}
        style={style}
        onClick={() => onMessage(cta.message || cta.label)}
      >
        {cta.label}
      </button>
    );
  }
  return isExternal(url) ? (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={cls}
      style={style}
    >
      {cta.label} <ArrowUpRight size={13} />
    </a>
  ) : (
    <Link to={url} className={cls} style={style}>
      {cta.label} <ArrowUpRight size={13} />
    </Link>
  );
}
