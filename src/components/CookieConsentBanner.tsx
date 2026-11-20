import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, X } from "lucide-react";

export const COOKIE_CONSENT_STORAGE_KEY = "casa_esy_cookie_consent_v1";
export const COOKIE_CONSENT_EVENT = "casa-esy-cookie-consent-updated";
export const COOKIE_OPEN_MODAL_EVENT = "casa-esy-open-cookie-settings";

export const PREF_LANG_KEY = "casa_esy_pref_lang";
export const PREF_ROOMS_FILTER_KEY = "casa_esy_room_filters";
export const PREF_PLACES_FILTER_KEY = "casa_esy_place_filters";
export const ANALYTICS_STATS_KEY = "casa_esy_analytics_stats";
export const MARKETING_PROMO_KEY = "casa_esy_marketing_promo";

export type CookieCategory = "necessary" | "preferences" | "analytics" | "marketing";

export interface CookieConsentState {
  version: string;
  updatedAt: string;
  necessary: boolean;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  geolocation?: boolean;
}

function expireCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  if (typeof window !== "undefined" && window.location?.hostname) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
  }
}

export function enforceCookieConsent(state: CookieConsentState) {
  if (typeof window === "undefined") return;
  try {
    if (!state.preferences) {
      localStorage.removeItem(PREF_LANG_KEY);
      localStorage.removeItem(PREF_ROOMS_FILTER_KEY);
      localStorage.removeItem(PREF_PLACES_FILTER_KEY);
      expireCookie("googtrans");
    }
    if (!state.analytics) {
      localStorage.removeItem(ANALYTICS_STATS_KEY);
    }
    if (!state.marketing) {
      localStorage.removeItem(MARKETING_PROMO_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

export function getSavedCookieConsent(): CookieConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      version: "1.0",
      updatedAt: parsed.updatedAt || new Date().toISOString(),
      necessary: true,
      preferences: Boolean(parsed.preferences),
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      geolocation:
        parsed.geolocation !== undefined
          ? Boolean(parsed.geolocation)
          : Boolean(parsed.preferences),
    };
  } catch {
    return null;
  }
}

export function hasCookieConsent(category: CookieCategory): boolean {
  if (category === "necessary") return true;
  const saved = getSavedCookieConsent();
  if (!saved) return false;
  return Boolean(saved[category]);
}

export function saveCookieConsent(prefs: {
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  geolocation?: boolean;
}): CookieConsentState {
  const state: CookieConsentState = {
    version: "1.0",
    updatedAt: new Date().toISOString(),
    necessary: true,
    preferences: prefs.preferences,
    analytics: prefs.analytics,
    marketing: prefs.marketing,
    geolocation: prefs.geolocation ?? prefs.preferences,
  };
  try {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(state));
    enforceCookieConsent(state);
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: state }));
  } catch {
    // ignore storage errors
  }
  return state;
}

export function trackAnalyticsEvent(eventName: string, detail?: Record<string, unknown>) {
  if (typeof window === "undefined" || !hasCookieConsent("analytics")) return;
  try {
    const raw = localStorage.getItem(ANALYTICS_STATS_KEY);
    const stats = raw ? JSON.parse(raw) : { pageViews: 0, events: {} };
    const safeStats =
      stats && typeof stats === "object"
        ? stats
        : { pageViews: 0, events: {} };
    if (eventName === "page_view") {
      safeStats.pageViews = Number(safeStats.pageViews || 0) + 1;
      safeStats.lastPath = detail?.path || window.location.pathname;
    } else {
      const events =
        safeStats.events && typeof safeStats.events === "object"
          ? safeStats.events
          : {};
      const key = detail?.slug ? `${eventName}:${String(detail.slug)}` : eventName;
      events[key] = Number(events[key] || 0) + 1;
      safeStats.events = events;
    }
    safeStats.updatedAt = new Date().toISOString();
    localStorage.setItem(ANALYTICS_STATS_KEY, JSON.stringify(safeStats));
  } catch {
    // ignore analytics storage errors
  }
}

export function useCookieConsent(): CookieConsentState | null {
  const [consent, setConsent] = useState<CookieConsentState | null>(() =>
    getSavedCookieConsent(),
  );

  useEffect(() => {
    const sync = () => setConsent(getSavedCookieConsent());
    window.addEventListener(COOKIE_CONSENT_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return consent;
}

export function openCookieSettingsModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(COOKIE_OPEN_MODAL_EVENT));
  }
}

