import { useState } from "react";
import { Send, AlertCircle } from "lucide-react";
import { apiFetch, ApiError } from "../lib/api";
import { useToast } from "../components/Toast";

const IconPin = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2c-4 0-7 2.7-7 6 0 3.2 4 8.6 6.2 11.2a1.5 1.5 0 0 0 1.8 0C15.2 16.6 19 11.2 19 8c0-3.3-3-6-7-6z" />
    <circle cx="12" cy="8" r="2.5" />
    <path d="M5 20h14" />
  </svg>
);

const IconPhone = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.9c0 1-.6 1.9-1.5 2.3-1.3.6-2.8.8-4.3.8-5.5 0-10.8-4.3-13-9.4C2.4 7.8 2 6.1 2 4.3 2 3 3 2 4.3 2c.8 0 1.5.4 1.9 1.1l1.6 2.8c.4.7.3 1.5-.2 2.1l-.7.8c.6 1.4 1.6 2.7 2.9 3.8 1.2 1.1 2.6 1.9 4.1 2.4l.6-.7c.5-.6 1.3-.8 2-.5l2.8 1.1c.7.3 1.1 1 1.1 1.8z" />
  </svg>
);

const IconMail = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="5" width="20" height="14" rx="3" />
    <path d="M2 8l8.5 5.5a3 3 0 0 0 3 0L22 8" />
    <path d="M2 17l7-5" />
    <path d="M22 17l-7-5" />
  </svg>
);

