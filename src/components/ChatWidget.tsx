import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, BedDouble, MapPin, Send, Sparkles, Tag, Users, X } from "lucide-react";
import { ron } from "../lib/format";

const API_BASE = (import.meta.env.VITE_API_URL || "https://backend-licenta-i0lr.onrender.com").replace(/\/$/, "");
const CHAT_URL = `${API_BASE}/api/chat`;
const SESSION_KEY = "casaesy_chat_session";

type RoomImg = { image_url?: string; url?: string } | string;
type RoomCard = {
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
};
type Cta = { label: string; url?: string; href?: string; message?: string };
type Msg = {
  id: string;
  role: "user" | "model";
  text: string;
  rooms?: RoomCard[];
  ctas?: Cta[];
  error?: boolean;
};

const QUICK = [
  { label: "Camere libere", text: "Ce camere aveți disponibile?", Icon: BedDouble },
  { label: "Prețuri", text: "Care sunt prețurile?", Icon: Tag },
  { label: "Facilități", text: "Ce facilități oferiți?", Icon: Sparkles },
  { label: "Locație", text: "Cum ajung la vilă?", Icon: MapPin },
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
  const fromArr = typeof first === "string" ? first : first?.image_url || first?.url;
  return absUrl(r.image_url || r.image || r.thumbnail || fromArr);
}

const WELCOME: Msg = {
  id: "welcome",
  role: "model",
  text: "Bună! Sunt Esy, asistentul virtual al Vilei Casa Esy. Te ajut cu camere, prețuri și rezervări.",
};

