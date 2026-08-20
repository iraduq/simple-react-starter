import { FileText, CreditCard, CalendarX, BedDouble, Scale, AlertTriangle } from "lucide-react";
import LegalPage, { LegalSection, LegalList } from "../components/legal/LegalPage";

export default function Terms() {
  return (
    <LegalPage
      title="Termeni și condiții"
      subtitle="Condițiile de utilizare a site-ului și de rezervare a cazării la Vila Casa Esy."
      icon={<FileText size={18} />}
      lastUpdated="20 august 2026"
    >
      <LegalSection title="Date de identificare" icon={<FileText size={20} />}>
        <p>
          Site-ul este operat de <strong>Vila Casa Esy SRL</strong>, cu sediul în Eforie Nord, județul Constanța,
          România. Prin utilizarea site-ului și prin efectuarea unei rezervări acceptați integral termenii de mai jos.
        </p>
      </LegalSection>

      <LegalSection title="Rezervări și confirmare" icon={<BedDouble size={20} />}>
        <LegalList
          items={[
            "Rezervările se fac online, telefonic sau prin e-mail și devin valide după confirmarea primită de la recepție.",
            "Prețurile afișate sunt exprimate în lei (RON) și includ TVA, dar nu includ taxa locală de promovare turistică.",
            "Tarifele pot varia dinamic în funcție de sezon, grad de ocupare și durata șederii.",
            "Numărul de persoane cazate nu poate depăși capacitatea maximă a camerei rezervate.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Plată" icon={<CreditCard size={20} />}>
        <p>
          Pentru garantarea rezervării poate fi solicitat un avans de 30% din valoarea totală. Diferența se achită la
          check-in, prin card sau numerar. Pentru rezervările cu tarif nerambursabil, plata integrală se face în
          momentul rezervării.
        </p>
      </LegalSection>

      <LegalSection title="Anulare și modificare" icon={<CalendarX size={20} />}>
        <LegalList
          items={[
            "Anulare gratuită cu până la 7 zile înainte de data de check-in.",
            "Anulare între 7 și 2 zile înainte de sosire: se reține 30% din valoarea rezervării.",
            "Anulare cu mai puțin de 48 de ore înainte de sosire sau neprezentare: se reține prima noapte.",
            "Tarifele marcate ca nerambursabile nu se pot anula sau modifica.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Reguli de cazare" icon={<AlertTriangle size={20} />}>
        <LegalList
          items={[
            "Check-in de la ora 14:00, check-out până la ora 12:00.",
            "Liniștea este obligatorie în intervalul 22:00 – 08:00.",
            "Fumatul este permis exclusiv în spațiile exterioare special amenajate.",
            "Animalele de companie sunt acceptate doar cu acordul prealabil al recepției.",
            "Clientul răspunde pentru daunele produse în unitate.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Răspundere și legislație aplicabilă" icon={<Scale size={20} />}>
        <p>
          Vila Casa Esy nu răspunde pentru bunurile lăsate nesupravegheate în spațiile comune. Prezentul contract este
          guvernat de legislația română, iar eventualele litigii se soluționează amiabil sau, în caz contrar, de către
          instanțele competente din județul Constanța.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
