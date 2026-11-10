import { useCallback, useEffect, useRef, useState } from "react";
import {
  Mail,
  Sparkles,
  Send,
  RotateCcw,
  Save,
  Monitor,
  Smartphone,
  Code2,
  LayoutTemplate,
  Eye,
  Megaphone,
  CheckCircle2,
  Copy,
  Layers,
  Palette,
  Type,
  ExternalLink,
  QrCode,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useToast } from "../Toast";
import { get, put, post, errMsg } from "../../lib/admin";
import { Badge, Button, Card, Field, Modal, SectionHeader, TableSkeleton, inputCls } from "./ui";
import { useAdminLiveSync } from "../../context/AdminLiveSyncContext";

export interface EmailTemplateItem {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  subject: string;
  html_content: string;
  design_json?: string | null;
  variables_hint?: string | null;
  is_active: boolean;
  updated_at?: string | null;
}

declare global {
  interface Window {
    unlayer?: {
      init: (options: Record<string, unknown>) => void;
      loadDesign: (design: Record<string, unknown>) => void;
      exportHtml: (cb: (data: { design: Record<string, unknown>; html: string }) => void) => void;
      addEventListener: (event: string, cb: () => void) => void;
    };
  }
}

const SAMPLE_PREVIEW_VARS: Record<string, string> = {
  code: "849201",
  guest_name: "Alexandru Ionescu",
  booking_code: "BK-90421",
  room_title: "Suită Deluxe cu Vedere la Mare",
  room_unit_number: "204",
  check_in: "15.07.2026",
  check_out: "20.07.2026",
  total_price: "2.450,00",
  qr_code_url: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CASA-ESY-BK-90421",
};

const MERGE_TAGS = [
  { tag: "{{code}}", label: "Cod OTP sau promoție", sample: "849201" },
  { tag: "{{guest_name}}", label: "Nume oaspete", sample: "Alexandru Ionescu" },
  { tag: "{{booking_code}}", label: "Cod rezervare", sample: "BK-90421" },
  { tag: "{{room_title}}", label: "Denumire cameră", sample: "Suită Deluxe" },
  { tag: "{{room_unit_number}}", label: "Număr cameră", sample: "204" },
  { tag: "{{check_in}}", label: "Data check-in", sample: "15.07.2026" },
  { tag: "{{check_out}}", label: "Data check-out", sample: "20.07.2026" },
  { tag: "{{total_price}}", label: "Total factură (RON)", sample: "2.450,00" },
  { tag: "{{qr_code_url}}", label: "URL imagine QR", sample: "https://api.qrserver.com/..." },
];

function renderPreviewHtml(rawHtml: string): string {
  let out = rawHtml || "";
  for (const [k, v] of Object.entries(SAMPLE_PREVIEW_VARS)) {
    out = out.split(`{{${k}}}`).join(v);
    out = out.split(`{{ ${k} }}`).join(v);
    out = out.split(`{${k}}`).join(v);
  }
  return out;
}

interface VisualConfig {
  headerTitle: string;
  headerSubtitle: string;
  badgeText: string;
  headerBg: string;
  headline: string;
  bodyText: string;
  hasCodeBox: boolean;
  codeBoxLabel: string;
  codeBoxValue: string;
  codeBoxNote: string;
  hasBookingTable: boolean;
  hasCtaButton: boolean;
  ctaButtonText: string;
  ctaButtonUrl: string;
  ctaButtonColor: string;
  hasQrCode: boolean;
  qrInstruction: string;
  footerContact: string;
  footerCopyright: string;
}

