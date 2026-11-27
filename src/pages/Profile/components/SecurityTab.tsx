import { useState, useEffect } from "react";
import { apiFetch } from "../../../lib/api";
import { type SessionUser } from "../../../lib/auth";
import { useToast } from "../../../components/Toast";
import type { SessionItem } from "../types";
import ActiveSessionsSection from "./ActiveSessionsSection";

export default function SecurityTab({
  user: _user,
  onLogout: _onLogout,
}: {
  user: NonNullable<SessionUser>;
  onLogout: () => void;
}) {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [savingPwd, setSavingPwd] = useState(false);

  const loadSessions = () => {
    setLoadingSessions(true);
    apiFetch<SessionItem[]>("/users/me/sessions")
      .then((d) => setSessions(Array.isArray(d) ? d : []))
      .catch(() => setSessions([]))
      .finally(() => setLoadingSessions(false));
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.next !== pwd.confirm) {
      toast("Parolele noi nu coincid.", "error");
      return;
    }
    setSavingPwd(true);
    try {
      await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ current_password: pwd.current, new_password: pwd.next }),
      });
      toast("Parola a fost actualizată cu succes!", "success");
      setPwd({ current: "", next: "", confirm: "" });
    } catch (err: any) {
      toast(err?.message || "Eroare la schimbarea parolei.", "error");
    } finally {
      setSavingPwd(false);
    }
  };

  const handleRevokeSession = async (id: string) => {
    try {
      await apiFetch(`/users/me/sessions/${id}`, { method: "DELETE" });
      setSessions((cur) => cur.filter((s) => s.id !== id));
      toast("Sesiunea a fost revocată.", "success");
    } catch {
      toast("Eroare la revocarea sesiunii.", "error");
    }
  };

  const handleRevokeAllOther = async () => {
    try {
      await apiFetch("/users/me/sessions", { method: "DELETE" });
      setSessions((cur) => cur.filter((s) => s.is_current));
      toast("Toate celelalte dispozitive au fost deconectate.", "success");
    } catch {
      toast("Eroare la revocarea sesiunilor.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_10px_40px_rgba(13,44,92,0.06)] border border-[#e1e8f0]">
        <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold tracking-[0.22em] uppercase text-[#0d2c5c] mb-2 flex items-center gap-2">
          <span className="w-5 h-px bg-[#c69a3f]" />
          <span>Securitate cont</span>
        </p>
        <h2 className="font-['Outfit',sans-serif] text-[28px] sm:text-[34px] font-bold tracking-tight text-[#0d2c5c]">
          Schimbare parolă
        </h2>
        <p className="text-[13.5px] text-[#64748b] mt-1 mb-5 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
          Folosește o parolă puternică cu majuscule, litere mici, cifre și simboluri pentru protecția contului.
        </p>

        <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 font-['Plus_Jakarta_Sans',sans-serif]">
          <div>
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] block mb-1.5">
              Parola curentă
            </label>
            <input
              type="password"
              value={pwd.current}
              onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
              className="w-full px-4 py-3 rounded-[14px] border border-[#e1e8f0] focus:border-[#c69a3f] outline-none text-[13.5px] text-[#0d2c5c]"
              required
            />
          </div>
          <div>
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] block mb-1.5">
              Parola nouă
            </label>
            <input
              type="password"
              value={pwd.next}
              onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
              className="w-full px-4 py-3 rounded-[14px] border border-[#e1e8f0] focus:border-[#c69a3f] outline-none text-[13.5px] text-[#0d2c5c]"
              required
            />
          </div>
          <div>
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] block mb-1.5">
              Confirmă parola nouă
            </label>
            <input
              type="password"
              value={pwd.confirm}
              onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
              className="w-full px-4 py-3 rounded-[14px] border border-[#e1e8f0] focus:border-[#c69a3f] outline-none text-[13.5px] text-[#0d2c5c]"
              required
            />
          </div>
          <div className="md:col-span-3 flex justify-end mt-2">
            <button
              type="submit"
              disabled={savingPwd}
              className="px-6 h-12 rounded-[14px] bg-[#0d2c5c] hover:bg-[#07203f] text-white text-[13px] font-bold transition-all shadow-sm disabled:opacity-50"
            >
              {savingPwd ? "Se actualizează..." : "Actualizează parola"}
            </button>
          </div>
        </form>
      </div>

      <ActiveSessionsSection
        sessions={sessions}
        loadingSessions={loadingSessions}
        onRefresh={loadSessions}
        onRevokeSession={handleRevokeSession}
        onRevokeAllOther={handleRevokeAllOther}
      />
    </div>
  );
}
