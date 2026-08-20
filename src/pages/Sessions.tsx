import { useCallback, useEffect, useState } from "react";
import { Monitor, Loader as Loader2, LogOut } from "lucide-react";
import { useToast } from "../components/Toast";
import { mySessions, revokeAllMySessions, revokeMySession } from "../services/usersService";
import { httpErrorMessage } from "../services/apiClient";
import type { SessionInfo } from "../types/auth";

/** GET/DELETE /users/me/sessions */
export default function Sessions() {
  const { toast } = useToast();
  const [items, setItems] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await mySessions());
    } catch (e) {
      setItems([]);
      setError(httpErrorMessage(e, "Nu am putut încărca sesiunile."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const revoke = async (id: number | string) => {
    setBusy(String(id));
    try {
      await revokeMySession(id);
      toast("Sesiune revocată.", "success");
      await load();
    } catch (e) {
      toast(httpErrorMessage(e, "Revocarea a eșuat."), "error");
    } finally {
      setBusy(null);
    }
  };

  const revokeAll = async () => {
    if (!window.confirm("Deconectezi toate celelalte dispozitive?")) return;
    setBusy("all");
    try {
      await revokeAllMySessions();
      toast("Toate sesiunile au fost revocate.", "success");
      await load();
    } catch (e) {
      toast(httpErrorMessage(e, "Revocarea a eșuat."), "error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-[820px] px-4 py-10 lg:py-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[clamp(1.6rem,3vw,2.2rem)] text-[#0d2c5c]" style={{ fontFamily: "var(--font-display)" }}>
          Sesiuni active
        </h1>
        <button
          onClick={() => void revokeAll()}
          disabled={busy === "all"}
          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3.5 py-2 text-[12px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          <LogOut size={14} /> Deconectează tot
        </button>
      </div>

      {loading ? (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-[#eef2f7]" />
          ))}
        </div>
      ) : error ? (
        <p role="alert" className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-[13.5px] text-red-700">
          {error}
        </p>
      ) : items.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-[#e1e8f0] bg-white px-6 py-14 text-center text-[14px] text-[#6b7c99]">
          Nicio sesiune activă.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {items.map((s) => (
            <li
              key={String(s.id)}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e1e8f0] bg-white p-5"
            >
              <div className="flex items-start gap-3">
                <Monitor size={18} className="mt-0.5 text-[#c69a3f]" />
                <div>
                  <p className="text-[14px] font-semibold text-[#0d2c5c]">
                    {s.device || s.browser_family || "Dispozitiv necunoscut"}
                    {s.is_current ? " · această sesiune" : ""}
                  </p>
                  <p className="mt-0.5 text-[12px] text-[#6b7c99]">
                    {s.ip_address || "IP necunoscut"}
                    {s.location ? ` · ${s.location}` : ""}
                    {s.last_seen_at ? ` · ultima activitate ${new Date(s.last_seen_at).toLocaleString("ro-RO")}` : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={() => void revoke(s.id)}
                disabled={busy === String(s.id)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#e1e8f0] px-3.5 py-2 text-[12px] font-semibold text-[#0d2c5c] hover:border-[#0d2c5c] disabled:opacity-60"
              >
                {busy === String(s.id) && <Loader2 size={14} className="animate-spin" />} Revocă
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
