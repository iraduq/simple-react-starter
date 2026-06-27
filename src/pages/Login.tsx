import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  // Stări pentru Login-ul standard
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  // Stări pentru "Ai uitat parola?"
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const handleAuthSuccess = (data: { accessToken: string }) => {
    localStorage.setItem("token", data.accessToken);
    console.log("Token salvat:", data.accessToken);
    navigate("/profile");
  };

  // --- LOGICĂ LOGIN STANDARD ---
  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) handleAuthSuccess(data);
      else alert(data.detail || "Eroare la autentificare.");
    } catch (error) {
      alert("A apărut o problemă de conexiune.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGICĂ RECUPERARE PAROLĂ ---
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResetMessage("");
    try {
      // Ajustează acest endpoint cu cel real din backend-ul tău FastAPI
      await fetch("http://127.0.0.1:8000/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      // Afișăm un mesaj de succes (recomandat din motive de securitate să nu
      // confirmi explicit dacă emailul există sau nu, ci să dai un mesaj generic)
      setResetMessage(
        "Dacă adresa există în sistemul nostru, vei primi un email cu instrucțiunile de resetare.",
      );
    } catch (error) {
      setResetMessage(
        "A apărut o problemă de conexiune. Te rugăm să încerci din nou.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGICĂ GOOGLE LOGIN ---
  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    const decoded = JSON.parse(
      window.atob((credentialResponse.credential ?? "").split(".")[1]),
    );
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: decoded.email,
          firstName: decoded.given_name,
          lastName: decoded.family_name,
          googleId: decoded.sub,
        }),
      });
      const data = await res.json();
      if (res.ok) handleAuthSuccess(data);
    } catch (error) {
      alert("Eroare la conectarea cu Google.");
    }
  };

  return (
    <div className="auth-layout">
      {/* --- PARTEA STÂNGĂ - Imagine & Branding --- */}
      <div className="auth-visual">
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
            <h2>Vacanța ta perfectă începe aici.</h2>
            <p>
              Conectează-te pentru a-ți gestiona rezervările, a descoperi oferte
              exclusive și a planifica următoarea evadare la mare.
            </p>
          </div>
        </div>
      </div>

      {/* --- PARTEA DREAPTĂ - Formulare --- */}
      <div className="auth-form-side">
        <div className="auth-card-modern">
          <Link to="/" className="auth-brand-mini">
            <span className="brand-name">
              Casa <em>Esy</em>
            </span>
            <span className="brand-stars">★★★</span>
          </Link>

          {isForgotPasswordView ? (
            /* ==================================================
               VIEW: RECUPERARE PAROLĂ
               ================================================== */
            <>
              <div className="auth-header">
                <h1 className="auth-title">Recuperare Parolă</h1>
                <p className="auth-subtitle">
                  Introdu adresa de email și îți vom trimite un link de
                  resetare.
                </p>
              </div>

              {resetMessage && (
                <div
                  className="auth-alert"
                  style={{
                    backgroundColor: "#eff6ff",
                    color: "#1e3a8a",
                    borderColor: "#bfdbfe",
                  }}
                >
                  <span>{resetMessage}</span>
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="auth-form">
                <div className="input-group">
                  <Mail className="input-icon" size={18} strokeWidth={1.5} />
                  <input
                    type="email"
                    placeholder="Adresa de email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-auth-submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Se trimite..." : "Trimite link-ul"}
                  {!isLoading && <ArrowRight size={18} strokeWidth={2} />}
                </button>
              </form>

              <div className="auth-divider"></div>

              <p className="auth-footer-text">
                Ți-ai amintit parola?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordView(false);
                    setResetMessage("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-primary-deep)",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "inherit",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  Întoarce-te la Login
                </button>
              </p>
            </>
          ) : (
            /* ==================================================
               VIEW: LOGIN STANDARD
               ================================================== */
            <>
              <div className="auth-header">
                <h1 className="auth-title">Autentificare</h1>
                <p className="auth-subtitle">
                  Mă bucur să te revăd! Te rugăm să introduci detaliile.
                </p>
              </div>

              <form onSubmit={handleLocalLogin} className="auth-form">
                <div className="input-group">
                  <Mail className="input-icon" size={18} strokeWidth={1.5} />
                  <input
                    type="email"
                    placeholder="Adresa de email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="input-group">
                  <Lock className="input-icon" size={18} strokeWidth={1.5} />
                  <input
                    type="password"
                    placeholder="Parola"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>

                <div className="auth-actions-row">
                  <label className="remember-me">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                    <span className="label-text">Ține-mă minte</span>
                  </label>

                  {/* Butonul care deschide view-ul de Recuperare */}
                  <button
                    type="button"
                    className="forgot-password"
                    onClick={() => setIsForgotPasswordView(true)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      font: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    Ai uitat parola?
                  </button>
                </div>

                <button
                  type="submit"
                  className="btn-auth-submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Se încarcă..." : "Intră în cont"}
                  {!isLoading && <ArrowRight size={18} strokeWidth={2} />}
                </button>
              </form>

              <div className="auth-divider">
                <span>SAU CONTINUĂ CU</span>
              </div>

              <div className="google-auth-wrapper">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => alert("Eroare la inițializarea Google Login")}
                  theme="outline"
                  size="large"
                  shape="pill"
                  width="100%"
                />
              </div>

              <p className="auth-footer-text">
                Nu ai încă un cont?{" "}
                <Link to="/register">Creează unul acum</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
