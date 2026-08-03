import { useState } from "react";
import { Mail, MapPin, Phone, Send, Clock, AlertCircle } from "lucide-react";
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
    <section className="relative overflow-hidden bg-white">
      {/* Linie subtilă sus */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[#e1e8f0]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-40 bg-[#c69a3f]" />

      <div className="relative max-w-7xl mx-auto px-5 md:px-10 py-24 md:py-36">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-4 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-[#c69a3f]/60" />
            Contact
            <span className="w-8 h-px bg-[#c69a3f]/60" />
          </p>
          <h1 className="font-[var(--font-display)] text-[clamp(2.6rem,5vw,4.2rem)] font-normal text-[#0d2c5c] leading-[1.1] tracking-[-0.01em] mb-6">
            Hai să vorbim despre{" "}
            <em className="italic text-[#c69a3f]">sejurul tău</em>
          </h1>
          <p className="max-w-[600px] mx-auto text-[15px] text-[#3d4f6b] leading-[1.8] font-light">
            Fie că ai o întrebare despre disponibilitate, vrei recomandări sau dorești să organizezi un eveniment special — echipa noastră este aici să transforme ideile în realitate.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-start">
          {/* Contact Info Cards */}
          <div className="lg:col-span-2 flex flex-col gap-5 order-2 lg:order-1">
            {contactInfo.map(({ icon: Icon, title, lines }) => (
              <div
                key={title}
                className="group flex items-start gap-4 p-5 rounded-xl border border-[#e1e8f0] bg-white transition-all duration-300 hover:border-[#c69a3f]/50 hover:shadow-[0_8px_30px_rgba(13,44,92,0.08)]"
              >
                <div className="shrink-0 w-12 h-12 rounded-full border border-[#c69a3f]/30 flex items-center justify-center group-hover:border-[#c69a3f] group-hover:bg-[#c69a3f]/5 transition-all duration-300">
                  <Icon size={20} className="text-[#c69a3f]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-[var(--font-display)] text-[1.25rem] text-[#0d2c5c] mb-1.5 font-normal">
                    {title}
                  </h3>
                  <div className="space-y-0.5">
                    {lines.map((l) => (
                      <p
                        key={l}
                        className="text-[13.5px] text-[#3d4f6b] font-light leading-relaxed"
                      >
                        {l}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-2 p-5 rounded-xl border border-[#e1e8f0] bg-[#f8fafc]">
              <p className="text-[13px] text-[#5a6b85] font-light leading-[1.8]">
                Îți răspundem de obicei în mai puțin de{" "}
                <span className="text-[#0d2c5c] font-medium">24 de ore</span>.
                Pentru urgențe, te rugăm să ne suni direct.
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <form
              onSubmit={handleSubmit}
              className="relative bg-white rounded-2xl md:rounded-[14px] shadow-[0_20px_60px_rgba(13,44,92,0.08)] border border-[#e1e8f0] p-8 md:p-11"
            >
              <div className="mb-8">
                <h2 className="font-[var(--font-display)] text-[1.75rem] text-[#0d2c5c] font-normal mb-2">
                  Trimite-ne un mesaj
                </h2>
                <p className="text-sm text-[#5a6b85] font-light">
                  Completează formularul și vei fi contactat în curând
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="flex items-center gap-1 text-[10px] font-bold tracking-[0.14em] uppercase text-[#0d2c5c] mb-3">
                    Nume complet
                  </label>
                  <input
                    required
                    name="nume"
                    value={form.nume}
                    onChange={handleChange}
                    placeholder="Numele tău"
                    disabled={loading}
                    className="w-full px-4 py-3.5 rounded-lg border border-[#e1e8f0] text-sm text-[#0d2c5c] placeholder:text-[#9fb0c7] focus:outline-none focus:border-[#c69a3f] focus:ring-1 focus:ring-[#c69a3f]/20 transition-all duration-200 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-[10px] font-bold tracking-[0.14em] uppercase text-[#0d2c5c] mb-3">
                    Telefon
                  </label>
                  <input
                    name="telefon"
                    value={form.telefon}
                    onChange={handleChange}
                    placeholder="+40 7XX XXX XXX"
                    disabled={loading}
                    className="w-full px-4 py-3.5 rounded-lg border border-[#e1e8f0] text-sm text-[#0d2c5c] placeholder:text-[#9fb0c7] focus:outline-none focus:border-[#c69a3f] focus:ring-1 focus:ring-[#c69a3f]/20 transition-all duration-200 disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-1 text-[10px] font-bold tracking-[0.14em] uppercase text-[#0d2c5c] mb-3">
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
                  className="w-full px-4 py-3.5 rounded-lg border border-[#e1e8f0] text-sm text-[#0d2c5c] placeholder:text-[#9fb0c7] focus:outline-none focus:border-[#c69a3f] focus:ring-1 focus:ring-[#c69a3f]/20 transition-all duration-200 disabled:opacity-60"
                />
              </div>

              <div className="mb-8">
                <label className="flex items-center gap-1 text-[10px] font-bold tracking-[0.14em] uppercase text-[#0d2c5c] mb-3">
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
                  className="w-full px-4 py-3.5 rounded-lg border border-[#e1e8f0] text-sm text-[#0d2c5c] placeholder:text-[#9fb0c7] focus:outline-none focus:border-[#c69a3f] focus:ring-1 focus:ring-[#c69a3f]/20 transition-all duration-200 resize-none disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-3 bg-[#0d2c5c] text-white border-none rounded-lg px-8 py-4 font-sans text-[13px] font-semibold tracking-[0.12em] uppercase transition-all duration-300 hover:bg-[#c69a3f] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
                  <p className="text-center text-[13px] text-[#1a6c4a] font-medium">
                    ✓ Mulțumim! Îți vom răspunde în cel mai scurt timp.
                  </p>
                </div>
              )}

              {status === "error" && (
                <div className="mt-5 p-4 bg-[#fef2f2] border border-[#fecaca] rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle size={18} className="text-[#b91c1c] shrink-0 mt-px" />
                  <p className="text-[13px] text-[#b91c1c] font-medium">
                    {errorMessage}
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Linie subtilă jos, înainte de footer */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[#e1e8f0]" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-40 bg-[#0d2c5c]" />
    </section>
  );
}
