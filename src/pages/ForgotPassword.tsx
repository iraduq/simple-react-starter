import { useState } from "react";
import { Loader as Loader2, Mail } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { forgotPassword } from "../services/authService";
import { httpErrorMessage } from "../services/apiClient";

/** POST /auth/forgot-password */
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(httpErrorMessage(err, "Nu am putut trimite emailul de resetare."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-[28px] text-[#0d2c5c]" style={{ fontFamily: "var(--font-display)" }}>
        Resetare parolă
      </h1>
      <p className="mt-2 text-[13.5px] text-[#6b7c99]">
        Îți trimitem un link de resetare pe adresa de email.
      </p>

      {sent ? (
        <p className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-[13.5px] text-emerald-800">
          Dacă adresa există în sistem, vei primi un email cu instrucțiuni.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#8595aa]">
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#e1e8f0] bg-white px-3.5 py-2.5 text-[14px] text-[#0d2c5c] outline-none focus:border-[#c69a3f]"
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
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
            Trimite link
          </button>
        </form>
      )}

      <Link to="/login" className="mt-6 inline-block text-[13px] font-semibold text-[#0d2c5c] underline">
        Înapoi la autentificare
      </Link>
    </div>
  );
}
