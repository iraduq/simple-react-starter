import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie, ShieldCheck, SlidersHorizontal, X, Check } from "lucide-react";

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
}): CookieConsentState {
  const state: CookieConsentState = {
    version: "1.0",
    updatedAt: new Date().toISOString(),
    necessary: true,
    preferences: prefs.preferences,
    analytics: prefs.analytics,
    marketing: prefs.marketing,
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
      const events = safeStats.events && typeof safeStats.events === "object" ? safeStats.events : {};
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

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [preferences, setPreferences] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = getSavedCookieConsent();
    if (!existing) {
      setVisible(true);
    } else {
      enforceCookieConsent(existing);
      setPreferences(existing.preferences);
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
    }

    const handleOpenSettings = () => {
      const current = getSavedCookieConsent();
      if (current) {
        setPreferences(current.preferences);
        setAnalytics(current.analytics);
        setMarketing(current.marketing);
      }
      setCustomizeOpen(true);
      setVisible(true);
    };

    window.addEventListener(COOKIE_OPEN_MODAL_EVENT, handleOpenSettings);
    return () => window.removeEventListener(COOKIE_OPEN_MODAL_EVENT, handleOpenSettings);
  }, []);

  const handleAcceptAll = () => {
    saveCookieConsent({ preferences: true, analytics: true, marketing: true });
    setCustomizeOpen(false);
    setVisible(false);
  };

  const handleRejectNonEssential = () => {
    saveCookieConsent({ preferences: false, analytics: false, marketing: false });
    setCustomizeOpen(false);
    setVisible(false);
  };

  const handleSaveCustom = () => {
    saveCookieConsent({ preferences, analytics, marketing });
    setCustomizeOpen(false);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9990] mx-auto max-w-4xl">
      <div className="rounded-3xl border border-[#0d2c5c]/15 bg-white/95 backdrop-blur-md p-5 sm:p-6 shadow-[0_24px_60px_rgba(13,44,92,0.24)] text-[#0d2c5c]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fdf8ec] border border-[#c69a3f]/35 text-[#c69a3f]">
              <Cookie size={22} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#c69a3f]">
                  Conformitate GDPR & ePrivacy (UE 2016/679)
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  <ShieldCheck size={11} /> Protecție Date Activă
                </span>
              </div>
              <h3 className="mt-1 font-['Cormorant_Garamond',serif] text-xl sm:text-2xl font-bold text-[#0d2c5c]">
                Respectăm confidențialitatea și alegerile tale
              </h3>
              <p className="mt-1 text-xs sm:text-[13px] leading-relaxed text-[#4f6280]">
                Folosim module cookie și stocare locală strict necesare pentru securitatea sesiunii, rezervări și plăți Stripe,
                precum și cookie-uri opționale pentru preferințe, statistici de trafic și oferte personalizate. Poți citi detalii în{" "}
                <Link to="/cookies" className="font-semibold text-[#0d2c5c] underline hover:text-[#c69a3f]">
                  Politica de Cookie-uri
                </Link>{" "}
                și{" "}
                <Link to="/gdpr" className="font-semibold text-[#0d2c5c] underline hover:text-[#c69a3f]">
                  Angajamentul GDPR
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setCustomizeOpen((v) => !v)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs font-bold text-[#0d2c5c] hover:border-[#0d2c5c] transition cursor-pointer"
            >
              <SlidersHorizontal size={14} />
              Personalizează
            </button>
            <button
              type="button"
              onClick={handleRejectNonEssential}
              className="inline-flex items-center justify-center rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-3.5 py-2.5 text-xs font-bold text-[#3d4f6b] hover:bg-[#eef2f7] transition cursor-pointer"
            >
              Doar necesare
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0d2c5c] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#c69a3f] hover:text-[#0d2c5c] transition cursor-pointer"
            >
              <Check size={14} />
              Acceptă toate
            </button>
          </div>
        </div>

        {customizeOpen && (
          <div className="mt-5 pt-5 border-t border-[#e1e8f0] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0d2c5c]">
                Configurare Granulară Consimțământ Cookie-uri
              </span>
              <button
                type="button"
                onClick={() => setCustomizeOpen(false)}
                className="text-xs text-[#6b7c99] hover:text-[#0d2c5c] inline-flex items-center gap-1 cursor-pointer"
              >
                <X size={14} /> Închide detalii
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-[#e1e8f0] bg-[#f8fafc] p-3.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#0d2c5c]">Strict Necesare</span>
                  <span className="text-[10px] font-bold uppercase bg-[#0d2c5c] text-white px-2 py-0.5 rounded-full">
                    Activ permanent
                  </span>
                </div>
                <p className="text-[11.5px] text-[#6b7c99] leading-relaxed">
                  Asigură autentificarea JWT, coșul Room Service, protecția anti-CSRF și procesarea securizată Stripe.
                </p>
              </div>

              <label className="rounded-2xl border border-[#e1e8f0] bg-white p-3.5 cursor-pointer hover:border-[#c69a3f]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#0d2c5c]">Preferințe & Limbă</span>
                  <input
                    type="checkbox"
                    checked={preferences}
                    onChange={(e) => setPreferences(e.target.checked)}
                    className="h-4 w-4 accent-[#0d2c5c]"
                  />
                </div>
                <p className="text-[11.5px] text-[#6b7c99] leading-relaxed">
                  Memorează limba selectată (RO/EN), filtrele de camere și opțiunile tale de afișare.
                </p>
              </label>

              <label className="rounded-2xl border border-[#e1e8f0] bg-white p-3.5 cursor-pointer hover:border-[#c69a3f]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#0d2c5c]">Analitice & Statistici</span>
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="h-4 w-4 accent-[#0d2c5c]"
                  />
                </div>
                <p className="text-[11.5px] text-[#6b7c99] leading-relaxed">
                  Ne ajută să măsurăm anonimizat gradul de interes pentru camere și performanța paginilor.
                </p>
              </label>

              <label className="rounded-2xl border border-[#e1e8f0] bg-white p-3.5 cursor-pointer hover:border-[#c69a3f]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#0d2c5c]">Marketing & Oferte</span>
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="h-4 w-4 accent-[#0d2c5c]"
                  />
                </div>
                <p className="text-[11.5px] text-[#6b7c99] leading-relaxed">
                  Permite afișarea campaniilor sezoniere și a cupoanelor promoționale relevante (ex: VARA2026).
                </p>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleSaveCustom}
                className="rounded-xl bg-[#c69a3f] hover:bg-[#b58932] text-[#0d2c5c] px-5 py-2 text-xs font-extrabold uppercase tracking-wider transition cursor-pointer"
              >
                Salvează Preferințele Mele
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
