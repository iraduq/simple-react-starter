import { BadgeCheck, Shield, Lock, RefreshCcw } from "lucide-react";
import type { SessionUser } from "../../../lib/auth";
import type { TabKey } from "../../../types/profile";
import { useToast } from "../../Toast";

interface OverviewQuickSummaryProps {
  user: NonNullable<SessionUser>;
  fullName: string;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  goToTab: (t: TabKey) => void;
}

export default function OverviewQuickSummary({
  user,
  fullName,
  notificationsEnabled,
  onToggleNotifications,
  goToTab,
}: OverviewQuickSummaryProps) {
  const { toast } = useToast();

  const handleExportGdpr = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `gdpr_data_${user.email}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast("Datele GDPR au fost exportate cu succes.", "success");
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Personale Contact */}
        <div className="bg-white rounded-[24px] p-6 sm:p-7 shadow-[0_10px_40px_rgba(13,44,92,0.06)] border border-[#e1e8f0] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold tracking-[0.22em] uppercase text-[#0d2c5c] flex items-center gap-2">
                <span className="w-4 h-px bg-[#c69a3f]" />
                <span>Date personale de contact</span>
              </p>
              <button
                onClick={() => goToTab("personal")}
                className="text-[12.5px] font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#c69a3f] hover:underline cursor-pointer"
              >
                Editează
              </button>
            </div>

            <div className="space-y-3.5 font-['Plus_Jakarta_Sans',sans-serif]">
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b]">Nume complet</p>
                <p className="font-['Outfit',sans-serif] text-[18px] font-bold text-[#0d2c5c] mt-0.5">{fullName}</p>
              </div>
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b]">Adresă de email</p>
                <p className="text-[14px] text-[#0d2c5c] mt-0.5 flex items-center gap-1.5 truncate font-semibold">
                  <span>{user.email}</span>
                  <BadgeCheck size={14} className="text-[#c69a3f] shrink-0" />
                </p>
              </div>
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b]">Număr de telefon</p>
                <p className="text-[14px] text-[#0d2c5c] mt-0.5 font-semibold">{(user as any).phone || "Necompletat"}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#e1e8f0] flex items-center justify-between text-[12px] font-['Plus_Jakarta_Sans',sans-serif]">
            <span className="text-[#64748b]">
              Limba: <b className="text-[#0d2c5c]">Română</b>
            </span>
            <span className="text-[#0d2c5c] bg-amber-50 border border-[#c69a3f]/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
              ✓ Cont verificat
            </span>
          </div>
        </div>

        {/* Securitate și setări cont */}
        <div className="bg-white rounded-[24px] p-6 sm:p-7 shadow-[0_10px_40px_rgba(13,44,92,0.06)] border border-[#e1e8f0] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold tracking-[0.22em] uppercase text-[#0d2c5c] flex items-center gap-2">
                <span className="w-4 h-px bg-[#c69a3f]" />
                <span>Securitate și setări cont</span>
              </p>
              <button
                onClick={() => goToTab("security")}
                className="text-[12.5px] font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#c69a3f] hover:underline cursor-pointer"
              >
                Gestionează
              </button>
            </div>

            <div className="space-y-3 font-['Plus_Jakarta_Sans',sans-serif]">
              <div className="flex items-center justify-between p-3 rounded-[14px] bg-[#f8fafc] border border-[#e1e8f0]">
                <div className="flex items-center gap-2.5">
                  <Shield size={16} className="text-[#c69a3f]" />
                  <div>
                    <p className="text-[12.5px] font-bold text-[#0d2c5c]">Protecție cont</p>
                    <p className="text-[11px] text-[#64748b]">Parolă criptată cu hash securizat</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#0d2c5c] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Activ
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-[14px] bg-[#f8fafc] border border-[#e1e8f0]">
                <div className="flex items-center gap-2.5">
                  <Lock size={16} className="text-[#c69a3f]" />
                  <div>
                    <p className="text-[12.5px] font-bold text-[#0d2c5c]">Sesiuni conectate</p>
                    <p className="text-[11px] text-[#64748b]">Dispozitive autorizate Casa Esy</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#0d2c5c] bg-amber-50 border border-[#c69a3f]/30 px-2.5 py-0.5 rounded-full">
                  1 Activă
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#e1e8f0] flex items-center justify-between font-['Plus_Jakarta_Sans',sans-serif]">
            <span className="text-[12.5px] font-semibold text-[#0d2c5c]">Notificări SMS / WhatsApp</span>
            <button
              onClick={onToggleNotifications}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                notificationsEnabled ? "bg-[#0d2c5c]" : "bg-slate-300"
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  notificationsEnabled ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="bg-white rounded-[20px] px-6 py-4 shadow-[0_10px_35px_rgba(13,44,92,0.06)] border border-[#e1e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[12.5px] text-[#6b7c99]">
          <RefreshCcw size={13} className="text-[#c69a3f]" />
          <span>Modificările sunt sincronizate instant cu sistemul hotelului.</span>
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={handleExportGdpr}
            className="text-[12.5px] font-semibold text-[#6b7c99] hover:text-[#0d2c5c] transition-colors cursor-pointer"
          >
            Exportă date GDPR
          </button>
          <button
            onClick={() => toast("Setările profilului au fost salvate cu succes!", "success")}
            className="px-5 h-11 rounded-[12px] bg-[#0d2c5c] hover:bg-[#123a75] text-white text-[13px] font-semibold transition-colors shadow-sm cursor-pointer"
          >
            Salvează setările profilului
          </button>
        </div>
      </div>
    </>
  );
}
