import { Send, CheckCircle2 } from "lucide-react";

interface GdprDsarFormProps {
  reqType: string;
  setReqType: (v: string) => void;
  bookingRef: string;
  setBookingRef: (v: string) => void;
  fullName: string;
  setFullName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  details: string;
  setDetails: (v: string) => void;
  submittedCode: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export default function GdprDsarForm({
  reqType,
  setReqType,
  bookingRef,
  setBookingRef,
  fullName,
  setFullName,
  email,
  setEmail,
  details,
  setDetails,
  submittedCode,
  onSubmit,
}: GdprDsarFormProps) {
  return (
    <div>
      <p className="mb-3">
        Folosiți formularul de mai jos pentru a transmite o solicitare oficială către Responsabilul cu Protecția
        Datelor (DPO). Termenul legal de soluționare este de maximum 30 de zile calendaristice conform{" "}
        <strong>Art. 12 alin. (3) GDPR</strong>.
      </p>

      {submittedCode && (
        <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-900 flex items-start gap-2.5">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-600 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong>Cerere înregistrată cu numărul #{submittedCode}</strong>. Confirmarea a fost preluată de
            departamentul DPO (privacy@casaesy.ro). Veți primi răspunsul oficial pe adresa de e-mail indicată.
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="rounded-2xl border border-[#e1e8f0] bg-[#f8fafc] p-4 sm:p-5 space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#0d2c5c] mb-1">Tipul dreptului exercitat *</label>
            <select
              value={reqType}
              onChange={(e) => setReqType(e.target.value)}
              className="w-full rounded-xl border border-[#cbd5e1] bg-white px-3 py-2 text-xs font-semibold text-[#0d2c5c]"
            >
              <option value="access">Art. 15 — Dreptul de acces la datele personale</option>
              <option value="rectification">Art. 16 — Dreptul la rectificarea datelor</option>
              <option value="erasure">Art. 17 — Ștergerea datelor („Dreptul de a fi uitat”)</option>
              <option value="portability">Art. 20 — Portabilitatea datelor</option>
              <option value="objection">Art. 21 — Opoziție / Retragere consimțământ marketing</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0d2c5c] mb-1">Cod Rezervare #BK (opțional)</label>
            <input
              value={bookingRef}
              onChange={(e) => setBookingRef(e.target.value.toUpperCase())}
              placeholder="ex: BK-88412"
              className="w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2 text-xs font-mono text-[#0d2c5c]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0d2c5c] mb-1">Nume și Prenume *</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="ex: Alexandru Ionescu"
              className="w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2 text-xs text-[#0d2c5c]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0d2c5c] mb-1">Adresă de E-mail *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nume@exemplu.ro"
              className="w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2 text-xs text-[#0d2c5c]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0d2c5c] mb-1">Detalii suplimentare privind cererea</label>
          <textarea
            rows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Descrieți pe scurt solicitarea dumneavoastră..."
            className="w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2 text-xs text-[#0d2c5c]"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0d2c5c] hover:bg-[#c69a3f] text-white hover:text-[#0d2c5c] px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
          >
            <Send size={14} />
            Trimite Cererea Oficială GDPR
          </button>
        </div>
      </form>
    </div>
  );
}
