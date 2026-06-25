import { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    };
    fetchProfile();
  }, []);

  if (!user) return <p>Se încarcă datele...</p>;

  return (
    <div>
      <h1>Profil Utilizator</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
