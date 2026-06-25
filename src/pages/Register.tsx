import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        alert(errorData.detail || "Eroare la înregistrare.");
      }
    } catch (error) {
      console.error("Eroare:", error);
    }
  };

  return (
    <div className="auth-container">
      <h2>Creează cont</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Prenume"
          required
          onChange={(e) =>
            setFormData({ ...formData, firstName: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Nume"
          required
          onChange={(e) =>
            setFormData({ ...formData, lastName: e.target.value })
          }
        />
        <input
          type="email"
          placeholder="Email"
          required
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Parolă (min 8 caractere)"
          required
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
        <input
          type="tel"
          placeholder="Telefon (ex: +40...)"
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <button type="submit">Înregistrează-te</button>
      </form>
    </div>
  );
}
