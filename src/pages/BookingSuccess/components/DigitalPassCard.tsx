import { Link } from "react-router-dom";
import { Check, Copy, KeyRound, Download, Loader2, Home } from "lucide-react";

interface DigitalPassCardProps {
  bookingCode: string;
  qrImageSrc: string;
  accessPin?: string | null;
  copiedCode: boolean;
  onCopyCode: () => void;
  downloadingPdf: boolean;
  pdfError: string | null;
  onDownloadInvoice: () => void;
}

export default function DigitalPassCard({
  bookingCode,
  qrImageSrc,
  accessPin,
  copiedCode,
  onCopyCode,
  downloadingPdf,
  pdfError,
  onDownloadInvoice,
}: DigitalPassCardProps) {
  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-[#0d2c5c]/10 border-t-4 border-[#c69a3f] border-x border-b border-slate-200/80 overflow-hidden">
      <div className="p-6 sm:p-7 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c69a3f] mb-1">
          Digital Boarding Pass
        </p>
        <h3 className="text-xl font-serif font-bold text-[#0d2c5c] mb-5">
          Cod QR & Referință Check-in
        </h3>

        {qrImageSrc ? (
          <div className="inline-flex p-4 rounded-2xl bg-[#fdf8ec] border border-[#c69a3f]/30 shadow-inner mb-5">
            <img
              src={qrImageSrc}
              alt={`Cod QR rezervare ${bookingCode}`}
              className="w-44 h-44 rounded-xl bg-white p-2 shadow-sm"
            />
          </div>
        ) : null}

        {bookingCode ? (
          <div className="rounded-2xl bg-[#0d2c5c]/5 border border-[#0d2c5c]/10 p-4 mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1">
              Cod rezervare
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <span className="font-mono text-2xl font-extrabold tracking-widest text-[#0d2c5c]">
                {bookingCode}
              </span>
              <button
                type="button"
                onClick={onCopyCode}
                title="Copiază codul rezervării"
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#0d2c5c] hover:border-[#0d2c5c]/30 transition-colors"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copiedCode ? (
              <p className="text-xs text-emerald-600 font-medium mt-1">
                Cod copiat în clipboard!
              </p>
            ) : null}
          </div>
        ) : null}

        {accessPin ? (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 mb-5 flex items-center justify-between text-sm">
            <span className="text-emerald-800 font-medium flex items-center gap-1.5">
              <KeyRound className="w-4 h-4" />
              PIN acces cameră
            </span>
            <span className="font-mono font-bold text-emerald-900 tracking-wider">
              {accessPin}
            </span>
          </div>
        ) : null}

        <div className="space-y-2.5 pt-2">
          {bookingCode ? (
            <Link
              to={`/checkin/${encodeURIComponent(bookingCode)}`}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#0d2c5c] text-white py-3.5 px-5 rounded-xl font-semibold hover:bg-[#143d7a] transition-colors shadow-md shadow-[#0d2c5c]/15"
            >
              <KeyRound className="w-4 h-4 text-[#f3d48b]" />
              Completează Check-in Online
            </Link>
          ) : null}

          {bookingCode ? (
            <button
              type="button"
              onClick={onDownloadInvoice}
              disabled={downloadingPdf}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#fdf8ec] text-[#0d2c5c] border border-[#c69a3f]/40 py-3 px-5 rounded-xl font-semibold hover:bg-[#faefd6] transition-colors disabled:opacity-60"
            >
              {downloadingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-[#9c7624]" />
              )}
              {downloadingPdf ? "Se descarcă factura..." : "Descarcă factura PDF"}
            </button>
          ) : null}

          {pdfError ? (
            <p className="text-xs text-rose-600 text-center pt-1">{pdfError}</p>
          ) : null}

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <Link
              to="/profile"
              className="inline-flex items-center justify-center gap-1.5 border border-slate-200 text-slate-700 py-2.5 px-3 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Rezervările mele
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-1.5 border border-slate-200 text-slate-700 py-2.5 px-3 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              Acasă
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
