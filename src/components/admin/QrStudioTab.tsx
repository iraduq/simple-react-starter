import { useState } from "react";
import {
  QrCode,
  Wifi,
  Link2,
  Download,
  Printer,
  UtensilsCrossed,
  KeyRound,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useToast } from "../Toast";
import { fetchBlob, errMsg } from "../../lib/admin";
import { Badge, Button, Card, Field, SectionHeader, inputCls } from "./ui";

const COLOR_PRESETS = [
  { label: "Bleumarin Casa Esy", fill: "#0d2c5c", back: "#ffffff" },
  { label: "Auriu Imperial", fill: "#8a6420", back: "#fffdf7" },
  { label: "Negru Clasic", fill: "#111827", back: "#ffffff" },
  { label: "Inversat (Noapte)", fill: "#e6b85c", back: "#0d2c5c" },
];

export default function QrStudioTab() {
  const { toast } = useToast();
  const [kind, setKind] = useState<"wifi" | "link">("wifi");

  // Wi-Fi state
  const [ssid, setSsid] = useState("CasaEsy_Guests_5G");
  const [password, setPassword] = useState("VacantaLaMare2026");
  const [security, setSecurity] = useState<"WPA" | "WEP" | "nopass">("WPA");

  // Link state
  const origin = typeof window !== "undefined" ? window.location.origin : "https://casaesy.ro";
  const [qrData, setQrData] = useState(`${origin}/places`);
  const [cardTitle, setCardTitle] = useState("Conexiune Wi-Fi Oaspeți");
  const [cardSubtitle, setCardSubtitle] = useState("Camera 101 · Vila Casa Esy");

  // Colors
  const [fillColor, setFillColor] = useState("#0d2c5c");
  const [backColor, setBackColor] = useState("#ffffff");

  // Generated blob URL
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const generateQr = async () => {
    setBusy(true);
    try {
      let blob: Blob;
      if (kind === "wifi") {
        if (!ssid.trim()) {
          toast("Te rog introdu numele rețelei Wi-Fi (SSID).", "error");
          setBusy(false);
          return;
        }
        blob = await fetchBlob("/utils/generate-qr/wifi", {
          method: "POST",
          body: {
            ssid: ssid.trim(),
            password: password,
            security,
            fill_color: fillColor,
            back_color: backColor,
          },
        });
      } else {
        if (!qrData.trim()) {
          toast("Te rog introdu URL-ul sau textul pentru codul QR.", "error");
          setBusy(false);
          return;
        }
        blob = await fetchBlob("/utils/generate-qr", {
          method: "POST",
          body: {
            data: qrData.trim(),
            fill_color: fillColor,
            back_color: backColor,
          },
        });
      }

      if (qrImageUrl) URL.revokeObjectURL(qrImageUrl);
      const url = URL.createObjectURL(blob);
      setQrImageUrl(url);
      toast("Codul QR a fost generat cu succes!", "success");
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setBusy(false);
    }
  };

  const downloadPng = () => {
    if (!qrImageUrl) return;
    const a = document.createElement("a");
    a.href = qrImageUrl;
    a.download = kind === "wifi" ? `wifi-qr-${ssid}.png` : "casa-esy-qr.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const printCard = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Instrumente pentru recepție și camere"
        title="Studio de coduri QR și carduri Wi-Fi"
        action={
          qrImageUrl ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={downloadPng}>
                <Download size={14} /> Descarcă PNG
              </Button>
              <Button variant="gold" onClick={printCard}>
                <Printer size={14} /> Printează cardul
              </Button>
            </div>
          ) : null
        }
      />

      {/* ── SELECTOR TIP QR ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            setKind("wifi");
            setCardTitle("Conexiune Wi-Fi Oaspeți");
            setCardSubtitle("Scanează pentru conectare automată fără parolă");
          }}
          className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all cursor-pointer ${
            kind === "wifi"
              ? "border-[#0d2c5c] bg-[#0d2c5c] text-white shadow-md"
              : "border-[#e1e8f0] bg-white text-[#0d2c5c] hover:border-[#c69a3f]"
          }`}
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#c69a3f]/20 text-[#c69a3f]">
            <Wifi size={22} />
          </span>
          <div>
            <div className="text-[15px] font-bold">Cod QR Conectare Automată Wi-Fi</div>
            <p className={`text-[12px] ${kind === "wifi" ? "text-white/75" : "text-[#6b7c99]"}`}>
              Oaspeții scanează codul în cameră și telefonul se conectează direct la Wi-Fi.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setKind("link");
            setCardTitle("Meniu Digital & Ghid Local");
            setCardSubtitle("Restaurant · Bar · Plajă · Vila Casa Esy");
          }}
          className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all cursor-pointer ${
            kind === "link"
              ? "border-[#0d2c5c] bg-[#0d2c5c] text-white shadow-md"
              : "border-[#e1e8f0] bg-white text-[#0d2c5c] hover:border-[#c69a3f]"
          }`}
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#c69a3f]/20 text-[#c69a3f]">
            <Link2 size={22} />
          </span>
          <div>
            <div className="text-[15px] font-bold">Cod QR Meniu Digital / Self Check-In / URL</div>
            <p className={`text-[12px] ${kind === "link" ? "text-white/75" : "text-[#6b7c99]"}`}>
              Ideal pentru mesele de la restaurant, șezlonguri pe plajă sau recepție.
            </p>
          </div>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* ── CONFIGURARE QR ── */}
        <Card className="p-6 lg:col-span-7 space-y-5">
          {kind === "wifi" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#eef2f7] pb-3">
                <h3 className="text-[18px] font-bold text-[#0d2c5c] font-['Outfit',sans-serif]">
                  Detalii Rețea Wi-Fi Hotel
                </h3>
                <Badge tone="gold">Standard IEEE 802.11</Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nume Rețea Wi-Fi (SSID)">
                  <input
                    value={ssid}
                    onChange={(e) => setSsid(e.target.value)}
                    placeholder="Ex: CasaEsy_Guests_5G"
                    className={inputCls}
                  />
                </Field>
                <Field label="Tip Securitate">
                  <select
                    value={security}
                    onChange={(e) => setSecurity(e.target.value as "WPA" | "WEP" | "nopass")}
                    className={inputCls}
                  >
                    <option value="WPA">WPA / WPA2 / WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">Fără parolă (Open)</option>
                  </select>
                </Field>
              </div>

              {security !== "nopass" && (
                <Field label="Parolă Wi-Fi">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Parola rețelei Wi-Fi"
                    className={inputCls}
                  />
                </Field>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#eef2f7] pb-3">
                <h3 className="text-[18px] font-bold text-[#0d2c5c] font-['Outfit',sans-serif]">
                  Destinație Cod QR
                </h3>
                <Badge tone="navy">URL / Text</Badge>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4f6280] mb-2">
                  Preset-uri Rapide Casa Esy:
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQrData(`${origin}/places`);
                      setCardTitle("Meniu Restaurant & Bar Plajă");
                      setCardSubtitle("Scanează pentru a vedea preparatele și băuturile");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#e1e8f0] bg-[#f8fafd] px-3 py-2 text-[12px] font-semibold text-[#0d2c5c] hover:border-[#c69a3f] cursor-pointer"
                  >
                    <UtensilsCrossed size={14} className="text-[#c69a3f]" /> Meniu Restaurant & Plajă
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQrData(`${origin}/rooms`);
                      setCardTitle("Rezervă & Self Check-In");
                      setCardSubtitle("Acces rapid cu cheie digitală PIN");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#e1e8f0] bg-[#f8fafd] px-3 py-2 text-[12px] font-semibold text-[#0d2c5c] hover:border-[#c69a3f] cursor-pointer"
                  >
                    <KeyRound size={14} className="text-[#c69a3f]" /> Portal Camere & Check-In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQrData(`${origin}/places`);
                      setCardTitle("Ghid Atracții Eforie Nord");
                      setCardSubtitle("Plaje, restaurante și experiențe locale");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#e1e8f0] bg-[#f8fafd] px-3 py-2 text-[12px] font-semibold text-[#0d2c5c] hover:border-[#c69a3f] cursor-pointer"
                  >
                    <MapPin size={14} className="text-[#c69a3f]" /> Atracții Locale
                  </button>
                </div>
              </div>

              <Field label="URL sau Conținut Cod QR">
                <input
                  value={qrData}
                  onChange={(e) => setQrData(e.target.value)}
                  placeholder="https://casaesy.ro/..."
                  className={inputCls}
                />
              </Field>
            </div>
          )}

          {/* Personalizare Card Printabil */}
          <div className="pt-4 border-t border-[#eef2f7] space-y-4">
            <h4 className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#0d2c5c]">
              Personalizare Etichetă Card & Culori
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Titlu pe Cardul Printabil">
                <input
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Subtitlu / Număr Cameră sau Masă">
                <input
                  value={cardSubtitle}
                  onChange={(e) => setCardSubtitle(e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4f6280] mb-2">
                Paletă Culoare Cod QR:
              </div>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setFillColor(p.fill);
                      setBackColor(p.back);
                    }}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[12px] font-semibold cursor-pointer ${
                      fillColor === p.fill && backColor === p.back
                        ? "border-[#0d2c5c] bg-[#0d2c5c]/5 text-[#0d2c5c]"
                        : "border-[#e1e8f0] bg-white text-[#4f6280]"
                    }`}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-black/15"
                      style={{ backgroundColor: p.fill }}
                    />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Button onClick={generateQr} disabled={busy} className="w-full sm:w-auto">
                <Sparkles size={15} /> {busy ? "Se generează codul QR..." : "Generează Codul QR"}
              </Button>
            </div>
          </div>
        </Card>

        {/* ── PREVIZUALIZARE CARD PRINTABIL CASA ESY ── */}
        <Card className="p-6 lg:col-span-5 flex flex-col items-center justify-center bg-[#f8fafd]">
          <div className="w-full max-w-[320px] rounded-[28px] border-2 border-[#e5dcc3] bg-white p-7 text-center shadow-[0_20px_50px_rgba(13,44,92,0.12)]">
            <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#c69a3f]">
              &#9733; Vila Casa Esy &#9733;
            </div>
            <h3
              className="mt-2 text-[22px] font-bold text-[#0d2c5c] font-['Outfit',sans-serif]"
            >
              {cardTitle || "Vila Casa Esy"}
            </h3>
            <p className="mt-1 text-[12px] text-[#6b7c99]">{cardSubtitle}</p>

            <div className="my-6 flex items-center justify-center">
              {qrImageUrl ? (
                <img
                  src={qrImageUrl}
                  alt="Cod QR Generat"
                  className="h-48 w-48 rounded-2xl border border-[#e1e8f0] p-2 shadow-sm object-contain"
                />
              ) : (
                <div className="flex h-48 w-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#cbd5e1] bg-[#f8fafd] p-4 text-[#6b7c99]">
                  <QrCode size={42} className="text-[#94a3b8] mb-2" />
                  <span className="text-[12px] font-medium">
                    Apasă pe „Generează Codul QR” pentru a afișa imaginea
                  </span>
                </div>
              )}
            </div>

            {kind === "wifi" && (
              <div className="rounded-xl bg-[#f8fafd] border border-[#e1e8f0] px-3 py-2.5 text-[11.5px] text-[#2a3b52]">
                <div>
                  Rețea: <strong className="text-[#0d2c5c]">{ssid}</strong>
                </div>
                {security !== "nopass" && (
                  <div className="mt-0.5">
                    Parolă: <code className="font-bold text-[#c69a3f]">{password}</code>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#94a3b8]">
              Eforie Nord · Marea Neagră
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
