import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
// Folosim varianta "max" (metadata completă) — varianta default a librăriei
// ("min") nu are regex-urile stricte de validare a cifrelor pentru
// majoritatea țărilor, ci doar o verificare brută de lungime. Cu "min",
// un număr incomplet ca "+48 601 234" (6 cifre, cui un mobil polonez are
// nevoie de 9) putea trece drept valid.
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input/max";
import "react-phone-number-input/style.css"; // CSS-ul de bază pentru steaguri
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
  const [showPassword, setShowPassword] = useState(false); // Stare pentru ochișor

  // --- REGULI PAROLĂ ÎN TIMP REAL ---
  const passwordRules = {
    length: formData.password.length >= 8,
    lowercase: /[a-z]/.test(formData.password),
    uppercase: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  const nameRegex = /^[A-Za-zĂăÂâÎîȘșȚț\s\-]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // --- STARE DE VALIDITATE ÎN TIMP REAL PENTRU FIECARE CÂMP ---
  // (folosit pentru borderul verde / iconița de succes, independent de "touched")
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

  // Funcție de validare individuală (mesaje de eroare, la blur)
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

  // Când utilizatorul dă click în afara unui câmp
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);

    if (name === "password") setPasswordFocused(false);
  };

  // Când utilizatorul scrie
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Dacă a apărut o eroare, o ștergem pe măsură ce scrie corect
    if (touched[name]) validateField(name, value);
  };

  // Validare specifică pentru componenta PhoneInput (care nu returnează un event standard)
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

  // Helper: calculează clasa de stare pentru un input-group (idle / valid / error)
  const getFieldClass = (name: keyof typeof fieldValidity) => {
    if (touched[name] && errors[name]) return "has-error";
    if (touched[name] && fieldValidity[name]) return "is-valid";
    return "";
  };

  return (
    <div className="auth-layout">
      {/* --- PARTEA STÂNGĂ (Imagine) --- */}
      <div
        className="auth-visual"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')",
        }}
      >
        <div className="auth-visual-overlay"></div>
        <svg
          className="auth-decorator-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <polygon fill="var(--color-surface)" points="0,100 100,0 100,100" />
        </svg>
        <div className="auth-visual-content">
          <Link to="/" className="auth-back-link">
            <ArrowLeft size={16} /> Înapoi acasă
          </Link>
          <div className="auth-visual-text">
            <h2>Alătură-te oaspeților noștri.</h2>
            <p>
              Creează un cont pentru a debloca oferte exclusive, a rezerva mai
              rapid și a te bucura de o experiență personalizată la Casa Esy.
            </p>
          </div>
        </div>
      </div>

      {/* --- PARTEA DREAPTĂ (Formularul) --- */}
      <div className="auth-form-side">
        <div className="auth-card-modern">
          <Link to="/" className="auth-brand-mini">
            <span className="brand-name">
              Casa <em>Esy</em>
            </span>
            <span className="brand-stars">★★★</span>
          </Link>

          <div className="auth-header">
            <h1 className="auth-title">Creare Cont</h1>
            <p className="auth-subtitle">
              Completează detaliile de mai jos pentru a începe.
            </p>
          </div>

          {serverError && (
            <div className="auth-alert">
              <AlertCircle size={18} />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* NUME ȘI PRENUME */}
            <div className="input-row">
              <div className="input-wrapper">
                <div className={`input-group ${getFieldClass("firstName")}`}>
                  <User className="input-icon" size={18} strokeWidth={1.5} />
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Prenume"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.firstName && (
                    <span className="input-status-icon">
                      {fieldValidity.firstName ? (
                        <CheckCircle2 size={17} strokeWidth={2} />
                      ) : (
                        <AlertCircle size={17} strokeWidth={2} />
                      )}
                    </span>
                  )}
                </div>
                {errors.firstName && touched.firstName && (
                  <span className="input-error-text">{errors.firstName}</span>
                )}
              </div>

              <div className="input-wrapper">
                <div className={`input-group ${getFieldClass("lastName")}`}>
                  <User className="input-icon" size={18} strokeWidth={1.5} />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Nume"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.lastName && (
                    <span className="input-status-icon">
                      {fieldValidity.lastName ? (
                        <CheckCircle2 size={17} strokeWidth={2} />
                      ) : (
                        <AlertCircle size={17} strokeWidth={2} />
                      )}
                    </span>
                  )}
                </div>
                {errors.lastName && touched.lastName && (
                  <span className="input-error-text">{errors.lastName}</span>
                )}
              </div>
            </div>

            {/* EMAIL */}
            <div className="input-wrapper">
              <div className={`input-group ${getFieldClass("email")}`}>
                <Mail className="input-icon" size={18} strokeWidth={1.5} />
                <input
                  type="email"
                  name="email"
                  placeholder="Adresa de email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.email && (
                  <span className="input-status-icon">
                    {fieldValidity.email ? (
                      <CheckCircle2 size={17} strokeWidth={2} />
                    ) : (
                      <AlertCircle size={17} strokeWidth={2} />
                    )}
                  </span>
                )}
              </div>
              {errors.email && touched.email && (
                <span className="input-error-text">{errors.email}</span>
              )}
            </div>

            {/* TELEFON (CU DROPDOWN CUSTOM PENTRU ȚARĂ + STATUS) */}
            <div className="input-wrapper">
              <div
                className={`input-group phone-custom-group ${getFieldClass("phone")}`}
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
                  <span className="input-status-icon phone-status-icon">
                    {fieldValidity.phone ? (
                      <CheckCircle2 size={17} strokeWidth={2} />
                    ) : (
                      <AlertCircle size={17} strokeWidth={2} />
                    )}
                  </span>
                )}
              </div>
              {errors.phone && touched.phone && (
                <span className="input-error-text">{errors.phone}</span>
              )}
            </div>

            {/* PAROLĂ (CU OCHIȘOR) */}
            <div className="input-wrapper">
              <div className={`input-group ${getFieldClass("password")}`}>
                <Lock className="input-icon" size={18} strokeWidth={1.5} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Creează o parolă"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Arată/Ascunde parola"
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={1.5} />
                  ) : (
                    <Eye size={18} strokeWidth={1.5} />
                  )}
                </button>
              </div>

              {/* PANOU CERINȚE PAROLĂ */}
              {(passwordFocused || formData.password.length > 0) && (
                <div className="password-requirements">
                  <div className="password-strength-track">
                    {Object.values(passwordRules).map((isMet, index) => (
                      <span
                        key={index}
                        className={`password-strength-segment ${isMet ? "is-met" : ""}`}
                      />
                    ))}
                  </div>

                  <ul className="req-list">
                    <li className={passwordRules.length ? "valid" : "invalid"}>
                      <CheckCircle2 size={13} strokeWidth={2.25} />
                      Minim 8 caractere
                    </li>
                    <li
                      className={passwordRules.lowercase ? "valid" : "invalid"}
                    >
                      <CheckCircle2 size={13} strokeWidth={2.25} />O literă mică
                    </li>
                    <li
                      className={passwordRules.uppercase ? "valid" : "invalid"}
                    >
                      <CheckCircle2 size={13} strokeWidth={2.25} />O literă mare
                    </li>
                    <li className={passwordRules.number ? "valid" : "invalid"}>
                      <CheckCircle2 size={13} strokeWidth={2.25} />
                      Un număr
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn-auth-submit"
              disabled={isLoading}
            >
              {isLoading ? "Se creează contul..." : "Înregistrează-te"}
              {!isLoading && <ArrowRight size={18} strokeWidth={2} />}
            </button>
          </form>

          {/* DIVIZOR GOOGLE */}
          <div className="auth-divider">
            <span>SAU ÎNREGISTREAZĂ-TE CU</span>
          </div>

          {/* GOOGLE LOGIN */}
          <div className="google-auth-wrapper">
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

          {/* LINK CĂTRE LOGIN */}
          <p className="auth-footer-text">
            Ai deja un cont? <Link to="/login">Intră în cont aici</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
