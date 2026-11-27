import { useNavigate } from "react-router-dom";
import { Sparkles, Wrench, PackageSearch, Coffee, ShieldCheck, LogOut } from "lucide-react";
import { clearSession, type SessionUser } from "../../../lib/auth";
import { useToast } from "../../../components/Toast";
import type { PortalSection } from "../types";

interface HousekeepingNavProps {
  sessionUser: SessionUser;
  roleCopy: { eyebrow: string; heading: string; badge: string };
  section: PortalSection;
  setSection: (s: PortalSection) => void;
}

export default function HousekeepingNav({
  sessionUser,
  roleCopy,
  section,
  setSection,
}: HousekeepingNavProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const portalNav: { id: PortalSection; label: string; icon: typeof Sparkles }[] = [
    { id: "rooms", label: "Camere & Igienizare", icon: Sparkles },
    { id: "maintenance", label: "Tichete Întreținere", icon: Wrench },
    { id: "lost_found", label: "Obiecte Găsite", icon: PackageSearch },
    { id: "breakfast", label: "Mic Dejun", icon: Coffee },
  ];

  const handleLogout = async () => {
    await clearSession();
    toast("Te-ai delogheat cu succes.", "success");
    navigate("/");
  };

  return (
    <div className="relative z-10 border-b border-[#c69a3f]/25 bg-gradient-to-r from-[#0d2c5c] via-[#123a72] to-[#07203f] text-white shadow-[0_8px_28px_rgba(13,44,92,0.16)]">
      <div className="mx-auto flex max-w-[1380px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e6b85c]/40 bg-white/10 text-[#e6b85c]">
            <ShieldCheck size={19} />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e6b85c]">
              Vila Casa Esy · Portal Operațional
            </p>
            <p className="text-sm font-semibold text-white">
              {sessionUser?.first_name
                ? `${sessionUser.first_name} ${sessionUser.last_name || ""}`.trim()
                : sessionUser?.email || "Staff"}{" "}
              <span className="ml-2 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-[#e6b85c]">
                {roleCopy.badge}
              </span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {portalNav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[11.5px] font-bold uppercase tracking-[0.12em] transition-all cursor-pointer ${
                  section === item.id
                    ? "bg-[#c69a3f] text-[#07203f] shadow-[0_6px_18px_rgba(198,154,63,0.45)]"
                    : "border border-white/15 bg-white/10 text-white/90 hover:bg-white/20"
                }`}
              >
                <Icon size={14} /> <span>{item.label}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#e6b85c]/40 bg-[#07203f]/60 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#e6b85c] transition-colors hover:bg-[#e6b85c] hover:text-[#07203f] cursor-pointer"
          >
            Panou Complet
          </button>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/80 transition-colors hover:bg-white/15 hover:text-white cursor-pointer"
          >
            <LogOut size={13} /> Ieșire
          </button>
        </div>
      </div>
    </div>
  );
}