/* ── Bot avatar ── */
function BotAvatar({ size = 32 }: { size?: number }) {
  return (
    <span
      className="inline-grid shrink-0 place-items-center overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: size >= 40 ? 13 : Math.round(size * 0.34),
        background: "linear-gradient(150deg, #16386b, #07203f)",
        border: "1px solid rgba(255,255,255,.14)",
      }}
      aria-hidden
    >
      <svg viewBox="0 0 48 48" width={size} height={size}>
        <circle cx="24" cy="10.5" r="2" fill="#9cc4ff" />
        <rect x="23.2" y="11.5" width="1.6" height="3.5" rx=".8" fill="#9cc4ff" />
        <rect x="10" y="14.5" width="28" height="21" rx="9" fill="#ffffff" />
        <rect x="15" y="19" width="18" height="10" rx="5" fill="#0d2c5c" />
        <rect x="18.5" y="21.6" width="3" height="5" rx="1.5" fill="#7fd3ff" />
        <rect x="26.5" y="21.6" width="3" height="5" rx="1.5" fill="#7fd3ff" />
        <rect x="7" y="21.5" width="3" height="6" rx="1.5" fill="#9cc4ff" />
        <rect x="38" y="21.5" width="3" height="6" rx="1.5" fill="#9cc4ff" />
        <path d="M21 32.5 q3 1.8 6 0" stroke="#9cc4ff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open && !loading) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open, loading]);

  async function send(text: string) {
    const msg = text.trim();
    if (!msg || loading) return;
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
        body: JSON.stringify({ message: msg, history, session_id: getSessionId() }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const reply: string = data.reply ?? data.response ?? data.text ?? data.message ?? "";
      const ctas = Array.isArray(data.ctas)
        ? data.ctas
        : Array.isArray(data.cta)
          ? data.cta
          : data.cta
            ? [data.cta]
            : undefined;
      setMessages((p) => [
        ...p,
        {
          id: uid(),
          role: "model",
          text: reply || "Îmi pare rău, nu am un răspuns acum.",
          rooms: Array.isArray(data.rooms) ? data.rooms : undefined,
          ctas,
        },
      ]);
    } catch {
      setMessages((p) => [
        ...p,
        {
          id: uid(),
          role: "model",
          error: true,
          text: "Momentan nu mă pot conecta. Încearcă din nou în câteva clipe sau scrie-ne pe pagina de Contact.",
          ctas: [{ label: "Contact", url: "/contact" }],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9000] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="flex flex-col overflow-hidden rounded-2xl w-[calc(100vw-2.5rem)] sm:w-[400px] h-[min(640px,calc(100vh-7rem))]"
            style={{
              background: "#ffffff",
              boxShadow: "0 40px 90px -20px rgba(7,32,63,.5), 0 0 0 1px rgba(13,44,92,.08)",
            }}
            role="dialog"
            aria-label="Esy · Asistent Virtual"
          >
            {/* Header */}
            <div
              className="relative flex items-center gap-3 px-5 pt-5 pb-4"
              style={{
                background: "linear-gradient(160deg, #123661 0%, var(--navy) 55%, var(--navy-deep) 100%)",
                boxShadow: "0 10px 24px -12px rgba(7,32,63,.55)",
              }}
            >
              <div className="relative">
                <BotAvatar size={42} />
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2"
                  style={{ background: "#22c55e", borderColor: "var(--navy)" }}
                />
              </div>
              <div className="flex-1">
                <p className="text-[16px] font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-body)" }}>
                  Esy · Asistent Virtual
                </p>
                <p className="text-[12px] font-semibold" style={{ color: "#9cc4ff" }}>
                  Online · răspunde imediat
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Închide chatul"
                className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-white/10"
                style={{ color: "rgba(255,255,255,.85)" }}
              >
                <X size={18} strokeWidth={1.75} />
              </button>
              <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: "rgba(255,255,255,.14)" }} />
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-6" style={{ background: "#ffffff" }}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "model" && <BotAvatar size={24} />}
                  <div className={`flex min-w-0 flex-col ${m.role === "user" ? "max-w-[80%] items-end" : "max-w-[88%] items-start"}`}>
                    <div
                      className={`whitespace-pre-wrap px-4 py-3 text-[14px] font-semibold leading-relaxed ${
                        m.role === "user" ? "rounded-[16px] rounded-br-md" : "rounded-[16px] rounded-tl-sm"
                      }`}
                      style={
                        m.role === "user"
                          ? { background: "linear-gradient(135deg, #1f56b0, var(--navy))", color: "#fff" }
                          : {
                              background: "#F1F5FB",
                              color: "var(--text-primary)",
                              border: m.error ? "1px solid #f0d5d5" : "none",
                            }
                      }
                    >
                      {m.text}
                    </div>

                    {m.rooms && m.rooms.length > 0 && (
                      <div className="mt-2.5 flex w-full flex-col gap-2.5">
                        {m.rooms.map((r, i) => (
                          <RoomCardView key={r.id ?? i} room={r} />
                        ))}
                      </div>
                    )}

                    {m.ctas && m.ctas.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {m.ctas.map((c, i) => (
                          <CtaButton key={i} cta={c} onMessage={send} />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex items-end gap-2">
                  <BotAvatar size={24} />
                  <div
                    className="flex gap-1.5 rounded-[16px] rounded-tl-sm px-4 py-3.5"
                    style={{ background: "#F1F5FB" }}
                    aria-label="Esy scrie..."
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-2 w-2 rounded-full"
                        style={{ background: "#2f6fd6" }}
                        animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 overflow-x-auto px-4 pt-3" style={{ background: "#ffffff", scrollbarWidth: "none" }}>
              {QUICK.map(({ label, text, Icon }) => (
                <button
                  key={label}
                  onClick={() => send(text)}
                  disabled={loading}
                  className="flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-shadow hover:shadow-[0_4px_12px_-4px_rgba(13,44,92,.28)] disabled:opacity-50"
                  style={{
                    background: "#ffffff",
                    color: "var(--navy)",
                    border: "1px solid #e2e9f2",
                    boxShadow: "0 2px 6px -2px rgba(13,44,92,.12)",
                  }}
                >
                  <Icon size={14} strokeWidth={2.2} style={{ color: "var(--navy)" }} />
                  {label}
                </button>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={onSubmit} className="px-4 pb-4 pt-3" style={{ background: "#ffffff" }}>
              <div
                className="flex items-center gap-2 rounded-full py-1.5 pl-4 pr-1.5 transition-shadow focus-within:shadow-[0_0_0_3px_rgba(47,111,214,.16)]"
                style={{ background: "#F1F5FB", border: "1px solid #e4eaf3" }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Scrie un mesaj…"
                  maxLength={1000}
                  className="flex-1 bg-transparent text-[14px] font-semibold outline-none placeholder:text-slate-400"
                  style={{ color: "var(--text-primary)" }}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Trimite"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition-opacity disabled:opacity-40"
                  style={{
                    background: "linear-gradient(140deg, #2f6fd6, var(--navy))",
                    color: "#fff",
                    boxShadow: "0 6px 14px -4px rgba(13,44,92,.45)",
                  }}
                >
                  <Send size={15} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.94 }}
        aria-label={open ? "Închide asistentul" : "Deschide asistentul virtual"}
        className="relative grid h-16 w-16 place-items-center rounded-[22px]"
        style={{
          background: "linear-gradient(150deg, #1f4e94, var(--navy-deep))",
          color: "#fff",
          boxShadow: "0 18px 44px -10px rgba(7,32,63,.6)",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "x" : "bot"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="grid place-items-center"
          >
            {open ? <X size={24} /> : <BotAvatar size={52} />}
          </motion.span>
        </AnimatePresence>
        {!open && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
          </span>
        )}
      </motion.button>
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
    room.total_price ?? room.estimated_total ?? (perNight && room.nights ? perNight * room.nights : undefined);
  const guests = room.max_guests ?? room.capacity;
  const url = room.booking_url || (room.id != null ? `/camere/${room.id}` : "/camere");
  const btnCls =
    "flex items-center justify-center gap-1.5 rounded-full py-2.5 text-[13px] font-semibold";
  const btnStyle = { background: "linear-gradient(135deg, #2f6fd6, var(--navy))", color: "#fff" };

  return (
    <div className="overflow-hidden rounded-2xl bg-white" style={{ border: "1px solid #e8edf5", boxShadow: "0 6px 18px -8px rgba(13,44,92,.18)" }}>
      <div className="relative aspect-[16/9] w-full" style={{ background: "#e9eff8" }}>
        {img && !broken ? (
          <img src={img} alt={title} onError={() => setBroken(true)} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="grid h-full place-items-center" style={{ color: "#8aa3c7" }}>
            <BedDouble size={32} />
          </div>
        )}
        {perNight != null && (
          <span
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[12px] font-bold backdrop-blur"
            style={{ background: "rgba(255,255,255,.92)", color: "var(--navy)" }}
          >
            {ron(perNight)} <span className="font-medium opacity-60">/ noapte</span>
          </span>
        )}
      </div>
      <div className="space-y-2 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[15px] font-bold leading-tight" style={{ color: "var(--navy)", fontFamily: "var(--font-body)" }}>
            {title}
          </p>
          {guests != null && (
            <span className="flex shrink-0 items-center gap-1 text-[12px] font-medium" style={{ color: "#5a6b85" }}>
              <Users size={13} /> {guests}
            </span>
          )}
        </div>
        {total != null && (
          <div className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: "#f1f5fb" }}>
            <span className="text-[12px] font-medium" style={{ color: "#5a6b85" }}>
              Total estimat{room.nights ? ` · ${room.nights} nopți` : ""}
            </span>
            <span className="text-[14px] font-bold" style={{ color: "var(--navy)" }}>{ron(total)}</span>
          </div>
        )}
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

function CtaButton({ cta, onMessage }: { cta: Cta; onMessage: (t: string) => void }) {
  const url = cta.url || cta.href;
  const cls = "inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[12.5px] font-semibold";
  const style = { background: "#fff", color: "var(--navy)", border: "1px solid #d6e0ee" };
  if (!url) {
    return (
      <button className={cls} style={style} onClick={() => onMessage(cta.message || cta.label)}>
        {cta.label}
      </button>
    );
  }
  return isExternal(url) ? (
    <a href={url} target="_blank" rel="noreferrer" className={cls} style={style}>
      {cta.label} <ArrowUpRight size={13} />
    </a>
  ) : (
    <Link to={url} className={cls} style={style}>
      {cta.label} <ArrowUpRight size={13} />
    </Link>
  );
}
