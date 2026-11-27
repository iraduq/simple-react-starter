import { Send, CheckCircle2, AlertCircle } from "lucide-react";

interface ContactFormProps {
  form: { nume: string; email: string; telefon: string; mesaj: string };
  loading: boolean;
  status: "idle" | "sent" | "error";
  errorMessage: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ContactForm({
  form,
  loading,
  status,
  errorMessage,
  onChange,
  onSubmit,
}: ContactFormProps) {
  return (
    <div className="lg:col-span-3 order-1 lg:order-2">
      <form
        onSubmit={onSubmit}
        className="relative bg-white/95 backdrop-blur-sm rounded-[28px] shadow-[0_24px_60px_rgba(13,44,92,0.09)] border border-[#e2e8f0] overflow-hidden"
      >
        <div className="relative bg-[#0d2c5c] px-7 sm:px-10 md:px-12 pt-8 pb-7 text-white overflow-hidden">
          <div
            className="absolute -right-10 -top-10 w-40 h-40 rounded-full border border-[#c69a3f]/20 pointer-events-none"
            aria-hidden="true"
          />
          <p className="font-sans text-[10.5px] font-bold tracking-[0.22em] uppercase text-[#e6b85c] mb-2">
            Concierge & Recepție · Casa Esy
          </p>
          <h2 className="font-['Cormorant_Garamond',serif] text-[2rem] sm:text-[2.35rem] text-white font-semibold leading-tight mb-1.5">
            Trimite-ne un mesaj
          </h2>
          <p className="text-sm text-white/80 font-light">
            Completează formularul de mai jos și echipa noastră te va contacta în cel mai scurt timp.
          </p>
        </div>

        <div className="p-7 sm:p-10 md:p-12 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-[10.5px] font-bold tracking-[0.16em] uppercase text-[#475569] mb-2">
                Nume complet
              </label>
              <input
                required
                name="nume"
                value={form.nume}
                onChange={onChange}
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
                onChange={onChange}
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
              onChange={onChange}
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
              onChange={onChange}
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
            {loading ? "Se trimite…" : status === "sent" ? "Mesaj trimis ✓" : "Trimite mesajul"}
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
              <AlertCircle size={18} className="text-rose-700 shrink-0 mt-px" />
              <p className="text-[13.5px] text-rose-800 font-medium">{errorMessage}</p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
