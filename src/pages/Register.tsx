import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input/max";
import "react-phone-number-input/style.css";
import CustomCountrySelect from "../components/CustomCountrySelect";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

const inputBase =
  "w-full pl-[50px] pr-[44px] py-4 border rounded-[10px] font-sans text-[14.5px] text-[#1a1a1a] bg-[#f4f7fb] outline-none transition-all duration-300 focus:border-[#1e4d8c] focus:bg-white focus:shadow-[0_4px_15px_rgba(30,77,140,0.08)]";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordRules = {
    length: formData.password.length >= 8,
    lowercase: /[a-z]/.test(formData.password),
    uppercase: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  const nameRegex = /^[A-Za-zĂăÂâÎîȘșȚț\s\-]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const fieldValidity = {
    firstName:
      formData.firstName.trim().length >= 2 &&
      nameRegex.test(formData.firstName),
    lastName:
      formData.lastName.trim().length >= 2 && nameRegex.test(formData.lastName),
    email: emailRegex.test(formData.email),
    phone: formData.phone !== "" && isValidPhoneNumber(formData.phone),
    password: isPasswordValid,
  };

  const validateField = (name: string, value: string) => {
    let errorMsg = "";

    switch (name) {
      case "firstName":
        if (value.trim().length < 2) errorMsg = "Minim 2 caractere.";
        else if (!nameRegex.test(value)) errorMsg = "Doar litere/cratime.";
        break;
      case "lastName":
        if (value.trim().length < 2) errorMsg = "Minim 2 caractere.";
        else if (!nameRegex.test(value)) errorMsg = "Doar litere/cratime.";
        break;
      case "email":
        if (!value.trim()) errorMsg = "Email-ul este obligatoriu.";
        else if (!emailRegex.test(value)) errorMsg = "Format invalid.";
        break;
      case "phone":
        if (!value) errorMsg = "Numărul de telefon este obligatoriu.";
        else if (value && !isValidPhoneNumber(value))
          errorMsg = "Număr de telefon invalid.";
        break;
      case "password":
        if (!isPasswordValid)
          errorMsg = "Parola nu îndeplinește criteriile de securitate.";
        break;
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

  const handlePhoneBlur = () => {
    setTouched((prev) => ({ ...prev, phone: true }));
    validateField("phone", formData.phone);
  };

  const validateAll = () => {
    const isFirst = validateField("firstName", formData.firstName);
    const isLast = validateField("lastName", formData.lastName);
    const isMail = validateField("email", formData.email);
    const isPhone = validateField("phone", formData.phone);

    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      password: true,
    });

    return isFirst && isLast && isMail && isPhone && isPasswordValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validateAll()) return;

    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Cont creat cu succes! Te redirecționăm către Login.");
        navigate("/login");
      } else {
        const errorData = await response.json();
        setServerError(errorData.detail || "Eroare la înregistrare.");
      }
    } catch (error) {
      console.error("Eroare:", error);
      setServerError("A apărut o problemă de conexiune cu serverul.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    console.log("Google token:", credentialResponse.credential);
  };

  const getInputClass = (name: keyof typeof fieldValidity) => {
    if (touched[name] && errors[name])
      return `${inputBase} border-red-500 bg-red-50`;
    if (touched[name] && fieldValidity[name])
      return `${inputBase} border-emerald-500 bg-emerald-50/30`;
    return `${inputBase} border-[#e1e8f0]`;
  };

  const getIconClass = (name: keyof typeof fieldValidity) => {
    if (touched[name] && errors[name]) return "text-red-500";
    if (touched[name] && fieldValidity[name]) return "text-emerald-500";
    return "text-[#8595aa]";
  };

  const getPhoneGroupClass = () => {
    if (touched.phone && errors.phone)
      return "border-red-500 [&_.PhoneInputCountry]:border-r-red-300";
    if (touched.phone && fieldValidity.phone)
      return "border-emerald-500 [&_.PhoneInputCountry]:border-r-emerald-300";
    return "border-[#e1e8f0] [&_.PhoneInputCountry]:border-r-[#e1e8f0]";
  };

  return (
    <div className="flex min-h-screen bg-white font-['Albert_Sans',sans-serif] max-[899px]:bg-[radial-gradient(circle_at_top_right,#e6efff,#f4f7fb)] [&_input]:font-['Albert_Sans',sans-serif] [&_button]:font-['Albert_Sans',sans-serif] [&_.PhoneInputInput]:font-['Albert_Sans',sans-serif]">
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
              Alătură-te oaspeților noștri.
            </h2>
            <p className="text-[1.1rem] leading-[1.6] text-white/85 max-w-[450px]">
              Creează un cont pentru a debloca oferte exclusive, a rezerva mai
              rapid și a te bucura de o experiență personalizată la Casa Esy.
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

          <div className="text-center mb-10">
            <h1 className="font-['Cormorant_Garamond',serif] text-[32px] text-[#1a1a1a] mb-2.5 font-medium">
              Creare Cont
            </h1>
            <p className="text-[#8595aa] text-[14.5px] m-0">
              Completează detaliile de mai jos pentru a începe.
            </p>
          </div>

          {serverError && (
            <div className="flex items-center gap-2.5 bg-red-50 text-red-800 border border-red-300 px-4 py-3 rounded-[10px] text-[13.5px] font-medium mb-5">
              <AlertCircle size={18} />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <div className="relative">
                  <User
                    className={`absolute left-[18px] top-1/2 -translate-y-1/2 transition-colors duration-300 ${getIconClass("firstName")}`}
                    size={18}
                    strokeWidth={1.5}
                  />
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Prenume"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClass("firstName")}
                  />
                  {touched.firstName && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none animate-[fadeIn_0.2s_ease-in-out]">
                      {fieldValidity.firstName ? (
                        <CheckCircle2
                          size={17}
                          strokeWidth={2}
                          className="text-emerald-500"
                        />
                      ) : (
                        <AlertCircle
                          size={17}
                          strokeWidth={2}
                          className="text-red-500"
                        />
                      )}
                    </span>
                  )}
                </div>
                {errors.firstName && touched.firstName && (
                  <span className="text-[11.5px] text-red-500 font-medium pl-1">
                    {errors.firstName}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <div className="relative">
                  <User
                    className={`absolute left-[18px] top-1/2 -translate-y-1/2 transition-colors duration-300 ${getIconClass("lastName")}`}
                    size={18}
                    strokeWidth={1.5}
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Nume"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClass("lastName")}
                  />
                  {touched.lastName && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                      {fieldValidity.lastName ? (
                        <CheckCircle2
                          size={17}
                          strokeWidth={2}
                          className="text-emerald-500"
                        />
                      ) : (
                        <AlertCircle
                          size={17}
                          strokeWidth={2}
                          className="text-red-500"
                        />
                      )}
                    </span>
                  )}
                </div>
                {errors.lastName && touched.lastName && (
                  <span className="text-[11.5px] text-red-500 font-medium pl-1">
                    {errors.lastName}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="relative">
                <Mail
                  className={`absolute left-[18px] top-1/2 -translate-y-1/2 transition-colors duration-300 ${getIconClass("email")}`}
                  size={18}
                  strokeWidth={1.5}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Adresa de email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass("email")}
                />
                {touched.email && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                    {fieldValidity.email ? (
                      <CheckCircle2
                        size={17}
                        strokeWidth={2}
                        className="text-emerald-500"
                      />
                    ) : (
                      <AlertCircle
                        size={17}
                        strokeWidth={2}
                        className="text-red-500"
                      />
                    )}
                  </span>
                )}
              </div>
              {errors.email && touched.email && (
                <span className="text-[11.5px] text-red-500 font-medium pl-1">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <div
                className={`relative flex items-stretch overflow-hidden p-0! bg-[#f4f7fb] rounded-[10px] border ${getPhoneGroupClass()} [&_.PhoneInput]:flex [&_.PhoneInput]:items-center [&_.PhoneInput]:w-full [&_.PhoneInput]:flex-1 [&_.PhoneInputCountry]:flex [&_.PhoneInputCountry]:items-center [&_.PhoneInputCountry]:m-0 [&_.PhoneInputCountry]:h-full [&_.PhoneInputCountry]:relative [&_.PhoneInputCountry]:border-r [&_.PhoneInputInput]:border-none [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:py-4 [&_.PhoneInputInput]:pr-11 [&_.PhoneInputInput]:pl-3.5 [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:font-sans [&_.PhoneInputInput]:text-[14.5px] [&_.PhoneInputInput]:text-[#1a1a1a] [&_.PhoneInputInput]:w-full [&_.PhoneInputInput]:placeholder:text-[#8595aa]`}
              >
                <PhoneInput
                  international
                  defaultCountry="RO"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  onBlur={handlePhoneBlur}
                  placeholder="Număr de telefon"
                  countrySelectComponent={CustomCountrySelect}
                  focusInputOnCountrySelection={false}
                  autoComplete="off"
                />
                {touched.phone && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                    {fieldValidity.phone ? (
                      <CheckCircle2
                        size={17}
                        strokeWidth={2}
                        className="text-emerald-500"
                      />
                    ) : (
                      <AlertCircle
                        size={17}
                        strokeWidth={2}
                        className="text-red-500"
                      />
                    )}
                  </span>
                )}
              </div>
              {errors.phone && touched.phone && (
                <span className="text-[11.5px] text-red-500 font-medium pl-1">
                  {errors.phone}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <div className="relative">
                <Lock
                  className={`absolute left-[18px] top-1/2 -translate-y-1/2 transition-colors duration-300 ${getIconClass("password")}`}
                  size={18}
                  strokeWidth={1.5}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Creează o parolă"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={handleBlur}
                  className={getInputClass("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Arată/Ascunde parola"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none p-1 text-[#8595aa] cursor-pointer flex items-center justify-center transition-colors duration-200 hover:text-[#1e4d8c]"
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={1.5} />
                  ) : (
                    <Eye size={18} strokeWidth={1.5} />
                  )}
                </button>
              </div>

              {(passwordFocused || formData.password.length > 0) && (
                <div className="pt-3 pb-0.5 mt-0.5 animate-[fadeIn_0.2s_ease-in-out]">
                  <div className="flex gap-1 mb-3">
                    {Object.values(passwordRules).map((isMet, index) => (
                      <span
                        key={index}
                        className={`flex-1 h-[3px] rounded-sm transition-colors duration-300 ${isMet ? "bg-emerald-500" : "bg-[#e1e8f0]"}`}
                      />
                    ))}
                  </div>

                  <ul className="list-none p-0 m-0 flex flex-wrap gap-x-4 gap-y-2">
                    <li
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors duration-[250ms] ${passwordRules.length ? "text-[#3c4043]" : "text-[#8595aa]"}`}
                    >
                      <CheckCircle2
                        size={13}
                        strokeWidth={2.25}
                        className={
                          passwordRules.length
                            ? "text-emerald-500"
                            : "text-[#e1e8f0]"
                        }
                      />
                      Minim 8 caractere
                    </li>
                    <li
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors duration-[250ms] ${passwordRules.lowercase ? "text-[#3c4043]" : "text-[#8595aa]"}`}
                    >
                      <CheckCircle2
                        size={13}
                        strokeWidth={2.25}
                        className={
                          passwordRules.lowercase
                            ? "text-emerald-500"
                            : "text-[#e1e8f0]"
                        }
                      />
                      O literă mică
                    </li>
                    <li
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors duration-[250ms] ${passwordRules.uppercase ? "text-[#3c4043]" : "text-[#8595aa]"}`}
                    >
                      <CheckCircle2
                        size={13}
                        strokeWidth={2.25}
                        className={
                          passwordRules.uppercase
                            ? "text-emerald-500"
                            : "text-[#e1e8f0]"
                        }
                      />
                      O literă mare
                    </li>
                    <li
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors duration-[250ms] ${passwordRules.number ? "text-[#3c4043]" : "text-[#8595aa]"}`}
                    >
                      <CheckCircle2
                        size={13}
                        strokeWidth={2.25}
                        className={
                          passwordRules.number
                            ? "text-emerald-500"
                            : "text-[#e1e8f0]"
                        }
                      />
                      Un număr
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-3 w-full py-[18px] bg-[#0d2c5c] text-white rounded-[10px] text-sm font-bold tracking-[0.1em] uppercase shadow-[0_4px_15px_rgba(13,44,92,0.15)] transition-all duration-300 hover:not-disabled:bg-[#c69a3f] hover:not-disabled:text-[#0d2c5c] hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_8px_25px_rgba(198,154,63,0.3)] disabled:bg-[#8595aa] disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isLoading ? "Se creează contul..." : "Înregistrează-te"}
              {!isLoading && <ArrowRight size={18} strokeWidth={2} />}
            </button>
          </form>

          <div className="flex items-center text-center my-8 text-[#8595aa] text-[11px] font-bold tracking-[0.15em] before:content-[''] before:flex-1 before:border-b before:border-[#e1e8f0] after:content-[''] after:flex-1 after:border-b after:border-[#e1e8f0]">
            <span className="px-5">SAU ÎNREGISTREAZĂ-TE CU</span>
          </div>

          <div className="flex justify-center w-full [&>div]:w-full!">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert("Eroare la conectarea cu Google")}
              theme="outline"
              size="large"
              shape="pill"
              width="100%"
              text="signup_with"
            />
          </div>

          <p className="text-center mt-9 text-sm text-[#3c4043]">
            Ai deja un cont?{" "}
            <Link
              to="/login"
              className="text-[#0d2c5c] font-bold no-underline border-b border-transparent hover:text-[#c69a3f] hover:border-[#c69a3f] transition-colors duration-200"
            >
              Intră în cont aici
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
