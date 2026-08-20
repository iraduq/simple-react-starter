import { API_URL } from "../lib/config";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import GoogleAuthButton from "../components/GoogleAuthButton";
import { fetchSession, notifySessionChange } from "../lib/auth";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Restaurează emailul memorat
  useEffect(() => {
    const saved = localStorage.getItem("casaesy_remember_email");
    if (saved) {
      setFormData((f) => ({ ...f, email: saved }));
    }
  }, []);

  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...formData }),
      });
      const contentType = res.headers.get("content-type");
      const data = contentType?.includes("application/json")
        ? await res.json()
        : null;

      if (res.ok) {
        const session = await fetchSession(true);
        notifySessionChange();
        navigate(session?.role === "admin" ? "/admin" : "/profile");
      } else {
        const errorMessage =
          data &&
          typeof data === "object" &&
          "detail" in data &&
          typeof data.detail === "string"
            ? data.detail
            : "Eroare la autentificare.";
        alert(errorMessage);
      }
    } catch {
      alert("A apărut o problemă de conexiune.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResetMessage("");
    try {
      await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: resetEmail }),
      });

      setResetMessage(
        "Dacă adresa există în sistemul nostru, vei primi un email cu instrucțiunile de resetare.",
      );
    } catch {
      setResetMessage(
        "A apărut o problemă de conexiune. Te rugăm să încerci din nou.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id_token: credentialResponse.credential,
        }),
      });

      if (res.ok) {
        const session = await fetchSession(true);
        notifySessionChange();
        navigate(session?.role === "admin" ? "/admin" : "/profile");
        return;
      }

      const contentType = res.headers.get("content-type");
      let errorMsg = `Eroare server (${res.status})`;
      if (contentType && contentType.includes("application/json")) {
        const data = (await res.json()) as Record<string, unknown>;
        if (data && typeof data.detail === "string") {
          errorMsg = data.detail;
        }
      }
      alert(errorMsg);
    } catch (error) {
      console.error("Eroare detaliată Google Login:", error);
      alert("A apărut o problemă de conexiune cu serverul.");
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans max-[899px]:bg-[radial-gradient(circle_at_top_right,#e6efff,#f4f7fb)]">
      <div
        className="relative flex-[1.2] hidden min-[900px]:block bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage:
            "url(https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)",
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
              Vacanța ta perfectă începe aici.
            </h2>
            <p className="text-[1.1rem] leading-[1.6] text-white/85 max-w-[450px]">
              Conectează-te pentru a-ți gestiona rezervările, a descoperi oferte
              exclusive și a planifica următoarea evadare la mare.
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
            <span className="text-[#d4a437] text-[10px] tracking-[2px]">
              ★★★
            </span>
          </Link>

          {isForgotPasswordView ? (
            <>
              <div className="text-center mb-10">
                <h1 className="font-['Cormorant_Garamond',serif] text-[32px] text-[#1a1a1a] mb-2.5 font-medium">
                  Recuperare Parolă
                </h1>
                <p className="text-[#8595aa] text-[14.5px] m-0">
                  Introdu adresa de email și îți vom trimite un link de
                  resetare.
                </p>
              </div>

              {resetMessage && (
                <div className="flex items-center gap-2.5 bg-blue-50 text-blue-900 border border-blue-200 px-4 py-3 rounded-[10px] text-[13.5px] font-medium mb-5">
                  <span>{resetMessage}</span>
                </div>
              )}

              <form
                onSubmit={handleForgotPassword}
                className="flex flex-col gap-4"
              >
                <div className="relative">
                  <Mail
                    className="absolute left-[18px] top-1/2 -translate-y-1/2 text-[#8595aa]"
                    size={18}
                    strokeWidth={1.5}
                  />
                  <input
                    type="email"
                    placeholder="Adresa de email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-[50px] pr-[44px] py-4 border border-[#e1e8f0] rounded-[10px] font-sans text-[14.5px] text-[#1a1a1a] bg-[#f4f7fb] outline-none transition-all duration-300 focus:border-[#1e4d8c] focus:bg-white focus:shadow-[0_4px_15px_rgba(30,77,140,0.08)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center gap-3 w-full py-[18px] bg-[#0d2c5c] text-white rounded-[10px] text-sm font-bold tracking-[0.1em] uppercase shadow-[0_4px_15px_rgba(13,44,92,0.15)] transition-all duration-300 hover:not-disabled:bg-[#c69a3f] hover:not-disabled:text-[#0d2c5c] hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_8px_25px_rgba(198,154,63,0.3)] disabled:bg-[#8595aa] disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {isLoading ? "Se trimite..." : "Trimite link-ul"}
                  {!isLoading && <ArrowRight size={18} strokeWidth={2} />}
                </button>
              </form>

              <div className="flex items-center text-center my-8 text-[#8595aa] text-[11px] font-bold tracking-[0.15em] before:content-[''] before:flex-1 before:border-b before:border-[#e1e8f0] after:content-[''] after:flex-1 after:border-b after:border-[#e1e8f0]" />

              <p className="text-center mt-9 text-sm text-[#3c4043]">
                Ți-ai amintit parola?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordView(false);
                    setResetMessage("");
                  }}
                  className="bg-transparent border-none text-[#0d2c5c] font-bold cursor-pointer text-inherit p-0 underline"
                >
                  Întoarce-te la Login
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-10">
                <h1 className="font-['Cormorant_Garamond',serif] text-[32px] text-[#1a1a1a] mb-2.5 font-medium">
                  Autentificare
                </h1>
                <p className="text-[#8595aa] text-[14.5px] m-0">
                  Mă bucur să te revăd! Te rugăm să introduci detaliile.
                </p>
              </div>

              <form onSubmit={handleLocalLogin} className="flex flex-col gap-4">
                <div className="relative">
                  <Mail
                    className="absolute left-[18px] top-1/2 -translate-y-1/2 text-[#8595aa]"
                    size={18}
                    strokeWidth={1.5}
                  />
                  <input
                    type="email"
                    placeholder="Adresa de email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-[50px] pr-[44px] py-4 border border-[#e1e8f0] rounded-[10px] font-sans text-[14.5px] text-[#1a1a1a] bg-[#f4f7fb] outline-none transition-all duration-300 focus:border-[#1e4d8c] focus:bg-white focus:shadow-[0_4px_15px_rgba(30,77,140,0.08)]"
                  />
                </div>

                <div className="relative">
                  <Lock
                    className="absolute left-[18px] top-1/2 -translate-y-1/2 text-[#8595aa]"
                    size={18}
                    strokeWidth={1.5}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Parola"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-[50px] pr-[44px] py-4 border border-[#e1e8f0] rounded-[10px] font-sans text-[14.5px] text-[#1a1a1a] bg-[#f4f7fb] outline-none transition-all duration-300 focus:border-[#1e4d8c] focus:bg-white focus:shadow-[0_4px_15px_rgba(30,77,140,0.08)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Ascunde parola" : "Arată parola"
                    }
                    className="absolute right-[14px] top-1/2 -translate-y-1/2 p-1 text-[#8595aa] hover:text-[#0d2c5c] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff size={18} strokeWidth={1.5} />
                    ) : (
                      <Eye size={18} strokeWidth={1.5} />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[13.5px] -mt-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordView(true)}
                    className="bg-transparent border-none p-0 font-inherit text-[#1e4d8c] font-semibold cursor-pointer hover:text-[#c69a3f] transition-colors duration-200"
                  >
                    Ai uitat parola?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center gap-3 w-full py-[18px] bg-[#0d2c5c] text-white rounded-[10px] text-sm font-bold tracking-[0.1em] uppercase shadow-[0_4px_15px_rgba(13,44,92,0.15)] transition-all duration-300 hover:not-disabled:bg-[#c69a3f] hover:not-disabled:text-[#0d2c5c] hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_8px_25px_rgba(198,154,63,0.3)] disabled:bg-[#8595aa] disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {isLoading ? "Se încarcă..." : "Intră în cont"}
                  {!isLoading && <ArrowRight size={18} strokeWidth={2} />}
                </button>
              </form>

              <div className="flex items-center text-center my-8 text-[#8595aa] text-[11px] font-bold tracking-[0.15em] before:content-[''] before:flex-1 before:border-b before:border-[#e1e8f0] after:content-[''] after:flex-1 after:border-b after:border-[#e1e8f0]">
                <span className="px-5">SAU CONTINUĂ CU</span>
              </div>

              <GoogleAuthButton
                onSuccess={handleGoogleSuccess}
                onError={() => alert("Eroare la conectarea cu Google")}
                text="continue_with"
              />

              <p className="text-center mt-9 text-sm text-[#3c4043]">
                Nu ai încă un cont?{" "}
                <Link
                  to="/register"
                  className="text-[#0d2c5c] font-bold no-underline border-b border-transparent hover:text-[#c69a3f] hover:border-[#c69a3f] transition-colors duration-200"
                >
                  Creează unul acum
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
