import { Scale, FileText, CreditCard, Ban, AlertCircle } from "lucide-react";
import LegalPage, { LegalSection, LegalList } from "@/components/legal/LegalPage";

export default function Terms() {
  return (
    <LegalPage
      title="Termeni și condiții"
      subtitle="Regulile care definesc relația dintre Vila Casa Esy și oaspeții noștri."
      icon={<Scale size={18} />}
      lastUpdated="19 august 2026"
    >
      <LegalSection title="Acceptarea termenilor" icon={<FileText size={20} />}>
        <p>
          Prin accesarea site-ului și efectuarea unei rezervări la <strong>Vila Casa Esy</strong> („noi”, „ne”),
          acceptați în mod implicit prezentul document. Vă recomandăm să citiți cu atenție termenii înainte de a
          confirma orice rezervare.
        </p>
      </LegalSection>

      <LegalSection title="Rezervări și confirmare" icon={<CreditCard size={20} />}>
        <p>
          O rezervare devine validă doar după primirea confirmării prin e-mail sau SMS. Tarifele afișate sunt în
          <strong> RON (lei români)</strong> și includ TVA. Prețurile pot varia în funcție de sezon, cerere și
          disponibilitate, conform politicii noastre de Dynamic Pricing.
        </p>
        <LegalList
          items={[
            "Rezervările se pot face online, telefonic sau prin e-mail.",
            "Pentru sejururi de minim 3 nopți, pot fi solicitate un avans sau un card de garanție.",
            "În cazul anulării în termen de 48 de ore sau mai puțin înainte de check-in, se poate reține contravaloarea primei nopți.",
            "Vila Casa Esy își rezervă dreptul de a refuza rezervările care încalcă politica internă.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Check-in și check-out" icon={<CreditCard size={20} />}>
        <LegalList
          items={[
            "Check-in: începând cu ora 15:00.",
            "Check-out: până la ora 11:00.",
            "Early check-in / late check-out se pot oferi contra cost, în funcție de disponibilitate.",
            "Oaspeții sunt obligați să prezinte un act de identitate valabil la recepție.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Anulări și modificări" icon={<Ban size={20} />}>
        <p>
          Anulările gratuite sunt acceptate până la 48 de ore înainte de data check-in-ului. După acest termen, se
          aplică politica de anulare aferentă fiecărei tarife. Modificările rezervării se fac doar în limita
          disponibilității și pot implica diferențe de tarif.
        </p>
      </LegalSection>

      <LegalSection title="Răspundere" icon={<AlertCircle size={20} />}>
        <p>
          Vila Casa Esy nu este răspunzătoare pentru obiecte personale pierdute sau furate. Vă recomandăm utilizarea
          seifurilor disponibile în camere sau la recepție. De asemenea, nu suntem răspunzători pentru întârzieri sau
          anulări cauzate de forța majoră (condiții meteo, pandemii, dezastre naturale).
        </p>
      </LegalSection>

      <LegalSection title="Legea aplicabilă" icon={<Scale size={20} />}>
        <p>
          Prezentul document este guvernat de legislația română. Orice dispută va fi soluționată pe cale amiabilă,
          iar în caz de neînțelegere, instanțele competente sunt cele din Constanța.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
