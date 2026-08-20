import { ShieldCheck, FileText, Eye, Lock, Calendar } from "lucide-react";
import LegalPage, { LegalSection, LegalList } from "@/components/legal/LegalPage";

export default function Privacy() {
  return (
    <LegalPage
      title="Politica de confidențialitate"
      subtitle="Cum colectăm, folosim și protejăm datele personale ale oaspeților Vila Casa Esy."
      icon={<ShieldCheck size={18} />}
      lastUpdated="19 august 2026"
    >
      <LegalSection title="Operatorul de date" icon={<FileText size={20} />}>
        <p>
          Operatorul de date cu caracter personal este <strong>Vila Casa Esy SRL</strong>, cu sediul în Eforie Nord,
          județul Constanța, România. Ne puteți contacta pentru orice întrebare legată de datele personale la adresa
          de e-mail <a href="mailto:privacy@casaesy.ro" className="text-[#c69a3f] hover:underline">privacy@casaesy.ro</a>.
        </p>
      </LegalSection>

      <LegalSection title="Datele colectate" icon={<Eye size={20} />}>
        <p>
          Colectăm doar datele necesare pentru a vă putea oferi serviciile solicitate:
        </p>
        <LegalList
          items={[
            "Date de identificare: nume, prenume, adresă, număr de telefon, e-mail.",
            "Date de rezervare: perioada sejurului, tipul camerei, numărul de oaspeți, preferințe speciale.",
            "Date de plată: informații despre tranzacții (nu stocăm date complete ale cardului).",
            "Date tehnice: adresa IP, tipul de browser, dispozitivul folosit, în scop de securitate și funcționalitate.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Scopurile prelucrării" icon={<Calendar size={20} />}>
        <LegalList
          items={[
            "Gestionarea rezervărilor și cazării.",
            "Comunicarea cu dvs. în legătură cu sejurul, oferte și confirmări.",
            "Emiterea facturilor fiscale și conformarea cu legislația în vigoare.",
            "Îmbunătățirea serviciilor și a experienței pe site.",
            "Marketing direct, doar cu acordul prealabil exprimat.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Securitatea datelor" icon={<Lock size={20} />}>
        <p>
          Implementăm măsuri tehnice și organizatorice pentru a proteja datele împotriva accesului neautorizat,
          pierderii sau distrugerii. Site-ul utilizează conexiuni securizate (HTTPS), iar accesul la date este
          restricționat doar angajaților autorizați.
        </p>
      </LegalSection>

      <LegalSection title="Drepturile tale" icon={<ShieldCheck size={20} />}>
        <p>
          Conform Regulamentului UE 2016/679 (GDPR), aveți următoarele drepturi:
        </p>
        <LegalList
          items={[
            "Dreptul de acces la datele personale prelucrate.",
            "Dreptul de rectificare a datelor inexacte.",
            "Dreptul la ștergerea datelor („dreptul de a fi uitat”), în anumite condiții.",
            "Dreptul la restricționarea prelucrării.",
            "Dreptul de a te opune prelucrării sau marketingului direct.",
            "Dreptul la portabilitatea datelor.",
          ]}
        />
        <p>
          Pentru a exercita aceste drepturi, ne puteți contacta la adresa de e-mail de mai sus.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
