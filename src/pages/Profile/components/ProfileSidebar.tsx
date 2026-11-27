import { Link } from "react-router-dom";
import { MapPin, SlidersHorizontal, Calendar, MessageSquare } from "lucide-react";
import type { SessionUser } from "../../../lib/auth";
import type { LoyaltyAccountData } from "../../../components/loyalty/LoyaltyCard";
import { getInitials, type Booking, type TabKey } from "../types";

interface ProfileSidebarProps {
  user: NonNullable<SessionUser>;
  fullName: string;
  loyaltyAccount: LoyaltyAccountData | null;
  bookings: Booking[];
  onOpenPersonalTab: () => void;
}

export default function ProfileSidebar({
  user,
  fullName,
  loyaltyAccount,
  bookings,
  onOpenPersonalTab,
}: ProfileSidebarProps) {
  const validBookings = bookings.filter((b) => b.status !== "cancelled");
  const points = loyaltyAccount?.points_balance ?? 0;
  const vipTier = loyaltyAccount?.tier || "Bronze";

  const defaultPerks = [
    "100 Puncte / noapte cazare",
    "1 Punct / 10 RON comenzi",
    "Welcome Drink rece la check-in",
    "Wi-Fi de mare viteză gratuit",
  ];
  const perks = loyaltyAccount?.tier_perks?.length ? loyaltyAccount.tier_perks : defaultPerks;

  return (
    <div className="flex flex-col gap-6">
      {/* User Profile Card */}
      <div className="bg-white rounded-[26px] p-6 sm:p-7 shadow-[0_12px_45px_rgba(13,44,92,0.06)] border border-[#e1e8f0]">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="w-[114px] h-[114px] sm:w-[128px] sm:h-[128px] rounded-full p-[3px] bg-[#c69a3f]/40 shadow-md border border-[#c69a3f]/30">
              <div className="w-full h-full rounded-full bg-[#0d2c5c] overflow-hidden flex items-center justify-center font-['Outfit',sans-serif] text-[40px] font-bold text-white">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  getInitials(fullName)
                )}
              </div>
            </div>
          </div>

          <h1 className="mt-4 font-['Outfit',sans-serif] text-[28px] sm:text-[32px] font-bold text-[#0d2c5c] leading-tight tracking-tight">
            {fullName}
          </h1>
          <div className="mt-2 flex items-center justify-center">
            <span className="px-3.5 py-1 rounded-full bg-[#fdf8ec] text-[#9c7624] border border-[#c69a3f]/35 text-[11px] font-['Plus_Jakarta_Sans',sans-serif] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-xs">
              <span className="text-[#c69a3f]">★</span>
              <span>Oaspete Privilège • Casa Esy {vipTier}</span>
            </span>
          </div>
          <p className="text-[12px] text-[#64748b] mt-2 flex items-center justify-center gap-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
            <MapPin size={13} className="text-[#c69a3f]" />
            <span>Mamaia, Constanța • România</span>
          </p>

          {/* Quick actions */}
          <div className="w-full mt-5 flex items-center gap-2.5">
            <button
              onClick={onOpenPersonalTab}
              title="Editează datele personale"
              className="w-12 h-12 rounded-[14px] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e1e8f0] text-[#0d2c5c] flex items-center justify-center transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              <SlidersHorizontal size={17} className="text-[#0d2c5c]" />
            </button>
            <Link
              to="/camere"
              className="flex-1 h-12 rounded-[14px] bg-[#0d2c5c] hover:bg-[#07203f] text-white text-[13.5px] font-['Plus_Jakarta_Sans',sans-serif] font-bold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(13,44,92,0.18)] transition-all active:scale-[0.99] no-underline"
            >
              <Calendar size={15} className="text-[#c69a3f]" />
              <span>Rezervă Sejur Nou</span>
            </Link>
          </div>
        </div>

        {/* BENEFICII INCLUSE */}
        <div className="mt-6 pt-5 border-t border-[#e1e8f0]">
          <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[10.5px] font-bold tracking-[0.2em] uppercase text-[#64748b] mb-3">
            Beneficii incluse în statut:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {perks.map((label: string) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e1e8f0] bg-[#f8fafc] text-[11.5px] font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[#0d2c5c]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#c69a3f]" />
                <span>{label}</span>
              </span>
            ))}
          </div>
        </div>

        {/* STATISTICI DIN CONTUL VIP & REZERVARI REALE */}
        <div className="mt-6 pt-5 border-t border-[#e1e8f0] grid grid-cols-3 text-center">
          <div>
            <p className="font-['Outfit',sans-serif] text-[26px] sm:text-[28px] font-bold text-[#0d2c5c] leading-none">
              {validBookings.length}
            </p>
            <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] text-[#64748b] mt-1 font-semibold">
              Sejururi
            </p>
          </div>
          <div className="border-x border-[#e1e8f0]">
            <p className="font-['Outfit',sans-serif] text-[26px] sm:text-[28px] font-bold text-[#0d2c5c] leading-none">
              {points.toLocaleString("ro-RO")}
            </p>
            <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] text-[#64748b] mt-1 font-semibold">
              Puncte Club
            </p>
          </div>
          <div>
            <p className="font-['Outfit',sans-serif] text-[26px] sm:text-[28px] font-bold text-[#c69a3f] leading-none">
              {vipTier}
            </p>
            <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] text-[#c69a3f] mt-1 font-semibold">
              Statut VIP
            </p>
          </div>
        </div>
      </div>

      {/* Butler & Concierge Card */}
      <div className="bg-white rounded-[24px] p-5 shadow-[0_12px_45px_rgba(13,44,92,0.06)] border border-[#e1e8f0]">
        <div className="flex items-center justify-between mb-3.5">
          <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[10px] font-bold tracking-[0.2em] uppercase text-[#64748b]">
            Butler Personal Desemnat
          </p>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-[#c69a3f] border border-[#c69a3f]/30 text-[10.5px] font-['Plus_Jakarta_Sans',sans-serif] font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c69a3f]" /> Serviciu Activ
          </span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-[#0d2c5c] text-[#c69a3f] border border-[#c69a3f]/30 flex items-center justify-center font-['Outfit',sans-serif] text-[16px] font-bold shrink-0 shadow-sm">
            CE
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-[#0d2c5c] truncate font-['Plus_Jakarta_Sans',sans-serif]">
              Recepție și concierge
            </p>
            <p className="text-[11.5px] text-[#64748b] truncate font-['Plus_Jakarta_Sans',sans-serif]">
              Head Butler • Serviciu 24/7
            </p>
          </div>
          <Link
            to="/contact"
            title="Contactează concierge-ul"
            className="w-9 h-9 rounded-[12px] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e1e8f0] text-[#0d2c5c] flex items-center justify-center transition-colors shrink-0 shadow-xs"
          >
            <MessageSquare size={16} className="text-[#c69a3f]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
