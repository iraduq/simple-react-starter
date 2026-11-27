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

import type { Booking, TabKey } from "./Profile/types";
import FloatingMaritimeBackgroundWhite from "./Profile/components/FloatingMaritimeBackground";
import ProfileSidebar from "./Profile/components/ProfileSidebar";
import ProfileTabBar from "./Profile/components/ProfileTabBar";
import OverviewTab from "./Profile/components/OverviewTab";
import PersonalTab from "./Profile/components/PersonalTab";
import ReservationsTab from "./Profile/components/ReservationsTab";
import SecurityTab from "./Profile/components/SecurityTab";
import DangerTab from "./Profile/components/DangerTab";

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
      <div className="relative w-full h-[270px] sm:h-[330px] lg:h-[380px] xl:h-[420px] overflow-hidden border-b border-[#e1e8f0] pt-16 sm:pt-20">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover saturate-60 contrast-110 brightness-95"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#0d2c5c]/60 mix-blend-color" />
        <div className="absolute inset-0 bg-[#0b2146]/35 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d2c5c]/85 via-[#0d2c5c]/25 to-[#0d2c5c]/95" />
        <span aria-hidden="true" className="pointer-events-none absolute -top-16 -left-16 w-80 h-80 rounded-full bg-[#c69a3f]/25 blur-[85px]" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-16 -right-16 w-96 h-96 rounded-full bg-[#c69a3f]/20 blur-[90px]" />

        <div className="relative z-10 w-full h-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 flex flex-col justify-between pt-4 sm:pt-6 pb-24 sm:pb-28">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0d2c5c]/70 backdrop-blur-md border border-white/20 text-white text-[12px] font-medium shadow-lg">
              <span className="text-[#c69a3f] text-[11px] tracking-widest font-serif font-semibold">★★★</span>
              <span className="font-sans font-semibold tracking-wide">Casa Esy • Mamaia Resort & Spa</span>
            </div>
          </div>
        </div>
      </div>

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