const IconClock = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
    <path d="M5 3l2 2" />
    <path d="M19 3l-2 2" />
    <path d="M5 21l2-2" />
    <path d="M19 21l-2-2" />
  </svg>
);

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    nume: "",
    email: "",
    telefon: "",
    mesaj: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (status !== "idle") setStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setStatus("sent");
      toast("Mesajul tău a fost trimis cu succes!", "success");
      setForm({ nume: "", email: "", telefon: "", mesaj: "" });
    } catch (err) {
      setStatus("error");
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
        toast(err.message, "error");
      } else {
        const fallbackMsg = "Nu am putut trimite mesajul. Încearcă din nou.";
        setErrorMessage(fallbackMsg);
        toast(fallbackMsg, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: IconPin,
      title: "Locație",
      lines: ["Str. Faleză Nord, Eforie Nord", "Constanța, România"],
    },
    {
      icon: IconPhone,
      title: "Telefon",
      lines: ["+40 7XX XXX XXX"],
    },
    {
      icon: IconMail,
      title: "Email",
      lines: ["contact@casaesy.ro"],
    },
    {
      icon: IconClock,
      title: "Recepție",
      lines: ["Non-stop, 24/7"],
    },
  ];

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Linie subtilă sus */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[var(--border-light)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-40 bg-[var(--gold)]" />

      <div className="relative max-w-7xl mx-auto px-5 md:px-10 py-24 md:py-36">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[var(--gold)] mb-4 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-[var(--gold)]/60" />
            Contact
            <span className="w-8 h-px bg-[var(--gold)]/60" />
          </p>
          <h1 className="font-[var(--font-display)] text-[clamp(2.6rem,5vw,4.2rem)] font-normal text-[var(--text-primary)] leading-[1.1] tracking-[-0.01em] mb-6">
            Hai să vorbim despre{" "}
            <em className="italic text-[var(--gold)]">sejurul tău</em>
          </h1>
          <p className="max-w-[600px] mx-auto text-[15px] text-[var(--text-secondary)] leading-[1.8] font-light">
            Fie că ai o întrebare despre disponibilitate, vrei recomandări sau
            dorești să organizezi un eveniment special — echipa noastră este
            aici să transforme ideile în realitate.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-start">
          {/* Contact Info Cards */}
          <div className="lg:col-span-2 flex flex-col gap-5 order-2 lg:order-1">
            {contactInfo.map(({ icon: Icon, title, lines }) => (
              <div
                key={title}
                className="group flex items-start gap-4 p-5 rounded-xl border border-[var(--border-light)] bg-white transition-all duration-300 hover:border-[var(--gold)]/50 hover:shadow-[var(--shadow-hover)]"
              >
                <div className="shrink-0 w-13 h-13 rounded-full border border-[var(--gold)]/30 flex items-center justify-center text-[var(--gold)] group-hover:border-[var(--gold)] group-hover:bg-[var(--gold-pale)]/40 transition-all duration-300">
                  <div className="w-6 h-6">
                    <Icon />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-[var(--font-display)] text-[1.35rem] text-[var(--text-primary)] mb-1.5 font-normal">
                    {title}
                  </h3>
                  <div className="space-y-0.5">
                    {lines.map((l) => (
                      <p
                        key={l}
                        className="text-[14px] text-[var(--text-secondary)] font-normal leading-relaxed"
                      >
                        {l}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-2 p-5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-soft)]">
              <p className="text-[13.5px] text-[var(--text-muted)] font-light leading-[1.8]">
                Îți răspundem de obicei în mai puțin de{" "}
                <span className="text-[var(--text-primary)] font-medium">
                  24 de ore
                </span>
                . Pentru urgențe, te rugăm să ne suni direct.
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <form
              onSubmit={handleSubmit}
              className="relative bg-white rounded-2xl md:rounded-[14px] shadow-[var(--shadow-soft)] border border-[var(--border-light)] p-8 md:p-11"
            >
              <div className="mb-8">
                <h2 className="font-[var(--font-display)] text-[1.85rem] text-[var(--text-primary)] font-normal mb-2">
                  Trimite-ne un mesaj
                </h2>
                <p className="text-sm text-[var(--text-muted)] font-light">
                  Completează formularul și vei fi contactat în curând
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--text-primary)] mb-3">
                    Nume complet
                  </label>
                  <input
                    required
                    name="nume"
                    value={form.nume}
                    onChange={handleChange}
                    placeholder="Numele tău"
                    disabled={loading}
                    className="w-full px-4 py-3.5 rounded-lg border border-[var(--border-light)] text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-light)] focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/20 transition-all duration-200 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--text-primary)] mb-3">
                    Telefon
                  </label>
                  <input
                    name="telefon"
                    value={form.telefon}
                    onChange={handleChange}
                    placeholder="+40 7XX XXX XXX"
                    disabled={loading}
                    className="w-full px-4 py-3.5 rounded-lg border border-[var(--border-light)] text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-light)] focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/20 transition-all duration-200 disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--text-primary)] mb-3">
                  Adresa de email
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tu@exemplu.ro"
                  disabled={loading}
                  className="w-full px-4 py-3.5 rounded-lg border border-[var(--border-light)] text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-light)] focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/20 transition-all duration-200 disabled:opacity-60"
                />
              </div>

              <div className="mb-8">
                <label className="block text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--text-primary)] mb-3">
                  Mesajul tău
                </label>
                <textarea
                  required
                  name="mesaj"
                  value={form.mesaj}
                  onChange={handleChange}
                  rows={6}
                  disabled={loading}
                  placeholder="Spune-ne cu ce te putem ajuta..."
                  className="w-full px-4 py-3.5 rounded-lg border border-[var(--border-light)] text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-light)] focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/20 transition-all duration-200 resize-none disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-3 bg-[var(--navy)] text-white border-none rounded-lg px-8 py-4 font-sans text-[13px] font-semibold tracking-[0.12em] uppercase transition-all duration-300 hover:bg-[var(--navy-soft)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send size={16} />
                {loading
                  ? "Se trimite…"
                  : status === "sent"
                    ? "Mesaj trimis ✓"
                    : "Trimite mesajul"}
              </button>

              {status === "sent" && (
                <div className="mt-5 p-4 bg-[#f0f9f4] border border-[#b8e0c9] rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-center text-[13.5px] text-[#1a6c4a] font-medium">
                    ✓ Mulțumim! Îți vom răspunde în cel mai scurt timp.
                  </p>
                </div>
              )}

              {status === "error" && (
                <div className="mt-5 p-4 bg-[#fef2f2] border border-[#fecaca] rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle
                    size={18}
                    className="text-[#b91c1c] shrink-0 mt-px"
                  />
                  <p className="text-[13.5px] text-[#b91c1c] font-medium">
                    {errorMessage}
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Linie subtilă jos, înainte de footer */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[var(--border-light)]" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-40 bg-[var(--navy)]" />
    </section>
  );
}