function getDefaultVisualConfig(slug: string): VisualConfig {
  if (slug === "verification_otp") {
    return {
      headerTitle: "Casa Esy",
      headerSubtitle: "Vila · Eforie Nord",
      badgeText: "Verificare cont",
      headerBg: "#123a75",
      headline: "Confirmă adresa ta de email",
      bodyText:
        "Am primit o solicitare de înregistrare pentru contul tău Casa Esy.\nIntrodu codul de securitate de mai jos pentru a finaliza activarea:",
      hasCodeBox: true,
      codeBoxLabel: "Codul tău de securitate",
      codeBoxValue: "{{code}}",
      codeBoxNote:
        "Codul este valabil timp de 10 minute. Dacă nu ai solicitat tu crearea acestui cont, poți ignora în siguranță acest mesaj.",
      hasBookingTable: false,
      hasCtaButton: false,
      ctaButtonText: "Autentifică-te în cont",
      ctaButtonUrl: "https://casaesy.ro/autentificare",
      ctaButtonColor: "#c69a3f",
      hasQrCode: false,
      qrInstruction: "",
      footerContact: "Casa Esy · Sejururi și cazare la Marea Neagră",
      footerCopyright: "© 2026 Casa Esy. Toate drepturile rezervate.",
    };
  }

  if (slug === "password_reset") {
    return {
      headerTitle: "Casa Esy",
      headerSubtitle: "Vila · Eforie Nord",
      badgeText: "Resetare parolă",
      headerBg: "#123a75",
      headline: "Securitatea contului tău",
      bodyText:
        "Am primit o solicitare de resetare a parolei pentru contul tău Casa Esy.\nIntrodu codul de securitate de mai jos pentru a-ți schimba parola:",
      hasCodeBox: true,
      codeBoxLabel: "Codul tău de resetare",
      codeBoxValue: "{{code}}",
      codeBoxNote:
        "Codul este valabil timp de 10 minute. Dacă nu ai solicitat tu resetarea parolei, ignoră acest mesaj. Parola ta rămâne neschimbată.",
      hasBookingTable: false,
      hasCtaButton: false,
      ctaButtonText: "Resetează parola",
      ctaButtonUrl: "https://casaesy.ro/resetare-parola",
      ctaButtonColor: "#c69a3f",
      hasQrCode: false,
      qrInstruction: "",
      footerContact: "Casa Esy · Sejururi și cazare la Marea Neagră",
      footerCopyright: "© 2026 Casa Esy. Toate drepturile rezervate.",
    };
  }

  if (slug === "seasonal_campaign") {
    return {
      headerTitle: "Casa Esy",
      headerSubtitle: "Vila · Eforie Nord",
      badgeText: "Ofertă specială",
      headerBg: "#0d2c5c",
      headline: "Ofertă de vacanță la Marea Neagră",
      bodyText:
        "Dragă {{guest_name}},\nTe invităm să te bucuri de soare, briza mării și momente de relaxare la Casa Esy. Folosește codul promoțional de mai jos pentru un tarif preferențial la următorul tău sejur:",
      hasCodeBox: true,
      codeBoxLabel: "Cod promoțional oaspete fidel",
      codeBoxValue: "{{code}}",
      codeBoxNote: "Ofertă valabilă pentru rezervările efectuate direct pe site-ul oficial Casa Esy.",
      hasBookingTable: false,
      hasCtaButton: true,
      ctaButtonText: "Descoperă camerele disponibile",
      ctaButtonUrl: "https://casaesy.ro/camere",
      ctaButtonColor: "#c69a3f",
      hasQrCode: false,
      qrInstruction: "",
      footerContact: "Casa Esy · Sejururi și cazare la Marea Neagră",
      footerCopyright: "© 2026 Casa Esy. Toate drepturile rezervate.",
    };
  }

  // Default: booking_confirmation
  return {
    headerTitle: "Casa Esy",
    headerSubtitle: "Vila · Eforie Nord",
    badgeText: "Confirmare rezervare",
    headerBg: "#0d2c5c",
    headline: "Plata a fost confirmată cu succes!",
    bodyText:
      "Îți mulțumim pentru sejur! Rezervarea ta cu codul #{{booking_code}} este acum activă și achitată.\nTe așteptăm cu drag la Casa Esy pentru o experiență de neuitat.",
    hasCodeBox: false,
    codeBoxLabel: "Cod rezervare",
    codeBoxValue: "#{{booking_code}}",
    codeBoxNote: "",
    hasBookingTable: true,
    hasCtaButton: true,
    ctaButtonText: "Descarcă voucherul de cazare",
    ctaButtonUrl: "https://casaesy.ro/rezervari",
    ctaButtonColor: "#c69a3f",
    hasQrCode: true,
    qrInstruction: "Prezintă acest cod QR la recepție la sosire pentru check-in rapid fără timp de așteptare.",
    footerContact: "Casa Esy · Sejururi și cazare la Marea Neagră",
    footerCopyright: "© 2026 Casa Esy. Toate drepturile rezervate.",
  };
}

