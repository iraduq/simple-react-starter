import { Cookie, Settings, Eye, Ban, FileText } from "lucide-react";
import LegalPage, { LegalSection, LegalList } from "@/components/legal/LegalPage";

export default function Cookies() {
  return (
    <LegalPage
      title="Politica de cookie-uri"
      subtitle="Informații despre modulele cookie folosite pe site-ul Vila Casa Esy."
      icon={<Cookie size={18} />}
      lastUpdated="19 august 2026"
    >
      <LegalSection title="Ce sunt cookie-urile?" icon={<Cookie size={20} />}>
        <p>
          Cookie-urile sunt fișiere text de mici dimensiuni stocate pe dispozitivul dvs. atunci când accesați un site
          web. Acestea ajută site-ul să funcționeze corect, să ofere o experiență personalizată și să înțeleagă cum
          este utilizat.
        </p>
      </LegalSection>

      <LegalSection title="Ce tipuri de cookie-uri folosim?" icon={<Settings size={20} />}>
        <LegalList
          items={[
            "Cookie-uri necesare: esențiale pentru funcționarea site-ului (login, rezervări, coș de cumpărături).",
            "Cookie-uri de preferințe: memorează limba aleasă, moneda și alte setări personale.",
            "Cookie-uri de performanță: ne ajută să înțelegem cum interacționează vizitatorii cu site-ul (Google Analytics).",
            "Cookie-uri de marketing: utilizate pentru afișarea de conținut relevant și măsurarea eficienței campaniilor.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Cum gestionați cookie-urile?" icon={<Eye size={20} />}>
        <p>
          La prima vizită, vă solicităm consimțământul pentru cookie-urile non-esențiale. Puteți modifica oricând
          preferințele din banner-ul de cookie-uri sau din setările browserului. Dezactivarea cookie-urilor necesare
          poate afecta funcționalități precum login-ul sau finalizarea rezervării.
        </p>
      </LegalSection>

      <LegalSection title="Cookie-uri terțe" icon={<FileText size={20} />}>
        <p>
          Folosim servicii externe de încredere, cum ar fi Google Analytics și Google Login, care pot plasa cookie-uri
          proprii. Acestea sunt supuse politicilor de confidențialitate ale furnizorilor respectivi.
        </p>
      </LegalSection>

      <LegalSection title="Durata stocării" icon={<Ban size={20} />}>
        <p>
          Cookie-urile necesare sunt șterse la finalul sesiunii sau după o perioadă scurtă. Cookie-urile analitice și
          de marketing pot fi păstrate până la 24 de luni, cu excepția cazului în care le ștergeți manual sau vă
          retrageți consimțământul.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
