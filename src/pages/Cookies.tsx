import { useEffect, useState } from "react";
import {
  Cookie,
  Settings,
  Eye,
  Ban,
  FileText,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import LegalPage, { LegalSection, LegalList } from "../components/legal/LegalPage";
import {
  getSavedCookieConsent,
  saveCookieConsent,
  openCookieSettingsModal,
  COOKIE_CONSENT_EVENT,
  type CookieConsentState,
} from "../components/CookieConsentBanner";
import { useToast } from "../components/Toast";

export default function Cookies() {
  const { toast } = useToast();
  const [consent, setConsent] = useState<CookieConsentState | null>(() =>
    getSavedCookieConsent(),
  );
  const [preferences, setPreferences] = useState(consent?.preferences ?? true);
  const [analytics, setAnalytics] = useState(consent?.analytics ?? true);
  const [marketing, setMarketing] = useState(consent?.marketing ?? true);
  const [geolocation, setGeolocation] = useState(
    consent?.geolocation ?? consent?.preferences ?? true,
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    essential: true,
    functional: false,
    analytics: false,
    marketing: false,
    geolocation: false,
  });

  useEffect(() => {
    const sync = () => {
      const c = getSavedCookieConsent();
      setConsent(c);
      if (c) {
        setPreferences(c.preferences);
        setAnalytics(c.analytics);
        setMarketing(c.marketing);
        setGeolocation(c.geolocation ?? c.preferences);
      }
    };
    window.addEventListener(COOKIE_CONSENT_EVENT, sync);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, sync);
  }, []);

  const handleAcceptSelected = () => {
    const updated = saveCookieConsent({
      preferences,
      analytics,
      marketing,
      geolocation,
    });
    setConsent(updated);
    toast(
      "Preferințele tale privind modulele cookie au fost salvate!",
      "success",
    );
  };

  const handleAcceptAll = () => {
    setPreferences(true);
    setAnalytics(true);
    setMarketing(true);
    setGeolocation(true);
    const updated = saveCookieConsent({
      preferences: true,
      analytics: true,
      marketing: true,
      geolocation: true,
    });
    setConsent(updated);
    toast("Toate modulele cookie au fost activate.", "success");
  };

  const handleRejectAll = () => {
    setPreferences(false);
    setAnalytics(false);
    setMarketing(false);
    setGeolocation(false);
    const updated = saveCookieConsent({
      preferences: false,
      analytics: false,
      marketing: false,
      geolocation: false,
    });
    setConsent(updated);
    toast("Au fost păstrate exclusiv cookie-urile esențiale.", "info");
  };

  const items = [
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
    <LegalPage
      title="Politica de cookie-uri și stocare locală"
      subtitle="Transparență completă și control în timp real asupra modulelor cookie utilizate pe platforma Vila Casa Esy (Directiva ePrivacy 2002/58/CE & Legea nr. 506/2004)."
      icon={<Cookie size={18} />}
      lastUpdated="5 noiembrie 2026"
    >
      {/* Interactive Cookie Consent Panel */}
      <LegalSection
        title="Gestionează preferințele tale pentru cookie-uri"
        icon={<SlidersHorizontal size={20} />}
      >
        <div className="rounded-2xl border border-[#e1e8f0] bg-white p-5 sm:p-6 space-y-4 shadow-[0_8px_30px_rgba(13,44,92,0.05)]">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#e1e8f0]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0d2c5c]">
              <CheckCircle2 size={16} className="text-emerald-600" />
              {consent ? (
                <span>
                  Consimțământ actualizat la:{" "}
                  <strong>
                    {new Date(consent.updatedAt).toLocaleString("ro-RO")}
                  </strong>
                </span>
              ) : (
                <span>
                  Nu ai salvat încă preferințe personalizate pe acest dispozitiv.
                </span>
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
            {items.map((cat) => {
              const isExpanded = Boolean(expanded[cat.id]);
              return (
                <div
                  key={cat.id}
                  className="rounded-xl overflow-hidden border border-[#e6edf5] bg-[#f4f7fb]"
                >
                  <div
                    className={`flex items-center justify-between gap-3 px-4 py-3.5 transition-colors ${
                      isExpanded ? "bg-[#e3ebf5]/85" : "hover:bg-[#ebf1f8]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [cat.id]: !prev[cat.id],
                        }))
                      }
                      className="flex items-center gap-3 text-left flex-1 min-w-0 bg-transparent border-0 p-0 cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronUp
                          size={16}
                          className="text-[#0d2c5c] shrink-0"
                        />
                      ) : (
                        <ChevronDown
                          size={16}
                          className="text-[#0d2c5c] shrink-0"
                        />
                      )}
                      <span className="text-[14.5px] font-medium text-[#0d2c5c] truncate">
                        {cat.title}
                      </span>
                    </button>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={cat.checked}
                      disabled={cat.locked}
                      onClick={() => {
                        if (!cat.locked && cat.onToggle) cat.onToggle();
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

          <div className="pt-3 border-t border-[#e1e8f0] flex flex-wrap items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={handleAcceptSelected}
              className="rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] px-4 py-2.5 text-[13px] font-semibold text-[#0d2c5c] transition cursor-pointer"
            >
              Acceptă selecția
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
                className="rounded-xl bg-[#0d2c5c] hover:bg-[#163c78] px-5 py-2.5 text-[13px] font-semibold text-white transition cursor-pointer shadow-xs"
              >
                Acceptă toate
              </button>
            </div>
          </div>
        </div>
      </LegalSection>

      <LegalSection
        title="Ce sunt modulele cookie și stocarea locală?"
        icon={<Cookie size={20} />}
      >
        <p>
          Modulele cookie și cheile din stocarea locală a browserului (
          <code>localStorage</code>) sunt fișiere de mici dimensiuni salvate pe
          dispozitivul dumneavoastră atunci când vizitați platforma Vila Casa
          Esy. În conformitate cu <strong>Legea nr. 506/2004</strong> și{" "}
          <strong>Regulamentul (UE) 2016/679 (GDPR)</strong>, modulele strict
          necesare funcționării tehnice a serviciului solicitat de utilizator
          sunt plasate în temeiul interesului legitim și al executării
          contractului, în timp ce modulele opționale necesită consimțământul
          dumneavoastră.
        </p>
      </LegalSection>

      <LegalSection
        title="Inventarul modulelor utilizate pe platforma noastră"
        icon={<Settings size={20} />}
      >
        <LegalList
          items={[
            "access_token / sesiune autentificare (Strict Necesar): păstrează sesiunea criptată JWT pentru accesul la «Rezervările Mele», descărcarea facturilor PDF și Self Check-In. Durată: pe durata sesiunii / până la deconectare.",
            "casa_esy_cookie_consent_v1 (Strict Necesar): memorează opțiunile tale GDPR privind modulele cookie, împreună cu data și ora acordării consimțământului. Durată: 12 luni.",
            "googtrans (Funcțional / Preferințe): memorează limba aleasă în selectorul de traducere al site-ului. Durată: sesiune.",
            "__stripe_mid / __stripe_sid (Securitate Plăți — Terț): plasate de Stripe Payments Europe exclusiv la inițierea plății rezervării pentru prevenirea fraudei bancare. Durată: 30 minute – 1 an.",
          ]}
        />
      </LegalSection>

      <LegalSection
        title="Cum puteți șterge sau bloca cookie-urile din browser?"
        icon={<Eye size={20} />}
      >
        <p>
          Pe lângă panoul interactiv de mai sus, puteți șterge în orice moment
          toate modulele cookie direct din setările browserului utilizat (Google
          Chrome, Safari, Mozilla Firefox, Microsoft Edge). Vă atragem atenția
          că blocarea completă a stocării locale necesare poate împiedica
          menținerea autentificării în cont.
        </p>
      </LegalSection>

      <LegalSection
        title="Servicii terțe verificate"
        icon={<FileText size={20} />}
      >
        <p>
          Platforma integrează servicii securizate furnizate de{" "}
          <strong>Stripe</strong> (pentru plăți online certificate PCI-DSS) și{" "}
          <strong>Google</strong> (pentru autentificare OAuth 2.0 și traducerea
          interfeței), fiecare operând în conformitate cu standardele europene
          privind protecția datelor.
        </p>
      </LegalSection>

      <LegalSection title="Perioada de păstrare" icon={<Ban size={20} />}>
        <p>
          Token-urile de sesiune sunt șterse automat în momentul apăsării
          butonului „Deconectare”. Consimțământul pentru cookie-uri poate fi
          modificat sau retras instantaneu din panoul de pe această pagină.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
