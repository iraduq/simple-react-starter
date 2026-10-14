import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Anchor, ArrowUpRight, BedDouble, Send, X } from "lucide-react";
import { ron } from "../lib/format";

const CHAT_URL = `${import.meta.env.VITE_API_URL || "https://backend-licenta-i0lr.onrender.com"}/api/chat`;
const SESSION_KEY = "casaesy_chat_session";

type RoomCard = {
  id?: string | number;
  title?: string;
  name?: string;
  image_url?: string;
  image?: string;
  price_per_night?: number;
  base_price?: number;
  total_price?: number;
  nights?: number;
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
  "Ce camere aveți disponibile?",
  "Care sunt prețurile?",
  "Ce facilități oferiți?",
  "Cum ajung la vilă?",
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

const WELCOME: Msg = {
  id: "welcome",
  role: "model",
  text: "Bună! Sunt Esy, asistentul virtual al Vilei Casa Esy. Te pot ajuta cu camere, prețuri și rezervări. 🌊",
};

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
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
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
      const reply: string =
        data.reply ?? data.response ?? data.text ?? data.message ?? "";
      setMessages((p) => [
        ...p,
        {
          id: uid(),
          role: "model",
          text: reply || "Îmi pare rău, nu am un răspuns acum.",
          rooms: Array.isArray(data.rooms) ? data.rooms : undefined,
          ctas: Array.isArray(data.ctas)
            ? data.ctas
            : Array.isArray(data.cta)
              ? data.cta
              : data.cta
                ? [data.cta]
                : undefined,
        },
      ]);
    } catch {
      setMessages((p) => [
        ...p,
        {
          id: uid(),
          role: "model",
          error: true,
          text: "Momentan nu mă pot conecta. Te rog încearcă din nou în câteva clipe sau scrie-ne la pagina de Contact.",
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
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="flex flex-col overflow-hidden rounded-2xl bg-white w-[calc(100vw-2.5rem)] sm:w-[380px] h-[min(600px,calc(100vh-7rem))]"
            style={{ boxShadow: "0 30px 80px rgba(7,32,63,.35), 0 8px 24px rgba(7,32,63,.18)" }}
            role="dialog"
            aria-label="Esy · Asistent Virtual"
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-5 py-4"
              style={{ background: "linear-gradient(135deg, var(--navy-deep), var(--navy))" }}
            >
              <div
                className="grid h-10 w-10 place-items-center rounded-full"
                style={{ border: "1px solid var(--gold)", color: "var(--gold)" }}
              >
                <Anchor size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xl leading-tight" style={{ fontFamily: "var(--font-display)", color: "#fff" }}>
                  Esy · Asistent Virtual
                </p>
                <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--gold-pale)" }}>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  Online acum
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Închide chatul"
                className="rounded-full p-1.5 transition-opacity opacity-70 hover:opacity-100"
                style={{ color: "#fff" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" style={{ background: "#f7f9fc" }}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === "user" ? "rounded-2xl rounded-br-sm" : "rounded-2xl rounded-bl-sm"
                    }`}
                    style={
                      m.role === "user"
                        ? { background: "var(--navy)", color: "#fff" }
                        : {
                            background: "#fff",
                            color: "var(--text-secondary)",
                            border: `1px solid ${m.error ? "#f3c6c6" : "var(--border-light)"}`,
                          }
                    }
                  >
                    {m.text}
                  </div>

                  {m.rooms && m.rooms.length > 0 && (
                    <div className="mt-2 flex w-full flex-col gap-2">
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
                </motion.div>
              ))}

              {loading && (
                <div className="flex items-start">
                  <div
                    className="flex gap-1.5 rounded-2xl rounded-bl-sm bg-white px-4 py-3"
                    style={{ border: "1px solid var(--border-light)" }}
                    aria-label="Esy scrie..."
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-2 w-2 rounded-full"
                        style={{ background: "var(--gold)" }}
                        animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick chips */}
            <div className="flex gap-2 overflow-x-auto px-4 pt-3 pb-1 bg-white" style={{ scrollbarWidth: "none" }}>
              {QUICK.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  disabled={loading}
                  className="shrink-0 rounded-full px-3 py-1.5 text-xs transition-colors disabled:opacity-50"
                  style={{ border: "1px solid var(--border-gold)", color: "var(--navy)", background: "#fffdf8" }}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={onSubmit} className="flex items-center gap-2 bg-white px-4 pb-4 pt-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Scrie un mesaj..."
                maxLength={1000}
                className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(198,154,63,.25)]"
                style={{ border: "1px solid var(--border-light)", color: "var(--navy)", background: "#f7f9fc" }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Trimite"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full transition-opacity disabled:opacity-40"
                style={{ background: "var(--navy)", color: "var(--gold)" }}
              >
                <Send size={17} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.94 }}
        aria-label={open ? "Închide asistentul" : "Deschide asistentul virtual"}
        className="relative grid h-14 w-14 place-items-center rounded-full"
        style={{
          background: "linear-gradient(135deg, var(--navy-soft), var(--navy-deep))",
          color: "var(--gold)",
          border: "1px solid var(--border-gold)",
          boxShadow: "0 14px 34px rgba(7,32,63,.4)",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "x" : "bot"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {open ? <X size={22} /> : <BotIcon />}
          </motion.span>
        </AnimatePresence>
        {!open && (
          <span className="absolute right-0.5 top-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70" style={{ background: "var(--gold)" }} />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2" style={{ background: "var(--gold)", borderColor: "var(--navy-deep)" }} />
          </span>
        )}
      </motion.button>
    </div>
  );
}

function BotIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="16" height="11" rx="4" />
      <path d="M12 8V5" />
      <circle cx="12" cy="4" r="1" />
      <circle cx="9" cy="13.5" r="1" fill="currentColor" />
      <circle cx="15" cy="13.5" r="1" fill="currentColor" />
      <path d="M2 13v2M22 13v2" />
    </svg>
  );
}

function isExternal(url: string) {
  return /^https?:\/\//.test(url);
}

function RoomCardView({ room }: { room: RoomCard }) {
  const title = room.title || room.name || "Cameră";
  const img = room.image_url || room.image;
  const perNight = room.price_per_night ?? room.base_price;
  const total = room.total_price ?? (perNight && room.nights ? perNight * room.nights : undefined);
  const url = room.booking_url || (room.id != null ? `/camere/${room.id}` : "/camere");

  return (
    <div className="flex overflow-hidden rounded-xl bg-white" style={{ border: "1px solid var(--border-light)" }}>
      <div className="h-auto w-24 shrink-0" style={{ background: "var(--gold-pale)" }}>
        {img ? (
          <img src={img} alt={title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="grid h-full place-items-center" style={{ color: "var(--gold)" }}>
            <BedDouble size={22} />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-lg leading-tight" style={{ fontFamily: "var(--font-display)", color: "var(--navy)" }}>{title}</p>
        {perNight != null && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            <strong style={{ color: "var(--navy)" }}>{ron(perNight)}</strong> / noapte
          </p>
        )}
        {total != null && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Total estimat{room.nights ? ` (${room.nights} nopți)` : ""}: <strong style={{ color: "var(--gold)" }}>{ron(total)}</strong>
          </p>
        )}
        {isExternal(url) ? (
          <a href={url} className="mt-1 inline-flex w-fit items-center gap-1 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.14em]" style={{ background: "var(--navy)", color: "#fff" }}>
            Rezervă <ArrowUpRight size={12} />
          </a>
        ) : (
          <Link to={url} className="mt-1 inline-flex w-fit items-center gap-1 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.14em]" style={{ background: "var(--navy)", color: "#fff" }}>
            Rezervă <ArrowUpRight size={12} />
          </Link>
        )}
      </div>
    </div>
  );
}

function CtaButton({ cta, onMessage }: { cta: Cta; onMessage: (t: string) => void }) {
  const url = cta.url || cta.href;
  const cls = "inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-medium";
  const style = { background: "var(--gold)", color: "var(--navy-deep)" };
  if (!url) {
    return (
      <button className={cls} style={style} onClick={() => onMessage(cta.message || cta.label)}>
        {cta.label}
      </button>
    );
  }
  return isExternal(url) ? (
    <a href={url} target="_blank" rel="noreferrer" className={cls} style={style}>
      {cta.label} <ArrowUpRight size={12} />
    </a>
  ) : (
    <Link to={url} className={cls} style={style}>
      {cta.label} <ArrowUpRight size={12} />
    </Link>
  );
}
