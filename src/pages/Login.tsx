import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleAuthSuccess = (data: { accessToken: string }) => {
    localStorage.setItem("token", data.accessToken);
    console.log("Token salvat:", data.accessToken); // Verifică în consolă dacă apare aici
    navigate("/profile");
  };

  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://127.0.0.1:8000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (res.ok) handleAuthSuccess(data);
    else alert(data.detail);
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const decoded = JSON.parse(
      window.atob((credentialResponse.credential ?? "").split(".")[1]),
    );
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
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleLocalLogin}>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Parolă"
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
        <button type="submit">Intră în cont</button>
      </form>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => alert("Eroare Google")}
      />
    </div>
  );
}
