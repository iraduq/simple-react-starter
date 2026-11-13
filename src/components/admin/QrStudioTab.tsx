import { useState, useEffect, useCallback } from "react";
import {
  QrCode,
  Wifi,
  Link2,
  Download,
  Printer,
  Sparkles,
  Mail,
  Send,
  CheckCircle2,
  Info,
  ExternalLink,
  ShieldCheck,
  User,
} from "lucide-react";
import { useToast } from "../Toast";
import { get, post, fetchBlob, list, errMsg, type RoomBooking } from "../../lib/admin";
import { Badge, Button, Card, Field, SectionHeader, Modal, inputCls } from "./ui";

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
  const [cardSubtitle, setCardSubtitle] = useState("Scanează pentru conectare automată fără parolă");

  // Colors
  const [fillColor, setFillColor] = useState("#0d2c5c");
  const [backColor, setBackColor] = useState("#ffffff");

  // Generated blob URL
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [syncedWithBookingEmail, setSyncedWithBookingEmail] = useState(false);

  // Email modal state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [selectedBookingCode, setSelectedBookingCode] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [bookings, setBookings] = useState<RoomBooking[]>([]);

  // Load saved Wi-Fi configuration from backend on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [cfg, fetchedBookings] = await Promise.all([
          get<{
            ssid?: string;
            password?: string;
            security?: "WPA" | "WEP" | "nopass";
            card_title?: string;
            card_subtitle?: string;
          }>("/utils/wifi-config"),
          list<RoomBooking>("/bookings"),
        ]);

        if (mounted) {
          if (cfg) {
            if (cfg.ssid) setSsid(cfg.ssid);
            if (cfg.password !== undefined) setPassword(cfg.password);
            if (cfg.security) setSecurity(cfg.security);
            if (cfg.card_title) setCardTitle(cfg.card_title);
            if (cfg.card_subtitle) setCardSubtitle(cfg.card_subtitle);
            setSyncedWithBookingEmail(true);
          }
          if (Array.isArray(fetchedBookings)) {
            setBookings(fetchedBookings);
          }
        }
      } catch {
        // Fallback default values remain active
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const generateQr = useCallback(async () => {
    setBusy(true);
    try {
      let blob: Blob;
      if (kind === "wifi") {
        if (!ssid.trim()) {
          toast("Te rog introdu numele rețelei Wi-Fi (SSID).", "error");
          setBusy(false);
          return;
        }

        // 1. Fetch QR Image Blob from backend
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

        // 2. Persist Wi-Fi config so all booking emails automatically include this QR & network details
        try {
          await post("/utils/wifi-config", {
            ssid: ssid.trim(),
            password: password,
            security,
            card_title: cardTitle.trim() || "Conexiune Wi-Fi Oaspeți",
            card_subtitle: cardSubtitle.trim() || "Scanează pentru conectare automată fără parolă",
          });
          setSyncedWithBookingEmail(true);
        } catch (err) {
          console.warn("Could not sync wifi config to settings:", err);
        }

        toast(
          "Codul QR a fost generat și sincronizat automat în emailurile de confirmare a rezervărilor!",
          "success"
        );
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
        toast("Codul QR a fost generat cu succes!", "success");
      }

      if (qrImageUrl) URL.revokeObjectURL(qrImageUrl);
      const url = URL.createObjectURL(blob);
      setQrImageUrl(url);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setBusy(false);
    }
  }, [kind, ssid, password, security, fillColor, backColor, qrData, cardTitle, cardSubtitle, qrImageUrl, toast]);

  // Auto-generate on first load if not yet generated
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (!qrImageUrl && ssid) {
      timer = setTimeout(() => {
        void generateQr();
      }, 350);
    }
    return () => clearTimeout(timer);
  }, []);

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

  const handleSendEmail = async () => {
    if (!targetEmail.trim() || !targetEmail.includes("@")) {
      toast("Te rugăm să introduci o adresă de email validă.", "error");
      return;
    }

    setSendingEmail(true);
    try {
      await post("/utils/send-wifi-email", {
        to_email: targetEmail.trim(),
        ssid: ssid.trim(),
        password: password,
        security,
        guest_name: guestName.trim() || undefined,
        booking_code: selectedBookingCode || undefined,
      });

      toast(
        `Emailul cu cardul Wi-Fi și codul QR a fost expediat cu succes către ${targetEmail}!`,
        "success"
      );
      setEmailModalOpen(false);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSelectBooking = (code: string) => {
    setSelectedBookingCode(code);
    const b = bookings.find((item) => item.booking_code === code);
    if (b) {
      const email = b.guest_email || b.user?.email || "";
      const name = b.guest_name || `${b.user?.first_name || ""} ${b.user?.last_name || ""}`.trim();
      if (email) setTargetEmail(email);
      if (name) setGuestName(name);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Instrumente pentru recepție și camere"
        title="Studio de coduri QR și carduri Wi-Fi"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEmailModalOpen(true)}
              className="text-[#0d2c5c] hover:bg-[#f8fafd]"
            >
              <Mail size={14} className="text-[#c69a3f]" /> Trimite pe Email
            </Button>
            {qrImageUrl && (
              <>
                <Button variant="ghost" size="sm" onClick={downloadPng}>
                  <Download size={14} /> Descarcă PNG
                </Button>
                <Button variant="gold" size="sm" onClick={printCard}>
                  <Printer size={14} /> Printează Cardul
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* ── EMAIL INTEGRATION STATUS BANNER ── */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-white p-4 text-emerald-950 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] font-bold text-emerald-950">
                  Integrare Activă în Emailul de Confirmare a Rezervării
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Sincronizat
                </span>
              </div>
              <p className="text-[12px] text-emerald-800/90 mt-0.5">
                La apăsarea pe <strong>„Generează Codul QR”</strong>, această rețea Wi-Fi (
                <strong className="font-mono text-emerald-950">{ssid}</strong>) și imaginea codului QR
                sunt atașate automat în emailul de confirmare a plății trimis fiecărui oaspete.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="gold"
            onClick={() => setEmailModalOpen(true)}
            className="shrink-0"
          >
            <Send size={13} /> Trimite Email de Test
          </Button>
        </div>
      </div>

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
              ? "border-[#0d2c5c] bg-[#0d2c5c] text-white shadow-md ring-2 ring-[#c69a3f]"
              : "border-[#e1e8f0] bg-white text-[#0d2c5c] hover:border-[#c69a3f]"
          }`}
        >
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              kind === "wifi" ? "bg-white/10 text-[#e6b85c]" : "bg-[#0d2c5c]/5 text-[#0d2c5c]"
            }`}
          >
            <Wifi size={24} />
          </div>
          <div>
            <div className="font-bold text-[14px]">Cod QR Conectare Automată Wi-Fi</div>
            <div className={`text-[12px] mt-0.5 ${kind === "wifi" ? "text-white/80" : "text-[#6b7c99]"}`}>
              Oaspeții scanează codul în cameră sau din email și telefonul se conectează direct la Wi-Fi.
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setKind("link");
            setCardTitle("Meniu Digital & Servicii");
            setCardSubtitle("Vila Casa Esy · Eforie Nord");
          }}
          className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all cursor-pointer ${
            kind === "link"
              ? "border-[#0d2c5c] bg-[#0d2c5c] text-white shadow-md ring-2 ring-[#c69a3f]"
              : "border-[#e1e8f0] bg-white text-[#0d2c5c] hover:border-[#c69a3f]"
          }`}
        >
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              kind === "link" ? "bg-white/10 text-[#e6b85c]" : "bg-[#0d2c5c]/5 text-[#0d2c5c]"
            }`}
          >
            <Link2 size={24} />
          </div>
          <div>
            <div className="font-bold text-[14px]">Cod QR Meniu Digital / Self Check-In / URL</div>
            <div className={`text-[12px] mt-0.5 ${kind === "link" ? "text-white/80" : "text-[#6b7c99]"}`}>
              Ideal pentru mesele de la restaurant, șezlonguri pe plajă sau recepție.
            </div>
          </div>
        </button>
      </div>

      {/* ── ZONA DE CONFIGURARE & PREVIEW ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Formular configurare (Stânga) */}
        <Card className="p-6 lg:col-span-7 space-y-5">
          {kind === "wifi" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#0d2c5c]">
                  Detalii Rețea Wi-Fi Hotel
                </h4>
                <Badge tone="gold">Standard IEEE 802.11</Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nume Rețea Wi-Fi (SSID)">
                  <input
                    value={ssid}
                    onChange={(e) => setSsid(e.target.value)}
                    placeholder="ex: CasaEsy_Guests_5G"
                    className={inputCls}
                  />
                </Field>

                <Field label="Tip Securitate">
                  <select
                    value={security}
                    onChange={(e) => setSecurity(e.target.value as "WPA" | "WEP" | "nopass")}
                    className={inputCls}
                  >
                    <option value="WPA">WPA / WPA2 / WPA3 (Recomandat)</option>
                    <option value="WEP">WEP (Rețele mai vechi)</option>
                    <option value="nopass">Fără Parolă (Rețea Deschisă)</option>
                  </select>
                </Field>
              </div>

              {security !== "nopass" && (
                <Field label="Parolă Wi-Fi">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ex: VacantaLaMare2026"
                    className={inputCls}
                  />
                </Field>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#0d2c5c]">
                  Destinație Link sau Text
                </h4>
                <Badge tone="navy">Navigare Web</Badge>
              </div>

              <Field label="URL sau Date Cod QR">
                <input
                  value={qrData}
                  onChange={(e) => setQrData(e.target.value)}
                  placeholder="https://casaesy.ro/places"
                  className={inputCls}
                />
              </Field>

              {/* Preseturi rapide */}
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-[#6b7c99] mb-1.5">
                  Preseturi Rapide Casa Esy:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Meniu & Bar", url: `${origin}/menu` },
                    { label: "Ghid Turistic & Locații", url: `${origin}/places` },
                    { label: "Self Check-In", url: `${origin}/self-checkin` },
                    { label: "Rezervare Camere", url: `${origin}/rooms` },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setQrData(p.url)}
                      className="rounded-xl border border-[#e1e8f0] bg-[#f8fafd] px-3 py-1.5 text-[11.5px] font-semibold text-[#0d2c5c] hover:border-[#c69a3f] hover:bg-white transition-colors cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
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
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[12px] font-semibold cursor-pointer transition-colors ${
                      fillColor === p.fill && backColor === p.back
                        ? "border-[#0d2c5c] bg-[#0d2c5c]/5 text-[#0d2c5c] ring-1 ring-[#0d2c5c]"
                        : "border-[#e1e8f0] bg-white text-[#4f6280] hover:bg-[#f8fafd]"
                    }`}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-black/15 shrink-0"
                      style={{ backgroundColor: p.fill }}
                    />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button onClick={() => void generateQr()} disabled={busy} className="flex-1">
                <Sparkles size={15} /> {busy ? "Se generează codul QR..." : "Generează Codul QR"}
              </Button>

              <Button
                variant="ghost"
                onClick={() => setEmailModalOpen(true)}
                className="text-[#0d2c5c] border-[#cbd5e1] hover:bg-[#f8fafd]"
              >
                <Mail size={15} className="text-[#c69a3f]" /> Trimite pe Email
              </Button>
            </div>
          </div>
        </Card>

        {/* ── PREVIZUALIZARE CARD PRINTABIL CASA ESY (Dreapta) ── */}
        <Card className="p-6 lg:col-span-5 flex flex-col items-center justify-center bg-[#f8fafd]">
          <div className="w-full max-w-[320px] rounded-[28px] border-2 border-[#e5dcc3] bg-white p-7 text-center shadow-[0_20px_50px_rgba(13,44,92,0.12)]">
            <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#c69a3f]">
              &#9733; Vila Casa Esy &#9733;
            </div>
            <h3 className="mt-2 text-[21px] font-bold text-[#0d2c5c] font-['Outfit',sans-serif]">
              {cardTitle || "Vila Casa Esy"}
            </h3>
            <p className="mt-1 text-[12px] text-[#6b7c99] line-clamp-2">{cardSubtitle}</p>

            <div className="my-5 flex items-center justify-center">
              {qrImageUrl ? (
                <div className="rounded-2xl border border-[#e1e8f0] bg-white p-2.5 shadow-sm">
                  <img
                    src={qrImageUrl}
                    alt="Cod QR Generat"
                    className="h-44 w-44 object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-44 w-44 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#cbd5e1] bg-[#f8fafd] p-4 text-[#6b7c99]">
                  <QrCode size={40} className="text-[#94a3b8] mb-2 animate-pulse" />
                  <span className="text-[11.5px] font-medium text-center">
                    Apasă pe „Generează Codul QR”
                  </span>
                </div>
              )}
            </div>

            {kind === "wifi" ? (
              <div className="rounded-xl bg-[#f8fafd] border border-[#e1e8f0] px-3 py-2.5 text-[11.5px] text-[#2a3b52] text-left space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#6b7c99]">Rețea:</span>
                  <strong className="text-[#0d2c5c] font-mono">{ssid}</strong>
                </div>
                {security !== "nopass" && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#6b7c99]">Parolă:</span>
                    <code className="font-bold text-[#c69a3f] bg-white px-2 py-0.5 rounded border border-[#ecd9b2]">
                      {password}
                    </code>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl bg-[#f8fafd] border border-[#e1e8f0] px-3 py-2 text-[11px] text-[#475569] truncate font-mono">
                {qrData}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#f1f5f9] text-[10px] text-[#94a3b8]">
              <span className="font-semibold uppercase tracking-[0.16em]">Eforie Nord · Marea Neagră</span>
              <button
                type="button"
                onClick={() => setEmailModalOpen(true)}
                className="font-bold text-[#0d2c5c] hover:underline cursor-pointer"
              >
                Trimite email
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* ── MODAL EXPEDIERE EMAIL CU CODUL QR ── */}
      <Modal
        open={emailModalOpen}
        title="Trimite Cardul Wi-Fi & Codul QR pe Email"
        onClose={() => setEmailModalOpen(false)}
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-emerald-900 text-[12px] flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>
              Oaspetele va primi un email cu cardul de bun venit Casa Esy, codul QR generat și instrucțiunile de conectare automată.
            </span>
          </div>

          {/* QUICK SELECT FROM RECENT BOOKINGS */}
          {bookings.length > 0 && (
            <Field label="Alege rapid dintr-o rezervare recentă (opțional)">
              <select
                className={inputCls}
                value={selectedBookingCode}
                onChange={(e) => handleSelectBooking(e.target.value)}
              >
                <option value="">— Selectează oaspete cazat —</option>
                {bookings.slice(0, 15).map((b) => (
                  <option key={b.id} value={b.booking_code || ""}>
                    {b.booking_code ? `#${b.booking_code} · ` : ""}
                    {b.guest_name || b.user?.email || "Oaspete"}
                    {b.room_title ? ` (${b.room_title})` : ""}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Adresă Email Destinatar">
            <input
              type="email"
              className={inputCls}
              placeholder="ex: oaspete@gmail.com sau email-ul tău de test"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
            />
          </Field>

          <Field label="Nume Oaspete (opțional)">
            <input
              type="text"
              className={inputCls}
              placeholder="ex: Mihai Radu"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
            />
          </Field>

          <div className="rounded-xl bg-[#f8fafd] border border-[#e1e8f0] p-3 text-[12px] text-[#475569] space-y-1">
            <div className="font-semibold text-[#0d2c5c]">Date rețea incluse în email:</div>
            <div>Rețea Wi-Fi: <strong>{ssid}</strong></div>
            <div>Parolă: <code className="font-mono text-[#c69a3f]">{password}</code></div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2 border-t border-[#eef2f7] pt-4">
          <Button variant="ghost" onClick={() => setEmailModalOpen(false)}>
            Renunță
          </Button>
          <Button
            variant="gold"
            disabled={sendingEmail || !targetEmail.trim()}
            onClick={() => void handleSendEmail()}
          >
            <Send size={14} /> {sendingEmail ? "Se trimite emailul..." : "Trimite Emailul Acum"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