function generateHtmlFromVisualConfig(cfg: VisualConfig): string {
  const formattedBody = (cfg.bodyText || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("<br><br>");

  let codeBoxHtml = "";
  if (cfg.hasCodeBox) {
    codeBoxHtml = `
      <div style="background: linear-gradient(180deg, #F7F9FC 0%, #EEF2F8 100%); border-radius: 18px; padding: 24px 16px; border: 1px solid #E5DCC3; margin: 24px 0 18px 0; text-align: center;">
        <div style="font-size: 10.5px; font-weight: 700; letter-spacing: 2.5px; color: #C69A3F; text-transform: uppercase; margin-bottom: 8px;">
          ${cfg.codeBoxLabel}
        </div>
        <span style="font-size: 32px; font-weight: 800; color: #0D2C5C; letter-spacing: 6px; font-family: 'Courier New', Courier, monospace; display: block;">
          ${cfg.codeBoxValue}
        </span>
      </div>
      ${
        cfg.codeBoxNote
          ? `<p style="font-size: 12.5px; line-height: 160%; color: #8A93A3; margin: 0 0 20px 0; text-align: center;">${cfg.codeBoxNote}</p>`
          : ""
      }
    `;
  }

  let bookingTableHtml = "";
  if (cfg.hasBookingTable) {
    bookingTableHtml = `
      <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F8FAFD; border-radius: 16px; padding: 20px; margin: 24px 0; border: 1px solid #E1E8F0;">
        <tr>
          <td style="padding: 8px 0; font-size: 13.5px; color: #5B6474;">Cameră selectată:</td>
          <td style="padding: 8px 0; font-size: 13.5px; font-weight: 700; color: #0D2C5C; text-align: right;">{{room_title}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 13.5px; color: #5B6474;">Număr cameră / unitate:</td>
          <td style="padding: 8px 0; font-size: 13.5px; font-weight: 700; color: #C69A3F; text-align: right;">Camera nr. {{room_unit_number}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 13.5px; color: #5B6474;">Perioadă sejur:</td>
          <td style="padding: 8px 0; font-size: 13.5px; font-weight: 700; color: #0D2C5C; text-align: right;">{{check_in}} &mdash; {{check_out}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0 0 0; font-size: 14.5px; font-weight: 700; color: #0D2C5C; border-top: 1px dashed #CBD5E1;">Total achitat:</td>
          <td style="padding: 10px 0 0 0; font-size: 15px; font-weight: 800; color: #16A34A; text-align: right; border-top: 1px dashed #CBD5E1;">{{total_price}} RON</td>
        </tr>
      </table>
    `;
  }

  let qrCodeHtml = "";
  if (cfg.hasQrCode) {
    qrCodeHtml = `
      <div style="background-color: #F8FAFD; border-radius: 16px; padding: 24px; margin: 20px 0; text-align: center; border: 1px dashed #CBD5E1;">
        <div style="font-size: 12px; font-weight: 700; color: #0D2C5C; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px;">
          Cod QR check-in rapid la recepție
        </div>
        <img src="{{qr_code_url}}" alt="Cod QR Rezervare" width="140" height="140" style="border-radius: 12px; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.08);" />
        ${
          cfg.qrInstruction
            ? `<div style="font-size: 12px; color: #64748B; margin-top: 12px; line-height: 150%;">${cfg.qrInstruction}</div>`
            : ""
        }
      </div>
    `;
  }

  let ctaHtml = "";
  if (cfg.hasCtaButton && cfg.ctaButtonText) {
    ctaHtml = `
      <div style="text-align: center; margin: 28px 0 12px 0;">
        <a href="${cfg.ctaButtonUrl || "#"}" style="display: inline-block; background-color: ${cfg.ctaButtonColor || "#C69A3F"}; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; padding: 14px 34px; border-radius: 999px; box-shadow: 0 8px 20px rgba(198, 154, 63, 0.28);">
          ${cfg.ctaButtonText}
        </a>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${cfg.headline} &mdash; ${cfg.headerTitle}</title>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #EAEEF5; margin: 0; padding: 0;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#EAEEF5">
    <tbody>
      <tr>
        <td valign="top" align="center" style="padding: 44px 16px;">
          <table width="560" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; width: 100%;">
            <tbody>
              <tr>
                <td style="padding: 0 0 22px 0; text-align: center;">
                  <span style="color: #C69A3F; font-size: 12px; letter-spacing: 6px;">&#9733;&nbsp;&nbsp;&#9733;&nbsp;&nbsp;&#9733;</span>
                  <div style="font-family: Georgia, serif; font-size: 30px; font-weight: 700; color: #0D2C5C; letter-spacing: 4px; text-transform: uppercase; margin-top: 6px;">
                    ${cfg.headerTitle}
                  </div>
                  <span style="display: block; font-size: 10.5px; font-weight: 600; letter-spacing: 3px; color: #97A0B0; text-transform: uppercase; margin-top: 4px;">
                    ${cfg.headerSubtitle}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(13, 44, 92, 0.12); background-color: #ffffff;">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                      <tr>
                        <td bgcolor="${cfg.headerBg}" style="background-color: ${cfg.headerBg}; padding: 32px 32px 28px 32px; text-align: center;">
                          <span style="display: inline-block; padding: 5px 16px; border: 1px solid rgba(198,154,63,0.55); border-radius: 999px; font-size: 10.5px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: #E4C67F;">
                            ${cfg.badgeText}
                          </span>
                          <div style="font-family: Georgia, serif; font-style: italic; font-size: 24px; font-weight: 600; color: #ffffff; margin-top: 14px;">
                            ${cfg.headline}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td bgcolor="#ffffff" style="background-color: #ffffff; padding: 34px 36px 38px 36px; color: #111827;">
                          <p style="font-size: 14px; line-height: 170%; color: #5B6474; margin: 0 0 16px 0; text-align: center;">
                            ${formattedBody}
                          </p>
                          ${codeBoxHtml}
                          ${bookingTableHtml}
                          ${qrCodeHtml}
                          ${ctaHtml}
                          <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #EEF2F7; text-align: center; font-family: Georgia, serif; font-size: 15.5px; font-style: italic; font-weight: 600; color: #0D2C5C;">
                            Cu drag,<br>Echipa Casa Esy
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 0 10px; text-align: center; font-size: 11.5px; color: #9CA3AF; line-height: 160%;">
                  ${cfg.footerContact}<br/>
                  ${cfg.footerCopyright}
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;
}

export default function EmailStudioTab() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplateItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("booking_confirmation");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [designJson, setDesignJson] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);

  // Visual customizer configuration state
  const [visualConfig, setVisualConfig] = useState<VisualConfig>(() =>
    getDefaultVisualConfig("booking_confirmation"),
  );

  // Studio mode: "visual" (default & always working) | "split" | "preview" | "unlayer"
  const [mode, setMode] = useState<"visual" | "split" | "preview" | "unlayer">("visual");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  // Unlayer engine state & watchdog
  const [unlayerLoading, setUnlayerLoading] = useState(false);
  const [unlayerFailed, setUnlayerFailed] = useState(false);
  const [unlayerReady, setUnlayerReady] = useState(false);
  const unlayerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Modals
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("VARA2026");
  const [customRecipients, setCustomRecipients] = useState("");
  const [sendingCampaign, setSendingCampaign] = useState(false);

  const loadTemplates = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const data = await get<EmailTemplateItem[]>("/email-templates");
        const arr = Array.isArray(data) ? data : [];
        setTemplates(arr);
      } catch (e) {
        if (!silent) toast(errMsg(e), "error");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [toast],
  );

  useAdminLiveSync({
    topic: "all",
    onSync: () => void loadTemplates(true),
  });

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const activeTemplate = templates.find((t) => t.slug === selectedSlug) || templates[0] || null;

  // On template change: update subject, html, and visual configuration
  useEffect(() => {
    if (!activeTemplate) return;
    setSubject(activeTemplate.subject);
    setHtmlContent(activeTemplate.html_content);
    setDesignJson(activeTemplate.design_json || null);
    setIsActive(activeTemplate.is_active);

    const defaultConfig = getDefaultVisualConfig(activeTemplate.slug);
    setVisualConfig(defaultConfig);

    if (mode === "unlayer" && unlayerReady && window.unlayer && activeTemplate.design_json) {
      try {
        const parsed = JSON.parse(activeTemplate.design_json);
        window.unlayer.loadDesign(parsed);
      } catch {
        /* ignore invalid design json */
      }
    }
  }, [activeTemplate?.slug, activeTemplate?.updated_at]);

  // Update visual config helper and regenerate HTML live
  const updateVisualField = <K extends keyof VisualConfig>(key: K, value: VisualConfig[K]) => {
    setVisualConfig((prev) => {
      const next = { ...prev, [key]: value };
      const newHtml = generateHtmlFromVisualConfig(next);
      setHtmlContent(newHtml);
      return next;
    });
  };

  // Watchdog & loader for Unlayer (only runs when user explicitly selects "unlayer")
  useEffect(() => {
    if (mode !== "unlayer") {
      if (unlayerTimeoutRef.current) clearTimeout(unlayerTimeoutRef.current);
      return;
    }

    setUnlayerLoading(true);
    setUnlayerFailed(false);

    const initEditor = () => {
      if (!window.unlayer) {
        setUnlayerFailed(true);
        setUnlayerLoading(false);
        return;
      }
      const container = document.getElementById("unlayer-editor-box");
      if (!container) return;
      container.innerHTML = "";

      const mergeTagsConfig: Record<string, { name: string; value: string }> = {};
      MERGE_TAGS.forEach((m, idx) => {
        mergeTagsConfig[`tag_${idx}`] = { name: m.label, value: m.tag };
      });

      try {
        window.unlayer.init({
          id: "unlayer-editor-box",
          displayMode: "email",
          appearance: {
            theme: "modern_light",
            panels: { tools: { dock: "right" } },
          },
          mergeTags: mergeTagsConfig,
        });

        window.unlayer.addEventListener("editor:ready", () => {
          setUnlayerReady(true);
          setUnlayerLoading(false);
          setUnlayerFailed(false);
          if (designJson) {
            try {
              window.unlayer?.loadDesign(JSON.parse(designJson));
            } catch {
              /* ignore */
            }
          }
        });
      } catch {
        setUnlayerFailed(true);
        setUnlayerLoading(false);
      }
    };

    // Watchdog: If Unlayer takes longer than 3.5 seconds or fails due to adblocker/CORS, show friendly alert
    unlayerTimeoutRef.current = setTimeout(() => {
      if (!unlayerReady) {
        setUnlayerLoading(false);
        setUnlayerFailed(true);
      }
    }, 3500);

    const existingScript = document.getElementById("unlayer-embed-script") as HTMLScriptElement | null;
    if (existingScript && window.unlayer) {
      initEditor();
      return;
    }

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "unlayer-embed-script";
      script.src = "https://editor.unlayer.com/embed.js";
      script.async = true;
      script.onload = () => {
        initEditor();
      };
      script.onerror = () => {
        setUnlayerLoading(false);
        setUnlayerFailed(true);
      };
      document.body.appendChild(script);
    }
  }, [mode]);

  const syncFromUnlayer = (): Promise<{ html: string; design: string | null }> => {
    return new Promise((resolve) => {
      if (mode === "unlayer" && unlayerReady && window.unlayer) {
        try {
          window.unlayer.exportHtml((data) => {
            const exportedHtml = data?.html || htmlContent;
            const exportedDesign = data?.design ? JSON.stringify(data.design) : designJson;
            setHtmlContent(exportedHtml);
            setDesignJson(exportedDesign);
            resolve({ html: exportedHtml, design: exportedDesign });
          });
        } catch {
          resolve({ html: htmlContent, design: designJson });
        }
      } else {
        resolve({ html: htmlContent, design: designJson });
      }
    });
  };

  const handleSave = async () => {
    if (!activeTemplate) return;
    setSaving(true);
    try {
      const synced = await syncFromUnlayer();
      await put(`/email-templates/${activeTemplate.slug}`, {
        name: activeTemplate.name,
        description: activeTemplate.description,
        subject,
        html_content: synced.html,
        design_json: synced.design,
        is_active: isActive,
      });
      toast(`Șablonul „${activeTemplate.name}” a fost salvat și este activ!`, "success");
      await loadTemplates(true);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!activeTemplate) return;
    if (
      !window.confirm(
        `Sigur vrei să resetezi șablonul „${activeTemplate.name}” la designul oficial Casa Esy?`,
      )
    ) {
      return;
    }
    setSaving(true);
    try {
      const updated = await post<EmailTemplateItem>(`/email-templates/${activeTemplate.slug}/reset`);
      setSubject(updated.subject);
      setHtmlContent(updated.html_content);
      setDesignJson(updated.design_json || null);
      setVisualConfig(getDefaultVisualConfig(activeTemplate.slug));
      if (unlayerReady && window.unlayer && updated.design_json) {
        try {
          window.unlayer.loadDesign(JSON.parse(updated.design_json));
        } catch {
          /* ignore */
        }
      }
      toast("Șablonul a fost readus la forma inițială.", "success");
      await loadTemplates(true);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!activeTemplate || !testEmail.trim()) return;
    setSendingTest(true);
    try {
      const synced = await syncFromUnlayer();
      const res = await post<{ sent: boolean; message: string }>(
        `/email-templates/${activeTemplate.slug}/test`,
        {
          to_email: testEmail.trim(),
          subject,
          html_content: synced.html,
        },
      );
      toast(res.message, res.sent ? "success" : "error");
      if (res.sent) setTestModalOpen(false);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setSendingTest(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!activeTemplate) return;
    setSendingCampaign(true);
    try {
      const synced = await syncFromUnlayer();
      const recipientsList = customRecipients
        .split(/[,;\n]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await post<{ sent_count: number; total_targets: number }>(
        `/email-templates/${activeTemplate.slug}/broadcast`,
        {
          subject,
          html_content: synced.html,
          promo_code: promoCode.trim() || "ESY2026",
          recipients: recipientsList.length > 0 ? recipientsList : null,
        },
      );
      toast(
        `Campanie expediată cu succes către ${res.sent_count} din ${res.total_targets} destinatari!`,
        "success",
      );
      setCampaignModalOpen(false);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setSendingCampaign(false);
    }
  };

  const insertMergeTag = (tag: string) => {
    setHtmlContent((prev) => prev + `\n${tag}`);
    navigator.clipboard?.writeText(tag);
    toast(`Variabila ${tag} a fost copiată în clipboard!`, "success");
  };

  if (loading) return <TableSkeleton rows={6} />;

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Design și comunicare automată"
        title="Email studio și editor vizual de șabloane"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" onClick={handleReset} disabled={saving}>
              <RotateCcw size={14} /> Resetează șablonul
            </Button>
            <Button variant="ghost" onClick={() => setTestModalOpen(true)}>
              <Send size={14} /> Trimite email de test
            </Button>
            <Button variant="gold" onClick={() => setCampaignModalOpen(true)}>
              <Megaphone size={14} /> Trimite campanie către oaspeți
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save size={14} /> {saving ? "Se salvează..." : "Salvează șablonul"}
            </Button>
          </div>
        }
      />

      {/* Selector șabloane email */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {templates.map((tpl) => {
          const selected = tpl.slug === activeTemplate?.slug;
          return (
            <button
              key={tpl.slug}
              type="button"
              onClick={async () => {
                await syncFromUnlayer();
                setSelectedSlug(tpl.slug);
              }}
              className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                selected
                  ? "border-[#0d2c5c] bg-[#0d2c5c] text-white shadow-md ring-2 ring-[#c69a3f]/40"
                  : "border-[#e1e8f0] bg-white text-[#0d2c5c] hover:border-[#c69a3f]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                      selected ? "bg-white/15 text-[#e6b85c]" : "bg-[#c69a3f]/20 text-[#c69a3f]"
                    }`}
                  >
                    <Mail size={16} />
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      selected ? "bg-white/20 text-[#e6b85c]" : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {tpl.is_active ? "Activ" : "Inactiv"}
                  </span>
                </div>
                <h4
                  className={`mt-3 text-[14px] font-bold leading-snug ${
                    selected ? "text-white" : "text-[#0d2c5c]"
                  }`}
                >
                  {tpl.name}
                </h4>
                <p
                  className={`mt-1 text-[11.5px] line-clamp-2 ${
                    selected ? "text-white/80" : "text-[#6b7c99]"
                  }`}
                >
                  {tpl.description}
                </p>
              </div>
              <div
                className={`mt-3 pt-2 border-t text-[10px] font-mono truncate ${
                  selected ? "border-white/15 text-[#e6b85c]" : "border-[#eef2f7] text-[#6b7c99]"
                }`}
              >
                {tpl.variables_hint}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bară subiect și variabile dinamice */}
      {activeTemplate && (
        <Card className="p-5 space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#0d2c5c] mb-1.5">
                Subiectul emailului (suportă variabile dinamice)
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={inputCls}
                placeholder="Ex: Confirmare rezervare #{{booking_code}} — Casa Esy"
              />
            </div>

            <div className="flex flex-col justify-end">
              <div className="flex items-center justify-between rounded-xl border border-[#e1e8f0] bg-[#f8fafd] px-4 py-2.5">
                <div>
                  <div className="text-[12px] font-bold text-[#0d2c5c]">Șablon personalizat activ</div>
                  <div className="text-[11px] text-[#6b7c99]">Folosit automat de server la trimitere</div>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 accent-[#0d2c5c] cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#eef2f7]">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={13} className="text-[#c69a3f]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4f6280]">
                Variabile dinamice (apasă pentru copiere sau inserare în șablon):
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {MERGE_TAGS.map((m) => (
                <button
                  key={m.tag}
                  type="button"
                  onClick={() => insertMergeTag(m.tag)}
                  className="group inline-flex items-center gap-1.5 rounded-lg border border-[#e1e8f0] bg-[#f8fafd] px-2.5 py-1 text-[11.5px] font-medium text-[#0d2c5c] hover:border-[#c69a3f] hover:bg-[#c69a3f]/10 transition-colors cursor-pointer"
                  title={`Exemplu valoare: ${m.sample}`}
                >
                  <code className="font-bold text-[#c69a3f]">{m.tag}</code>
                  <span className="text-[#6b7c99] text-[11px]">({m.label})</span>
                  <Copy size={11} className="text-[#94a3b8] group-hover:text-[#0d2c5c]" />
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Selector mod studio */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-[#e1e8f0] bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={async () => {
              await syncFromUnlayer();
              setMode("visual");
            }}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[12px] font-bold transition-colors cursor-pointer ${
              mode === "visual" ? "bg-[#0d2c5c] text-white" : "text-[#4f6280] hover:text-[#0d2c5c]"
            }`}
          >
            <LayoutTemplate size={15} /> Editor vizual de secțiuni
          </button>
          <button
            type="button"
            onClick={async () => {
              await syncFromUnlayer();
              setMode("split");
            }}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[12px] font-bold transition-colors cursor-pointer ${
              mode === "split" ? "bg-[#0d2c5c] text-white" : "text-[#4f6280] hover:text-[#0d2c5c]"
            }`}
          >
            <Code2 size={15} /> Editor HTML și previzualizare dublă
          </button>
          <button
            type="button"
            onClick={async () => {
              await syncFromUnlayer();
              setMode("preview");
            }}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[12px] font-bold transition-colors cursor-pointer ${
              mode === "preview" ? "bg-[#0d2c5c] text-white" : "text-[#4f6280] hover:text-[#0d2c5c]"
            }`}
          >
            <Eye size={15} /> Previzualizare oaspete
          </button>
          <button
            type="button"
            onClick={() => setMode("unlayer")}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[12px] font-medium transition-colors cursor-pointer ${
              mode === "unlayer"
                ? "bg-[#0d2c5c] text-white font-bold"
                : "text-[#64748b] hover:text-[#0d2c5c]"
            }`}
            title="Motor de editare extern Unlayer"
          >
            <Layers size={14} /> Motor Unlayer Cloud
          </button>
        </div>

        {(mode === "preview" || mode === "split" || mode === "visual") && (
          <div className="inline-flex rounded-xl border border-[#e1e8f0] bg-white p-1">
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold cursor-pointer ${
                device === "desktop" ? "bg-[#0d2c5c] text-white" : "text-[#6b7c99]"
              }`}
            >
              <Monitor size={14} /> Desktop (600px)
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold cursor-pointer ${
                device === "mobile" ? "bg-[#0d2c5c] text-white" : "text-[#6b7c99]"
              }`}
            >
              <Smartphone size={14} /> Mobil (375px)
            </button>
          </div>
        )}
      </div>

      {/* ── MOD 1: EDITOR VIZUAL DE SECȚIUNI (CASA ESY STUDIO) ── */}
      {mode === "visual" && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Panou stânga: Personalizare vizuală blocuri */}
          <div className="lg:col-span-6 space-y-4">
            {/* Secțiunea 1: Antet și identitate */}
            <Card className="p-4 space-y-3 border-l-4 border-l-[#0d2c5c]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#0d2c5c] font-bold text-[13px]">
                  <Palette size={16} className="text-[#c69a3f]" /> Antet și identitate vizuală
                </div>
                <Badge tone="navy">Branding</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#64748b] mb-1">
                    Titlu resort
                  </label>
                  <input
                    value={visualConfig.headerTitle}
                    onChange={(e) => updateVisualField("headerTitle", e.target.value)}
                    className={inputCls}
                    placeholder="Casa Esy"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#64748b] mb-1">
                    Sub-etichetă locație
                  </label>
                  <input
                    value={visualConfig.headerSubtitle}
                    onChange={(e) => updateVisualField("headerSubtitle", e.target.value)}
                    className={inputCls}
                    placeholder="Vila · Eforie Nord"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#64748b] mb-1">
                    Etichetă insignă (badge)
                  </label>
                  <input
                    value={visualConfig.badgeText}
                    onChange={(e) => updateVisualField("badgeText", e.target.value)}
                    className={inputCls}
                    placeholder="Confirmare rezervare"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#64748b] mb-1">
                    Culoare fundal antet
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={visualConfig.headerBg}
                      onChange={(e) => updateVisualField("headerBg", e.target.value)}
                      className="h-9 w-12 rounded border border-[#e1e8f0] p-1 cursor-pointer bg-white"
                    />
                    <span className="text-[12px] font-mono font-medium text-[#0d2c5c]">
                      {visualConfig.headerBg}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Secțiunea 2: Mesaj principal */}
            <Card className="p-4 space-y-3 border-l-4 border-l-[#c69a3f]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#0d2c5c] font-bold text-[13px]">
                  <Type size={16} className="text-[#c69a3f]" /> Mesaj principal și conținut
                </div>
                <Badge tone="gold">Text</Badge>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#64748b] mb-1">
                  Titlu întâmpinare
                </label>
                <input
                  value={visualConfig.headline}
                  onChange={(e) => updateVisualField("headline", e.target.value)}
                  className={inputCls}
                  placeholder="Plata a fost confirmată cu succes!"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#64748b] mb-1">
                  Paragraf explicativ (suportă variabile dinamice)
                </label>
                <textarea
                  rows={4}
                  value={visualConfig.bodyText}
                  onChange={(e) => updateVisualField("bodyText", e.target.value)}
                  className={inputCls}
                  placeholder="Îți mulțumim pentru sejur!..."
                />
              </div>
            </Card>

            {/* Secțiunea 3: Casetă cod securitate sau detalii rezervare */}
            {visualConfig.hasCodeBox && (
              <Card className="p-4 space-y-3 border-l-4 border-l-emerald-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#0d2c5c] font-bold text-[13px]">
                    <Sparkles size={16} className="text-emerald-600" /> Caseta cod de securitate / promoție
                  </div>
                  <Badge tone="green">Cod dinamic</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#64748b] mb-1">
                      Etichetă deasupra codului
                    </label>
                    <input
                      value={visualConfig.codeBoxLabel}
                      onChange={(e) => updateVisualField("codeBoxLabel", e.target.value)}
                      className={inputCls}
                      placeholder="Codul tău de securitate"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#64748b] mb-1">
                      Variabilă afișată
                    </label>
                    <input
                      value={visualConfig.codeBoxValue}
                      onChange={(e) => updateVisualField("codeBoxValue", e.target.value)}
                      className={inputCls}
                      placeholder="{{code}}"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#64748b] mb-1">
                    Notă valabilitate / instrucțiune
                  </label>
                  <input
                    value={visualConfig.codeBoxNote}
                    onChange={(e) => updateVisualField("codeBoxNote", e.target.value)}
                    className={inputCls}
                    placeholder="Codul este valabil timp de 10 minute..."
                  />
                </div>
              </Card>
            )}

            {visualConfig.hasBookingTable && (
              <Card className="p-4 space-y-2 border-l-4 border-l-emerald-600 bg-[#f8fafd]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#0d2c5c] font-bold text-[13px]">
                    <CheckCircle2 size={16} className="text-emerald-600" /> Detalii sejur incluse automat
                  </div>
                  <Badge tone="green">Tabel rezervare</Badge>
                </div>
                <p className="text-[12px] text-[#5b6474] leading-relaxed">
                  Emailul include automat tabelul lux cu Cameră (<code>{"{{room_title}}"}</code>), Unitate (<code>{"{{room_unit_number}}"}</code>), Perioadă (<code>{"{{check_in}} &mdash; {{check_out}}"}</code>) și Total achitat (<code>{"{{total_price}} RON"}</code>).
                </p>
              </Card>
            )}

            {/* Secțiunea 4: Buton principal de acțiune (CTA) */}
            <Card className="p-4 space-y-3 border-l-4 border-l-[#c69a3f]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#0d2c5c] font-bold text-[13px]">
                  <ExternalLink size={16} className="text-[#c69a3f]" /> Buton principal de acțiune (CTA)
                </div>
                <label className="flex items-center gap-2 text-[12px] text-[#4f6280] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visualConfig.hasCtaButton}
                    onChange={(e) => updateVisualField("hasCtaButton", e.target.checked)}
                    className="h-4 w-4 accent-[#0d2c5c] cursor-pointer"
                  />
                  Activ
                </label>
              </div>

              {visualConfig.hasCtaButton && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-[#64748b] mb-1">
                      Text buton
                    </label>
                    <input
                      value={visualConfig.ctaButtonText}
                      onChange={(e) => updateVisualField("ctaButtonText", e.target.value)}
                      className={inputCls}
                      placeholder="Descarcă voucherul"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#64748b] mb-1">
                      Link destinație (URL)
                    </label>
                    <input
                      value={visualConfig.ctaButtonUrl}
                      onChange={(e) => updateVisualField("ctaButtonUrl", e.target.value)}
                      className={inputCls}
                      placeholder="https://casaesy.ro/rezervari"
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Secțiunea 5: Cod QR check-in */}
            <Card className="p-4 space-y-3 border-l-4 border-l-[#0d2c5c]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#0d2c5c] font-bold text-[13px]">
                  <QrCode size={16} className="text-[#0d2c5c]" /> Cod QR check-in rapid la recepție
                </div>
                <label className="flex items-center gap-2 text-[12px] text-[#4f6280] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visualConfig.hasQrCode}
                    onChange={(e) => updateVisualField("hasQrCode", e.target.checked)}
                    className="h-4 w-4 accent-[#0d2c5c] cursor-pointer"
                  />
                  Afișează cod QR
                </label>
              </div>

              {visualConfig.hasQrCode && (
                <div>
                  <label className="block text-[11px] font-bold text-[#64748b] mb-1">
                    Instrucțiuni sosire recepție
                  </label>
                  <input
                    value={visualConfig.qrInstruction}
                    onChange={(e) => updateVisualField("qrInstruction", e.target.value)}
                    className={inputCls}
                    placeholder="Prezintă acest cod la recepție la sosire..."
                  />
                </div>
              )}
            </Card>

            {/* Secțiunea 6: Subsol și contact */}
            <Card className="p-4 space-y-3 border-l-4 border-l-[#94a3b8]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#0d2c5c] font-bold text-[13px]">
                  <Mail size={16} className="text-[#94a3b8]" /> Subsol și date de contact
                </div>
                <Badge tone="muted">Subsol</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#64748b] mb-1">
                    Informații contact
                  </label>
                  <input
                    value={visualConfig.footerContact}
                    onChange={(e) => updateVisualField("footerContact", e.target.value)}
                    className={inputCls}
                    placeholder="Casa Esy · Sejururi la Marea Neagră"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#64748b] mb-1">
                    Notă drepturi de autor
                  </label>
                  <input
                    value={visualConfig.footerCopyright}
                    onChange={(e) => updateVisualField("footerCopyright", e.target.value)}
                    className={inputCls}
                    placeholder="© 2026 Casa Esy. Toate drepturile rezervate."
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Panou dreapta: Previzualizare live cu date reale */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <Card className="w-full p-4 flex flex-col items-center bg-[#eaeef5] sticky top-6">
              <div className="mb-3 w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge tone="gold">Previzualizare în timp real</Badge>
                  <span className="text-[12px] text-[#4f6280] font-medium">
                    Actualizare instantanee la orice modificare
                  </span>
                </div>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  <Save size={13} /> {saving ? "Se salvează..." : "Salvează șablonul"}
                </Button>
              </div>

              <div
                className="overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300 border border-[#dce3ee]"
                style={{
                  width: device === "mobile" ? "375px" : "100%",
                  maxWidth: "580px",
                  height: "760px",
                }}
              >
                <iframe
                  title="Previzualizare Live Șablon"
                  srcDoc={renderPreviewHtml(htmlContent)}
                  className="h-full w-full border-0"
                />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── MOD 2: MOTOR UNLAYER CLOUD (CU WATCHDOG ȘI FALLBACK AUTOMAT) ── */}
      {mode === "unlayer" && (
        <Card className="overflow-hidden border border-[#e1e8f0]">
          <div className="flex flex-wrap items-center justify-between border-b border-[#eef2f7] bg-[#f8fafd] px-5 py-3 gap-3">
            <div className="flex items-center gap-2">
              <Badge tone="gold">Unlayer Studio</Badge>
              <span className="text-[12px] font-medium text-[#4f6280]">
                Editor drag and drop bazat pe componente cloud.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode("visual")}
                className="text-[#0d2c5c]"
              >
                <LayoutTemplate size={14} /> Comută pe editorul vizual integrat
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save size={14} /> Salvează designul
              </Button>
            </div>
          </div>

          {unlayerLoading && (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white min-h-[300px]">
              <RefreshCw size={32} className="text-[#c69a3f] animate-spin mb-3" />
              <div className="text-[15px] font-bold text-[#0d2c5c]">
                Se inițializează editorul Unlayer Cloud...
              </div>
              <p className="text-[12.5px] text-[#64748b] mt-1 max-w-md">
                Descărcăm componentele grafice de la editor.unlayer.com. Dacă durează mai mult de câteva secunde, poți comuta oricând pe editorul vizual integrat.
              </p>
            </div>
          )}

          {unlayerFailed && (
            <div className="m-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-6 text-[#92400e]">
              <div className="flex items-start gap-3">
                <AlertTriangle size={22} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <div className="font-bold text-[14.5px] text-amber-900">
                    Motorul Unlayer Cloud nu a putut fi încărcat de la editor.unlayer.com
                  </div>
                  <p className="text-[13px] leading-relaxed text-amber-800">
                    Browserul tău sau o extensie de confidențialitate (Brave Shields, uBlock Origin sau AdBlock) a blocat scriptul extern Unlayer.
                    Poți utiliza în continuare <strong>Editorul vizual integrat Casa Esy</strong>, care funcționează 100% offline și local, fără nicio dependență externă.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2">
                    <Button variant="gold" onClick={() => setMode("visual")}>
                      <LayoutTemplate size={14} /> Deschide editorul vizual integrat Casa Esy
                    </Button>
                    <Button variant="ghost" onClick={() => setMode("split")}>
                      <Code2 size={14} /> Deschide editorul HTML
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            id="unlayer-editor-box"
            style={{
              height: unlayerFailed ? "0px" : "720px",
              width: "100%",
              backgroundColor: "#f4f6f9",
              display: unlayerFailed ? "none" : "block",
            }}
          />
        </Card>
      )}

      {/* ── MOD 3: EDITOR HTML ȘI PREVIZUALIZARE DUBLĂ ── */}
      {mode === "split" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5 flex flex-col">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#0d2c5c]">
                Cod sursă HTML șablon
              </span>
              <Badge tone="navy">Editare directă</Badge>
            </div>
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              className="w-full flex-1 min-h-[620px] rounded-xl border border-[#e1e8f0] bg-[#0b192c] p-4 font-mono text-[12.5px] leading-relaxed text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#c69a3f]"
              spellCheck={false}
            />
          </Card>

          <Card className="p-5 flex flex-col items-center bg-[#eaeef5]">
            <div className="mb-3 w-full flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#0d2c5c]">
                Previzualizare live cu date reale
              </span>
              <Badge tone="green">Randare instantanee</Badge>
            </div>
            <div
              className="overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 border border-[#dce3ee]"
              style={{ width: device === "mobile" ? "375px" : "100%", height: "620px" }}
            >
              <iframe
                title="Previzualizare Email"
                srcDoc={renderPreviewHtml(htmlContent)}
                className="h-full w-full border-0"
              />
            </div>
          </Card>
        </div>
      )}

      {/* ── MOD 4: PREVIZUALIZARE FINALĂ CLIENT ── */}
      {mode === "preview" && (
        <Card className="p-6 flex flex-col items-center bg-[#eaeef5]">
          <div className="mb-4 w-full max-w-2xl rounded-xl bg-white p-4 shadow-sm border border-[#e1e8f0]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6b7c99]">
              Subiect randat pentru oaspete:
            </div>
            <div className="mt-0.5 text-[15px] font-bold text-[#0d2c5c]">
              {renderPreviewHtml(subject)}
            </div>
          </div>

          <div
            className="overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300 border border-[#dce3ee]"
            style={{ width: device === "mobile" ? "375px" : "640px", height: "720px" }}
          >
            <iframe
              title="Previzualizare Email Final"
              srcDoc={renderPreviewHtml(htmlContent)}
              className="h-full w-full border-0"
            />
          </div>
        </Card>
      )}

      {/* Modal: Trimite email de test */}
      <Modal
        open={testModalOpen}
        title="Trimite email de test"
        onClose={() => setTestModalOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-[13px] text-[#4f6280]">
            Vom trimite șablonul curent (cu variabilele înlocuite cu date demonstrative de rezervare) către adresa de mai jos:
          </p>
          <Field label="Adresa de email destinatar">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="exemplu@domeniu.ro"
              className={inputCls}
            />
          </Field>
          <div className="flex justify-end gap-2 pt-3 border-t border-[#eef2f7]">
            <Button variant="ghost" onClick={() => setTestModalOpen(false)}>
              Anulează
            </Button>
            <Button onClick={handleSendTest} disabled={sendingTest || !testEmail.trim()}>
              <Send size={14} /> {sendingTest ? "Se trimite..." : "Trimite testul acum"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Campanie de noutăți către oaspeți */}
      <Modal
        open={campaignModalOpen}
        title="Trimite campanie de noutăți către oaspeți"
        onClose={() => setCampaignModalOpen(false)}
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-[#f8fafd] border border-[#e1e8f0] p-3.5 text-[12.5px] text-[#2a3b52]">
            <div className="font-bold text-[#0d2c5c] flex items-center gap-1.5 mb-1">
              <CheckCircle2 size={15} className="text-emerald-600" />
              Personalizare automată per oaspete
            </div>
            Fiecare destinatar va primi emailul personalizat cu numele său (<code>{"{{guest_name}}"}</code>) și codul promoțional de mai jos (<code>{"{{code}}"}</code>).
          </div>

          <Field label="Cod promoțional sau cupon ({{code}})">
            <input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Ex: VARA2026"
              className={inputCls}
            />
          </Field>

          <Field label="Destinatari (lasă gol pentru toți oaspeții activi)">
            <textarea
              rows={3}
              value={customRecipients}
              onChange={(e) => setCustomRecipients(e.target.value)}
              placeholder="client1@email.ro, client2@email.ro (sau lasă gol pentru toți oaspeții)"
              className={inputCls}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#eef2f7]">
            <Button variant="ghost" onClick={() => setCampaignModalOpen(false)}>
              Renunță
            </Button>
            <Button variant="gold" onClick={handleSendCampaign} disabled={sendingCampaign}>
              <Megaphone size={14} /> {sendingCampaign ? "Se expediază..." : "Lansează campania"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
