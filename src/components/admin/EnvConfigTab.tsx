import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Cloud,
  Server,
  HardDrive,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Pencil,
  Trash2,
  Plus,
  RefreshCw,
  Rocket,
  RotateCw,
  ShieldCheck,
  ExternalLink,
  AlertTriangle,
  Sliders,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useToast } from "../Toast";
import {
  SectionHeader,
  PrimaryButton,
  GhostButton,
  SearchInput,
  Modal,
  Field,
  TextInput,
  Select,
  Badge,
  TableSkeleton,
  EmptyState,
} from "./ui";

type EnvSource = "render" | "netlify" | "local";

interface RenderStatus {
  configured: boolean;
  connected: boolean;
  service_id: string | null;
  service_name: string | null;
  service_url: string | null;
  error: string | null;
}

interface NetlifyStatus {
  configured: boolean;
  connected: boolean;
  site_id: string | null;
  site_name: string | null;
  site_url: string | null;
  error: string | null;
}

interface LocalStatus {
  configured: boolean;
  connected: boolean;
  env_file_exists: boolean;
  env_file_path: string;
}

interface ProvidersStatus {
  render: RenderStatus;
  netlify: NetlifyStatus;
  local: LocalStatus;
}

interface EnvVarItem {
  source: EnvSource;
  key: string;
  category: string;
  description: string;
  is_secret: boolean;
  is_set: boolean;
  masked_value: string;
  value_preview: string;
  context: string;
  scopes: string[];
}

const SOURCE_META: Record<
  EnvSource,
  { label: string; subtitle: string; icon: typeof Server }
> = {
  render: {
    label: "Render Backend",
    subtitle: "Variabile de producție API (FastAPI)",
    icon: Server,
  },
  netlify: {
    label: "Netlify Frontend",
    subtitle: "Variabile build Vite / Edge",
    icon: Cloud,
  },
  local: {
    label: "Local & Runtime (.env)",
    subtitle: "Fișier .env local, memorie și DB",
    icon: HardDrive,
  },
};

