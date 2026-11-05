import {
  FileText,
  CreditCard,
  CalendarX,
  BedDouble,
  Scale,
  AlertTriangle,
  KeyRound,
  UtensilsCrossed,
  ShieldCheck,
} from "lucide-react";
import LegalPage, { LegalSection, LegalList } from "../components/legal/LegalPage";

export default function Terms() {
  return (
    <LegalPage
      title="Termeni și condiții generale"
      subtitle="Cadrul contractual și legal aplicabil utilizării platformei Vila Casa Esy, rezervărilor online, accesului Smart Lock și serviciilor conexe."
      icon={<FileText size={18} />}
      lastUpdated="5 noiembrie 2026"
    >
      <LegalSection title="1. Date de identificare ale operatorului" icon={<FileText size={20} />}>
        <p>
          Platforma web și serviciile hoteliere sunt operate de <strong>SC VILA CASA ESY SRL</strong>, persoană
          juridică română cu sediul social în Strada Mării Nr. 123, Stațiunea Mamaia, Municipiul Constanța, Județul
          Constanța, România, înregistrată la Oficiul Registrului Comerțului sub nr. <strong>J13/2481/2022</strong>,
          Cod Unic de Înregistrare <strong>RO 46192045</strong>, titulară a Certificatului de Clasificare Turistică
          emis de Ministerul Economiei, Antreprenoriatului și Turismului.
        </p>
        <p>
          Prin accesarea site-ului, crearea unui cont sau plasarea unei rezervări online, confirmați că aveți vârsta
          minimă de 18 ani și că acceptați în mod expres prezentele condiții contractuale, în conformitate cu
          prevederile <strong>Codului Civil Român (art. 1166 și urm.)</strong>, ale{" "}
          <strong>Legii nr. 365/2002 privind comerțul electronic</strong> și ale{" "}
          <strong>OUG nr. 34/2014 privind drepturile consumatorilor</strong>.
        </p>
      </LegalSection>

      <LegalSection title="2. Rezervări online, tarife dinamice și cupoane promoționale" icon={<BedDouble size={20} />}>
        <LegalList
          items={[
            "Rezervările efectuate prin intermediul platformei devin ferme în momentul confirmării plății prin procesatorul securizat Stripe și emiterii codului unic de rezervare (format #BK-XXXXX).",
            "Toate tarifele afișate sunt exprimate în Lei (RON), includ TVA în cota legală aplicabilă sectorului HoReCa (9%) și sunt calculate transparent înainte de finalizarea comenzii.",
            "Platforma utilizează un sistem automatizat de tarife dinamice în funcție de gradul de ocupare, sezonalitate, zilele de weekend și planul tarifar ales (Flexibil sau Nerambursabil).",
            "Codurile promoționale (ex: VARA2026, ESYVIP) emise prin campaniile noastre se aplică exclusiv online în momentul plasării rezervării, nu sunt cumulabile între ele și nu pot fi preschimbate în numerar.",
            "La confirmarea rezervării, oaspetele poate descărca în orice moment Factura Fiscală PDF direct din secțiunea «Rezervările Mele» sau din link-ul securizat transmis pe e-mail.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Plăți securizate și facturare" icon={<CreditCard size={20} />}>
        <p>
          Plățile online cu cardul bancar sunt procesate prin <strong>Stripe Payments Europe Ltd.</strong>, entitate
          certificată la cel mai înalt standard internațional de securitate bancară (<strong>PCI-DSS Level 1</strong>
          , cu autentificare 3D Secure 2.0 / SCA). SC VILA CASA ESY SRL nu accesează și nu stochează niciodată numărul
          complet al cardului bancar sau codul CVV/CVC.
        </p>
      </LegalSection>

      <LegalSection
        title="4. Politica de anulare și excepția legală privind dreptul de retragere (OUG 34/2014)"
        icon={<CalendarX size={20} />}
      >
        <p>
          În conformitate cu prevederile <strong>art. 16 lit. l) din OUG nr. 34/2014</strong> privind drepturile
          consumatorilor în cadrul contractelor încheiate cu profesioniștii, sunt exceptate de la dreptul legal de
          retragere în termen de 14 zile contractele de prestări de servicii de cazare (altele decât cele în scop
          rezidențial) atunci când contractul prevede o dată sau o perioadă de executare specifică. Cu toate acestea,
          Vila Casa Esy oferă oaspeților următoarele condiții comerciale de anulare:
        </p>
        <LegalList
          items={[
            "Planul Tarifar Flexibil: anulare gratuită și rambursarea integrală a sumei achitate dacă solicitarea este transmisă cu cel puțin 7 zile calendaristice înainte de data de check-in.",
            "Anulare între 7 și 2 zile înainte de data sosirii: se reține contravaloarea primei nopți de cazare sau 30% din valoarea pachetului.",
            "Anulare cu mai puțin de 48 de ore înainte de check-in sau neprezentare (No-Show): suma achitată nu se rambursează, camera fiind blocată exclusiv pentru oaspete.",
            "Planul Tarifar Nerambursabil (Early Booking / Ofertă Specială): beneficiază de tarif redus și nu permite anularea sau rambursarea ulterioară.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Self Check-In Digital și Accesul prin Cod PIN Smart Lock" icon={<KeyRound size={20} />}>
        <LegalList
          items={[
            "Conform HG nr. 237/2001, cazarea oricărui turist este condiționată de completarea Fișei de anunțare a sosirii și plecării și verificarea actului de identitate (CI sau Pașaport), procedură disponibilă digital prin modulul nostru Self Check-In.",
            "După validarea check-in-ului, sistemul generează un cod PIN unic de 6 cifre pentru încuietoarea inteligentă (Smart Lock) a unității fizice alocate (ex: Camera 102).",
            "Codul PIN este strict confidențial, este activ exclusiv în intervalul sejurului (de la ora 14:00 în ziua sosirii până la ora 12:00 în ziua plecării) și nu poate fi divulgat unor persoane neînregistrate în rezervare.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Comenzi Room Service & Livrare la Șezlong (Meniu Digital)" icon={<UtensilsCrossed size={20} />}>
        <LegalList
          items={[
            "Oaspeții pot plasa comenzi de preparate culinare și băuturi direct din Meniul Digital pentru livrare în cameră (Room Service), pe plaja privată (la numărul șezlongului/baldachinului) sau la mesele de pe terasă.",
            "Opțiunea «Trecut pe Contul Camerei» este disponibilă oaspeților cu o rezervare activă (#BK-...) și implică achitarea consumației înainte sau în momentul check-out-ului.",
            "Informațiile privind gramajele, ingredientele și alergenii (conform Regulamentului UE nr. 1169/2011) sunt afișate în pagina fiecărui produs din meniul digital.",
          ]}
        />
      </LegalSection>

      <LegalSection title="7. Regulamentul de ordine interioară" icon={<AlertTriangle size={20} />}>
        <LegalList
          items={[
            "Check-in începând cu ora 14:00 · Check-out până la ora 12:00.",
            "Orele de liniște în incinta vilei sunt 22:00 – 08:00 și 13:00 – 15:00.",
            "Fumatul (inclusiv țigări electronice / dispozitive vape) este strict interzis în interiorul camerelor, conform Legii nr. 15/2016; nerespectarea atrage o taxă de igienizare de 500 RON.",
            "Obiectele uitate de oaspeți sunt înregistrate în registrul nostru digital «Lost & Found» și păstrate timp de 90 de zile, putând fi expediate prin curier la cererea titularului.",
          ]}
        />
      </LegalSection>

      <LegalSection title="8. Soluționarea litigiilor (ANPC — SAL & Platforma SOL)" icon={<Scale size={20} />}>
        <p>
          Eventualele sesizări se transmit în scris la <strong>contact@casaesy.ro</strong> și primesc răspuns în
          termen de maximum 5 zile lucrătoare. În conformitate cu <strong>OG nr. 38/2015</strong> și{" "}
          <strong>Regulamentul (UE) nr. 524/2013</strong>, consumatorii au dreptul de a apela la mecanismele de
          soluționare alternativă a litigiilor:
        </p>
        <LegalList
          items={[
            "Autoritatea Națională pentru Protecția Consumatorilor (ANPC — Direcția SAL): https://anpc.ro/ce-este-sal/",
            "Platforma Europeană de Soluționare Online a Litigiilor (SOL / ODR): https://ec.europa.eu/consumers/odr",
            "Instanțele judecătorești competente de la sediul operatorului (Municipiul Constanța).",
          ]}
        />
      </LegalSection>

      <LegalSection title="9. Protecția datelor cu caracter personal" icon={<ShieldCheck size={20} />}>
        <p>
          Prelucrarea datelor cu caracter personal se realizează în deplină conformitate cu{" "}
          <strong>Regulamentul (UE) 2016/679 (GDPR)</strong> și este descrisă pe larg în secțiunile dedicate:{" "}
          <strong>Politica de Confidențialitate</strong>, <strong>Politica de Cookie-uri</strong> și{" "}
          <strong>Angajamentul GDPR</strong>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
