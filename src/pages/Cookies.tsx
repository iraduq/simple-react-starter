import { useEffect, useState } from "react";
import { Cookie, Settings, Eye, Ban, FileText, CheckCircle2, SlidersHorizontal } from "lucide-react";
import LegalPage, { LegalSection, LegalList } from "../components/legal/LegalPage";
import {
  getSavedCookieConsent,
  saveCookieConsent,
  COOKIE_CONSENT_EVENT,
  type CookieConsentState,
} from "../components/CookieConsentBanner";
import { useToast } from "../components/Toast";

export default function Cookies() {
  const { toast } = useToast();
  const [consent, setConsent] = useState<CookieConsentState | null>(() => getSavedCookieConsent());
  const [preferences, setPreferences] = useState(consent?.preferences ?? true);
  const [analytics, setAnalytics] = useState(consent?.analytics ?? true);
  const [marketing, setMarketing] = useState(consent?.marketing ?? false);

  useEffect(() => {
    const sync = () => {
      const c = getSavedCookieConsent();
      setConsent(c);
      if (c) {
        setPreferences(c.preferences);
        setAnalytics(c.analytics);
        setMarketing(c.marketing);
      }
    };
    window.addEventListener(COOKIE_CONSENT_EVENT, sync);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, sync);
  }, []);

  const handleSave = () => {
    const updated = saveCookieConsent({ preferences, analytics, marketing });
    setConsent(updated);
    toast("Preferințele tale privind modulele cookie au fost salvate conform GDPR!", "success");
  };

  return (
    <LegalPage
      title="Politica de cookie-uri și stocare locală"
      subtitle="Transparență completă și control în timp real asupra modulelor cookie utilizate pe platforma Vila Casa Esy (Directiva ePrivacy 2002/58/CE & Legea nr. 506/2004)."
      icon={<Cookie size={18} />}
      lastUpdated="5 noiembrie 2026"
    >
      {/* Interactive Cookie Consent Panel */}
      <LegalSection title="Panou Interactiv — Gestionează consimțământul tău acum" icon={<SlidersHorizontal size={20} />}>
        <div className="rounded-2xl border border-[#c69a3f]/35 bg-[#fdf8ec]/70 p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0d2c5c]">
              <CheckCircle2 size={16} className="text-emerald-600" />
              {consent ? (
                <span>
                  Consimțământ înregistrat la:{" "}
                  <strong>{new Date(consent.updatedAt).toLocaleString("ro-RO")}</strong>
                </span>
              ) : (
                <span>Nu ai salvat încă preferințe personalizate pe acest dispozitiv.</span>
              )}
            </div>
            <span className="rounded-full bg-[#0d2c5c] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#e6b85c]">
              Art. 7 GDPR · Revocabil oricând
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl bg-white p-3.5 border border-[#e1e8f0]">
              <div className="flex items-center justify-between">
                <strong className="text-xs text-[#0d2c5c]">1. Strict Necesare (Tehnice & Securitate)</strong>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Obligatorii
                </span>
              </div>
              <p className="mt-1 text-xs text-[#6b7c99]">
                Esențiale pentru autentificare, rezervări, coșul Room Service și plățile Stripe.
              </p>
            </div>

            <label className="rounded-xl bg-white p-3.5 border border-[#e1e8f0] cursor-pointer">
              <div className="flex items-center justify-between">
                <strong className="text-xs text-[#0d2c5c]">2. Funcționale & Preferințe (Limbă RO/EN)</strong>
                <input
                  type="checkbox"
                  checked={preferences}
                  onChange={(e) => setPreferences(e.target.checked)}
                  className="h-4 w-4 accent-[#0d2c5c]"
                />
              </div>
              <p className="mt-1 text-xs text-[#6b7c99]">
                Păstrează limba selectată în Google Translate și filtrele de căutare ale camerelor.
              </p>
            </label>

            <label className="rounded-xl bg-white p-3.5 border border-[#e1e8f0] cursor-pointer">
              <div className="flex items-center justify-between">
                <strong className="text-xs text-[#0d2c5c]">3. Analitice & Performanță</strong>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="h-4 w-4 accent-[#0d2c5c]"
                />
              </div>
              <p className="mt-1 text-xs text-[#6b7c99]">
                Statistici anonimizate privind disponibilitatea camerelor și viteza de încărcare.
              </p>
            </label>

            <label className="rounded-xl bg-white p-3.5 border border-[#e1e8f0] cursor-pointer">
              <div className="flex items-center justify-between">
                <strong className="text-xs text-[#0d2c5c]">4. Marketing & Campanii Promoționale</strong>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="h-4 w-4 accent-[#0d2c5c]"
                />
              </div>
              <p className="mt-1 text-xs text-[#6b7c99]">
                Afișarea ofertelor personalizate și a cupoanelor sezoniere (ex: VARA2026).
              </p>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                setPreferences(false);
                setAnalytics(false);
                setMarketing(false);
                const updated = saveCookieConsent({
                  preferences: false,
                  analytics: false,
                  marketing: false,
                });
                setConsent(updated);
                toast("Au fost păstrate exclusiv cookie-urile strict necesare.", "info");
              }}
              className="rounded-xl border border-[#cbd5e1] bg-white px-4 py-2 text-xs font-bold text-[#0d2c5c] hover:bg-[#f8fafc] cursor-pointer"
            >
              Doar strict necesare
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-[#0d2c5c] hover:bg-[#c69a3f] text-white hover:text-[#0d2c5c] px-5 py-2 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
            >
              Salvează Preferințele Cookie
            </button>
          </div>
        </div>
      </LegalSection>

      <LegalSection title="Ce sunt modulele cookie și stocarea locală?" icon={<Cookie size={20} />}>
        <p>
          Modulele cookie și cheile din stocarea locală a browserului (<code>localStorage</code>) sunt fișiere de mici
          dimensiuni salvate pe dispozitivul dumneavoastră atunci când vizitați platforma Vila Casa Esy. În conformitate
          cu <strong>Legea nr. 506/2004</strong> și <strong>Regulamentul (UE) 2016/679 (GDPR)</strong>, modulele
          strict necesare funcționării tehnice a serviciului solicitat de utilizator sunt plasate în temeiul interesului
          legitim și al executării contractului, în timp ce modulele opționale necesită consimțământul dumneavoastră.
        </p>
      </LegalSection>

      <LegalSection title="Inventarul modulelor utilizate pe platforma noastră" icon={<Settings size={20} />}>
        <LegalList
          items={[
            "access_token / sesiune autentificare (Strict Necesar): păstrează sesiunea criptată JWT pentru accesul la «Rezervările Mele», descărcarea facturilor PDF și Self Check-In. Durată: pe durata sesiunii / până la deconectare.",
            "casa_esy_cookie_consent_v1 (Strict Necesar): memorează opțiunile tale GDPR privind modulele cookie, împreună cu data și ora acordării consimțământului. Durată: 12 luni.",
            "googtrans (Funcțional / Preferințe): memorează limba aleasă în selectorul de traducere al site-ului. Durată: sesiune.",
            "__stripe_mid / __stripe_sid (Securitate Plăți — Terț): plasate de Stripe Payments Europe exclusiv la inițierea plății rezervării pentru prevenirea fraudei bancare. Durată: 30 minute – 1 an.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Cum puteți șterge sau bloca cookie-urile din browser?" icon={<Eye size={20} />}>
        <p>
          Pe lângă panoul interactiv de mai sus, puteți șterge în orice moment toate modulele cookie direct din
          setările browserului utilizat (Google Chrome, Safari, Mozilla Firefox, Microsoft Edge). Vă atragem atenția că
          blocarea completă a stocării locale necesare poate împiedica menținerea autentificării în cont.
        </p>
      </LegalSection>

      <LegalSection title="Servicii terțe verificate" icon={<FileText size={20} />}>
        <p>
          Platforma integrează servicii securizate furnizate de <strong>Stripe</strong> (pentru plăți online
          certificate PCI-DSS) și <strong>Google</strong> (pentru autentificare OAuth 2.0 și traducerea interfeței),
          fiecare operând în conformitate cu standardele europene privind protecția datelor.
        </p>
      </LegalSection>

      <LegalSection title="Perioada de păstrare" icon={<Ban size={20} />}>
        <p>
          Token-urile de sesiune sunt șterse automat în momentul apăsării butonului „Deconectare”. Consimțământul
          pentru cookie-uri poate fi modificat sau retras instantaneu din panoul de pe această pagină.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
