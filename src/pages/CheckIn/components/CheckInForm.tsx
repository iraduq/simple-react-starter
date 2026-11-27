import { Clock, KeyRound, RefreshCw, AlertCircle } from "lucide-react";

interface CheckInFormProps {
  notes: string;
  setNotes: (notes: string) => void;
  submitting: boolean;
  checkinError: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CheckInForm({
  notes,
  setNotes,
  submitting,
  checkinError,
  onSubmit,
}: CheckInFormProps) {
  return (
    <form onSubmit={onSubmit} className="mt-8 pt-6 border-t border-[#eef2f7]">
      <div className="rounded-2xl border border-[#c69a3f]/40 bg-[#fdfaf5] p-5 mb-6">
        <div className="flex items-start gap-3">
          <Clock size={20} className="text-[#c69a3f] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[14px] font-bold text-[#0d2c5c]">
              Pregătit pentru Self Check-in
            </h4>
            <p className="text-[12.5px] text-[#6b7c99] mt-1">
              Confirmă check-in-ul pentru a debloca instant codul digital PIN pe care îl vei folosi
              la clanța inteligentă a camerei tale.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#2a3b52] mb-1.5">
            Mențiuni la sosire / Ora estimată (opțional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Sosire în jurul orei 16:30, doresc parcare"
            className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-2.5 text-[13px] text-[#0d2c5c] placeholder-[#94a3b8] focus:border-[#0d2c5c] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d2c5c] py-3.5 px-6 text-[12.5px] font-bold uppercase tracking-[0.16em] text-white hover:bg-[#c69a3f] hover:text-[#0c1523] transition-all shadow-md disabled:opacity-50"
        >
          {submitting ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Generare Cod PIN…
            </>
          ) : (
            <>
              <KeyRound size={16} />
              Finalizează Self Check-in & Obține Cheia Digitală
            </>
          )}
        </button>

        {checkinError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12.5px] text-amber-900 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <span>{checkinError}</span>
          </div>
        )}
      </div>
    </form>
  );
}
