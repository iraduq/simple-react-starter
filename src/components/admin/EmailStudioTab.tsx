import { useCallback, useEffect, useRef, useState } from "react";
import {
  Mail,
  Radio,
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
  ShieldCheck,
  CreditCard,
  Utensils,
  KeyRound,
  Wifi,
  Compass,
  Check,
  HelpCircle,
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

const SAMPLE_PREVIEW_VARS: Record<string, string> = {
  code: "849201",
  guest_name: "Alexandru Ionescu",
  booking_code: "BK-90421",
  room_title: "Suită Deluxe cu Vedere la Mare",
  room_unit_number: "204",
  room_label: "Camera 204 (Suită Deluxe)",
  check_in: "15.07.2026",
  check_out: "20.07.2026",
  total_price: "2.450,00",
  amount: "420,00",
  total_amount: "145,00",
  subtotal: "165,00",
  discount_amount: "20,00",
  items_list: "&bull; 2x Aperol Spritz (76 lei)<br>&bull; 1x Platou Fructe de Mare (89 lei)",
  estimated_time: "20-25 minute",
  login_time: "16 nov. 2026, 18:30",
  device_info: "Chrome 122 &middot; Windows 11 PC",
  ip_address: "86.124.95.12",
  location: "București, România",
  secure_account_url: "https://casaesy.ro/profile",
  portal_url: "https://casaesy.ro/profile",
  receipt_url: "https://casaesy.ro/places",
  order_url: "https://casaesy.ro/comanda/ORD-7783",
  wifi_ssid: "CasaEsy_Guests_5G",
  wifi_password: "VacantaLaMare2026",
  reception_phone: "+40 700 000 000",
  payment_intent_id: "pi_3Mtwx2LkdIwHu7ix28aEEac1",
  payment_date: "16 nov. 2026, 18:32",
  description: "Cazare Suită Deluxe & Room Service",
  qr_code_url: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CASA-ESY-BK-90421",
  wifi_qr_code_url: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=WIFI:S:CasaEsy_Guests_5G;T:WPA;P:VacantaLaMare2026;;",
  email: "alexandru.ionescu@yahoo.com",
  unsubscribe_url: "https://backend-licenta-i0lr.onrender.com/email-templates/newsletter/unsubscribe-one-click?token=demo",
};

const MERGE_TAGS = [
  { tag: "{{guest_name}}", label: "Nume oaspete", sample: "Alexandru Ionescu" },
  { tag: "{{email}}", label: "Adresă email abonat", sample: "alexandru@yahoo.com" },
  { tag: "{{unsubscribe_url}}", label: "Link 1-Click Dezabonare (Yahoo/Gmail)", sample: "https://.../unsubscribe-one-click" },
  { tag: "{{code}}", label: "Cod OTP / promoțional", sample: "849201" },
  { tag: "{{amount}}", label: "Sumă plată Stripe (RON)", sample: "420,00" },
  { tag: "{{booking_code}}", label: "Cod rezervare", sample: "BK-90421" },
  { tag: "{{room_title}}", label: "Denumire cameră", sample: "Suită Deluxe" },
  { tag: "{{room_unit_number}}", label: "Număr cameră", sample: "204" },
  { tag: "{{check_in}}", label: "Data check-in", sample: "15.07.2026" },
  { tag: "{{check_out}}", label: "Data check-out", sample: "20.07.2026" },
  { tag: "{{total_price}}", label: "Total rezervare (RON)", sample: "2.450,00" },
  { tag: "{{login_time}}", label: "Ora și data logării", sample: "16 nov., 18:30" },
  { tag: "{{device_info}}", label: "Dispozitiv & Browser", sample: "Chrome · Windows" },
  { tag: "{{ip_address}}", label: "Adresă IP", sample: "86.124.95.12" },
  { tag: "{{wifi_ssid}}", label: "Nume rețea Wi-Fi", sample: "CasaEsy_Guests_5G" },
  { tag: "{{wifi_password}}", label: "Parolă Wi-Fi", sample: "VacantaLaMare2026" },
  { tag: "{{qr_code_url}}", label: "URL imagine QR check-in", sample: "https://api.qrserver.com/..." },
  { tag: "{{wifi_qr_code_url}}", label: "URL imagine QR Wi-Fi", sample: "https://api.qrserver.com/..." },
];

function replaceVars(text: string): string {
  let out = text || "";
  for (const [k, v] of Object.entries(SAMPLE_PREVIEW_VARS)) {
    out = out.split(`{{${k}}}`).join(v);
    out = out.split(`{{ ${k} }}`).join(v);
    out = out.split(`{${k}}`).join(v);
  }
  return out;
}

function renderPreviewHtml(rawHtml: string, isMobile: boolean = false): string {
  let out = rawHtml || "";

  // 1. Sanitize any malformed HTML prefix (e.g. if raw string starts with p://www.w3 or missing doctype)
  if (out.trim().startsWith("p://www.w3.org") || out.trim().startsWith("//www.w3.org")) {
    out = `<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml">\n${out.substring(out.indexOf(">") + 1)}`;
  } else if (!out.includes("<!DOCTYPE") && out.includes("<html")) {
    out = `<!DOCTYPE html>\n${out}`;
  }

  // 2. Replace variables with sample preview data
  out = replaceVars(out);

  // 3. Inject responsive styles & viewport into <head>
  const responsiveStyles = `
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
    <style type="text/css">
      * { box-sizing: border-box !important; }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        overflow-x: hidden !important;
        -webkit-text-size-adjust: 100%;
      }
      img {
        max-width: 100% !important;
        height: auto !important;
      }
      ${
        isMobile
          ? `
        /* Mobile Preview Mode (375px simulation) */
        table[width="560"], table.container-table, table {
          width: 100% !important;
          max-width: 100% !important;
        }
        td[style*="padding: 44px 16px"], td[style*="padding: 48px 15px"], td[style*="padding: 48px"] {
          padding: 12px 6px !important;
        }
        td[style*="padding: 40px"], td[style*="padding: 38px 40px"], td[style*="padding: 34px 36px"], td[style*="padding: 38px 36px"] {
          padding: 18px 12px !important;
        }
        td[width="48%"] {
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
          margin-bottom: 12px !important;
          box-sizing: border-box !important;
        }
        td[width="4%"] {
          display: none !important;
          width: 0 !important;
        }
        /* Ensure table text wraps cleanly on narrow screens */
        table table td {
          word-break: break-word !important;
        }
      `
          : `
        /* Standard Screen Fallbacks */
        @media only screen and (max-width: 580px) {
          table[width="560"], table.container-table {
            width: 100% !important;
            max-width: 100% !important;
          }
          td[style*="padding: 40px"], td[style*="padding: 38px 40px"] {
            padding: 18px 12px !important;
          }
          td[width="48%"] {
            display: block !important;
            width: 100% !important;
            margin-bottom: 12px !important;
          }
          td[width="4%"] {
            display: none !important;
          }
        }
      `
      }
    </style>
  `;

  if (out.includes("</head>")) {
    out = out.replace("</head>", `${responsiveStyles}\n</head>`);
  } else if (out.includes("<body")) {
    out = `<head>${responsiveStyles}</head>\n${out}`;
  } else {
    out = `<head>${responsiveStyles}</head>\n<body>${out}</body>`;
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
  if (slug === "new_login") {
    return {
      headerTitle: "Casa Esy",
      headerSubtitle: "Vila · Eforie Nord",
      badgeText: "Securitate Cont",
      headerBg: "#0d2c5c",
      headline: "Logare nouă detectată",
      bodyText:
        "Bună ziua, {{guest_name}}!\nAm înregistrat o autentificare recentă în contul tău Vila Casa Esy.\nDispozitiv: {{device_info}}\nData și ora: {{login_time}}\nAdresă IP: {{ip_address}} &middot; {{location}}.\nDacă ai fost chiar tu, ignoră acest mesaj.",
      hasCodeBox: false,
      codeBoxLabel: "Adresă IP",
      codeBoxValue: "{{ip_address}}",
      codeBoxNote: "Dacă nu recunoști această activitate, schimbă parola imediat.",
      hasBookingTable: false,
      hasCtaButton: true,
      ctaButtonText: "Securizează Contul",
      ctaButtonUrl: "https://casaesy.ro/profile",
      ctaButtonColor: "#0d2c5c",
      hasQrCode: false,
      qrInstruction: "",
      footerContact: "Casa Esy · Securitate și protecție cont",
      footerCopyright: "© 2026 Casa Esy. Toate drepturile rezervate.",
    };
  }

  if (slug === "login_success") {
    return {
      headerTitle: "Casa Esy",
      headerSubtitle: "Vila · Eforie Nord",
      badgeText: "Autentificare Reușită",
      headerBg: "#123a75",
      headline: "Bine ai revenit, {{guest_name}}!",
      bodyText:
        "Te-ai conectat cu succes în contul tău de oaspete Vila Casa Esy la data de {{login_time}}.\nAi acces la rezervările tale active, cheia PIN de la cameră și comenzi de Room Service.",
      hasCodeBox: false,
      codeBoxLabel: "",
      codeBoxValue: "",
      codeBoxNote: "",
      hasBookingTable: false,
      hasCtaButton: true,
      ctaButtonText: "Accesează Portalul Oaspetelui",
      ctaButtonUrl: "https://casaesy.ro/profile",
      ctaButtonColor: "#c69a3f",
      hasQrCode: false,
      qrInstruction: "",
      footerContact: "Casa Esy · Sejururi și cazare la Marea Neagră",
      footerCopyright: "© 2026 Casa Esy. Toate drepturile rezervate.",
    };
  }

  if (slug === "payment_success") {
    return {
      headerTitle: "Casa Esy",
      headerSubtitle: "Vila · Eforie Nord",
      badgeText: "Plată Confirmată Stripe",
      headerBg: "#0d2c5c",
      headline: "Plata a fost procesată cu succes!",
      bodyText:
        "Mulțumim, {{guest_name}}!\nConfirmăm plata în valoare de {{amount}} RON procesată securizat prin Stripe pentru comanda sau rezervarea #{{booking_code}}.\nServiciile tale au fost confirmate instant.",
      hasCodeBox: true,
      codeBoxLabel: "Sumă Totală Achitată",
      codeBoxValue: "{{amount}} RON",
      codeBoxNote: "Tranzacție securizată Stripe · ID: {{payment_intent_id}}",
      hasBookingTable: false,
      hasCtaButton: true,
      ctaButtonText: "Vezi Chitanța Online",
      ctaButtonUrl: "https://casaesy.ro/places",
      ctaButtonColor: "#16a34a",
      hasQrCode: false,
      qrInstruction: "",
      footerContact: "Plată procesată prin Stripe conform standardului PCI-DSS",
      footerCopyright: "© 2026 Casa Esy. Toate drepturile rezervate.",
    };
  }

  if (slug === "order_room_service") {
    return {
      headerTitle: "Casa Esy",
      headerSubtitle: "Gastronomie · Room Service",
      badgeText: "Room Service Live",
      headerBg: "#0d2c5c",
      headline: "Comanda ta este în preparare",
      bodyText:
        "Bucătăria noastră a preluat comanda #{{order_code}} pentru {{room_label}}.\nPreparatele tale sunt gătite proaspăt și vor fi livrate în aproximativ {{estimated_time}}.",
      hasCodeBox: true,
      codeBoxLabel: "Total de Plată",
      codeBoxValue: "{{total_amount}} RON",
      codeBoxNote: "Preparate: {{items_list}}",
      hasBookingTable: false,
      hasCtaButton: true,
      ctaButtonText: "Urmărește Comanda Live pe Site",
      ctaButtonUrl: "https://casaesy.ro/comanda/{{order_code}}",
      ctaButtonColor: "#c69a3f",
      hasQrCode: false,
      qrInstruction: "",
      footerContact: "Bucătărie și Room Service Vila Casa Esy",
      footerCopyright: "© 2026 Casa Esy. Toate drepturile rezervate.",
    };
  }

  if (slug === "welcome_guest") {
    return {
      headerTitle: "Casa Esy",
      headerSubtitle: "Vila · Eforie Nord",
      badgeText: "Ghidul Sejurului Tău",
      headerBg: "#0d2c5c",
      headline: "Bun venit la Vila Casa Esy!",
      bodyText:
        "Dragă {{guest_name}},\nSuntem încântați să te avem oaspete începând cu data de {{check_in}} pentru camera {{room_title}}.\nCheck-in-ul este disponibil de la ora 14:00, parcarea privată este gratuită, iar plaja este la 3 minute de mers pe jos.",
      hasCodeBox: false,
      codeBoxLabel: "Rețea Wi-Fi Oaspeți",
      codeBoxValue: "{{wifi_ssid}}",
      codeBoxNote: "Parolă Wi-Fi: {{wifi_password}}",
      hasBookingTable: false,
      hasCtaButton: true,
      ctaButtonText: "Descoperă Facilitățile & Meniul",
      ctaButtonUrl: "https://casaesy.ro/places",
      ctaButtonColor: "#0d2c5c",
      hasQrCode: false,
      qrInstruction: "",
      footerContact: "Recepție deschisă · Telefon: {{reception_phone}}",
      footerCopyright: "© 2026 Casa Esy. Toate drepturile rezervate.",
    };
  }

  if (slug === "wifi_access") {
    return {
      headerTitle: "Casa Esy",
      headerSubtitle: "Vila · Eforie Nord",
      badgeText: "Conectare Wi-Fi Gratuită",
      headerBg: "#0d2c5c",
      headline: "Conectare Automată Wi-Fi",
      bodyText:
        "Bună ziua, {{guest_name}}!\nScanează codul QR de mai jos sau conectează-te manual la rețeaua Wi-Fi dedicată oaspeților noștri.",
      hasCodeBox: true,
      codeBoxLabel: "Nume Rețea (SSID)",
      codeBoxValue: "{{wifi_ssid}}",
      codeBoxNote: "Parolă conexiune: {{wifi_password}}",
      hasBookingTable: false,
      hasCtaButton: false,
      ctaButtonText: "",
      ctaButtonUrl: "",
      ctaButtonColor: "#c69a3f",
      hasQrCode: true,
      qrInstruction: "Scanează cu camera telefonului pentru conectare automată fără tastarea parolei.",
      footerContact: "Internet de mare viteză gratuit pe toată proprietatea",
      footerCopyright: "© 2026 Casa Esy. Toate drepturile rezervate.",
    };
  }

  if (slug === "verification_otp") {
    return {
      headerTitle: "Casa Esy",
      headerSubtitle: "Vila · Eforie Nord",
      badgeText: "Verificare cont",
      headerBg: "#123a75",
      headline: "Confirmă adresa ta de email",
      bodyText:
        "Am primit o solicitare de înregistrare pentru contul tău Casa Esy.\nIntrodu codul de securitate de mai jos pentru a finaliza activarea contului:",
      hasCodeBox: true,
      codeBoxLabel: "Codul tău de securitate",
      codeBoxValue: "{{code}}",
      codeBoxNote:
        "Codul este valabil timp de 10 minute. Dacă nu ai solicitat tu crearea acestui cont, poți ignora în siguranță acest mesaj.",
      hasBookingTable: false,
      hasCtaButton: false,
      ctaButtonText: "Autentifică-te în cont",
      ctaButtonUrl: "https://casaesy.ro/login",
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
      ctaButtonUrl: "https://casaesy.ro/login",
      ctaButtonColor: "#c69a3f",
      hasQrCode: false,
      qrInstruction: "",
      footerContact: "Casa Esy · Sejururi și cazare la Marea Neagră",
      footerCopyright: "© 2026 Casa Esy. Toate drepturile rezervate.",
    };
  }

  if (slug === "newsletter_welcome") {
    return {
      headerTitle: "Vila Casa Esy",
      headerSubtitle: "Newsletter Exclusiv · Marea Neagră",
      badgeText: "Abonare Confirmată",
      headerBg: "#0d2c5c",
      headline: "Bun venit la malul mării, {{guest_name}}!",
      bodyText:
        "Îți mulțumim că te-ai abonat la newsletter-ul Vila Casa Esy.\nVei primi prioritar ofertele noastre sezoniere, pachetele SPA & Beach Club și coduri exclusive de reducere.",
      hasCodeBox: false,
      codeBoxLabel: "",
      codeBoxValue: "",
      codeBoxNote: "",
      hasBookingTable: false,
      hasCtaButton: true,
      ctaButtonText: "Descoperă Camerele & Ofertele",
      ctaButtonUrl: "https://casaesy.ro/camere",
      ctaButtonColor: "#c69a3f",
      hasQrCode: false,
      qrInstruction: "",
      footerContact:
        'Vila Casa Esy · Eforie Nord · <a href="{{unsubscribe_url}}" style="color:#0D2C5C;font-weight:700;text-decoration:underline;">Dezabonare 1-Click</a>',
      footerCopyright: "© 2026 Casa Esy. Toate drepturile rezervate.",
    };
  }

  if (slug === "newsletter_campaign") {
    return {
      headerTitle: "Vila Casa Esy",
      headerSubtitle: "Ediție Specială Newsletter",
      badgeText: "Newsletter Abonați",
      headerBg: "#0d2c5c",
      headline: "Salutare, {{guest_name}}! Marea te așteaptă.",
      bodyText:
        "Am pregătit pentru abonații noștri o selecție de camere cu vedere la mare, seri gastronomice la Restaurantul Casa Esy și acces privilegiat la Beach Club & SPA Infinity.",
      hasCodeBox: true,
      codeBoxLabel: "Cod promoțional exclusiv abonați",
      codeBoxValue: "{{code}}",
      codeBoxNote: "Introdu codul la finalizarea rezervării pe site.",
      hasBookingTable: false,
      hasCtaButton: true,
      ctaButtonText: "Rezervă Acum Cu Reducere",
      ctaButtonUrl: "https://casaesy.ro/camere",
      ctaButtonColor: "#c69a3f",
      hasQrCode: false,
      qrInstruction: "",
      footerContact:
        'Vila Casa Esy · Eforie Nord · <a href="{{unsubscribe_url}}" style="color:#0D2C5C;font-weight:700;text-decoration:underline;">Dezabonare 1-Click (fără autentificare)</a>',
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
    ctaButtonUrl: "https://casaesy.ro/profile",
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
        <span style="font-size: 32px; font-weight: 800; color: #0D2C5C; letter-spacing: 4px; font-family: 'Courier New', Courier, monospace; display: block;">
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
          Cod QR check-in & conectare Wi-Fi
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
                      <tr>
                        <td bgcolor="#F8FAFD" style="background-color: #F8FAFD; border-top: 1px solid #EEF2F7; padding: 22px 32px; text-align: center; color: #8A93A3; font-size: 12px; line-height: 160%;">
                          ${cfg.footerContact}<br>
                          ${cfg.footerCopyright}
                        </td>
                      </tr>
                    </tbody>
                  </table>
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

// Preset card icon mapper
const TEMPLATE_METAS: Record<
  string,
  {
    category: "security" | "payments" | "stay" | "dining" | "marketing";
    categoryLabel: string;
    icon: any;
    triggerWhen: string;
  }
> = {
  new_login: {
    category: "security",
    categoryLabel: "Autentificare & Securitate",
    icon: ShieldCheck,
    triggerWhen: "La logarea de pe un dispozitiv nou, browser nou sau IP necunoscut.",
  },
  login_success: {
    category: "security",
    categoryLabel: "Autentificare & Securitate",
    icon: ShieldCheck,
    triggerWhen: "La fiecare autentificare reușită a oaspetelui în contul web.",
  },
  verification_otp: {
    category: "security",
    categoryLabel: "Autentificare & Securitate",
    icon: KeyRound,
    triggerWhen: "La înregistrarea unui cont nou sau retrimiterea codului OTP de 6 cifre.",
  },
  password_reset: {
    category: "security",
    categoryLabel: "Autentificare & Securitate",
    icon: KeyRound,
    triggerWhen: "Când un oaspete solicită recuperarea sau resetarea parolei.",
  },
  payment_success: {
    category: "payments",
    categoryLabel: "Plăți & Tranzacții Stripe",
    icon: CreditCard,
    triggerWhen: "Imediat după ce plata prin card (rezervare sau room service) este confirmată în Stripe.",
  },
  booking_confirmation: {
    category: "stay",
    categoryLabel: "Sejur & Cazare",
    icon: Compass,
    triggerWhen: "La confirmarea rezervării cu detaliile camerei, PIN clanță smart lock și QR Wi-Fi.",
  },
  welcome_guest: {
    category: "stay",
    categoryLabel: "Sejur & Cazare",
    icon: Compass,
    triggerWhen: "Cu 24h înainte de sosire cu instrucțiuni de check-in, parcare și plajă.",
  },
  wifi_access: {
    category: "stay",
    categoryLabel: "Sejur & Cazare",
    icon: Wifi,
    triggerWhen: "La trimiterea manuală din recepție sau solicitarea accesului Wi-Fi cu cod QR.",
  },
  order_room_service: {
    category: "dining",
    categoryLabel: "Gastronomie & Room Service",
    icon: Utensils,
    triggerWhen: "La plasarea sau achitarea unei comenzi de mâncare/băutură la cameră.",
  },
  seasonal_campaign: {
    category: "marketing",
    categoryLabel: "Newsletter & Oferte",
    icon: Sparkles,
    triggerWhen: "La transmiterea unei campanii promoționale din panoul de administrare.",
  },
  newsletter_welcome: {
    category: "marketing",
    categoryLabel: "Newsletter & Oferte",
    icon: Mail,
    triggerWhen: "Trimis automat imediat ce un client se abonează la newsletter-ul de pe site (include 1-Click Unsubscribe Yahoo/Gmail).",
  },
  newsletter_campaign: {
    category: "marketing",
    categoryLabel: "Newsletter & Oferte",
    icon: Megaphone,
    triggerWhen: "Șablonul de newsletter editabil de admin pentru trimiterea către abonați (cu buton nativ 1-Click Unsubscribe Yahoo/Gmail).",
  },
};

const CATEGORIES = [
  { id: "all", label: "Toate Modelele (12)" },
  { id: "security", label: "🔐 Securitate & Logare (4)" },
  { id: "payments", label: "💳 Plăți Stripe (1)" },
  { id: "stay", label: "🏖️ Sejur & Wi-Fi (3)" },
  { id: "dining", label: "🍽️ Room Service (1)" },
  { id: "marketing", label: "📰 Newsletter & Oferte (3)" },
];

interface EmailStudioTabProps {
  onNavigateToBroadcast?: () => void;
}

export default function EmailStudioTab({ onNavigateToBroadcast }: EmailStudioTabProps = {}) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplateItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("booking_confirmation");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
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

  // Mode: "visual" | "html" | "preview"
  const [mode, setMode] = useState<"visual" | "html" | "preview">("visual");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  // Modals
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("raduivan2003@gmail.com");
  const [sendingTest, setSendingTest] = useState(false);

  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("VARA2026");
  const [customRecipients, setCustomRecipients] = useState("");
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [subscriberStats, setSubscriberStats] = useState<{
    active_count: number;
    unsubscribed_count: number;
    total_count: number;
  } | null>(null);

  const loadTemplates = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const [data, subs] = await Promise.all([
          get<EmailTemplateItem[]>("/email-templates"),
          get<{ active_count: number; unsubscribed_count: number; total_count: number }>(
            "/email-templates/newsletter/subscribers",
          ).catch(() => null),
        ]);
        const arr = Array.isArray(data) ? data : [];
        setTemplates(arr);
        if (subs) setSubscriberStats(subs);
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

  // Sync on template switch
  useEffect(() => {
    if (!activeTemplate) return;
    setSubject(activeTemplate.subject);
    setHtmlContent(activeTemplate.html_content);
    setDesignJson(activeTemplate.design_json || null);
    setIsActive(activeTemplate.is_active);

    const defaultConfig = getDefaultVisualConfig(activeTemplate.slug);
    setVisualConfig(defaultConfig);
  }, [activeTemplate?.slug, activeTemplate?.updated_at]);

  const updateVisualField = <K extends keyof VisualConfig>(key: K, value: VisualConfig[K]) => {
    setVisualConfig((prev) => {
      const next = { ...prev, [key]: value };
      const generated = generateHtmlFromVisualConfig(next);
      setHtmlContent(generated);
      return next;
    });
  };

  const handleSave = async () => {
    if (!activeTemplate) return;
    if (!subject.trim()) {
      toast("Subiectul emailului nu poate fi gol.", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: activeTemplate.name,
        subject: subject.trim(),
        html_content: htmlContent,
        design_json: designJson,
        is_active: isActive,
      };

      const updated = await put<EmailTemplateItem>(`/email-templates/${activeTemplate.slug}`, payload);
      toast(`Modelul de email '${updated.name}' a fost salvat cu succes în baza de date!`, "success");

      setTemplates((prev) =>
        prev.map((t) => (t.slug === updated.slug ? updated : t)),
      );
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!activeTemplate) return;
    const ok = window.confirm(
      `Sigur dorești să resetezi modelul '${activeTemplate.name}' la versiunea originală din fabrică?`,
    );
    if (!ok) return;

    try {
      const reset = await post<EmailTemplateItem>(`/email-templates/${activeTemplate.slug}/reset`, {});
      toast("Modelul a fost resetat la setările de fabrică.", "success");
      setSubject(reset.subject);
      setHtmlContent(reset.html_content);
      const def = getDefaultVisualConfig(reset.slug);
      setVisualConfig(def);
      setTemplates((prev) => prev.map((t) => (t.slug === reset.slug ? reset : t)));
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  const handleSendTest = async () => {
    if (!testEmail.trim() || !testEmail.includes("@")) {
      toast("Te rugăm să introduci o adresă de email validă.", "error");
      return;
    }

    setSendingTest(true);
    try {
      await post(`/email-templates/${selectedSlug}/test`, {
        to_email: testEmail.trim(),
        subject: subject,
        html_content: htmlContent,
      });

      toast(`Emailul de test a fost expediat prin Resend către ${testEmail}!`, "success");
      setTestModalOpen(false);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setSendingTest(false);
    }
  };

  const insertMergeTag = (tag: string) => {
    setSubject((prev) => `${prev} ${tag}`);
    toast(`Variabila ${tag} a fost adăugată la subiect.`, "info");
  };

  const filteredTemplates = templates.filter((t) => {
    if (selectedCategory === "all") return true;
    const meta = TEMPLATE_METAS[t.slug];
    return meta?.category === selectedCategory;
  });

  const activeMeta = activeTemplate ? TEMPLATE_METAS[activeTemplate.slug] : null;
  const renderedPreview = renderPreviewHtml(htmlContent, device === "mobile");

  return (
    <div className="space-y-8 font-sans">
      {/* ── HEADER (Identic ca structură și prestigiu cu BroadcastTab) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#0d2c5c]/10">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-[#c69a3f] mb-1">
            <Mail size={14} className="text-[#c69a3f] animate-pulse" />
            <span>Corespondență automată & Notificări tranzacționale</span>
          </div>
          <h2 className="font-['Outfit',sans-serif] text-[28px] sm:text-[34px] font-bold text-[#0d2c5c] leading-tight">
            Centru de Șabloane Email și Mesaje Tranzacționale
          </h2>
          <p className="text-[13.5px] text-[#64748b] mt-0.5 max-w-3xl font-['Plus_Jakarta_Sans',sans-serif]">
            Vizualizează și modifică exact toate modelele de email trimise oaspeților prin <strong>Resend</strong>: la logare în cont, logare de pe dispozitiv nou, plăți efectuate prin Stripe, comenzi de room service, coduri QR Wi-Fi și confirmări de rezervare.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {onNavigateToBroadcast && (
            <button
              type="button"
              onClick={onNavigateToBroadcast}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#f8fafc] text-[#0d2c5c] border border-[#e1e8f0] hover:border-[#c69a3f] text-[12px] font-['Plus_Jakarta_Sans',sans-serif] font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Radio size={13} className="text-[#c69a3f]" />
              <span>Alerte Live & Push &rarr;</span>
            </button>
          )}
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#0d2c5c] text-[12px] font-bold flex items-center gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{templates.length || 12} modele active Resend</span>
          </div>
          {subscriberStats && (
            <div className="px-3.5 py-1.5 rounded-full bg-[#fdf8ec] border border-[#c69a3f]/45 text-[#0d2c5c] text-[12px] font-bold flex items-center gap-2 shadow-xs">
              <Megaphone size={13} className="text-[#c69a3f]" />
              <span>{subscriberStats.active_count} abonați Newsletter activi</span>
            </div>
          )}
          <button
            onClick={() => void loadTemplates()}
            disabled={loading}
            className="w-10 h-10 rounded-full border border-[#e1e8f0] hover:border-[#c69a3f] flex items-center justify-center text-[#0d2c5c] hover:bg-[#f8fafc] transition cursor-pointer"
            title="Reîmprospătează"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── CATEGORY FILTER CHIPS ── */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-4 py-2 text-[12px] font-bold transition-all cursor-pointer ${
                active
                  ? "bg-[#0d2c5c] text-white shadow-sm ring-2 ring-[#0d2c5c]/20"
                  : "bg-white border border-[#e1e8f0] text-[#556987] hover:border-[#c69a3f] hover:text-[#0d2c5c]"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ── PRESET TEMPLATE CARDS (Grid stil BroadcastTab) ── */}
      <div>
        <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#64748b] mb-3">
          Alege un scenariu de email pentru a-i vedea și modifica modelul:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5">
          {filteredTemplates.map((t) => {
            const isSelected = t.slug === selectedSlug;
            const meta = TEMPLATE_METAS[t.slug] || {
              category: "stay",
              categoryLabel: "General",
              icon: Mail,
              triggerWhen: t.description || "Trimis la eveniment",
            };
            const IconComponent = meta.icon;

            return (
              <div
                key={t.slug}
                onClick={() => setSelectedSlug(t.slug)}
                className={`group rounded-2xl border p-4 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-[#c69a3f] bg-[#fdf8ec] shadow-md ring-2 ring-[#c69a3f]/30"
                    : "border-[#e1e8f0] bg-white hover:border-[#c69a3f]/60 hover:shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-[#0d2c5c] text-[#e6b85c]"
                          : "bg-[#f8fafc] text-[#0d2c5c] border border-[#e1e8f0]"
                      }`}
                    >
                      <IconComponent size={16} />
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 border border-[#e1e8f0] text-[#6b7c99]">
                      {t.slug}
                    </span>
                  </div>

                  <h4 className="text-[13px] sm:text-[13.5px] font-bold text-[#0d2c5c] leading-snug line-clamp-2 min-h-[38px] flex items-center">
                    {t.name}
                  </h4>

                  <div className="mt-2 text-[11px] text-[#556987] leading-relaxed min-h-[46px]">
                    <div className="inline-flex items-center gap-1 font-bold text-[#c69a3f] uppercase text-[9.5px] tracking-wider mb-0.5">
                      <Sparkles size={11} className="text-[#c69a3f]" /> Când primește:
                    </div>
                    <p className="line-clamp-2 text-[#475569]">{meta.triggerWhen}</p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#e2e8f0]/60 flex items-center justify-between text-[11px]">
                  <span className="text-[#8a6420] font-semibold truncate max-w-[130px]">
                    {t.subject}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-extrabold text-[#0d2c5c]">
                      <Check size={12} className="text-[#c69a3f]" /> Selectat
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── STUDIO DE EDITARE & PREVIZUALIZARE SPLIT ── */}
      {activeTemplate && (
        <div className="space-y-6">
          {/* Top Bar for Selected Template: Action Buttons & Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#0d2c5c] text-white shadow-md">
            <div className="flex items-start sm:items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[#e6b85c] text-[#0d2c5c] flex items-center justify-center font-bold shrink-0 mt-0.5 sm:mt-0">
                <Mail size={20} />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#e6b85c]">
                    Model Email Selectat
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/15 border border-white/25 !text-white">
                    {activeTemplate.slug}
                  </span>
                </div>
                <h3 className="text-white !text-white text-[18px] sm:text-[20px] font-bold leading-snug mt-1">
                  {activeTemplate.name}
                </h3>
                {/* PROMINENT TRIGGER NOTICE */}
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-[#e6b85c]/45 text-white text-[11.5px] font-medium">
                  <Sparkles size={12} className="text-[#e6b85c] shrink-0" />
                  <strong className="text-[#e6b85c]">Când primește clientul:</strong>
                  <span className="text-white font-medium">
                    {activeMeta?.triggerWhen || activeTemplate.description}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Mode switch */}
              <div className="inline-flex rounded-xl bg-white/10 p-1 backdrop-blur-xs">
                <button
                  type="button"
                  onClick={() => setMode("visual")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    mode === "visual"
                      ? "bg-white text-[#0d2c5c] shadow-xs"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  <LayoutTemplate size={14} /> Designer Vizual
                </button>
                <button
                  type="button"
                  onClick={() => setMode("html")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    mode === "html"
                      ? "bg-white text-[#0d2c5c] shadow-xs"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  <Code2 size={14} /> Cod HTML Direct
                </button>
              </div>

              {/* Action Buttons */}
              <button
                type="button"
                onClick={() => setTestModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 px-3.5 py-2 text-xs font-bold text-white transition cursor-pointer"
              >
                <Send size={13} className="text-[#e6b85c]" /> Trimite Test
              </button>

              <button
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-2 text-xs font-medium text-white/90 transition cursor-pointer"
                title="Resetează la modelul original din fabrică"
              >
                <RotateCcw size={13} /> Reset
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-[#c69a3f] hover:bg-[#b0862f] px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#0d2c5c] shadow-md transition cursor-pointer disabled:opacity-60"
              >
                <Save size={14} />
                {saving ? "Se salvează..." : "Salvează Modelul"}
              </button>
            </div>
          </div>

          {/* SPLIT SCREEN: LEFT EDITOR & RIGHT PREVIEW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ── PANOU STÂNGA: FORMULAR DE PERSONALIZARE ── */}
            <div className="lg:col-span-6 space-y-5">
              {/* Subiect Email & Merge Tags */}
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0d2c5c] flex items-center gap-2">
                    <Type size={14} className="text-[#c69a3f]" /> Subiect Email
                  </label>
                  <Badge tone="navy">Linie vizibilă în Inbox</Badge>
                </div>

                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={inputCls}
                  placeholder="ex: Confirmare rezervare #{{booking_code}} — Casa Esy"
                />

                <div>
                  <span className="block text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] mb-1.5">
                    Apasă pentru a insera o variabilă dinamică în subiect:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {MERGE_TAGS.map((mt) => (
                      <button
                        key={mt.tag}
                        type="button"
                        onClick={() => insertMergeTag(mt.tag)}
                        className="rounded-lg border border-[#e1e8f0] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-[#0d2c5c] hover:border-[#c69a3f] hover:bg-[#fdf8ec] transition cursor-pointer"
                        title={mt.label}
                      >
                        {mt.tag}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              {/* MOD VIZUAL */}
              {mode === "visual" && (
                <div className="space-y-4">
                  {/* Card Antet & Identitate */}
                  <Card className="p-5 space-y-4 border-l-4 border-l-[#0d2c5c]">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold text-[#0d2c5c] uppercase tracking-wider flex items-center gap-2">
                        <Palette size={15} className="text-[#c69a3f]" /> Antet și Titlu Email
                      </span>
                      <Badge tone="gold">Design Luxury</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#64748b] mb-1">
                          Insignă / Badge
                        </label>
                        <input
                          value={visualConfig.badgeText}
                          onChange={(e) => updateVisualField("badgeText", e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#64748b] mb-1">
                          Culoare Fundal Antet
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={visualConfig.headerBg}
                            onChange={(e) => updateVisualField("headerBg", e.target.value)}
                            className="h-10 w-12 rounded-lg border border-[#e1e8f0] cursor-pointer"
                          />
                          <input
                            value={visualConfig.headerBg}
                            onChange={(e) => updateVisualField("headerBg", e.target.value)}
                            className={inputCls}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#64748b] mb-1">
                        Titlu Principal (Headline)
                      </label>
                      <input
                        value={visualConfig.headline}
                        onChange={(e) => updateVisualField("headline", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </Card>

                  {/* Card Mesaj Principal */}
                  <Card className="p-5 space-y-3">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0d2c5c]">
                      Mesaj Principal (Conținut Email)
                    </label>
                    <textarea
                      rows={5}
                      value={visualConfig.bodyText}
                      onChange={(e) => updateVisualField("bodyText", e.target.value)}
                      className={`${inputCls} resize-y leading-relaxed`}
                      placeholder="Scrie textul mesajului trimis oaspetelui..."
                    />
                    <span className="text-[11px] text-[#64748b]">
                      * Poți folosi variabile precum <code>{'{{guest_name}}'}</code>, <code>{'{{amount}}'}</code>, <code>{'{{login_time}}'}</code>.
                    </span>
                  </Card>

                  {/* Card Box Evidențiat (Cod / Sumă / Parolă) */}
                  <Card className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[12px] font-bold uppercase tracking-wider text-[#0d2c5c]">
                        Casă Evidențiată (Cod / Sumă / Date Acces)
                      </label>
                      <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visualConfig.hasCodeBox}
                          onChange={(e) => updateVisualField("hasCodeBox", e.target.checked)}
                          className="rounded text-[#0d2c5c]"
                        />
                        <span>Activează caseta</span>
                      </label>
                    </div>

                    {visualConfig.hasCodeBox && (
                      <div className="space-y-3 pt-2 border-t border-[#e2e8f0]">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-[#64748b] mb-1">
                              Etichetă Sus
                            </label>
                            <input
                              value={visualConfig.codeBoxLabel}
                              onChange={(e) => updateVisualField("codeBoxLabel", e.target.value)}
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-[#64748b] mb-1">
                              Valoare Evidențiată
                            </label>
                            <input
                              value={visualConfig.codeBoxValue}
                              onChange={(e) => updateVisualField("codeBoxValue", e.target.value)}
                              className={inputCls}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#64748b] mb-1">
                            Notă Sub Casă
                          </label>
                          <input
                            value={visualConfig.codeBoxNote}
                            onChange={(e) => updateVisualField("codeBoxNote", e.target.value)}
                            className={inputCls}
                          />
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Card Buton Acțiune (CTA) */}
                  <Card className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[12px] font-bold uppercase tracking-wider text-[#0d2c5c]">
                        Buton Principal de Acțiune (CTA)
                      </label>
                      <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visualConfig.hasCtaButton}
                          onChange={(e) => updateVisualField("hasCtaButton", e.target.checked)}
                          className="rounded text-[#0d2c5c]"
                        />
                        <span>Activează butonul</span>
                      </label>
                    </div>

                    {visualConfig.hasCtaButton && (
                      <div className="space-y-3 pt-2 border-t border-[#e2e8f0]">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-[#64748b] mb-1">
                              Text Buton
                            </label>
                            <input
                              value={visualConfig.ctaButtonText}
                              onChange={(e) => updateVisualField("ctaButtonText", e.target.value)}
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-[#64748b] mb-1">
                              Link Destinație (URL)
                            </label>
                            <input
                              value={visualConfig.ctaButtonUrl}
                              onChange={(e) => updateVisualField("ctaButtonUrl", e.target.value)}
                              className={inputCls}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* MOD COD HTML DIRECT */}
              {mode === "html" && (
                <Card className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#0d2c5c] flex items-center gap-2">
                      <Code2 size={15} className="text-[#c69a3f]" /> Cod HTML Complet
                    </label>
                    <Badge tone="muted">Mod Dezvoltator</Badge>
                  </div>

                  <textarea
                    rows={18}
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    className="w-full font-mono text-[12px] rounded-xl border border-[#e1e8f0] bg-[#1e293b] text-[#f1f5f9] p-4 outline-none focus:border-[#c69a3f] leading-relaxed"
                  />
                </Card>
              )}
            </div>

            {/* ── PANOU DREAPTA: PREVIZUALIZARE LIVE FIDELĂ ── */}
            <div className="lg:col-span-6 space-y-4 sticky top-6">
              <Card className="p-5 shadow-lg border border-[#e1e8f0] bg-[#f8fafc]">
                {/* Preview Toolbar */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#e2e8f0]">
                  <div className="flex items-center gap-2">
                    <Eye size={15} className="text-[#c69a3f]" />
                    <span className="text-[12px] font-bold text-[#0d2c5c] uppercase tracking-wider">
                      Previzualizare Live Oaspete
                    </span>
                  </div>

                  <div className="inline-flex rounded-xl border border-[#e1e8f0] bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setDevice("desktop")}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-[11px] font-bold cursor-pointer transition ${
                        device === "desktop" ? "bg-[#0d2c5c] text-white" : "text-[#6b7c99]"
                      }`}
                    >
                      <Monitor size={13} /> Desktop (560px)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDevice("mobile")}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-[11px] font-bold cursor-pointer transition ${
                        device === "mobile" ? "bg-[#0d2c5c] text-white" : "text-[#6b7c99]"
                      }`}
                    >
                      <Smartphone size={13} /> Mobil (375px)
                    </button>
                  </div>
                </div>

                {/* Email Client Window Shell */}
                <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden shadow-md">
                  {/* Simulated Mail Header */}
                  <div className="bg-[#f1f5f9] px-4 py-3 border-b border-[#e2e8f0] text-[11.5px] space-y-1.5">
                    <div className="flex items-center gap-2 text-[#64748b]">
                      <span className="font-bold text-[#0d2c5c] w-12 shrink-0">De la:</span>
                      <span className="truncate">Vila Casa Esy &lt;contact@casaesy.ro&gt; (via Resend)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#64748b]">
                      <span className="font-bold text-[#0d2c5c] w-12 shrink-0">Către:</span>
                      <span className="truncate">alexandru.ionescu@email.ro</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#64748b]">
                      <span className="font-bold text-[#0d2c5c] w-12 shrink-0">Subiect:</span>
                      <span className="font-semibold text-[#0d2c5c] truncate">{replaceVars(subject)}</span>
                    </div>
                    {/* Explicit Trigger Info Bar inside Envelope */}
                    <div className="flex items-start sm:items-center gap-2 pt-1.5 border-t border-[#e2e8f0]/80">
                      <span className="font-bold text-[#c69a3f] shrink-0 flex items-center gap-1 text-[11px]">
                        <Sparkles size={12} className="text-[#c69a3f]" /> Când primește clientul:
                      </span>
                      <span className="text-[#0d2c5c] font-semibold bg-amber-50/90 text-[11px] px-2.5 py-0.5 rounded border border-amber-200/60 leading-normal">
                        {activeMeta?.triggerWhen || activeTemplate.description || "Trimis automat la eveniment"}
                      </span>
                    </div>
                  </div>

                  {/* Rendered Frame */}
                  <div className="p-4 sm:p-6 bg-[#eaedf2] flex justify-center min-h-[460px] max-h-[660px] overflow-y-auto overflow-x-hidden">
                    <div
                      style={{ width: device === "mobile" ? "375px" : "100%", maxWidth: device === "mobile" ? "375px" : "560px" }}
                      className={`transition-all duration-300 ${
                        device === "mobile"
                          ? "p-3 bg-[#0d2c5c] rounded-[38px] shadow-2xl border-4 border-[#334155]"
                          : ""
                      }`}
                    >
                      {device === "mobile" && (
                        <div className="w-20 h-3.5 bg-[#1e293b] rounded-full mx-auto mb-2 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-black/40"></div>
                        </div>
                      )}
                      <iframe
                        title="Previzualizare Email"
                        srcDoc={renderedPreview}
                        className="w-full min-h-[580px] rounded-xl border border-[#cbd5e1] bg-white shadow-sm"
                        style={{ overflowX: "hidden" }}
                        sandbox="allow-same-origin"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL TRIMITE TEST PE EMAIL ── */}
      <Modal
        open={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        title="Trimite Email de Test prin Resend"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#556987]">
            Vei primi o copie exactă a modelului <strong>{activeTemplate?.name}</strong> generată live cu date simulate pe adresa ta de email.
          </p>

          <Field label="Adresă Email Destinatar">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="ex: raduivan2003@gmail.com"
              className={inputCls}
            />
          </Field>

          <div className="rounded-xl bg-amber-50 border border-amber-200/80 p-3.5 text-xs text-[#8a6420] space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-[#0d2c5c]">
              <Sparkles size={14} className="text-[#c69a3f]" />
              Politica Resend Sandbox (Domeniu Test):
            </div>
            <p className="leading-relaxed text-[#475569]">
              Cu domeniul gratuit <strong>onboarding@resend.dev</strong>, Resend permite expedierea emailurilor de test <strong>doar către adresa asociată contului tău Resend (<code className="font-bold text-[#0d2c5c]">raduivan2003@gmail.com</code>)</strong>. Trimiterile către adrese străine sunt blocate de API.
            </p>
            <p className="text-[11px] text-[#64748b] pt-1 border-t border-amber-200/60">
              Pentru a trimite către orice client sau adresă externă, adaugă și verifică domeniul tău pe <strong>resend.com/domains</strong>.
            </p>
          </div>

          <div className="rounded-xl bg-[#f8fafc] border border-[#e1e8f0] p-3 text-xs text-[#64748b] space-y-1">
            <span className="font-bold text-[#0d2c5c] block">Expediere prin:</span>
            <span>API Resend &middot; Expeditor: Vila Casa Esy &lt;onboarding@resend.dev&gt;</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setTestModalOpen(false)}>
              Anulează
            </Button>
            <Button onClick={handleSendTest} disabled={sendingTest}>
              <Send size={14} />
              {sendingTest ? "Se trimite..." : "Trimite Test Acum"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
