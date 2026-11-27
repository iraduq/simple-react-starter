import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearSession,
  fetchSession,
  getCachedUser,
  notifySessionChange,
  onSessionChange,
  type SessionUser,
} from "../lib/auth";
import { apiFetch } from "../lib/api";
import { useAdminLiveSync } from "../context/AdminLiveSyncContext";
import { useToast } from "../components/Toast";
import type { LoyaltyAccountData } from "../components/loyalty/LoyaltyCard";

import type { Booking, TabKey } from "../types/profile";
import FloatingMaritimeBackgroundWhite from "../components/profile/FloatingMaritimeBackground";
import ProfileHeroBanner from "../components/profile/ProfileHeroBanner";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import ProfileTabBar from "../components/profile/ProfileTabBar";
import OverviewTab from "../components/profile/OverviewTab";
import PersonalTab from "../components/profile/PersonalTab";
import ReservationsTab from "../components/profile/ReservationsTab";
import SecurityTab from "../components/profile/SecurityTab";
import DangerTab from "../components/profile/DangerTab";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SessionUser>(getCachedUser());
  const [loading, setLoading] = useState(!user);
  const [tab, setTab] = useState<TabKey>("overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loyaltyAccount, setLoyaltyAccount] = useState<LoyaltyAccountData | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    apiFetch<Booking[]>("/bookings/my-bookings")
      .then((d) => setBookings(Array.isArray(d) ? d : []))
      .catch(() => setBookings([]));
    apiFetch<LoyaltyAccountData>("/loyalty/my-account")
      .then((d) => setLoyaltyAccount(d))
      .catch(() => {});
  }, []);

  useAdminLiveSync({
    topic: "loyalty",
    onSync: () => {
      apiFetch<LoyaltyAccountData>("/loyalty/my-account")
        .then((d) => setLoyaltyAccount(d))
        .catch(() => {});
    },
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const s = await fetchSession(false);
      if (!active) return;
      if (!s) {
        navigate("/login", { replace: true });
        return;
      }
      setUser(s);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    const unsub = onSessionChange(() => {
      const fresh = getCachedUser();
      if (fresh) setUser(fresh);
    });
    return unsub;
  }, []);

  const handleLogout = async () => {
    await clearSession();
    navigate("/");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiFetch<any>("/users/me/avatar", {
        method: "POST",
        body: formData,
      });
      setUser((prev) => (prev ? { ...prev, avatar_url: res.avatar_url } : prev));
      await fetchSession(true);
      notifySessionChange();
      toast("Fotografia de profil a fost actualizată cu succes!", "success");
    } catch (err: any) {
      toast(err?.message || "Eroare la încărcarea fotografiei.", "error");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    try {
      await apiFetch<any>("/users/me/avatar", { method: "DELETE" });
      setUser((prev) => (prev ? { ...prev, avatar_url: null } : prev));
      await fetchSession(true);
      notifySessionChange();
      toast("Fotografia de profil a fost eliminată.", "success");
    } catch (err: any) {
      toast(err?.message || "Eroare la ștergerea fotografiei.", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-[#6b7c99] text-[11px] font-bold tracking-[0.2em] uppercase pt-24">
        Se încarcă profilul…
      </div>
    );
  }

  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.email.split("@")[0];

  return (
    <div className="min-h-screen w-full bg-[#f8f6f1] text-[#0d2c5c] font-sans antialiased relative overflow-hidden">
      <FloatingMaritimeBackgroundWhite />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleAvatarUpload}
        className="hidden"
      />

      {/* Hero Banner Edge-to-Edge */}
      <ProfileHeroBanner />

      {/* Main Body */}
      <div className="w-full px-3 sm:px-5 md:px-7 lg:px-9 xl:px-10 pb-20 relative z-20">
        <div className="relative grid grid-cols-1 lg:grid-cols-[340px_1fr] xl:grid-cols-[380px_1fr] 2xl:grid-cols-[410px_1fr] gap-6 lg:gap-8 items-start -mt-20 sm:-mt-24 lg:-mt-28">
          <ProfileSidebar
            user={user}
            fullName={fullName}
            loyaltyAccount={loyaltyAccount}
            bookings={bookings}
            onOpenPersonalTab={() => setTab("personal")}
          />

          <div className="flex flex-col gap-6">
            <ProfileTabBar currentTab={tab} onTabChange={setTab} />

            {tab === "overview" && (
              <OverviewTab
                user={user}
                bookings={bookings}
                goToTab={setTab}
                onLoyaltyChange={setLoyaltyAccount}
              />
            )}
            {tab === "personal" && (
              <PersonalTab
                user={user}
                setUser={setUser}
                onAvatarClick={() => fileInputRef.current?.click()}
                onRemoveAvatar={handleRemoveAvatar}
                uploadingAvatar={uploadingAvatar}
              />
            )}
            {tab === "reservations" && (
              <ReservationsTab bookings={bookings} />
            )}
            {tab === "security" && (
              <SecurityTab user={user} onLogout={handleLogout} />
            )}
            {tab === "danger" && (
              <DangerTab onDeleted={handleLogout} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
