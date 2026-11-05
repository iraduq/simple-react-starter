import {
  ShieldCheck,
  Database,
  Clock,
  Users,
  Lock,
  UserCheck,
  KeyRound,
  FileCheck2,
} from "lucide-react";
import LegalPage, { LegalSection, LegalList } from "../components/legal/LegalPage";

export default function Privacy() {
  return (
    <LegalPage
      title="Politica de confidențialitate (Informare Art. 13–14 GDPR)"
      subtitle="Transparență totală privind colectarea, temeiul legal, securizarea și păstrarea datelor tale cu caracter personal la Vila Casa Esy."
      icon={<ShieldCheck size={18} />}
      lastUpdated="5 noiembrie 2026"
    >
      <LegalSection title="1. Identitatea Operatorului de Date" icon={<UserCheck size={20} />}>
        <p>
          Operatorul datelor dumneavoastră cu caracter personal este <strong>SC VILA CASA ESY SRL</strong>, cu sediul
          în Strada Mării Nr. 123, Stațiunea Mamaia, Municipiul Constanța, CUI <strong>RO 46192045</strong>, Nr. Reg.
          Com. <strong>J13/2481/2022</strong>. Pentru orice solicitare privind protecția datelor, Responsabilul nostru
          cu Protecția Datelor (DPO) poate fi contactat direct la adresa <strong>privacy@casaesy.ro</strong> sau
          telefonic la <strong>+40 721 234 567</strong>.
        </p>
      </LegalSection>

      <LegalSection title="2. Categorii de date cu caracter personal prelucrate" icon={<Database size={20} />}>
        <LegalList
          items={[
            "Date de cont și contact: nume, prenume, adresă de e-mail, număr de telefon, parolă criptată ireversibil (bcrypt/Argon2).",
            "Date de rezervare și facturare: cod rezervare (#BK-...), perioada sejurului, unitatea alocată (ex: Camera 102), numărul de adulți/copii, valoarea tranzacției, codul promoțional utilizat și datele de pe factura fiscală PDF.",
            "Date obligatorii pentru evidența turiștilor (Self Check-In): cetățenie, data nașterii, domiciliu, seria și numărul actului de identitate (CI/Pașaport), colectate strict în baza obligației legale prevăzute de HG nr. 237/2001.",
            "Date operaționale pe durata sejurului: jurnale de acces Smart Lock (momentul deblocării ușii cu PIN-ul temporar), comenzi Room Service / Șezlong (#ORD-...) și recenzii verificate.",
            "Date tehnice și de securitate cibernetică: adresă IP, tip browser/dispozitiv, sesiuni active și jurnale de audit (Firewall & protecție anti-abuz).",
          ]}
        />
      </LegalSection>

      <LegalSection
        title="3. Scopurile prelucrării și temeiul juridic (Art. 6 alin. 1 GDPR)"
        icon={<FileCheck2 size={20} />}
      >
        <LegalList
          items={[
            "Art. 6 alin. (1) lit. b) — Executarea contractului: procesarea și confirmarea rezervării, alocarea camerei, generarea codului PIN Smart Lock și livrarea comenzilor Room Service / Plajă.",
            "Art. 6 alin. (1) lit. c) — Îndeplinirea unei obligații legale: completarea registrului de evidență a turiștilor conform HG nr. 237/2001 și arhivarea documentelor financiar-contabile conform Legii contabilității nr. 82/1991 și Codului Fiscal.",
            "Art. 6 alin. (1) lit. f) — Interesul legitim al operatorului: asigurarea securității fizice a proprietății (supraveghere CCTV în zonele comune și parcare), protecția cibernetică a platformei (blocarea IP-urilor malițioase, jurnalul de audit) și apărarea drepturilor în instanță.",
            "Art. 6 alin. (1) lit. a) — Consimțământul persoanei vizate: transmiterea de comunicări comerciale și cupoane promoționale prin Email Studio, precum și activarea modulelor cookie analitice sau de marketing (consimțământ revocabil în orice clipă).",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Destinatarii datelor și persoanele împuternicite" icon={<Users size={20} />}>
        <p>
          Datele dumneavoastră nu sunt vândute niciodată unor terți. Acestea sunt accesate exclusiv de personalul
          autorizat al Vilei Casa Esy (pe bază de control strict al rolurilor RBAC) și, strict în măsura necesară, de
          următorii parteneri contractuali care oferă garanții adecvate GDPR (Art. 28):
        </p>
        <LegalList
          items={[
            "Stripe Payments Europe Ltd. (Irlanda / UE) — pentru procesarea securizată a plăților cu cardul.",
            "Furnizorii de infrastructură cloud și bază de date securizată (servere localizate în Spațiul Economic European, cu conexiuni criptate TLS 1.3).",
            "Autoritățile publice competente (MAI, ANAF), exclusiv în cazurile și limitele impuse de legislația română în vigoare.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Perioada de stocare și retenție a datelor" icon={<Clock size={20} />}>
        <LegalList
          items={[
            "Facturile fiscale și documentele contabile aferente rezervărilor: 10 ani, conform Legii nr. 82/1991.",
            "Fișele de anunțare a sosirii și plecării turiștilor: 5 ani, conform normelor legale din domeniul turismului (HG nr. 237/2001).",
            "Codurile PIN Smart Lock: sunt dezactivate automat în momentul check-out-ului (ora 12:00 în ziua plecării).",
            "Jurnalele de securitate și sesiuni expirate: curățate automat prin procese periodice la 30–90 de zile.",
            "Datele prelucrate în baza consimțământului (newsletter / cookie-uri opționale): până la retragerea consimțământului.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Măsuri tehnice și organizatorice de securitate (Art. 32 GDPR)" icon={<KeyRound size={20} />}>
        <LegalList
          items={[
            "Criptarea comunicațiilor prin HTTPS / TLS și protecția token-urilor de sesiune JWT cu revocare instantanee.",
            "Control granular al accesului pe bază de roluri și permisiuni (RBAC) și jurnalizarea tuturor acțiunilor administrative în Jurnalul de Securitate.",
            "Limitarea ratei de cereri (Rate Limiting) și Firewall activ împotriva tentativelor de acces neautorizat.",
          ]}
        />
      </LegalSection>

      <LegalSection title="7. Drepturile tale și cum le poți exercita" icon={<Lock size={20} />}>
        <LegalList
          items={[
            "Dreptul de acces (Art. 15 GDPR), Dreptul la rectificare (Art. 16 GDPR) și Dreptul la ștergerea datelor / «Dreptul de a fi uitat» (Art. 17 GDPR).",
            "Dreptul la restricționarea prelucrării (Art. 18 GDPR), Dreptul la portabilitatea datelor (Art. 20 GDPR) și Dreptul la opoziție (Art. 21 GDPR).",
            "Puteți trimite o cerere rapidă direct din secțiunea «GDPR» a site-ului nostru sau la privacy@casaesy.ro, ori vă puteți adresa Autorității Naționale de Supraveghere (ANSPDCP — www.dataprotection.ro).",
          ]}
        />
      </LegalSection>
    </LegalPage>
  );
}
