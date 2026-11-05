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
  { tag: "{{code}}", label: "Cod OTP / Promo", sample: "849201" },
  { tag: "{{guest_name}}", label: "Nume Oaspete", sample: "Alexandru Ionescu" },
  { tag: "{{booking_code}}", label: "Cod Rezervare", sample: "BK-90421" },
  { tag: "{{room_title}}", label: "Denumire Cameră", sample: "Suită Deluxe" },
  { tag: "{{room_unit_number}}", label: "Număr Unitate", sample: "204" },
  { tag: "{{check_in}}", label: "Data Check-In", sample: "15.07.2026" },
  { tag: "{{check_out}}", label: "Data Check-Out", sample: "20.07.2026" },
  { tag: "{{total_price}}", label: "Total Factură (RON)", sample: "2.450,00" },
  { tag: "{{qr_code_url}}", label: "URL Imagine QR", sample: "https://api.qrserver.com/..." },
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

export default function EmailStudioTab() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplateItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("booking_confirmation");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable state for active template
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [designJson, setDesignJson] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);

  // Studio view mode: "unlayer" | "split" | "preview"
  const [mode, setMode] = useState<"unlayer" | "split" | "preview">("unlayer");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [unlayerReady, setUnlayerReady] = useState(false);
  const unlayerInitializedRef = useRef(false);

  // Modals
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("VARA2026");
  const [customRecipients, setCustomRecipients] = useState("");
  const [sendingCampaign, setSendingCampaign] = useState(false);

  const loadTemplates = useCallback(async (silent = false) => {
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
  }, [toast]);

  useAdminLiveSync({
    topic: "all",
    onSync: () => void loadTemplates(true),
  });

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const activeTemplate = templates.find((t) => t.slug === selectedSlug) || templates[0] || null;

  // Populate editor fields when switching template
  useEffect(() => {
    if (!activeTemplate) return;
    setSubject(activeTemplate.subject);
    setHtmlContent(activeTemplate.html_content);
    setDesignJson(activeTemplate.design_json || null);
    setIsActive(activeTemplate.is_active);

    if (unlayerReady && window.unlayer && activeTemplate.design_json) {
      try {
        const parsed = JSON.parse(activeTemplate.design_json);
        window.unlayer.loadDesign(parsed);
      } catch {
        /* ignore invalid design json */
      }
    }
  }, [activeTemplate?.slug, activeTemplate?.updated_at, unlayerReady]);

  // Load Unlayer script when in "unlayer" mode
  useEffect(() => {
    if (mode !== "unlayer") return;

    const initEditor = () => {
      if (!window.unlayer) return;
      const container = document.getElementById("unlayer-editor-box");
      if (!container) return;
      container.innerHTML = "";

      const mergeTagsConfig: Record<string, { name: string; value: string }> = {};
      MERGE_TAGS.forEach((m, idx) => {
        mergeTagsConfig[`tag_${idx}`] = { name: m.label, value: m.tag };
      });

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
        if (designJson) {
          try {
            window.unlayer?.loadDesign(JSON.parse(designJson));
          } catch {
            /* ignore */
          }
        }
      });
    };

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
        unlayerInitializedRef.current = true;
        initEditor();
      };
      document.body.appendChild(script);
    }
  }, [mode]);

  const syncFromUnlayer = (): Promise<{ html: string; design: string | null }> => {
    return new Promise((resolve) => {
      if (mode === "unlayer" && unlayerReady && window.unlayer) {
        window.unlayer.exportHtml((data) => {
          const exportedHtml = data?.html || htmlContent;
          const exportedDesign = data?.design ? JSON.stringify(data.design) : designJson;
          setHtmlContent(exportedHtml);
          setDesignJson(exportedDesign);
          resolve({ html: exportedHtml, design: exportedDesign });
        });
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
    if (!window.confirm(`Sigur vrei să resetezi șablonul „${activeTemplate.name}” la designul oficial Casa Esy?`)) {
      return;
    }
    setSaving(true);
    try {
      const updated = await post<EmailTemplateItem>(`/email-templates/${activeTemplate.slug}/reset`);
      setSubject(updated.subject);
      setHtmlContent(updated.html_content);
      setDesignJson(updated.design_json || null);
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
      const res = await post<{ sent: boolean; message: string }>(`/email-templates/${activeTemplate.slug}/test`, {
        to_email: testEmail.trim(),
        subject,
        html_content: synced.html,
      });
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
    toast(`Variabila ${tag} a fost copiată (o poți lipi direct în Unlayer sau în Subiect)!`, "success");
  };

  if (loading) return <TableSkeleton rows={6} />;

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Design & Comunicare Automată"
        title="Email Studio & Visual Builder (Unlayer)"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" onClick={handleReset} disabled={saving}>
              <RotateCcw size={14} /> Resetează Default
            </Button>
            <Button variant="ghost" onClick={() => setTestModalOpen(true)}>
              <Send size={14} /> Trimite Email Test
            </Button>
            <Button variant="gold" onClick={() => setCampaignModalOpen(true)}>
              <Megaphone size={14} /> Trimite Campanie Oaspeți
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save size={14} /> {saving ? "Se salvează..." : "Salvează Șablonul"}
            </Button>
          </div>
        }
      />

      {/* ── SELECTOR ȘABLOANE EMAIL ── */}
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
                  ? "border-[#0d2c5c] bg-[#0d2c5c] text-white shadow-md"
                  : "border-[#e1e8f0] bg-white text-[#0d2c5c] hover:border-[#c69a3f]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#c69a3f]/20 text-[#c69a3f]">
                    <Mail size={16} />
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      selected ? "bg-white/15 text-[#e6b85c]" : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {tpl.is_active ? "Activ" : "Inactiv"}
                  </span>
                </div>
                <h4 className="mt-3 text-[14px] font-bold leading-snug">{tpl.name}</h4>
                <p
                  className={`mt-1 text-[11.5px] line-clamp-2 ${
                    selected ? "text-white/75" : "text-[#6b7c99]"
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

      {/* ── BARĂ SUBIECT & VARIABILE DINAMICE (MERGE TAGS) ── */}
      {activeTemplate && (
        <Card className="p-5 space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#0d2c5c] mb-1.5">
                Subiectul Emailului (suportă variabile dinamice)
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={inputCls}
                placeholder="Ex: Confirmare Rezervare #{{booking_code}} — Casa Esy"
              />
            </div>

            <div className="flex flex-col justify-end">
              <div className="flex items-center justify-between rounded-xl border border-[#e1e8f0] bg-[#f8fafd] px-4 py-2.5">
                <div>
                  <div className="text-[12px] font-bold text-[#0d2c5c]">Șablon Personalizat Activ</div>
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

          {/* Merge Tags bar */}
          <div className="pt-2 border-t border-[#eef2f7]">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={13} className="text-[#c69a3f]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4f6280]">
                Variabile Dinamice (Click pentru a copia / insera în șablon):
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

      {/* ── SELECTOR MOD STUDIO: UNLAYER DRAG & DROP / SPLIT EDITOR / LIVE PREVIEW ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-[#e1e8f0] bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setMode("unlayer")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[12px] font-bold transition-colors cursor-pointer ${
              mode === "unlayer" ? "bg-[#0d2c5c] text-white" : "text-[#4f6280] hover:text-[#0d2c5c]"
            }`}
          >
            <LayoutTemplate size={15} /> Studio Vizual Unlayer (Drag & Drop)
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
            <Code2 size={15} /> Editor HTML & Previzualizare Dublă
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
            <Eye size={15} /> Previzualizare Finală Client
          </button>
        </div>

        {(mode === "preview" || mode === "split") && (
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

      {/* ── ZONA PRINCIPALĂ DE LUCRU ── */}
      {mode === "unlayer" && (
        <Card className="overflow-hidden border border-[#e1e8f0]">
          <div className="flex items-center justify-between border-b border-[#eef2f7] bg-[#f8fafd] px-5 py-3">
            <div className="flex items-center gap-2">
              <Badge tone="gold">Unlayer Studio</Badge>
              <span className="text-[12px] font-medium text-[#4f6280]">
                Trage blocuri (Text, Butoane, Imagini, Coloane) sau dă dublu-click pe șablonul existent pentru a modifica textele și culorile.
              </span>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              <Save size={14} /> Salvează Designul
            </Button>
          </div>
          <div
            id="unlayer-editor-box"
            style={{ height: "720px", width: "100%", backgroundColor: "#f4f6f9" }}
          />
        </Card>
      )}

      {mode === "split" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5 flex flex-col">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#0d2c5c]">
                Cod Sursă HTML Șablon
              </span>
              <Badge tone="navy">Editare Directă</Badge>
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
                Previzualizare Live cu Date Reale
              </span>
              <Badge tone="green">Randare Instantanee</Badge>
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

      {/* ── MODAL: TRIMITE EMAIL DE TEST ── */}
      <Modal open={testModalOpen} title="Trimite Email de Test" onClose={() => setTestModalOpen(false)}>
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
              <Send size={14} /> {sendingTest ? "Se trimite..." : "Trimite Testul Acum"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL: CAMPANIE / NEWSLETTER OASPEȚI ── */}
      <Modal
        open={campaignModalOpen}
        title="Trimite Campanie / Newsletter Oaspeților"
        onClose={() => setCampaignModalOpen(false)}
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-[#f8fafd] border border-[#e1e8f0] p-3.5 text-[12.5px] text-[#2a3b52]">
            <div className="font-bold text-[#0d2c5c] flex items-center gap-1.5 mb-1">
              <CheckCircle2 size={15} className="text-emerald-600" />
              Personalizare Automată per Oaspete
            </div>
            Fiecare destinatar va primi emailul personalizat cu numele său (<code>{"{{guest_name}}"}</code>) și codul promoțional de mai jos (<code>{"{{code}}"}</code>).
          </div>

          <Field label="Cod Promoțional / Cupon ({{code}})">
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
              <Megaphone size={14} /> {sendingCampaign ? "Se expediază..." : "Lansează Campania"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
