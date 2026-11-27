import { CheckCircle2 } from "lucide-react";
import { openCookieSettingsModal, type CookieConsentState } from "../../../components/CookieConsentBanner";
import CookieAccordionItem, { type CookieItemConfig } from "./CookieAccordionItem";

interface CookiePreferencesPanelProps {
  consent: CookieConsentState | null;
  items: CookieItemConfig[];
  expanded: Record<string, boolean>;
  setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onAcceptSelected: () => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
}

export default function CookiePreferencesPanel({
  consent,
  items,
  expanded,
  setExpanded,
  onAcceptSelected,
  onAcceptAll,
  onRejectAll,
}: CookiePreferencesPanelProps) {
  return (
    <div className="rounded-2xl border border-[#e1e8f0] bg-white p-5 sm:p-6 space-y-4 shadow-[0_8px_30px_rgba(13,44,92,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#e1e8f0]">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0d2c5c]">
          <CheckCircle2 size={16} className="text-emerald-600" />
          {consent ? (
            <span>
              Consimțământ actualizat la: <strong>{new Date(consent.updatedAt).toLocaleString("ro-RO")}</strong>
            </span>
          ) : (
            <span>Nu ai salvat încă preferințe personalizate pe acest dispozitiv.</span>
          )}
        </div>
        <button
          type="button"
          onClick={openCookieSettingsModal}
          className="rounded-lg border border-[#e1e8f0] bg-[#f8fafc] hover:border-[#0d2c5c] px-3 py-1 text-[11px] font-bold text-[#0d2c5c] transition cursor-pointer"
        >
          Deschide în fereastră modală
        </button>
      </div>

      <div className="space-y-2.5">
        {items.map((cat) => (
          <CookieAccordionItem
            key={cat.id}
            item={cat}
            isExpanded={Boolean(expanded[cat.id])}
            onToggleExpand={() => setExpanded((p) => ({ ...p, [cat.id]: !p[cat.id] }))}
          />
        ))}
      </div>

      <div className="pt-3 border-t border-[#e1e8f0] flex flex-wrap items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={onAcceptSelected}
          className="rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] px-4 py-2.5 text-[13px] font-semibold text-[#0d2c5c] transition cursor-pointer"
        >
          Acceptă selecția
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRejectAll}
            className="rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] px-4 py-2.5 text-[13px] font-semibold text-[#334155] transition cursor-pointer"
          >
            Refuză toate
          </button>
          <button
            type="button"
            onClick={onAcceptAll}
            className="rounded-xl bg-[#0d2c5c] hover:bg-[#163c78] px-5 py-2.5 text-[13px] font-semibold text-white transition cursor-pointer shadow-xs"
          >
            Acceptă toate
          </button>
        </div>
      </div>
    </div>
  );
}
