import { useState } from "react";
import type { SessionUser } from "../../../lib/auth";
import { apiFetch } from "../../../lib/api";
import { fetchSession, notifySessionChange } from "../../../lib/auth";
import { useToast } from "../../../components/Toast";
import { getInitials } from "../types";

interface PersonalTabProps {
  user: NonNullable<SessionUser>;
  setUser: (u: SessionUser) => void;
  onAvatarClick: () => void;
  onRemoveAvatar: () => void;
  uploadingAvatar: boolean;
}

export default function PersonalTab({
  user,
  setUser,
  onAvatarClick,
  onRemoveAvatar,
  uploadingAvatar,
}: PersonalTabProps) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    phone: (user as any).phone || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      setUser({ ...user, ...form });
      await fetchSession(true);
      notifySessionChange();
      toast("Datele profilului au fost salvate!", "success");
    } catch (err: any) {
      toast(err?.message || "Eroare la salvarea datelor.", "error");
    } finally {
      setSaving(false);
    }
  };

  const fullName =
    [form.first_name, form.last_name].filter(Boolean).join(" ") ||
    user.email.split("@")[0];

  return (
    <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_10px_40px_rgba(13,44,92,0.06)] border border-[#e1e8f0] space-y-6">
      <div>
        <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold tracking-[0.22em] uppercase text-[#0d2c5c] mb-2 flex items-center gap-2">
          <span className="w-5 h-px bg-[#c69a3f]" />
          <span>Date personale</span>
        </p>
        <h2 className="font-['Outfit',sans-serif] text-[28px] sm:text-[34px] font-bold tracking-tight text-[#0d2c5c]">
          Profilul tău la Casa Esy
        </h2>
        <p className="text-[13.5px] text-[#64748b] mt-1 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
          Actualizează datele de contact și fotografia afișată pe contul tău de oaspete.
        </p>
      </div>

      {/* Profil Avatar uploader */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 rounded-[18px] bg-[#f8fafc] border border-[#e1e8f0]">
        <div className="relative w-20 h-20 rounded-full p-[2.5px] bg-[#c69a3f]/40 border border-[#c69a3f]/30 shrink-0 shadow-sm">
          <div className="w-full h-full rounded-full bg-[#0d2c5c] overflow-hidden flex items-center justify-center font-['Outfit',sans-serif] text-[26px] font-bold text-white">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              getInitials(fullName)
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0 font-['Plus_Jakarta_Sans',sans-serif]">
          <p className="text-[14.5px] font-bold text-[#0d2c5c]">Fotografie de Profil</p>
          <p className="text-[12px] text-[#64748b] mt-0.5">Formate acceptate: JPG, PNG sau WebP (maxim 5 MB).</p>
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={onAvatarClick}
              disabled={uploadingAvatar}
              className="px-4 py-2 rounded-[12px] bg-[#0d2c5c] hover:bg-[#07203f] text-white text-[12px] font-bold transition-all disabled:opacity-50 shadow-xs cursor-pointer"
            >
              {uploadingAvatar ? "Se încarcă…" : user.avatar_url ? "Schimbă Fotografia" : "Încarcă Fotografie"}
            </button>
            {user.avatar_url && (
              <button
                type="button"
                onClick={onRemoveAvatar}
                disabled={uploadingAvatar}
                className="px-3.5 py-2 rounded-[12px] border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[12px] font-bold transition-colors disabled:opacity-50 cursor-pointer"
              >
                Șterge
              </button>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] block mb-1.5">
              Prenume
            </label>
            <input
              type="text"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              className="w-full px-4 py-3 rounded-[14px] border border-[#e1e8f0] focus:border-[#c69a3f] outline-none text-[13.5px] text-[#0d2c5c]"
              placeholder="Ex: Andrei"
              required
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] block mb-1.5">
              Nume de familie
            </label>
            <input
              type="text"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              className="w-full px-4 py-3 rounded-[14px] border border-[#e1e8f0] focus:border-[#c69a3f] outline-none text-[13.5px] text-[#0d2c5c]"
              placeholder="Ex: Popescu"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] block mb-1.5">
            Număr de telefon
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-3 rounded-[14px] border border-[#e1e8f0] focus:border-[#c69a3f] outline-none text-[13.5px] text-[#0d2c5c]"
            placeholder="+40 712 345 678"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 h-12 rounded-[14px] bg-[#0d2c5c] hover:bg-[#07203f] text-white text-[13px] font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Se salvează..." : "Salvează Modificările"}
          </button>
        </div>
      </form>
    </div>
  );
}