export default function EnvConfigTab() {
  const { toast } = useToast();

  const [source, setSource] = useState<EnvSource>("render");
  const [status, setStatus] = useState<ProvidersStatus | null>(null);
  const [variables, setVariables] = useState<EnvVarItem[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingVars, setLoadingVars] = useState(true);
  const [varsError, setVarsError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("Toate");

  const [revealedMap, setRevealedMap] = useState<Record<string, string>>({});
  const [revealingKey, setRevealingKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [deployingProvider, setDeployingProvider] = useState<
    "render" | "netlify" | null
  >(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isNewVar, setIsNewVar] = useState(false);
  const [formKey, setFormKey] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formContext, setFormContext] = useState("all");
  const [formSyncLocal, setFormSyncLocal] = useState(false);
  const [formTriggerDeploy, setFormTriggerDeploy] = useState(false);
  const [savingVar, setSavingVar] = useState(false);

  const [credModalProvider, setCredModalProvider] = useState<
    "render" | "netlify" | null
  >(null);
  const [credToken, setCredToken] = useState("");
  const [credResourceId, setCredResourceId] = useState("");
  const [credPushRender, setCredPushRender] = useState(true);
  const [savingCreds, setSavingCreds] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<EnvVarItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const data = await apiFetch<ProvidersStatus>("/admin/env/status");
      setStatus(data);
    } catch (err) {
      toast(
        err instanceof Error
          ? err.message
          : "Nu s-a putut verifica starea Render/Netlify.",
        "error"
      );
    } finally {
      setLoadingStatus(false);
    }
  }, [toast]);

  const loadVariables = useCallback(
    async (targetSource: EnvSource) => {
      setLoadingVars(true);
      setVarsError(null);
      setRevealedMap({});
      try {
        const data = await apiFetch<{ source: EnvSource; variables: EnvVarItem[] }>(
          `/admin/env/variables?source=${targetSource}`
        );
        setVariables(data.variables || []);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Nu s-au putut încărca variabilele.";
        setVarsError(msg);
        setVariables([]);
      } finally {
        setLoadingVars(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    void loadVariables(source);
    setCategoryFilter("Toate");
  }, [source, loadVariables]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(variables.map((v) => v.category)));
    return ["Toate", ...unique];
  }, [variables]);

  const filteredVariables = useMemo(() => {
    const q = query.trim().toLowerCase();
    return variables.filter((item) => {
      if (categoryFilter !== "Toate" && item.category !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        item.key.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [variables, categoryFilter, query]);

  const mapKey = (src: EnvSource, k: string) => `${src}:${k}`;

  const handleToggleReveal = async (item: EnvVarItem) => {
    const mk = mapKey(item.source, item.key);
    if (mk in revealedMap) {
      setRevealedMap((prev) => {
        const next = { ...prev };
        delete next[mk];
        return next;
      });
      return;
    }

    setRevealingKey(mk);
    try {
      const res = await apiFetch<{ value: string }>(
        `/admin/env/reveal?source=${item.source}&key=${encodeURIComponent(
          item.key
        )}`
      );
      setRevealedMap((prev) => ({ ...prev, [mk]: res.value ?? "" }));
    } catch (err) {
      toast(
        err instanceof Error
          ? err.message
          : "Eroare la decriptarea variabilei.",
        "error"
      );
    } finally {
      setRevealingKey(null);
    }
  };

  const handleCopyValue = async (item: EnvVarItem) => {
    const mk = mapKey(item.source, item.key);
    let val = revealedMap[mk];
    if (val === undefined) {
      try {
        const res = await apiFetch<{ value: string }>(
          `/admin/env/reveal?source=${item.source}&key=${encodeURIComponent(
            item.key
          )}`
        );
        val = res.value ?? "";
        setRevealedMap((prev) => ({ ...prev, [mk]: val }));
      } catch (err) {
        toast(
          err instanceof Error ? err.message : "Nu s-a putut copia valoarea.",
          "error"
        );
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(val);
      setCopiedKey(mk);
      toast(`Copiat: ${item.key}`, "success");
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      toast("Clipboard indisponibil în browser.", "error");
    }
  };

  const openCreateModal = () => {
    setIsNewVar(true);
    setFormKey("");
    setFormValue("");
    setFormContext(source === "netlify" ? "all" : "production");
    setFormSyncLocal(source !== "local");
    setFormTriggerDeploy(false);
    setEditModalOpen(true);
  };

  const openEditModal = async (item: EnvVarItem) => {
    setIsNewVar(false);
    setFormKey(item.key);
    setFormContext(item.context || (source === "netlify" ? "all" : "production"));
    setFormSyncLocal(false);
    setFormTriggerDeploy(false);

    const mk = mapKey(item.source, item.key);
    if (mk in revealedMap) {
      setFormValue(revealedMap[mk]);
    } else if (item.is_set) {
      try {
        const res = await apiFetch<{ value: string }>(
          `/admin/env/reveal?source=${item.source}&key=${encodeURIComponent(
            item.key
          )}`
        );
        const val = res.value ?? "";
        setRevealedMap((prev) => ({ ...prev, [mk]: val }));
        setFormValue(val);
      } catch {
        setFormValue("");
      }
    } else {
      setFormValue("");
    }
    setEditModalOpen(true);
  };

  const handleSaveVariable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKey.trim()) {
      toast("Numele cheii este obligatoriu.", "error");
      return;
    }
    setSavingVar(true);
    try {
      const res = await apiFetch<{ ok: boolean; deploy?: { action?: string } }>(
        "/admin/env/variables",
        {
          method: "PUT",
          body: JSON.stringify({
            source,
            key: formKey.trim().toUpperCase(),
            value: formValue,
            context: formContext,
            sync_to_local: formSyncLocal,
            trigger_deploy: formTriggerDeploy,
          }),
        }
      );
      toast(
        res.deploy
          ? `Variabila ${formKey.trim().toUpperCase()} salvată și deploy declanșat.`
          : `Variabila ${formKey.trim().toUpperCase()} a fost salvată.`,
        "success"
      );
      setEditModalOpen(false);
      await loadVariables(source);
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Eroare la salvarea variabilei.",
        "error"
      );
    } finally {
      setSavingVar(false);
    }
  };

  const handleDeleteVariable = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(
        `/admin/env/variables?source=${deleteTarget.source}&key=${encodeURIComponent(
          deleteTarget.key
        )}`,
        { method: "DELETE" }
      );
      toast(`Variabila ${deleteTarget.key} a fost ștearsă.`, "success");
      setDeleteTarget(null);
      await loadVariables(source);
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Eroare la ștergerea variabilei.",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  const openCredentialsModal = (provider: "render" | "netlify") => {
    setCredModalProvider(provider);
    setCredToken("");
    setCredResourceId(
      provider === "render"
        ? status?.render.service_id || ""
        : status?.netlify.site_id || "licentaradu.netlify.app"
    );
    setCredPushRender(provider === "netlify");
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credModalProvider) return;
    setSavingCreds(true);
    try {
      const res = await apiFetch<{
        ok: boolean;
        synced_to_render?: boolean;
        status: ProvidersStatus;
      }>("/admin/env/credentials", {
        method: "POST",
        body: JSON.stringify({
          provider: credModalProvider,
          token: credToken.trim(),
          resource_id: credResourceId.trim(),
          push_to_render: credPushRender,
        }),
      });
      setStatus(res.status);
      toast(
        credModalProvider === "netlify" && res.synced_to_render
          ? "Netlify conectat și sincronizat automat pe Render!"
          : `${credModalProvider === "render" ? "Render" : "Netlify"} conectat cu succes!`,
        "success"
      );
      setCredModalProvider(null);
      if (source === credModalProvider || source === "local") {
        await loadVariables(source);
      }
    } catch (err) {
      toast(
        err instanceof Error
          ? err.message
          : "Credențialele nu au putut fi validate.",
        "error"
      );
    } finally {
      setSavingCreds(false);
    }
  };

  const handleTriggerDeploy = async (
    provider: "render" | "netlify",
    restartOnly = false
  ) => {
    setDeployingProvider(provider);
    try {
      await apiFetch("/admin/env/deploy", {
        method: "POST",
        body: JSON.stringify({
          provider,
          clear_cache: false,
          restart_only: restartOnly,
        }),
      });
      toast(
        provider === "render"
          ? restartOnly
            ? "Restart serviciu Render inițiat!"
            : "Deploy nou pe Render declanșat!"
          : "Build & Deploy nou pe Netlify declanșat!",
        "success"
      );
    } catch (err) {
      toast(
        err instanceof Error
          ? err.message
          : "Eroare la declanșarea deploy-ului.",
        "error"
      );
    } finally {
      setDeployingProvider(null);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Infrastructură Cloud & Mediu"
        title="Variabile de mediu Render & Netlify"
        description="Gestionează în timp real toate cheile API, secretele Stripe, SMTP, Supabase, LLM și variabilele de producție direct din panoul administrativ."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <GhostButton
              size="sm"
              onClick={() => {
                void loadStatus();
                void loadVariables(source);
              }}
            >
              <RefreshCw size={13} />
              Reîncarcă
            </GhostButton>
            <PrimaryButton size="sm" onClick={openCreateModal}>
              <Plus size={14} />
              Adaugă variabilă
            </PrimaryButton>
          </div>
        }
      />

      {/* ─────────────── PROVIDER STATUS CARDS ─────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Render Card */}
        <div className="rounded-2xl border border-[#e1e8f0] bg-white p-5 shadow-[0_6px_24px_rgba(13,44,92,0.04)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0d2c5c] text-[#e6b85c]">
                <Server size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0d2c5c]">
                  Render Backend
                </h3>
                <p className="text-xs text-[#6b7c99] truncate max-w-[180px]">
                  {status?.render.service_name ||
                    status?.render.service_id ||
                    "Neconfigurat"}
                </p>
              </div>
            </div>
            {loadingStatus ? (
              <Badge tone="muted">Verificare...</Badge>
            ) : status?.render.connected ? (
              <Badge tone="green">Conectat</Badge>
            ) : status?.render.configured ? (
              <Badge tone="red">Eroare API</Badge>
            ) : (
              <Badge tone="gold">Necesită Token</Badge>
            )}
          </div>

          <div className="mt-3 min-h-[20px] text-xs text-[#4f6280]">
            {status?.render.service_url ? (
              <a
                href={status.render.service_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-[#0d2c5c] hover:text-[#c69a3f]"
              >
                {status.render.service_url}
                <ExternalLink size={11} />
              </a>
            ) : status?.render.error ? (
              <span className="text-rose-600">{status.render.error}</span>
            ) : (
              <span>API Render pentru variabile backend & restart</span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#eef2f7] pt-3">
            <button
              type="button"
              onClick={() => openCredentialsModal("render")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#e1e8f0] bg-[#f8fafd] px-2.5 py-1.5 text-[11px] font-semibold text-[#0d2c5c] hover:border-[#0d2c5c] cursor-pointer"
            >
              <KeyRound size={12} />
              Token & ID
            </button>
            <button
              type="button"
              disabled={!status?.render.connected || deployingProvider === "render"}
              onClick={() => void handleTriggerDeploy("render", true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#e1e8f0] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#0d2c5c] hover:bg-[#f4f6f9] disabled:opacity-40 cursor-pointer"
            >
              <RotateCw size={12} />
              Restart
            </button>
            <button
              type="button"
              disabled={!status?.render.connected || deployingProvider === "render"}
              onClick={() => void handleTriggerDeploy("render", false)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0d2c5c] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#07203f] disabled:opacity-40 cursor-pointer"
            >
              <Rocket size={12} />
              Deploy nou
            </button>
          </div>
        </div>

        {/* Netlify Card */}
        <div className="rounded-2xl border border-[#e1e8f0] bg-white p-5 shadow-[0_6px_24px_rgba(13,44,92,0.04)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00ad9f]/15 text-[#007a70]">
                <Cloud size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0d2c5c]">
                  Netlify Frontend
                </h3>
                <p className="text-xs text-[#6b7c99] truncate max-w-[180px]">
                  {status?.netlify.site_name ||
                    status?.netlify.site_id ||
                    "Neconfigurat"}
                </p>
              </div>
            </div>
            {loadingStatus ? (
              <Badge tone="muted">Verificare...</Badge>
            ) : status?.netlify.connected ? (
              <Badge tone="green">Conectat</Badge>
            ) : status?.netlify.configured ? (
              <Badge tone="red">Eroare API</Badge>
            ) : (
              <Badge tone="gold">Necesită Token</Badge>
            )}
          </div>

          <div className="mt-3 min-h-[20px] text-xs text-[#4f6280]">
            {status?.netlify.site_url ? (
              <a
                href={status.netlify.site_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-[#0d2c5c] hover:text-[#c69a3f]"
              >
                {status.netlify.site_url}
                <ExternalLink size={11} />
              </a>
            ) : status?.netlify.error ? (
              <span className="text-rose-600">{status.netlify.error}</span>
            ) : (
              <span>Configurează Personal Access Token Netlify</span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#eef2f7] pt-3">
            <button
              type="button"
              onClick={() => openCredentialsModal("netlify")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#e1e8f0] bg-[#f8fafd] px-2.5 py-1.5 text-[11px] font-semibold text-[#0d2c5c] hover:border-[#0d2c5c] cursor-pointer"
            >
              <KeyRound size={12} />
              {status?.netlify.configured ? "Editează Token" : "Conectează Netlify"}
            </button>
            <button
              type="button"
              disabled={!status?.netlify.connected || deployingProvider === "netlify"}
              onClick={() => void handleTriggerDeploy("netlify", false)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0d2c5c] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#07203f] disabled:opacity-40 cursor-pointer"
            >
              <Rocket size={12} />
              Build & Deploy
            </button>
          </div>
        </div>

        {/* Local & Runtime Card */}
        <div className="rounded-2xl border border-[#e1e8f0] bg-white p-5 shadow-[0_6px_24px_rgba(13,44,92,0.04)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fdf8ec] text-[#8a6420] border border-[#c69a3f]/30">
                <HardDrive size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0d2c5c]">
                  Local & Runtime
                </h3>
                <p className="text-xs text-[#6b7c99]">
                  Fișier .env + Proces + Bază DB
                </p>
              </div>
            </div>
            <Badge tone="green">Activ</Badge>
          </div>

          <div className="mt-3 min-h-[20px] text-xs text-[#4f6280]">
            {status?.local.env_file_exists ? (
              <span>
                Modificările se aplică instant în memoria serverului și în{" "}
                <code className="rounded bg-[#f4f6f9] px-1 py-0.5 font-mono text-[11px] text-[#0d2c5c]">
                  .env
                </code>
              </span>
            ) : (
              <span>Modificările runtime se salvează în baza de date</span>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#eef2f7] pt-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#1f6b45]">
              <ShieldCheck size={14} />
              Auditat în Security Log
            </span>
            <button
              type="button"
              onClick={() => setSource("local")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#e1e8f0] bg-[#f8fafd] px-2.5 py-1.5 text-[11px] font-semibold text-[#0d2c5c] hover:border-[#0d2c5c] cursor-pointer"
            >
              <Sliders size={12} />
              Vezi locale
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────── SOURCE TABS & FILTERS ─────────────── */}
      <div className="rounded-2xl border border-[#e1e8f0] bg-white shadow-[0_8px_30px_rgba(13,44,92,0.04)]">
        <div className="flex flex-col gap-4 border-b border-[#eef2f7] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            {(["render", "netlify", "local"] as EnvSource[]).map((src) => {
              const Icon = SOURCE_META[src].icon;
              const active = source === src;
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSource(src)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-[#0d2c5c] text-white shadow-[0_8px_20px_rgba(13,44,92,0.18)]"
                      : "bg-[#f4f6f9] text-[#4f6280] hover:bg-[#e9eff6] hover:text-[#0d2c5c]"
                  }`}
                >
                  <Icon
                    size={14}
                    className={active ? "text-[#e6b85c]" : "text-[#0d2c5c]"}
                  />
                  {SOURCE_META[src].label}
                </button>
              );
            })}
          </div>

          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Caută după cheie sau descriere..."
          />
        </div>

        {/* Category Filter Pills */}
        {categories.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 border-b border-[#eef2f7] bg-[#f8fafd]/60 px-4 py-3 sm:px-6">
            {categories.map((cat) => {
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                    active
                      ? "bg-[#c69a3f] text-white"
                      : "bg-white border border-[#e1e8f0] text-[#4f6280] hover:border-[#c69a3f] hover:text-[#0d2c5c]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Variables Table / Onboarding State */}
        {loadingVars ? (
          <TableSkeleton rows={6} />
        ) : varsError ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fdf8ec] text-[#8a6420]">
              <AlertTriangle size={22} />
            </div>
            <h4 className="mt-3 text-base font-bold text-[#0d2c5c]">
              {source === "netlify"
                ? "Conectează contul Netlify pentru a edita variabilele frontend"
                : source === "render"
                  ? "Conectează serviciul Render"
                  : "Nu s-au putut încărca variabilele"}
            </h4>
            <p className="mx-auto mt-1.5 max-w-lg text-xs leading-relaxed text-[#6b7c99]">
              {varsError}
            </p>
            {(source === "render" || source === "netlify") && (
              <div className="mt-5 flex justify-center">
                <PrimaryButton
                  size="sm"
                  onClick={() => openCredentialsModal(source)}
                >
                  <KeyRound size={14} />
                  Configurează {source === "netlify" ? "Netlify" : "Render"} acum
                </PrimaryButton>
              </div>
            )}
          </div>
        ) : filteredVariables.length === 0 ? (
          <EmptyState
            title="Nicio variabilă găsită"
            hint="Modifică filtrul de căutare sau adaugă o variabilă nouă."
          />
        ) : (
          <div className="divide-y divide-[#eef2f7]">
            {filteredVariables.map((item) => {
              const mk = mapKey(item.source, item.key);
              const isRevealed = mk in revealedMap;
              const revealedVal = revealedMap[mk] ?? "";
              const isBusyReveal = revealingKey === mk;
              const isCopied = copiedKey === mk;

              return (
                <div
                  key={mk}
                  className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-[#f8fafd] sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="rounded-lg bg-[#eef2f7] px-2.5 py-1 font-mono text-[12.5px] font-bold text-[#0d2c5c]">
                        {item.key}
                      </code>
                      <Badge tone="navy">{item.category}</Badge>
                      {item.is_secret && <Badge tone="gold">Secret</Badge>}
                      {!item.is_set && <Badge tone="muted">Nesetată</Badge>}
                      {item.context && item.source === "netlify" && (
                        <Badge tone="muted">{item.context}</Badge>
                      )}
                    </div>

                    <p className="mt-1.5 text-xs text-[#6b7c99]">
                      {item.description}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <div className="max-w-full overflow-x-auto rounded-lg border border-[#e1e8f0] bg-white px-3 py-1.5 font-mono text-xs text-[#2a3b52]">
                        {!item.is_set ? (
                          <span className="italic text-[#94a3b8]">
                            (valoare necompletată)
                          </span>
                        ) : isRevealed ? (
                          <span className="break-all select-all text-[#0d2c5c]">
                            {revealedVal || "(gol)"}
                          </span>
                        ) : (
                          <span className="text-[#4f6280]">
                            {item.masked_value}
                          </span>
                        )}
                      </div>

                      {item.is_set && (
                        <>
                          <button
                            type="button"
                            onClick={() => void handleToggleReveal(item)}
                            disabled={isBusyReveal}
                            title={
                              isRevealed ? "Ascunde valoarea" : "Afișează valoarea"
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#e1e8f0] bg-white text-[#4f6280] hover:border-[#0d2c5c] hover:text-[#0d2c5c] cursor-pointer"
                          >
                            {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleCopyValue(item)}
                            title="Copiază valoarea"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#e1e8f0] bg-white text-[#4f6280] hover:border-[#0d2c5c] hover:text-[#0d2c5c] cursor-pointer"
                          >
                            {isCopied ? (
                              <Check size={14} className="text-[#1f6b45]" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void openEditModal(item)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#e1e8f0] bg-white px-3 py-2 text-xs font-semibold text-[#0d2c5c] hover:border-[#0d2c5c] cursor-pointer"
                    >
                      <Pencil size={13} />
                      Editează
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      title="Șterge variabila"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50/60 text-rose-700 hover:bg-rose-100 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────── UPSERT MODAL ─────────────── */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={isNewVar ? "Adaugă variabilă nouă" : `Editează ${formKey}`}
        subtitle={`Țintă: ${SOURCE_META[source].label}`}
      >
        <form onSubmit={handleSaveVariable} className="space-y-4">
          <Field label="Nume cheie (KEY) *">
            <TextInput
              value={formKey}
              onChange={(e) => setFormKey(e.target.value.toUpperCase())}
              placeholder="EX: STRIPE_SECRET_KEY"
              disabled={!isNewVar}
              className="font-mono uppercase"
              required
            />
          </Field>

          <Field label="Valoare variabilă *">
            <textarea
              value={formValue}
              onChange={(e) => setFormValue(e.target.value)}
              rows={3}
              placeholder="Introdu noua valoare..."
              className="w-full rounded-xl border border-[#e1e8f0] bg-[#f8fafd] px-4 py-2.5 font-mono text-[13px] text-[#0d2c5c] outline-none transition-all focus:bg-white focus:border-[#c69a3f] focus:ring-2 focus:ring-[#c69a3f]/15"
            />
          </Field>

          {source === "netlify" && (
            <Field label="Context Netlify">
              <Select
                value={formContext}
                onChange={(e) => setFormContext(e.target.value)}
              >
                <option value="all">Toate mediile (all)</option>
                <option value="production">Doar Producție (production)</option>
                <option value="deploy-preview">Deploy Preview</option>
                <option value="branch-deploy">Branch Deploy</option>
              </Select>
            </Field>
          )}

          {source !== "local" && (
            <div className="space-y-2.5 rounded-xl border border-[#eef2f7] bg-[#f8fafd] p-3.5 text-xs text-[#2a3b52]">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formSyncLocal}
                  onChange={(e) => setFormSyncLocal(e.target.checked)}
                  className="h-4 w-4 rounded border-[#cbd5e1] accent-[#0d2c5c]"
                />
                <span>
                  Sincronizează automat și în <strong>Local / Runtime (.env)</strong>
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formTriggerDeploy}
                  onChange={(e) => setFormTriggerDeploy(e.target.checked)}
                  className="h-4 w-4 rounded border-[#cbd5e1] accent-[#0d2c5c]"
                />
                <span>
                  Declanșează automat{" "}
                  <strong>
                    {source === "netlify"
                      ? "Build & Deploy Netlify"
                      : "Restart serviciu Render"}
                  </strong>{" "}
                  după salvare
                </span>
              </label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <GhostButton onClick={() => setEditModalOpen(false)}>
              Anulează
            </GhostButton>
            <PrimaryButton type="submit" disabled={savingVar}>
              {savingVar ? "Se salvează..." : "Salvează variabila"}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* ─────────────── CREDENTIALS MODAL ─────────────── */}
      <Modal
        open={credModalProvider !== null}
        onClose={() => setCredModalProvider(null)}
        title={
          credModalProvider === "netlify"
            ? "Conectare Netlify Frontend"
            : "Conectare Render Backend"
        }
        subtitle="Token-ul este verificat live și salvat securizat"
      >
        <form onSubmit={handleSaveCredentials} className="space-y-4">
          <Field
            label={
              credModalProvider === "netlify"
                ? "Netlify Personal Access Token *"
                : "Render API Key *"
            }
          >
            <TextInput
              type="password"
              value={credToken}
              onChange={(e) => setCredToken(e.target.value)}
              placeholder={
                credModalProvider === "netlify"
                  ? "nfp_..."
                  : "rnd_..."
              }
              required
            />
          </Field>

          <Field
            label={
              credModalProvider === "netlify"
                ? "Site ID sau Domeniu Netlify *"
                : "Render Service ID *"
            }
          >
            <TextInput
              value={credResourceId}
              onChange={(e) => setCredResourceId(e.target.value)}
              placeholder={
                credModalProvider === "netlify"
                  ? "licentaradu.netlify.app sau UUID"
                  : "srv-..."
              }
              required
            />
          </Field>

          <p className="rounded-xl border border-[#e1e8f0] bg-[#f8fafd] px-3.5 py-2.5 text-xs leading-relaxed text-[#4f6280]">
            {credModalProvider === "netlify"
              ? "Obții token-ul din Netlify → User Settings → Applications → Personal access tokens. Poți introduce direct numele site-ului (ex: licentaradu.netlify.app) sau Site ID-ul din Site Configuration."
              : "Obții API Key-ul din Render → Account Settings → API Keys, iar Service ID-ul începe cu srv-... din URL-ul serviciului."}
          </p>

          {credModalProvider === "netlify" && (
            <label className="flex items-center gap-2.5 text-xs text-[#2a3b52] cursor-pointer">
              <input
                type="checkbox"
                checked={credPushRender}
                onChange={(e) => setCredPushRender(e.target.checked)}
                className="h-4 w-4 rounded border-[#cbd5e1] accent-[#0d2c5c]"
              />
              <span>
                Salvează automat <code>NETLIFY_AUTH_TOKEN</code> și{" "}
                <code>NETLIFY_SITE_ID</code> și pe Render pentru persistență în producție
              </span>
            </label>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <GhostButton onClick={() => setCredModalProvider(null)}>
              Anulează
            </GhostButton>
            <PrimaryButton type="submit" disabled={savingCreds}>
              {savingCreds ? "Se verifică..." : "Verifică și salvează"}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* ─────────────── DELETE CONFIRMATION MODAL ─────────────── */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Confirmare ștergere variabilă"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#2a3b52]">
            Sigur dorești să ștergi variabila{" "}
            <code className="rounded bg-[#eef2f7] px-2 py-0.5 font-mono font-bold text-[#0d2c5c]">
              {deleteTarget?.key}
            </code>{" "}
            din{" "}
            <strong>
              {deleteTarget ? SOURCE_META[deleteTarget.source].label : ""}
            </strong>
            ?
          </p>
          <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
            Atenție: ștergerea unei chei active poate afecta funcționarea serviciului asociat până la re-adăugarea ei.
          </p>
          <div className="flex justify-end gap-2">
            <GhostButton onClick={() => setDeleteTarget(null)}>
              Renunță
            </GhostButton>
            <button
              type="button"
              disabled={deleting}
              onClick={() => void handleDeleteVariable()}
              className="rounded-full bg-rose-700 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-rose-800 disabled:opacity-50 cursor-pointer"
            >
              {deleting ? "Se șterge..." : "Șterge definitiv"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
