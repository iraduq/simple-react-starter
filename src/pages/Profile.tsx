import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSession, getCachedUser, type SessionUser } from "../lib/auth";

export default function Profile() {
  const [user, setUser] = useState<SessionUser>(getCachedUser());
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      const sessionUser = await fetchSession();
      if (!active) return;
      if (!sessionUser) {
        navigate("/login", { replace: true });
        return;
      }
      setUser(sessionUser);
    };

    if (user) return;
    loadProfile();

    return () => {
      active = false;
    };
  }, [navigate, user]);

  if (!user) return <p>Se încarcă datele...</p>;

  return (
    <div>
      <h1>Profil Utilizator</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
