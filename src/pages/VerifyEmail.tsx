import { API_URL } from "../lib/config";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft, CircleAlert as AlertCircle } from "lucide-react";



export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? "";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true });
      return;
    }
    inputRefs.current[0]?.focus();
  }, [email, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleCodeChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    setError("");

    if (digit && index < 5) inputRefs.current[index + 1]?.focus();

    if (next.every((d) => d !== "") && digit) {
      verifyCode(next.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((d, i) => (next[i] = d));
    setCode(next);
    setError("");
    if (pasted.length === 6) {
      verifyCode(pasted);
      inputRefs.current[5]?.focus();
    } else {
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const verifyCode = async (fullCode: string) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code: fullCode }),
      });

      if (res.ok) {
        setSuccess("Cont verificat cu succes! Te redirectionăm...");
        setTimeout(() => navigate("/login", { replace: true }), 1500);
        return;
      }

      const contentType = res.headers.get("content-type");
      const data = contentType?.includes("application/json")
        ? await res.json()
        : null;
      const msg =
        data && typeof data === "object" && "detail" in data
          ? String(data.detail)
          : "Cod incorect sau expirat.";
      setError(msg);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      setError("Problemă de conexiune. Încearcă din nou.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSuccess("Un nou cod a fost trimis pe email.");
        setResendCooldown(30);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const contentType = res.headers.get("content-type");
        const data = contentType?.includes("application/json")
          ? await res.json()
          : null;
        setError(
          data && typeof data === "object" && "detail" in data
            ? String(data.detail)
            : "Nu s-a putut trimite un nou cod.",
        );
      }
    } catch {
      setError("Problemă de conexiune. Încearcă din nou.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Introdu codul complet de 6 cifre.");
      return;
    }
    verifyCode(fullCode);
  };

  return (
    <div className="flex min-h-screen bg-white font-sans max-[899px]:bg-[radial-gradient(circle_at_top_right,#e6efff,#f4f7fb)]">
      <div
        className="relative flex-[1.2] hidden min-[900px]:block bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage:
            "url(https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(13,44,92,0.4) 0%, rgba(13,44,92,0.85) 100%)",
          }}
        />
        <svg
          className="absolute bottom-0 -right-px w-[15%] h-full z-[2]"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <polygon fill="#ffffff" points="0,100 100,0 100,100" />
        </svg>
        <div className="relative z-[3] h-full flex flex-col justify-between p-[50px_80px_80px_50px] text-white">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.1em] text-white/80 hover:text-white transition-all duration-200 hover:-translate-x-1 self-start"
          >
            <ArrowLeft size={16} /> Înapoi acasă
          </Link>
          <div>
            <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.5rem,4vw,3.5rem)] font-normal leading-[1.1] mb-5 max-w-[500px]">
              Aproape gata.
            </h2>
            <p className="text-[1.1rem] leading-[1.6] text-white/85 max-w-[450px]">
              Confirmă adresa de email pentru a-ți activa contul și a te bucura
              de toate facilitățile Casa Esy.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-10 relative z-[3] max-[899px]:bg-transparent">
        <div className="w-full max-w-[420px] max-[899px]:bg-white max-[899px]:p-10 max-[899px]:rounded-2xl max-[899px]:shadow-[0_10px_40px_rgba(13,44,92,0.14)] max-[899px]:border max-[899px]:border-[#e1e8f0] max-[500px]:p-6">
          <Link
            to="/"
            className="flex flex-col items-center mb-10 no-underline"
          >
            <span className="font-['Cormorant_Garamond',serif] text-[28px] text-[#0d2c5c]">
              Casa <em className="italic">Esy</em>
            </span>
            <span className="text-[#d4a437] text-[10px] tracking-[2px]">★★★</span>
          </Link>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#e6efff] mb-5">
              <Mail size={24} className="text-[#1e4d8c]" strokeWidth={1.5} />
            </div>
            <h1 className="font-['Cormorant_Garamond',serif] text-[32px] text-[#1a1a1a] mb-2.5 font-medium">
              Verifică-ți emailul
            </h1>
            <p className="text-[#8595aa] text-[14.5px] m-0">
              Am trimis un cod de 6 cifre la{" "}
              <strong className="text-[#1a1a1a] font-semibold">{email}</strong>
              . Introdu-l mai jos.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 text-red-800 border border-red-300 px-4 py-3 rounded-[10px] text-[13.5px] font-medium mb-5">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-4 py-3 rounded-[10px] text-[13.5px] font-medium mb-5">
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={isLoading}
                  className="w-12 h-14 text-center text-xl font-bold border border-[#e1e8f0] rounded-[10px] bg-[#f4f7fb] text-[#1a1a1a] outline-none transition-all duration-200 focus:border-[#1e4d8c] focus:bg-white focus:shadow-[0_4px_15px_rgba(30,77,140,0.08)] disabled:opacity-60"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || code.some((d) => d === "")}
              className="flex items-center justify-center gap-3 w-full py-[18px] bg-[#0d2c5c] text-white rounded-[10px] text-sm font-bold tracking-[0.1em] uppercase shadow-[0_4px_15px_rgba(13,44,92,0.15)] transition-all duration-300 hover:not-disabled:bg-[#c69a3f] hover:not-disabled:text-[#0d2c5c] hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_8px_25px_rgba(198,154,63,0.3)] disabled:bg-[#8595aa] disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isLoading ? "Se verifică..." : "Verifică codul"}
              {!isLoading && <ArrowRight size={18} strokeWidth={2} />}
            </button>
          </form>

          <div className="text-center mt-7">
            <p className="text-[13.5px] text-[#3c4043] m-0">
              Nu ai primit codul?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || resendCooldown > 0}
                className="bg-transparent border-none p-0 font-inherit text-[#1e4d8c] font-semibold cursor-pointer hover:text-[#c69a3f] transition-colors duration-200 disabled:text-[#8595aa] disabled:cursor-not-allowed"
              >
                {isResending
                  ? "Se trimite..."
                  : resendCooldown > 0
                    ? `Retrimite în ${resendCooldown}s`
                    : "Retrimite codul"}
              </button>
            </p>
          </div>

          <p className="text-center mt-6 text-sm text-[#3c4043]">
            <Link
              to="/register"
              className="text-[#0d2c5c] font-bold no-underline border-b border-transparent hover:text-[#c69a3f] hover:border-[#c69a3f] transition-colors duration-200"
            >
              Schimbă adresa de email
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