interface AccordionItemConfig {
  id: "essential" | "functional" | "analytics" | "marketing" | "geolocation";
  title: string;
  description: string;
  locked?: boolean;
  checked: boolean;
  onToggle?: () => void;
}

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);

  const [preferences, setPreferences] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);
  const [geolocation, setGeolocation] = useState(true);

  // Categorii deschise în acordeon (implicit „essential” și „functional” pot fi deschise la click)
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    essential: true,
    functional: false,
    analytics: false,
    marketing: false,
    geolocation: false,
  });

  useEffect(() => {
    const existing = getSavedCookieConsent();
    if (!existing) {
      setVisible(true);
    } else {
      enforceCookieConsent(existing);
      setPreferences(existing.preferences);
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
      setGeolocation(existing.geolocation ?? existing.preferences);
    }

    const handleOpenSettings = () => {
      const current = getSavedCookieConsent();
      if (current) {
        setPreferences(current.preferences);
        setAnalytics(current.analytics);
        setMarketing(current.marketing);
        setGeolocation(current.geolocation ?? current.preferences);
      }
      setCustomizeOpen(true);
      setVisible(true);
    };

    window.addEventListener(COOKIE_OPEN_MODAL_EVENT, handleOpenSettings);
    return () => window.removeEventListener(COOKIE_OPEN_MODAL_EVENT, handleOpenSettings);
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAcceptAll = () => {
    saveCookieConsent({
      preferences: true,
      analytics: true,
      marketing: true,
      geolocation: true,
    });
    setCustomizeOpen(false);
    setVisible(false);
  };

  const handleRejectAll = () => {
    saveCookieConsent({
      preferences: false,
      analytics: false,
      marketing: false,
      geolocation: false,
    });
    setCustomizeOpen(false);
    setVisible(false);
  };

  const handleAcceptSelected = () => {
    saveCookieConsent({
      preferences,
      analytics,
      marketing,
      geolocation,
    });
    setCustomizeOpen(false);
    setVisible(false);
  };

  const handleCloseModal = () => {
    setCustomizeOpen(false);
    if (getSavedCookieConsent()) {
      setVisible(false);
    }
  };

  if (!visible) return null;

  const categories: AccordionItemConfig[] = [
    {
      id: "essential",
      title: "Esențiale",
      description:
        "Aceste cookie-uri sunt strict necesare pentru funcționarea corectă a platformei Vila Casa Esy (autentificare, rezervări, coș Room Service și procesarea securizată Stripe) și nu pot fi dezactivate.",
      locked: true,
      checked: true,
    },
    {
      id: "functional",
      title: "Funcționale",
      description:
        "Aceste cookie-uri memorează setările tale preferate (cum ar fi limba selectată RO/EN/DE și filtrele pentru camere sau meniul digital) pentru a-ți oferi o experiență personalizată.",
      checked: preferences,
      onToggle: () => setPreferences((v) => !v),
    },
    {
      id: "analytics",
      title: "Performanță și Analitice",
      description:
        "Ne ajută să înțelegem cum interacționează oaspeții cu paginile Vilei Casa Esy și să optimizăm viteza de încărcare și disponibilitatea camerelor.",
      checked: analytics,
      onToggle: () => setAnalytics((v) => !v),
    },
    {
      id: "marketing",
      title: "Marketing și Publicitate",
      description:
        "Utilizate pentru a-ți afișa oferte sezoniere relevante la malul mării, pachete speciale și coduri promoționale personalizate.",
      checked: marketing,
      onToggle: () => setMarketing((v) => !v),
    },
    {
      id: "geolocation",
      title: "Geolocație și Hărți",
      description:
        "Permite afișarea hărții interactive din Eforie Nord și orientarea rapidă către plajă, terase și punctele de interes ale Vilei Casa Esy.",
      checked: geolocation,
      onToggle: () => setGeolocation((v) => !v),
    },
  ];

  return (
    <>
      {/* ── 1. CARDUL COMPACT DIN STÂNGA-JOS (când modalul nu este deschis) ── */}
      {!customizeOpen && (
        <div className="fixed bottom-5 left-5 z-[9990] w-[calc(100vw-2.5rem)] max-w-[450px] font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="rounded-2xl border border-[#e1e8f0] bg-white p-6 shadow-[0_20px_55px_rgba(13,44,92,0.18)] text-[#0d2c5c]">
            <h3 className="font-['Outfit',sans-serif] text-[18.5px] font-semibold text-[#0d2c5c] leading-snug">
              Acceptați câteva cookie-uri?
            </h3>

            <p className="mt-2.5 text-[13.5px] leading-relaxed text-[#4f6280]">
              Folosim cookie-uri pentru funcțiile esențiale și pentru a înțelege mai bine cum utilizezi{" "}
              <strong className="font-semibold text-[#0d2c5c]">Vila Casa Esy</strong>, astfel încât să creăm cea mai bună experiență pentru tine{" "}
              <span className="text-[#c69a3f]">✦</span>{" "}
              <Link
                to="/cookies"
                className="text-[12.5px] font-semibold text-[#0d2c5c] underline decoration-[#c69a3f] underline-offset-2 hover:text-[#c69a3f]"
              >
                Detalii
              </Link>
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setCustomizeOpen(true)}
                className="rounded-xl border-[1.5px] border-[#0d2c5c] bg-white hover:bg-[#f8fafc] px-4 py-2.5 text-[13px] font-semibold text-[#0d2c5c] transition cursor-pointer"
              >
                Gestionează preferințele
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRejectAll}
                  className="rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] px-4 py-2.5 text-[13px] font-semibold text-[#334155] transition cursor-pointer"
                >
                  Refuză toate
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="rounded-xl bg-[#0d2c5c] hover:bg-[#163c78] px-4 py-2.5 text-[13px] font-semibold text-white transition cursor-pointer shadow-xs"
                >
                  Acceptă toate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. MODALUL ELEGANT „GESTIONEAZĂ PREFERINȚELE PENTRU COOKIE-URI” ── */}
      {customizeOpen && (
        <div
          className="fixed inset-0 z-[9995] bg-[#0d2c5c]/40 backdrop-blur-[2px] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]"
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-[560px] max-h-[88vh] flex flex-col rounded-2xl bg-white border border-[#e1e8f0] p-6 sm:p-7 shadow-[0_28px_80px_rgba(13,44,92,0.24)] text-[#0d2c5c]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-['Outfit',sans-serif] text-[19px] sm:text-[21px] font-semibold text-[#0d2c5c]">
                Gestionează preferințele pentru cookie-uri
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                aria-label="Închide"
                className="w-8 h-8 rounded-lg text-[#64748b] hover:text-[#0d2c5c] hover:bg-[#f1f5f9] flex items-center justify-center transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-3 text-[13.5px] leading-relaxed text-[#4f6280]">
              Folosim cookie-uri pentru a oferi funcții esențiale și pentru a-ți îmbunătăți experiența pe Vila Casa Esy. Confidențialitatea ta este importantă pentru noi, așa că îți oferim control deplin asupra modului în care le utilizăm. Activează sau dezactivează fiecare categorie mai jos.
            </p>

            {/* Accordion List */}
            <div className="mt-5 space-y-2.5 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isExpanded = Boolean(expandedIds[cat.id]);

                return (
                  <div
                    key={cat.id}
                    className="rounded-xl overflow-hidden border border-[#e6edf5] bg-[#f4f7fb] transition-colors"
                  >
                    <div
                      className={`flex items-center justify-between gap-3 px-4 py-3.5 transition-colors ${
                        isExpanded ? "bg-[#e3ebf5]/85" : "hover:bg-[#ebf1f8]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleExpand(cat.id)}
                        className="flex items-center gap-3 text-left flex-1 min-w-0 bg-transparent border-0 p-0 cursor-pointer"
                      >
                        {isExpanded ? (
                          <ChevronUp size={16} className="text-[#0d2c5c] shrink-0" />
                        ) : (
                          <ChevronDown size={16} className="text-[#0d2c5c] shrink-0" />
                        )}
                        <span className="text-[14.5px] font-medium text-[#0d2c5c] truncate">
                          {cat.title}
                        </span>
                      </button>

                      {/* Pill Switch Toggle */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={cat.checked}
                        disabled={cat.locked}
                        onClick={() => {
                          if (!cat.locked && cat.onToggle) {
                            cat.onToggle();
                          }
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ${
                          cat.locked
                            ? "bg-[#0d2c5c]/40 cursor-not-allowed"
                            : cat.checked
                              ? "bg-[#0d2c5c] cursor-pointer"
                              : "bg-[#cbd5e1] cursor-pointer"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                            cat.checked ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="px-4 py-3.5 text-[13.5px] leading-relaxed text-[#4f6280] bg-[#f4f7fb]">
                        {cat.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="mt-6 pt-4 border-t border-[#e1e8f0] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleAcceptSelected}
                className="rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] px-4 py-2.5 text-[13.5px] font-semibold text-[#0d2c5c] transition cursor-pointer"
              >
                Acceptă selecția
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleRejectAll}
                  className="rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] px-4 py-2.5 text-[13.5px] font-semibold text-[#334155] transition cursor-pointer"
                >
                  Refuză toate
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="rounded-xl bg-[#0d2c5c] hover:bg-[#163c78] px-5 py-2.5 text-[13.5px] font-semibold text-white transition cursor-pointer shadow-xs"
                >
                  Acceptă toate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
