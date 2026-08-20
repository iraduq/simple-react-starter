import { useState } from "react";
import { KeyRound, Loader as Loader2 } from "lucide-react";
import { Link, useNavigate } from "@/lib/router-compat";
import { useToast } from "../components/Toast";
import { resetPassword } from "../services/authService";
import { httpErrorMessage } from "../services/apiClient";

const inputCls =
  "w-full rounded-xl border border-[#e1e8f0] bg-white px-3.5 py-2.5 text-[14px] text-[#0d2c5c] outline-none focus:border-[#c69a3f]";
const labelCls = "mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#8595aa]";

/** POST /auth/reset-password */
export default function ResetPassword({ token: tokenProp }: { token?: string }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [token, setToken] = useState(tokenProp ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Parola trebuie să aibă minimum 8 caractere.");
    if (password !== confirm) return setError("Parolele nu coincid.");
    if (!token) return setError("Codul de resetare lipsește.");

    setLoading(true);
    try {
      await resetPassword(token, password);
      toast("Parolă schimbată. Te poți autentifica.", "success");
      navigate("/login", { replace: true });
    } catch (err) {
      setError(httpErrorMessage(err, "Resetarea a eșuat."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-[28px] text-[#0d2c5c]" style={{ fontFamily: "var(--font-display)" }}>
        Parolă nouă
      </h1>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {!tokenProp && (
          <label className="block">
            <span className={labelCls}>Cod / token din email</span>
            <input value={token} onChange={(e) => setToken(e.target.value)} className={inputCls} required />
          </label>
        )}
        <label className="block">
          <span className={labelCls}>Parolă nouă</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
            required
          />
        </label>
        <label className="block">
          <span className={labelCls}>Confirmă parola</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputCls}
            required
          />
        </label>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d2c5c] px-5 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-white hover:bg-[#c69a3f] hover:text-[#0d2c5c] disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
          Schimbă parola
        </button>
      </form>

      <Link to="/login" className="mt-6 inline-block text-[13px] font-semibold text-[#0d2c5c] underline">
        Înapoi la autentificare
      </Link>
    </div>
  );
}
