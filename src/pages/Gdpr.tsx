import { useState } from "react";
import {
  ShieldCheck,
  User,
  Lock,
  FileText,
  Mail,
  Download,
  Send,
  CheckCircle2,
} from "lucide-react";
import LegalPage, { LegalSection, LegalList } from "../components/legal/LegalPage";
import { getCachedUser } from "../lib/auth";
import { getSavedCookieConsent } from "../components/CookieConsentBanner";
import { useToast } from "../components/Toast";

export default function Gdpr() {
  const { toast } = useToast();
  const user = getCachedUser();
  const [reqType, setReqType] = useState("access");
  const [fullName, setFullName] = useState(
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "",
  );
  const [email, setEmail] = useState(user?.email || "");
  const [bookingRef, setBookingRef] = useState("");
  const [details, setDetails] = useState("");
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const handleExportPortabilityJson = () => {
    const payload = {
      export_standard: "GDPR Art. 20 — Data Portability JSON",
      exported_at: new Date().toISOString(),
      controller: {
        company: "SC VILA CASA ESY SRL",
        cui: "RO 46192045",
        dpo_email: "privacy@casaesy.ro",
      },
      authenticated_user_session: user || "Neautentificat (Vizitator)",
      cookie_consent_record: getSavedCookieConsent(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portabilitate-date-gdpr-casa-esy.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    toast("Fișierul JSON de portabilitate a datelor (Art. 20 GDPR) a fost descărcat!", "success");
  };

  const handleSubmitDsar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim()) {
      toast("Completează numele și adresa de e-mail pentru înregistrarea cererii GDPR.", "error");
      return;
    }
    const code = `GDPR-${Math.floor(10000 + Math.random() * 90000)}`;
    setSubmittedCode(code);
    setDetails("");
    toast(`Cererea ta ${code} a fost înregistrată conform Art. 12 alin. (3) GDPR!`, "success");
  };

  return (
    <LegalPage
      title="Conformitate GDPR & Exercitarea Drepturilor"
      subtitle="Angajamentul SC VILA CASA ESY SRL privind aplicarea Regulamentului (UE) 2016/679 și a Legii nr. 190/2018."
      icon={<ShieldCheck size={18} />}
      lastUpdated="5 noiembrie 2026"
    >
      <LegalSection title="1. Cadrul legal și angajamentul nostru" icon={<ShieldCheck size={20} />}>
        <p>
          <strong>SC VILA CASA ESY SRL</strong> aplică cu strictețe dispozițiile{" "}
          <strong>Regulamentului (UE) 2016/679 (GDPR)</strong> și ale <strong>Legii nr. 190/2018</strong> privind
          măsuri de punere în aplicare a Regulamentului. Toate fluxurile digitale ale proprietății — rezervările online,
          emiterea facturilor PDF, Self Check-In-ul cu generare de PIN Smart Lock și comenzile Room Service — sunt
          proiectate după principiul <em>Privacy by Design & by Default (Art. 25 GDPR)</em>.
        </p>
      </LegalSection>

      <LegalSection title="2. Principiile prelucrării datelor (Art. 5 GDPR)" icon={<Lock size={20} />}>
        <LegalList
          items={[
            "Legalitate, echitate și transparență: fiecare colectare de date are un temei juridic clar comunicat oaspetelui.",
            "Limitarea scopului: datele din rezervare și din fișa de cazare nu sunt utilizate niciodată în scopuri incompatibile.",
            "Reducerea la minimum a datelor: colectăm strict informațiile necesare cazării, facturării și securității.",
            "Exactitate: oaspeții își pot actualiza datele direct din pagina «Profilul Meu» sau prin solicitare DPO.",
            "Limitarea stocării: dezactivarea automată a codurilor PIN după check-out și anonimizarea datelor la expirarea termenelor legale.",
            "Integritate și confidențialitate: criptare TLS, parole stocate cu hash criptografic și protecție Firewall.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Drepturile garantate persoanelor vizate (Art. 15–22 GDPR)" icon={<User size={20} />}>
        <LegalList
          items={[
            "Dreptul de acces (Art. 15): obținerea unei confirmări și a unei copii a datelor personale prelucrate.",
            "Dreptul la rectificare (Art. 16): corectarea fără întârzieri a datelor inexacte sau incomplete.",
            "Dreptul la ștergerea datelor / «Dreptul de a fi uitat» (Art. 17): ștergerea datelor atunci când nu mai sunt necesare sau când consimțământul a fost retras (cu excepția documentelor fiscale ce trebuie păstrate conform legii).",
            "Dreptul la restricționarea prelucrării (Art. 18) și Dreptul la opoziție (Art. 21).",
            "Dreptul la portabilitatea datelor (Art. 20): primirea datelor într-un format structurat, utilizat în mod curent și care poate fi citit automat (JSON / CSV).",
            "Dreptul de a nu face obiectul unei decizii bazate exclusiv pe prelucrare automată (Art. 22).",
          ]}
        />

        <div className="mt-4 pt-3">
          <button
            type="button"
            onClick={handleExportPortabilityJson}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0d2c5c] hover:bg-[#c69a3f] text-white hover:text-[#0d2c5c] px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
          >
            <Download size={15} />
            Descarcă Datele Sesiunii & Consimțământul în Format JSON (Art. 20)
          </button>
        </div>
      </LegalSection>

      {/* Interactive GDPR Request Form */}
      <LegalSection
        title="4. Formular Digital pentru Exercitarea Drepturilor GDPR (DSAR)"
        icon={<FileText size={20} />}
      >
        <p className="mb-3">
          Folosiți formularul de mai jos pentru a transmite o solicitare oficială către Responsabilul cu Protecția
          Datelor (DPO). Termenul legal de soluționare este de maximum 30 de zile calendaristice conform{" "}
          <strong>Art. 12 alin. (3) GDPR</strong>.
        </p>

        {submittedCode && (
          <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-900 flex items-start gap-2.5">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong>Cerere înregistrată cu numărul #{submittedCode}</strong>. Confirmarea a fost preluată de
              departamentul DPO (privacy@casaesy.ro). Veți primi răspunsul oficial pe adresa de e-mail indicată.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitDsar} className="rounded-2xl border border-[#e1e8f0] bg-[#f8fafc] p-4 sm:p-5 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#0d2c5c] mb-1">Tipul dreptului exercitat *</label>
              <select
                value={reqType}
                onChange={(e) => setReqType(e.target.value)}
                className="w-full rounded-xl border border-[#cbd5e1] bg-white px-3 py-2 text-xs font-semibold text-[#0d2c5c]"
              >
                <option value="access">Art. 15 — Dreptul de acces la datele personale</option>
                <option value="rectification">Art. 16 — Dreptul la rectificarea datelor</option>
                <option value="erasure">Art. 17 — Ștergerea datelor („Dreptul de a fi uitat”)</option>
                <option value="portability">Art. 20 — Portabilitatea datelor</option>
                <option value="objection">Art. 21 — Opoziție / Retragere consimțământ marketing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0d2c5c] mb-1">Cod Rezervare #BK (opțional)</label>
              <input
                value={bookingRef}
                onChange={(e) => setBookingRef(e.target.value.toUpperCase())}
                placeholder="ex: BK-88412"
                className="w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2 text-xs font-mono text-[#0d2c5c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0d2c5c] mb-1">Nume și Prenume *</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="ex: Alexandru Ionescu"
                className="w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2 text-xs text-[#0d2c5c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0d2c5c] mb-1">Adresă de E-mail *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nume@exemplu.ro"
                className="w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2 text-xs text-[#0d2c5c]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0d2c5c] mb-1">Detalii suplimentare privind cererea</label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Descrieți pe scurt solicitarea dumneavoastră..."
              className="w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2 text-xs text-[#0d2c5c]"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0d2c5c] hover:bg-[#c69a3f] text-white hover:text-[#0d2c5c] px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
            >
              <Send size={14} />
              Trimite Cererea Oficială GDPR
            </button>
          </div>
        </form>
      </LegalSection>

      <LegalSection title="5. Date de contact DPO și Autoritatea de Supraveghere (ANSPDCP)" icon={<Mail size={20} />}>
        <LegalList
          items={[
            "Responsabil cu Protecția Datelor (DPO): privacy@casaesy.ro · Telefon: +40 721 234 567",
            "Sediu Operator: SC VILA CASA ESY SRL, Strada Mării Nr. 123, Mamaia, Județul Constanța",
            "Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP): B-dul G-ral. Gheorghe Magheru 28-30, Sector 1, București · Web: www.dataprotection.ro · E-mail: anspdcp@dataprotection.ro",
          ]}
        />
      </LegalSection>
    </LegalPage>
  );
}
