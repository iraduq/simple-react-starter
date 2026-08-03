import { useState } from "react";
import { Mail, MapPin, Phone, Send, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { apiFetch, ApiError } from "../lib/api";
import { useToast } from "../components/Toast";

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

  return (
    <section
      className="relative py-24 md:py-36 px-5 md:px-10 overflow-hidden font-sans"
      style={{
        background:
          "linear-gradient(to right, rgba(13,44,92,0.92) 0%, rgba(13,44,92,0.98) 100%), url(https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Wave sus */}
      <svg
        className="absolute -top-px left-0 w-full h-[90px] md:h-[130px] pointer-events-none z-[3] block"
        viewBox="0 0 1440 130"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 0 L1440 0 L1440 70 C1260 100, 1080 55, 900 75 S540 110, 360 78 S120 50, 0 82 Z"
          fill="#c69a3f"
          opacity="0.35"
        />
        <path
          d="M0 0 L1440 0 L1440 55 C1260 90, 1080 40, 900 62 S540 100, 360 65 S120 35, 0 68 Z"
          fill="#0d2c5c"
          opacity="0.5"
        />
        <path
          d="M0 0 L1440 0 L1440 45 C1260 80, 1080 28, 900 52 S540 92, 360 55 S120 22, 0 58 Z"
          fill="#ffffff"
        />
      </svg>

      <div className="relative max-w-7xl mx-auto z-10">
        {/* Header */}
        <div className="text-center mb-20 md:mb-28">
          <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-4 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-[#c69a3f]/60" />
            CONTACT
            <span className="w-8 h-px bg-[#c69a3f]/60" />
          </p>
          <h1 className="font-['Cormorant_Garamond',serif] text-[clamp(2.6rem,5vw,4.2rem)] font-normal text-white leading-[1.15] tracking-[-0.01em] drop-shadow-md mb-6">
            Hai să vorbim despre{" "}
            <em className="italic text-[#c69a3f]">sejurul tău</em>
          </h1>
          <p className="max-w-[600px] mx-auto text-[15px] text-white/75 leading-[1.8] font-light">
            Fie că ai o întrebare despre disponibilitate, vrei recomandări sau doriți să organizați un eveniment special — echipa noastră este aici să transforme ideile în realitate.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">
          {/* Contact Info Cards */}
          <div className="lg:col-span-2 flex flex-col gap-6 order-2 lg:order-1">
            {[
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
            ].map(({ icon: Icon, title, lines }, idx) => (
              <div
                key={title}
                className="group flex items-start gap-4 p-5 rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-sm transition-all duration-300 hover:border-[#c69a3f]/50 hover:bg-white/[0.06]"
              >
                <div className="shrink-0 w-14 h-14 rounded-lg border border-[#c69a3f]/40 flex items-center justify-center group-hover:border-[#c69a3f] transition-all duration-300 bg-[#c69a3f]/5">
                  <Icon size={20} className="text-[#c69a3f]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-['Cormorant_Garamond',serif] text-[1.15rem] text-white mb-2 font-normal">
                    {title}
                  </h3>
                  <div className="space-y-1">
                    {lines.map((l) => (
                      <p
                        key={l}
                        className="text-[13.5px] text-white/65 font-light leading-relaxed"
                      >
                        {l}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-2 pt-6 border-t border-white/10">
              <p className="text-[13px] text-white/50 font-light leading-[1.8]">
                Îți răspundem de obicei în mai puțin de <span className="text-white/70 font-medium">24 de ore</span>. Pentru urgențe, te rugăm să ne suni direct.
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="relative">
              {/* Subtle decorative accent */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-[#c69a3f]/10 to-transparent rounded-2xl md:rounded-[14px] blur-xl opacity-50 pointer-events-none" />

              <form
                onSubmit={handleSubmit}
                className="relative bg-white rounded-2xl md:rounded-[14px] shadow-[0_20px_40px_rgba(0,0,0,0.2)] border border-[#e1e8f0] p-8 md:p-11"
              >
                <div className="mb-8">
                  <h2 className="font-['Cormorant_Garamond',serif] text-2xl text-[#0d2c5c] font-normal mb-1">
                    Trimite-ne un mesaj
                  </h2>
                  <p className="text-sm text-[#666] font-light">
                    Completează formularul și vei fi contactat în curând
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="flex items-center gap-1 text-[10px] font-bold tracking-[0.14em] uppercase text-[#1a1a1a] mb-3">
                      Nume complet
                    </label>
                    <input
                      required
                      name="nume"
                      value={form.nume}
                      onChange={handleChange}
                      placeholder="Numele tău"
                      disabled={loading}
                      className="w-full px-4 py-3.5 rounded-lg border border-[#e1e8f0] text-sm text-[#1a1a1a] placeholder:text-[#bbb] focus:outline-none focus:border-[#c69a3f] focus:ring-1 focus:ring-[#c69a3f]/20 transition-all duration-200 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-[10px] font-bold tracking-[0.14em] uppercase text-[#1a1a1a] mb-3">
                      Telefon
                    </label>
                    <input
                      name="telefon"
                      value={form.telefon}
                      onChange={handleChange}
                      placeholder="+40 7XX XXX XXX"
                      disabled={loading}
                      className="w-full px-4 py-3.5 rounded-lg border border-[#e1e8f0] text-sm text-[#1a1a1a] placeholder:text-[#bbb] focus:outline-none focus:border-[#c69a3f] focus:ring-1 focus:ring-[#c69a3f]/20 transition-all duration-200 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="flex items-center gap-1 text-[10px] font-bold tracking-[0.14em] uppercase text-[#1a1a1a] mb-3">
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
                    className="w-full px-4 py-3.5 rounded-lg border border-[#e1e8f0] text-sm text-[#1a1a1a] placeholder:text-[#bbb] focus:outline-none focus:border-[#c69a3f] focus:ring-1 focus:ring-[#c69a3f]/20 transition-all duration-200 disabled:opacity-60"
                  />
                </div>

                <div className="mb-8">
                  <label className="flex items-center gap-1 text-[10px] font-bold tracking-[0.14em] uppercase text-[#1a1a1a] mb-3">
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
                    className="w-full px-4 py-3.5 rounded-lg border border-[#e1e8f0] text-sm text-[#1a1a1a] placeholder:text-[#bbb] focus:outline-none focus:border-[#c69a3f] focus:ring-1 focus:ring-[#c69a3f]/20 transition-all duration-200 resize-none disabled:opacity-60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-3 bg-[#c69a3f] text-white border-none rounded-lg px-8 py-4 font-sans text-[13px] font-semibold tracking-[0.12em] uppercase transition-all duration-300 hover:bg-[#b8882e] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-lg hover:shadow-xl hover:shadow-[#c69a3f]/20"
                >
                  <Send size={16} />
                  {loading
                    ? "Se trimite…"
                    : status === "sent"
                      ? "Mesaj trimis ✓"
                      : "Trimite mesajul"}
                </button>

                {status === "sent" && (
                  <div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-center text-[13px] text-emerald-700 font-medium">
                      ✓ Mulțumim! Îți vom răspunde în cel mai scurt timp.
                    </p>
                  </div>
                )}

                {status === "error" && (
                  <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle size={18} className="text-red-700 shrink-0 mt-px" />
                    <p className="text-[13px] text-red-700 font-medium">
                      {errorMessage}
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Wave jos */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[90px] md:h-[130px] pointer-events-none z-[3] block"
        viewBox="0 0 1440 130"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          transform="translate(0, 130) scale(1, -1)"
          d="M0 0 L1440 0 L1440 70 C1260 100, 1080 55, 900 75 S540 110, 360 78 S120 50, 0 82 Z"
          fill="#c69a3f"
          opacity="0.35"
        />
        <path
          transform="translate(0, 130) scale(1, -1)"
          d="M0 0 L1440 0 L1440 55 C1260 90, 1080 40, 900 62 S540 100, 360 65 S120 35, 0 68 Z"
          fill="#0d2c5c"
          opacity="0.5"
        />
        <path
          transform="translate(0, 130) scale(1, -1)"
          d="M0 0 L1440 0 L1440 45 C1260 80, 1080 28, 900 52 S540 92, 360 55 S120 22, 0 58 Z"
          fill="#ffffff"
        />
      </svg>
    </section>
  );
}
