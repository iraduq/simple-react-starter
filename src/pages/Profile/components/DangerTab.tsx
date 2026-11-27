import { useState } from "react";
import { Trash2 } from "lucide-react";
import { API_URL } from "../../../lib/config";

export default function DangerTab({ onDeleted }: { onDeleted: () => void }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [word, setWord] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const canDelete = word === "ȘTERGE";

  const doDelete = async () => {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        onDeleted();
      } else {
        setErr("Nu am putut șterge contul. Încearcă din nou.");
      }
    } catch {
      setErr("Problemă de conexiune cu serverul.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_10px_40px_rgba(13,44,92,0.06)] border border-rose-200/80 space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      <div>
        <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-rose-600 mb-2 flex items-center gap-2">
          <span className="w-5 h-px bg-rose-400" />
          <span>Zonă de siguranță cont</span>
        </p>
        <h2
          className="text-[28px] sm:text-[34px] font-bold tracking-tight text-rose-700"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Ștergere definitivă a contului
        </h2>
        <p className="text-[13.5px] text-[#6b7c99] mt-1 leading-relaxed">
          Această acțiune este ireversibilă. Toate datele tale, rezervările și punctele de loialitate vor fi eliminate definitiv din sistemul Casa Esy.
        </p>
      </div>

      <div className="p-5 rounded-[18px] border border-rose-200/80 bg-rose-50/40">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h4 className="font-['Plus_Jakarta_Sans',sans-serif] text-[15px] font-bold text-rose-950">
              Elimină definitiv contul tău Casa Esy
            </h4>
            <p className="text-[12.5px] text-rose-800/80 mt-1 max-w-[500px]">
              Vei fi delogat imediat de pe toate dispozitivele și nu vei mai putea recupera contul sau istoricul de sejururi.
            </p>
          </div>
          {!confirmOpen && (
            <button
              onClick={() => setConfirmOpen(true)}
              className="px-5 py-2.5 rounded-[12px] bg-red-600 hover:bg-red-700 text-white text-[12.5px] font-semibold transition-colors shrink-0 shadow-sm"
            >
              Șterge contul definitiv
            </button>
          )}
        </div>

        {confirmOpen && (
          <div className="mt-5 pt-5 border-t border-red-200 space-y-4">
            <p className="text-[12.5px] font-semibold text-red-900">
              Pentru a confirma ștergerea definitivă, tastează cuvântul{" "}
              <b className="font-mono text-red-700 font-black">ȘTERGE</b> mai jos:
            </p>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="ȘTERGE"
              className="w-full sm:w-[260px] px-4 py-2.5 rounded-[12px] border border-red-300 bg-white text-red-900 font-mono text-[14px] outline-none"
            />
            {err && <p className="text-[12px] font-semibold text-red-600">{err}</p>}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  setWord("");
                  setErr("");
                }}
                className="px-4 py-2 rounded-[10px] border border-[#e1e8f0] bg-white text-[12.5px] font-semibold text-[#0d2c5c]"
              >
                Renunță
              </button>
              <button
                disabled={!canDelete || busy}
                onClick={doDelete}
                className="px-5 py-2 rounded-[10px] bg-red-600 hover:bg-red-700 text-white text-[12.5px] font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>{busy ? "Se șterge…" : "Confirmă Ștergerea Definitivă"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
