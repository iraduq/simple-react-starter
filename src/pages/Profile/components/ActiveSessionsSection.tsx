import { Monitor } from "lucide-react";
import type { SessionItem } from "../types";

interface ActiveSessionsSectionProps {
  sessions: SessionItem[];
  loadingSessions: boolean;
  onRefresh: () => void;
  onRevokeSession: (id: string) => void;
  onRevokeAllOther: () => void;
}

export default function ActiveSessionsSection({
  sessions,
  loadingSessions,
  onRefresh,
  onRevokeSession,
  onRevokeAllOther,
}: ActiveSessionsSectionProps) {
  return (
    <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_10px_40px_rgba(13,44,92,0.06)] border border-[#e1e8f0]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[10.5px] font-bold tracking-[0.2em] uppercase text-[#0d2c5c] mb-1">
            Dispozitive conectate
          </p>
          <h2 className="font-['Outfit',sans-serif] text-[24px] font-bold text-[#0d2c5c]">
            Sesiuni active
          </h2>
          <p className="text-[12.5px] text-[#64748b] mt-0.5 font-['Plus_Jakarta_Sans',sans-serif]">
            Gestionează dispozitivele conectate la contul tău Casa Esy.
          </p>
        </div>
        <div className="flex items-center gap-2 font-['Plus_Jakarta_Sans',sans-serif]">
          <button
            onClick={onRefresh}
            className="px-3.5 py-2 rounded-[12px] border border-[#e1e8f0] text-[12px] font-bold text-[#0d2c5c] hover:bg-[#f8fafd]"
          >
            Reîmprospătează
          </button>
          {sessions.some((s) => !s.is_current) && (
            <button
              onClick={onRevokeAllOther}
              className="px-3.5 py-2 rounded-[12px] border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[12px] font-bold transition-colors"
            >
              Deconectează celelalte
            </button>
          )}
        </div>
      </div>

      {loadingSessions ? (
        <p className="text-[13px] text-[#6b7c99]">Se încarcă dispozitivele…</p>
      ) : sessions.length === 0 ? (
        <p className="text-[13px] text-[#6b7c99]">Nicio sesiune activă raportată.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-['Plus_Jakarta_Sans',sans-serif]">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`p-4 rounded-[16px] border flex items-center justify-between ${
                s.is_current
                  ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                  : "bg-[#f8fafd] border-[#e1e8f0]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    s.is_current
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-white border border-[#e1e8f0] text-[#0d2c5c]"
                  }`}
                >
                  <Monitor size={17} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#0d2c5c]">
                    {s.browser_family || "Browser"} • {s.os_family || "Dispozitiv"}
                  </p>
                  <p className="text-[11.5px] text-[#64748b]">
                    IP: {s.ip_address || "—"} {s.is_current && "• (Acest dispozitiv)"}
                  </p>
                </div>
              </div>
              {!s.is_current && (
                <button
                  onClick={() => onRevokeSession(s.id)}
                  className="text-[11.5px] text-red-600 hover:underline font-bold"
                >
                  Deconectează
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
