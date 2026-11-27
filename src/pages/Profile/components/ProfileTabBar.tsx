import { PROFILE_TABS, type TabKey } from "../types";

interface ProfileTabBarProps {
  currentTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export default function ProfileTabBar({ currentTab, onTabChange }: ProfileTabBarProps) {
  return (
    <div className="bg-white rounded-[22px] p-2 shadow-[0_8px_30px_rgba(13,44,92,0.06)] border border-[#e1e8f0]">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
        {PROFILE_TABS.map((t) => {
          const Icon = t.icon;
          const active = currentTab === t.key;
          const isDanger = t.key === "danger";
          return (
            <button
              key={t.key}
              onClick={() => onTabChange(t.key)}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-3 rounded-[14px] text-[12px] xl:text-[13px] font-['Plus_Jakarta_Sans',sans-serif] font-bold transition-all duration-200 text-center select-none ${
                active
                  ? isDanger
                    ? "bg-red-700 text-white shadow-sm"
                    : "bg-[#0d2c5c] text-white shadow-sm"
                  : isDanger
                    ? "text-red-600 hover:bg-red-50 hover:text-red-700"
                    : "text-[#64748b] hover:text-[#0d2c5c] hover:bg-[#f8fafc]"
              }`}
            >
              <Icon
                size={15}
                className={`shrink-0 ${
                  active
                    ? isDanger
                      ? "text-white"
                      : "text-[#c69a3f]"
                    : isDanger
                      ? "text-red-500"
                      : "text-[#64748b]"
                }`}
              />
              <span className="truncate">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
