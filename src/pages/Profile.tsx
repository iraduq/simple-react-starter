import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSession, type SessionUser } from "../lib/auth";

export default function Profile() {
  const [user, setUser] = useState<SessionUser>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      const sessionUser = await fetchSession();

      if (!sessionUser) {
        navigate("/login", { replace: true });
        return;
      }

      setUser(sessionUser);
    };

    loadProfile();
  }, [navigate]);

  if (!user) return <p>Se încarcă datele...</p>;

  return (
    <div>
      <h1>Profil Utilizator</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
