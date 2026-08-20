import { ShieldCheck, User, Lock, FileText, Mail } from "lucide-react";
import LegalPage, { LegalSection, LegalList } from "@/components/legal/LegalPage";

export default function Gdpr() {
  return (
    <LegalPage
      title="GDPR"
      subtitle="Angajamentul Vila Casa Esy față de protecția datelor cu caracter personal."
      icon={<ShieldCheck size={18} />}
      lastUpdated="19 august 2026"
    >
      <LegalSection title="Conformitate GDPR" icon={<ShieldCheck size={20} />}>
        <p>
          Vila Casa Esy respectă prevederile Regulamentului (UE) 2016/679 privind protecția persoanelor fizice în
          ceea ce privește prelucrarea datelor cu caracter personal și libera circulație a acestor date (GDPR).
          Scopul nostru este să asigurăm transparență, securitate și control asupra datelor dvs.
        </p>
      </LegalSection>

      <LegalSection title="Principii de prelucrare" icon={<Lock size={20} />}>
        <LegalList
          items={[
            "Legalitate, echitate și transparență: prelucrăm datele doar în baze legale clare.",
            "Limitarea scopului: folosim datele doar pentru scopurile comunicate.",
            "Minimizarea datelor: colectăm doar ceea ce este necesar.",
            "Exactitate: actualizăm datele și le rectificăm la solicitare.",
            "Limitarea stocării: păstrăm datele doar pe perioada necesară.",
            "Integritate și confidențialitate: protejăm datele împotriva riscurilor.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Temeiul legal" icon={<FileText size={20} />}>
        <p>
          Prelucrăm datele personale în principal pe bază de <strong>contract</strong> (rezervarea și cazarea),
          <strong> consimțământ</strong> (marketing direct și cookie-uri non-esențiale) și
          <strong> obligații legale</strong> (facturare și raportare fiscală).
        </p>
      </LegalSection>

      <LegalSection title="Drepturile persoanelor vizate" icon={<User size={20} />}>
        <p>
          În calitate de persoană vizată, beneficiați de drepturile prevăzute de GDPR, inclusiv:
        </p>
        <LegalList
          items={[
            "Dreptul de acces la datele personale prelucrate.",
            "Dreptul de rectificare.",
            "Dreptul la ștergerea datelor.",
            "Dreptul la restricționarea prelucrării.",
            "Dreptul de a vă opune prelucrării.",
            "Dreptul la portabilitatea datelor.",
            "Dreptul de a retrage consimțământul în orice moment.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Contact DPO / responsabil confidențialitate" icon={<Mail size={20} />}>
        <p>
          Pentru exercitarea drepturilor, pentru întrebări legate de GDPR sau pentru a depune o plângere, ne puteți
          contacta la:
        </p>
        <LegalList
          items={[
            "E-mail: privacy@casaesy.ro",
            "Adresă: Eforie Nord, județul Constanța, România",
            "Telefon: +40 721 234 567",
          ]}
        />
        <p>
          De asemenea, aveți dreptul de a depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării
          Datelor cu Caracter Personal (ANSPDCP) dacă considerați că drepturile dvs. au fost încălcate.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
