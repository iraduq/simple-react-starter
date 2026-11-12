import { useEffect, useRef, useState } from "react";
import { Send, AlertCircle, MapPin, Phone, Mail, Clock, CheckCircle2 } from "lucide-react";
import { apiFetch, ApiError } from "../lib/api";
import { useToast } from "../components/Toast";
import Footer from "../components/Footer";

export default function Contact() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [form, setForm] = useState({
    nume: "",
    email: "",
    telefon: "",
    mesaj: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.play().catch(() => {});
    }
  }, []);

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
      icon: MapPin,
      title: "Locație",
      lines: ["Str. Faleză Nord, Eforie Nord", "Constanța, România"],
    },
    {
      icon: Phone,
      title: "Telefon",
      lines: ["+40 7XX XXX XXX"],
    },
    {
      icon: Mail,
      title: "Email",
      lines: ["contact@casaesy.ro"],
    },
    {
      icon: Clock,
      title: "Recepție",
      lines: ["Non-stop, 24/7"],
    },
  ];

  return (
    <div className="relative bg-[#fdfbf7] text-[#0d2c5c] overflow-hidden min-h-screen">
      {/* ── HERO ÎN STILUL CASEI ESY (identic cu Places.tsx & Rooms.tsx) ── */}
      <section className="relative bg-[#0d2c5c] overflow-hidden pt-28 sm:pt-36 md:pt-44 pb-28 md:pb-36 z-10">
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/hero-poster.jpg"
            className="h-full w-full object-cover saturate-50 contrast-110 brightness-100"
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#0d2c5c]/70 mix-blend-color" />
          <div className="absolute inset-0 bg-[#0b2146]/45 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d2c5c]/95 via-[#0d2c5c]/45 to-[#0d2c5c]/95" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 md:px-10 text-center">
          <p className="font-sans text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-[#c69a3f] mb-3 sm:mb-4 flex items-center justify-center gap-3">
            <span className="w-6 sm:w-8 h-px bg-[#c69a3f]/60" />
            Contact · Vila Casa Esy
            <span className="w-6 sm:w-8 h-px bg-[#c69a3f]/60" />
          </p>

          <h1 className="font-['Cormorant_Garamond',serif] text-[clamp(2.5rem,5.5vw,4.8rem)] font-normal text-white leading-[1.05] tracking-[-0.015em] mb-4 sm:mb-6 [text-shadow:0_4px_30px_rgba(0,0,0,0.35)]">
            Hai să vorbim despre{" "}
            <em className="italic text-[#c69a3f]">sejurul tău</em>
          </h1>

          <span
            className="my-3 hidden sm:flex items-center justify-center gap-3"
            aria-hidden="true"
          >
            <span className="h-px w-14 bg-[#c69a3f]/50" />
            <span className="h-1.5 w-1.5 rotate-45 bg-[#c69a3f]" />
            <span className="h-px w-14 bg-[#c69a3f]/50" />
          </span>

          <p className="max-w-[600px] mx-auto text-[14px] sm:text-[17px] text-white/90 leading-[1.65] sm:leading-[1.85] font-light">
            Fie că ai o întrebare despre disponibilitate, vrei recomandări
            locale sau dorești să organizezi un moment special — echipa noastră
            este aici să îți răspundă cu drag.
          </p>
        </div>

        {/* Val alb-crem jos */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none translate-y-[1px]">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-[50px] md:h-[80px]"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.43,121.22,201.2,112.5,242.47,107.45,283.47,84.14,321.39,56.44Z"
              className="fill-[#fdfbf7]"
            />
          </svg>
        </div>
      </section>

      {/* ── CONȚINUT PRINCIPAL ── */}
      <section className="relative py-14 md:py-24 px-5 md:px-10 z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          {/* Coloana stângă: Date de contact */}
          <div className="lg:col-span-2 flex flex-col gap-4 order-2 lg:order-1">
            <div className="mb-2">
              <p className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-[#c69a3f] mb-2 flex items-center gap-3">
                <span className="h-px w-8 bg-gradient-to-r from-[#c69a3f] to-transparent" />
                Informații directe
              </p>
              <h2 className="font-['Cormorant_Garamond',serif] text-[2rem] font-normal leading-tight text-[#0d2c5c]">
                Suntem mereu <em className="italic text-[#c69a3f]">aproape</em>
              </h2>
            </div>

            {contactInfo.map(({ icon: Icon, title, lines }) => (
              <div
                key={title}
                className="group flex items-start gap-4 p-5 rounded-[22px] border border-[#e2e8f0] bg-white shadow-[0_8px_24px_rgba(13,44,92,0.04)] transition-all duration-300 hover:border-[#c69a3f]/60 hover:shadow-[0_14px_34px_rgba(13,44,92,0.08)]"
              >
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-[#fdf8ec] border border-[#c69a3f]/35 flex items-center justify-center text-[#c69a3f] group-hover:bg-[#0d2c5c] group-hover:text-[#e6b85c] group-hover:border-[#0d2c5c] transition-all duration-300">
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-['Cormorant_Garamond',serif] text-[1.45rem] text-[#0d2c5c] mb-1 font-semibold leading-snug">
                    {title}
                  </h3>
                  <div className="space-y-0.5">
                    {lines.map((l) => (
                      <p
                        key={l}
                        className="text-[14px] text-[#475569] font-normal leading-relaxed"
                      >
                        {l}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-1 p-5 rounded-[22px] border border-[#c69a3f]/35 bg-[#fdf8ec]">
              <p className="text-[13.5px] text-[#475569] leading-[1.75]">
                Îți răspundem de obicei în mai puțin de{" "}
                <span className="text-[#0d2c5c] font-bold">24 de ore</span>.
                Pentru urgențe sau solicitări imediate, te rugăm să ne suni
                direct la recepție.
              </p>
            </div>
          </div>

          {/* Coloana dreaptă: Formular */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <form
              onSubmit={handleSubmit}
              className="relative bg-white rounded-[28px] shadow-[0_24px_60px_rgba(13,44,92,0.08)] border border-[#e2e8f0] overflow-hidden"
            >
              {/* Bandă decorativă superioară */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#0d2c5c] via-[#c69a3f] to-[#0d2c5c]" />

              <div className="p-7 sm:p-10 md:p-12">
                <div className="mb-8">
                  <p className="font-sans text-[10.5px] font-bold tracking-[0.2em] uppercase text-[#c69a3f] mb-2">
                    Concierge & Recepție
                  </p>
                  <h2 className="font-['Cormorant_Garamond',serif] text-[2rem] sm:text-[2.25rem] text-[#0d2c5c] font-semibold leading-tight mb-2">
                    Trimite-ne un mesaj
                  </h2>
                  <p className="text-sm text-[#475569]">
                    Completează formularul de mai jos și echipa Casa Esy te va
                    contacta în cel mai scurt timp.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-[10.5px] font-bold tracking-[0.16em] uppercase text-[#475569] mb-2">
                      Nume complet
                    </label>
                    <input
                      required
                      name="nume"
                      value={form.nume}
                      onChange={handleChange}
                      placeholder="Numele tău"
                      disabled={loading}
                      className="w-full px-4 py-3.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[15px] text-[#0d2c5c] placeholder:text-[#94a3b8] focus:outline-none focus:bg-white focus:border-[#c69a3f] focus:ring-2 focus:ring-[#c69a3f]/20 transition-all duration-200 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold tracking-[0.16em] uppercase text-[#475569] mb-2">
                      Telefon
                    </label>
                    <input
                      name="telefon"
                      value={form.telefon}
                      onChange={handleChange}
                      placeholder="+40 7XX XXX XXX"
                      disabled={loading}
                      className="w-full px-4 py-3.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[15px] text-[#0d2c5c] placeholder:text-[#94a3b8] focus:outline-none focus:bg-white focus:border-[#c69a3f] focus:ring-2 focus:ring-[#c69a3f]/20 transition-all duration-200 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-[10.5px] font-bold tracking-[0.16em] uppercase text-[#475569] mb-2">
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
                    className="w-full px-4 py-3.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[15px] text-[#0d2c5c] placeholder:text-[#94a3b8] focus:outline-none focus:bg-white focus:border-[#c69a3f] focus:ring-2 focus:ring-[#c69a3f]/20 transition-all duration-200 disabled:opacity-60"
                  />
                </div>

                <div className="mb-7">
                  <label className="block text-[10.5px] font-bold tracking-[0.16em] uppercase text-[#475569] mb-2">
                    Mesajul tău
                  </label>
                  <textarea
                    required
                    name="mesaj"
                    value={form.mesaj}
                    onChange={handleChange}
                    rows={5}
                    disabled={loading}
                    placeholder="Spune-ne cu ce te putem ajuta..."
                    className="w-full px-4 py-3.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[15px] text-[#0d2c5c] placeholder:text-[#94a3b8] focus:outline-none focus:bg-white focus:border-[#c69a3f] focus:ring-2 focus:ring-[#c69a3f]/20 transition-all duration-200 resize-none disabled:opacity-60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2.5 bg-[#0d2c5c] hover:bg-[#c69a3f] text-white hover:text-[#0d2c5c] border-none rounded-full px-8 py-4 font-sans text-xs font-extrabold tracking-[0.18em] uppercase transition-all duration-300 shadow-[0_12px_28px_rgba(13,44,92,0.2)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send size={15} />
                  {loading
                    ? "Se trimite…"
                    : status === "sent"
                      ? "Mesaj trimis ✓"
                      : "Trimite mesajul"}
                </button>

                {status === "sent" && (
                  <div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center gap-2.5">
                    <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
                    <p className="text-[13.5px] text-emerald-800 font-medium">
                      Mulțumim! Mesajul tău a ajuns la recepție și îți vom răspunde în cel mai scurt timp.
                    </p>
                  </div>
                )}

                {status === "error" && (
                  <div className="mt-5 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
                    <AlertCircle
                      size={18}
                      className="text-rose-700 shrink-0 mt-px"
                    />
                    <p className="text-[13.5px] text-rose-800 font-medium">
                      {errorMessage}
                    </p>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
