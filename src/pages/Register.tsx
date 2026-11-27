import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { isValidPhoneNumber } from "react-phone-number-input/max";
import { AlertCircle } from "lucide-react";
import { API_URL } from "../lib/config";
import { markAuthSession, saveTokensFrom } from "../lib/token";
import { fetchSession, notifySessionChange } from "../lib/auth";
import { useToast } from "../components/Toast";
import GoogleAuthButton from "../components/GoogleAuthButton";
import AuthHeroPane from "../components/auth/AuthHeroPane";
import RegisterFormFields from "../components/auth/RegisterFormFields";

const nameRegex = /^[A-Za-zĂăÂâÎîȘșȚț\s-]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const phoneWrapRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({ email: "", password: "", first_name: "", last_name: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordRules = {
    length: formData.password.length >= 8 && formData.password.length <= 64,
    lowercase: /[a-z]/.test(formData.password),
    uppercase: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    symbol: /[^A-Za-z0-9]/.test(formData.password),
  };
  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  const fieldValidity = {
    first_name: formData.first_name.trim().length >= 2 && nameRegex.test(formData.first_name),
    last_name: formData.last_name.trim().length >= 2 && nameRegex.test(formData.last_name),
    email: emailRegex.test(formData.email),
    phone: formData.phone !== "" && isValidPhoneNumber(formData.phone),
    password: isPasswordValid,
  };

  const validateField = (name: string, value: string) => {
    let errorMsg = "";
    if (name === "first_name" || name === "last_name") {
      if (value.trim().length < 2) errorMsg = "Minim 2 caractere.";
      else if (value.trim().length > 50) errorMsg = "Maxim 50 de caractere.";
      else if (!nameRegex.test(value)) errorMsg = "Doar litere, spații sau cratime.";
    } else if (name === "email") {
      if (!value.trim()) errorMsg = "Email-ul este obligatoriu.";
      else if (!emailRegex.test(value)) errorMsg = "Format invalid.";
    } else if (name === "phone") {
      if (!value) errorMsg = "Numărul de telefon este obligatoriu.";
      else if (!isValidPhoneNumber(value)) errorMsg = "Număr de telefon invalid.";
    } else if (name === "password" && !isPasswordValid) {
      errorMsg = "Parola trebuie să conțină majuscule, litere mici, cifre și simboluri.";
    }
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    return errorMsg === "";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
    if (name === "password") setPasswordFocused(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) validateField(name, value);
  };

  const handlePhoneChange = (value: string | undefined) => {
    const phoneVal = value || "";
    setFormData((prev) => ({ ...prev, phone: phoneVal }));
    if (touched.phone) validateField("phone", phoneVal);
  };

  useEffect(() => {
    const wrap = phoneWrapRef.current;
    if (!wrap) return;
    const input = wrap.querySelector("input.PhoneInputInput") as HTMLInputElement | null;
    if (!input) return;
    input.setAttribute("autocomplete", "tel-national");
    input.setAttribute("name", "phone");
    const sync = () => setFormData((prev) => ({ ...prev, phone: input.value }));
    input.addEventListener("input", sync);
    input.addEventListener("change", sync);
    return () => {
      input.removeEventListener("input", sync);
      input.removeEventListener("change", sync);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    const isFirst = validateField("first_name", formData.first_name);
    const isLast = validateField("last_name", formData.last_name);
    const isMail = validateField("email", formData.email);
    const isPhone = validateField("phone", formData.phone);
    setTouched({ first_name: true, last_name: true, email: true, phone: true, password: true });

    if (!(isFirst && isLast && isMail && isPhone && isPasswordValid)) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data: unknown = response.headers.get("content-type")?.includes("application/json") ? await response.json() : null;
      if (response.ok) {
        navigate("/verify-email", { state: { email: formData.email } });
      } else {
        const msg = data && typeof data === "object" && "detail" in data ? String(data.detail) : "Eroare la înregistrare.";
        setServerError(msg);
      }
    } catch {
      setServerError("A apărut o problemă de conexiune cu serverul.");
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
        body: JSON.stringify({ id_token: credentialResponse.credential }),
      });
      if (res.ok) {
        saveTokensFrom(await res.json().catch(() => null));
        markAuthSession();
        await fetchSession(true);
        notifySessionChange();
        navigate("/profile");
        return;
      }
      toast("Eroare la autentificarea cu Google.", "error");
    } catch {
      toast("A apărut o problemă de conexiune cu serverul.", "error");
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans relative">
      <AuthHeroPane title="Începe o experiență de neuitat." subtitle="Creează-ți un cont pentru a debloca tarife preferențiale, rezervări rapide și beneficii dedicate oaspeților noștri." />
      <div className="flex-1 flex items-center justify-center px-5 py-10 relative z-10 w-full min-h-screen min-[900px]:min-h-0">
        <div className="w-full max-w-[440px] max-[899px]:bg-white/95 max-[899px]:backdrop-blur-sm max-[899px]:p-10 max-[899px]:rounded-2xl max-[899px]:shadow-[0_15px_50px_rgba(13,44,92,0.4)] max-[899px]:border max-[899px]:border-[#e1e8f0] max-[500px]:p-6">
          <Link to="/" className="flex flex-col items-center mb-6 no-underline">
            <span className="font-['Cormorant_Garamond',serif] text-[28px] text-[#0d2c5c]">Casa <em className="italic">Esy</em></span>
            <span className="text-[#d4a437] text-[10px] tracking-[2px]">★★★</span>
          </Link>
          <div className="text-center mb-6">
            <h1 className="font-['Cormorant_Garamond',serif] text-[32px] text-[#1a1a1a] mb-2 font-medium">Creează Cont</h1>
            <p className="text-[#8595aa] text-[14px] m-0">Completează detaliile pentru a te înregistra.</p>
          </div>
          {serverError && (
            <div className="flex items-center gap-2.5 bg-red-50 text-red-500 border border-red-200 px-4 py-3 rounded-[10px] text-[13.5px] font-medium mb-5">
              <AlertCircle size={18} className="shrink-0" />
              <span>{serverError}</span>
            </div>
          )}
          <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={() => toast("Eroare la conectarea cu Google", "error")} text="signup_with" />
          <div className="flex items-center text-center my-6 text-[#8595aa] text-[11px] font-bold tracking-[0.15em] before:content-[''] before:flex-1 before:border-b before:border-[#e1e8f0] after:content-[''] after:flex-1 after:border-b after:border-[#e1e8f0]">
            <span className="px-5">SAU CU EMAIL</span>
          </div>
          <RegisterFormFields formData={formData} errors={errors} touched={touched} fieldValidity={fieldValidity} passwordRules={passwordRules} showPassword={showPassword} setShowPassword={setShowPassword} passwordFocused={passwordFocused} setPasswordFocused={setPasswordFocused} phoneWrapRef={phoneWrapRef} handleChange={handleChange} handleBlur={handleBlur} handlePhoneChange={handlePhoneChange} handlePhoneBlur={() => { setTouched((p) => ({ ...p, phone: true })); validateField("phone", formData.phone); }} handleSubmit={handleSubmit} isLoading={isLoading} />
          <p className="text-center mt-7 text-sm text-[#3c4043]">
            Ai deja un cont? <Link to="/login" className="text-[#0d2c5c] font-bold no-underline border-b border-transparent hover:text-[#c69a3f] hover:border-[#c69a3f] transition-colors duration-200">Autentifică-te</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
