import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../lib/config";
import { fetchSession, notifySessionChange } from "../lib/auth";
import { saveTokensFrom, clearAuthTokens, markAuthSession } from "../lib/token";
import { useToast } from "../components/Toast";
import GoogleAuthButton from "../components/GoogleAuthButton";
import AuthHeroPane from "../components/auth/AuthHeroPane";
import LoginForm from "../components/auth/LoginForm";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";
import LoginErrorAlert from "../components/auth/LoginErrorAlert";

const DEACTIVATED_MSG =
  "Contul tău a fost dezactivat. Nu te poți autentifica momentan — te rugăm să contactezi echipa Casa Esy pentru reactivare.";

const isDeactivated = (status: number, detail?: string) => {
  const d = (detail || "").toLowerCase();
  return status === 403 || /dezactiv|inactiv|deactivat|disabled|suspend|blocat|not active|banned/.test(d);
};

const resolvePostLoginRoute = (role?: string | null) => {
  const r = (role || "").toLowerCase().trim();
  if (["admin", "menajera", "manajera", "intretinere", "receptionist", "bucatar"].includes(r)) {
    return "/admin";
  }
  return "/profile";
};

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const googleLoginInFlight = useRef(false);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [loginError, setLoginError] = useState<{ message: string; deactivated: boolean } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("casaesy_remember_email");
    if (saved) setFormData((f) => ({ ...f, email: saved }));
  }, []);

  const handleAuthFailure = (status: number, detail?: string) => {
    if (isDeactivated(status, detail)) {
      setLoginError({ message: DEACTIVATED_MSG, deactivated: true });
      return;
    }
    let msg = detail;
    if (status === 401 || status === 400) {
      msg = "Adresa de email sau parola este incorectă. Te rugăm să încerci din nou.";
    } else if (status === 404) {
      msg = "Nu am găsit un cont asociat acestei adrese de email.";
    } else if (status >= 500) {
      msg = "A apărut o problemă pe server. Te rugăm să revii mai târziu.";
    }
    setLoginError({ message: msg || "A apărut o eroare la autentificare.", deactivated: false });
  };

  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...formData }),
      });
      const data = res.headers.get("content-type")?.includes("application/json") ? await res.json() : null;

      if (res.ok) {
        saveTokensFrom(data);
        markAuthSession();
        const userRole = data?.role || data?.user?.role;
        const isActive = data?.is_active ?? data?.user?.is_active ?? true;
        if (isActive === false) {
          clearAuthTokens();
          notifySessionChange();
          setLoginError({ message: DEACTIVATED_MSG, deactivated: true });
          return;
        }
        const session = await fetchSession(true);
        notifySessionChange();
        navigate(resolvePostLoginRoute(session?.role || userRole));
      } else {
        const detail = data && typeof data === "object" && "detail" in data && typeof data.detail === "string" ? data.detail : undefined;
        handleAuthFailure(res.status, detail);
      }
    } catch {
      setLoginError({ message: "A apărut o problemă de conexiune.", deactivated: false });
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
      setResetMessage("Dacă adresa există în sistemul nostru, vei primi un email cu instrucțiunile de resetare.");
    } catch {
      setResetMessage("A apărut o problemă de conexiune. Te rugăm să încerci din nou.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (googleLoginInFlight.current) return;
    googleLoginInFlight.current = true;
    setLoginError(null);
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id_token: credentialResponse.credential }),
      });
      const data = res.headers.get("content-type")?.includes("application/json") ? await res.json() : null;
      if (res.ok) {
        saveTokensFrom(data);
        markAuthSession();
        const userRole = data?.role || data?.user?.role;
        const isActive = data?.is_active ?? data?.user?.is_active ?? true;
        if (isActive === false) {
          clearAuthTokens();
          notifySessionChange();
          setLoginError({ message: DEACTIVATED_MSG, deactivated: true });
          return;
        }
        const session = await fetchSession(true);
        notifySessionChange();
        navigate(resolvePostLoginRoute(session?.role || userRole));
        return;
      }
      const detail = data && typeof data === "object" && "detail" in data && typeof data.detail === "string" ? data.detail : undefined;
      handleAuthFailure(res.status, detail);
    } catch {
      setLoginError({ message: "A apărut o problemă de conexiune cu serverul.", deactivated: false });
    } finally {
      googleLoginInFlight.current = false;
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans relative">
      <AuthHeroPane title="Vacanța ta perfectă începe aici." subtitle="Conectează-te pentru a-ți gestiona rezervările, a descoperi oferte exclusive și a planifica următoarea evadare la mare." />
      <div className="flex-1 flex items-center justify-center px-5 py-10 relative z-10 w-full min-h-screen min-[900px]:min-h-0">
        <div className="w-full max-w-[420px] max-[899px]:bg-white/95 max-[899px]:backdrop-blur-sm max-[899px]:p-10 max-[899px]:rounded-2xl max-[899px]:shadow-[0_15px_50px_rgba(13,44,92,0.4)] max-[899px]:border max-[899px]:border-[#e1e8f0] max-[500px]:p-6">
          <Link to="/" className="flex flex-col items-center mb-10 no-underline">
            <span className="font-['Cormorant_Garamond',serif] text-[28px] text-[#0d2c5c]">Casa <em className="italic">Esy</em></span>
            <span className="text-[#d4a437] text-[10px] tracking-[2px]">★★★</span>
          </Link>
          {isForgotPasswordView ? (
            <ForgotPasswordForm resetEmail={resetEmail} setResetEmail={setResetEmail} resetMessage={resetMessage} isLoading={isLoading} onSubmit={handleForgotPassword} onBackToLogin={() => { setIsForgotPasswordView(false); setResetMessage(""); }} />
          ) : (
            <>
              <div className="text-center mb-10">
                <h1 className="font-['Cormorant_Garamond',serif] text-[32px] text-[#1a1a1a] mb-2.5 font-medium">Autentificare</h1>
                <p className="text-[#8595aa] text-[14.5px] m-0">Mă bucur să te revăd! Te rugăm să introduci detaliile.</p>
              </div>
              {loginError && <LoginErrorAlert loginError={loginError} />}
              <LoginForm formData={formData} setFormData={setFormData} isLoading={isLoading} showPassword={showPassword} setShowPassword={setShowPassword} onForgotPasswordClick={() => setIsForgotPasswordView(true)} onSubmit={handleLocalLogin} />
              <div className="flex items-center text-center my-8 text-[#8595aa] text-[11px] font-bold tracking-[0.15em] before:content-[''] before:flex-1 before:border-b before:border-[#e1e8f0] after:content-[''] after:flex-1 after:border-b after:border-[#e1e8f0]">
                <span className="px-5">SAU CONTINUĂ CU</span>
              </div>
              <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={() => toast("Eroare la conectarea cu Google", "error")} text="continue_with" />
              <p className="text-center mt-9 text-sm text-[#3c4043]">
                Nu ai încă un cont? <Link to="/register" className="text-[#0d2c5c] font-bold no-underline border-b border-transparent hover:text-[#c69a3f] hover:border-[#c69a3f] transition-colors duration-200">Creează unul acum</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
