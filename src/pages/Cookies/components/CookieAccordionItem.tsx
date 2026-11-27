import { ChevronDown, ChevronUp } from "lucide-react";

export interface CookieItemConfig {
  id: string;
  title: string;
  description: string;
  locked?: boolean;
  checked?: boolean;
  onToggle?: () => void;
}

interface CookieAccordionItemProps {
  item: CookieItemConfig;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export default function CookieAccordionItem({
  item,
  isExpanded,
  onToggleExpand,
}: CookieAccordionItemProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-[#e6edf5] bg-[#f4f7fb]">
      <div
        className={`flex items-center justify-between gap-3 px-4 py-3.5 transition-colors ${
          isExpanded ? "bg-[#e3ebf5]/85" : "hover:bg-[#ebf1f8]"
        }`}
      >
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex items-center gap-3 text-left flex-1 min-w-0 bg-transparent border-0 p-0 cursor-pointer"
        >
          {isExpanded ? (
            <ChevronUp size={16} className="text-[#0d2c5c] shrink-0" />
          ) : (
            <ChevronDown size={16} className="text-[#0d2c5c] shrink-0" />
          )}
          <span className="text-[14.5px] font-medium text-[#0d2c5c] truncate">
            {item.title}
          </span>
        </button>

        <button
          type="button"
          role="switch"
          aria-checked={item.checked}
          disabled={item.locked}
          onClick={() => {
            if (!item.locked && item.onToggle) item.onToggle();
          }}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ${
            item.locked
              ? "bg-[#0d2c5c]/40 cursor-not-allowed"
              : item.checked
                ? "bg-[#0d2c5c] cursor-pointer"
                : "bg-[#cbd5e1] cursor-pointer"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
              item.checked ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {isExpanded && (
        <div className="px-4 py-3.5 text-[13.5px] leading-relaxed text-[#4f6280] bg-[#f4f7fb]">
          {item.description}
        </div>
      )}
    </div>
  );
}
