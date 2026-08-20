import { ShieldCheck, Database, Clock, Users, Lock, UserCheck } from "lucide-react";
import LegalPage, { LegalSection, LegalList } from "../components/legal/LegalPage";

export default function Privacy() {
  return (
    <LegalPage
      title="Politica de confidențialitate"
      subtitle="Cum colectăm, folosim și protejăm datele tale personale atunci când rezervi la Casa Esy."
      icon={<ShieldCheck size={18} />}
      lastUpdated="20 august 2026"
    >
      <LegalSection title="Operatorul de date" icon={<UserCheck size={20} />}>
        <p>
          <strong>Vila Casa Esy SRL</strong>, Eforie Nord, județul Constanța, este operatorul datelor tale personale.
          Ne poți contacta oricând la <strong>privacy@casaesy.ro</strong> pentru orice aspect legat de prelucrarea
          datelor.
        </p>
      </LegalSection>

      <LegalSection title="Ce date colectăm" icon={<Database size={20} />}>
        <LegalList
          items={[
            "Date de identificare: nume, prenume, data nașterii, cetățenie, serie și număr document (necesare la check-in).",
            "Date de contact: adresă de e-mail, număr de telefon, adresă de facturare.",
            "Date despre rezervare: perioada șederii, camera, numărul de persoane, preferințe și solicitări speciale.",
            "Date tehnice: adresă IP, tip de dispozitiv și browser, colectate prin cookie-uri.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Scopurile și baza legală" icon={<ShieldCheck size={20} />}>
        <LegalList
          items={[
            "Executarea contractului de cazare: gestionarea rezervării, emiterea documentelor fiscale.",
            "Obligație legală: raportarea către autorități a datelor din registrul de evidență a turiștilor.",
            "Interes legitim: prevenirea fraudei, securitatea unității și îmbunătățirea serviciilor.",
            "Consimțământ: comunicări de marketing și cookie-uri neesențiale, revocabile oricând.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Cui transmitem datele" icon={<Users size={20} />}>
        <p>
          Datele pot fi transmise procesatorilor de plăți, furnizorului de găzduire a site-ului, contabilității și
          autorităților publice, atunci când legea o impune. Nu vindem și nu închiriem datele tale personale.
        </p>
      </LegalSection>

      <LegalSection title="Cât timp păstrăm datele" icon={<Clock size={20} />}>
        <LegalList
          items={[
            "Datele de rezervare și documentele fiscale: 10 ani, conform legislației contabile.",
            "Contul de utilizator: până la ștergerea contului, plus 30 de zile de arhivare tehnică.",
            "Datele de marketing: până la retragerea consimțământului.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Drepturile tale" icon={<Lock size={20} />}>
        <LegalList
          items={[
            "Acces, rectificare și ștergere a datelor personale.",
            "Restricționarea sau opoziția la prelucrare.",
            "Portabilitatea datelor într-un format structurat.",
            "Retragerea consimțământului în orice moment.",
            "Depunerea unei plângeri la ANSPDCP (www.dataprotection.ro).",
          ]}
        />
      </LegalSection>
    </LegalPage>
  );
}
