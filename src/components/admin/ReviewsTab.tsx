import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Star,
  Award,
  MessageSquareReply,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  BedDouble,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { dateFmt } from "../../lib/admin";
import { useToast } from "../Toast";
import { useAdminLiveSync } from "../../context/AdminLiveSyncContext";
import {
  SectionHeader,
  PrimaryButton,
  GhostButton,
  SearchInput,
  Modal,
  Field,
  Textarea,
  Badge,
} from "./ui";

export interface AdminReviewItem {
  id: string;
  room_id: string;
  room_title: string;
  booking_code?: string | null;
  unit_number?: string | null;
  guest_name: string;
  rating_overall: number;
  rating_cleanliness: number;
  rating_comfort: number;
  rating_location: number;
  rating_service: number;
  comment: string;
  admin_reply?: string | null;
  admin_replied_at?: string | null;
  is_verified: boolean;
  is_visible: boolean;
  created_at?: string | null;
}

export default function ReviewsTab() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<"all" | "unreplied" | "replied">("all");
  const [search, setSearch] = useState("");

  // Modal Răspuns Oficial
  const [replyTarget, setReplyTarget] = useState<AdminReviewItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [savingReply, setSavingReply] = useState(false);

  const loadReviews = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const data = await apiFetch<AdminReviewItem[]>("/reviews/admin");
        setReviews(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (!silent) toast(err?.message || "Eroare la încărcarea recenziilor.", "error");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  useAdminLiveSync({
    topic: "all",
    onSync: () => loadReviews(true),
  });

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (filterMode === "unreplied" && r.admin_reply) return false;
      if (filterMode === "replied" && !r.admin_reply) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchGuest = r.guest_name.toLowerCase().includes(q);
        const matchRoom = r.room_title.toLowerCase().includes(q);
        const matchBk = (r.booking_code || "").toLowerCase().includes(q);
        const matchComment = r.comment.toLowerCase().includes(q);
        return matchGuest || matchRoom || matchBk || matchComment;
      }
      return true;
    });
  }, [reviews, filterMode, search]);

  const stats = useMemo(() => {
    const count = reviews.length;
    const avg =
      count > 0
        ? (reviews.reduce((a, r) => a + Number(r.rating_overall || 5), 0) / count).toFixed(2)
        : "5.00";
    const unreplied = reviews.filter((r) => !r.admin_reply).length;
    return { count, avg, unreplied };
  }, [reviews]);

  const handleSaveReply = async () => {
    if (!replyTarget) return;
    setSavingReply(true);
    try {
      const updated = await apiFetch<AdminReviewItem>(`/reviews/${replyTarget.id}/reply`, {
        method: "PATCH",
        body: JSON.stringify({ admin_reply: replyText }),
      });
      setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setReplyTarget(null);
      toast("Răspunsul oficial Vila Casa Esy a fost publicat!", "success");
    } catch (err: any) {
      toast(err?.message || "Nu am putut salva răspunsul.", "error");
    } finally {
      setSavingReply(false);
    }
  };

  const handleToggleVisible = async (r: AdminReviewItem) => {
    try {
      const updated = await apiFetch<AdminReviewItem>(`/reviews/${r.id}/reply`, {
        method: "PATCH",
        body: JSON.stringify({ is_visible: !r.is_visible }),
      });
      setReviews((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      toast(
        updated.is_visible
          ? "Recenzia este acum vizibilă pe pagina camerei."
          : "Recenzia a fost ascunsă.",
        "info",
      );
    } catch (err: any) {
      toast(err?.message || "Eroare la actualizarea vizibilității.", "error");
    }
  };

  const handleDelete = async (r: AdminReviewItem) => {
    try {
      await apiFetch(`/reviews/${r.id}`, { method: "DELETE" });
      setReviews((prev) => prev.filter((x) => x.id !== r.id));
      toast("Recenzia a fost ștearsă.", "success");
    } catch (err: any) {
      toast(err?.message || "Nu am putut șterge recenzia.", "error");
    }
  };

  return (
    <div>
      <SectionHeader
        eyebrow="Reputație & Feedback Oaspeți"
        title="Recenzii Verificate cu Ecuson #BK & Răspuns Oficial"
        description="Gestionează recenziile oaspeților cazați în Vila Casa Esy și publică răspunsuri oficiale din partea conducerii direct sub comentariul clientului."
      />

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-white border border-[color:var(--color-border)] flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Scor Mediu General</div>
            <div className="font-serif font-bold text-2xl text-[color:var(--color-primary)] flex items-center gap-1.5">
              {stats.avg} / 5.0
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <Badge tone="gold">{stats.count} recenzii verificate</Badge>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[color:var(--color-border)] flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Ecuson Sejur Confirmat</div>
            <div className="font-serif font-bold text-lg text-emerald-800 flex items-center gap-1.5 mt-0.5">
              <Award className="w-5 h-5 text-emerald-600" /> 100% Rezervări Reale #BK
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[color:var(--color-border)] flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Așteaptă Răspuns Oficial</div>
            <div className="font-serif font-bold text-2xl text-amber-800">
              {stats.unreplied} recenzii
            </div>
          </div>
          <MessageSquareReply className="w-6 h-6 text-amber-600" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          {[
            { id: "all" as const, label: `Toate (${reviews.length})` },
            { id: "unreplied" as const, label: `Fără Răspuns Oficial (${stats.unreplied})` },
            {
              id: "replied" as const,
              label: `Cu Răspuns Publicat (${reviews.length - stats.unreplied})`,
            },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterMode(btn.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                filterMode === btn.id
                  ? "bg-[color:var(--color-primary)] text-white border-[color:var(--color-primary)]"
                  : "bg-white text-slate-700 border-[color:var(--color-border)] hover:bg-slate-50"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="w-72">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Caută după oaspete, #BK sau cameră..."
          />
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 rounded-2xl bg-white/60 border border-[color:var(--color-border)] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div
              key={r.id}
              className={`rounded-2xl bg-white border p-5 shadow-xs transition-all ${
                r.is_visible
                  ? "border-[color:var(--color-border)]"
                  : "border-slate-200 opacity-60"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-serif font-bold text-base text-[color:var(--color-foreground)]">
                      {r.guest_name}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-900 border border-amber-400/40">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                      Sejur Confirmat #{(r.booking_code || "BK-VERIFIED").replace(/^#/, "")}
                    </span>
                    {r.unit_number && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                        <BedDouble className="w-3 h-3" />
                        {r.unit_number}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {r.room_title} • Publicată pe {dateFmt(r.created_at)}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-4 h-4 ${
                        idx < r.rating_overall
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Sub-scores */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mb-3 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/70">
                <span>
                  Curățenie: <strong>{r.rating_cleanliness}/5</strong>
                </span>
                <span>•</span>
                <span>
                  Confort: <strong>{r.rating_comfort}/5</strong>
                </span>
                <span>•</span>
                <span>
                  Locație Plajă: <strong>{r.rating_location}/5</strong>
                </span>
                <span>•</span>
                <span>
                  Servicii & Gazdă: <strong>{r.rating_service}/5</strong>
                </span>
              </div>

              <p className="text-sm text-slate-800 leading-relaxed mb-4">„{r.comment}”</p>

              {r.admin_reply && (
                <div className="rounded-xl bg-[#0c192c]/5 border-l-4 border-l-[color:var(--color-accent)] p-3.5 mb-4">
                  <div className="text-xs font-bold text-[color:var(--color-primary)] mb-1">
                    Răspuns Oficial — Conducerea Vila Casa Esy
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{r.admin_reply}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[color:var(--color-border)]">
                <PrimaryButton
                  onClick={() => {
                    setReplyTarget(r);
                    setReplyText(r.admin_reply || "");
                  }}
                >
                  <MessageSquareReply className="w-4 h-4" />
                  {r.admin_reply ? "Editează Răspunsul Oficial" : "Răspunde Oficial"}
                </PrimaryButton>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleVisible(r)}
                    className="px-3 py-1.5 rounded-xl border border-[color:var(--color-border)] text-xs font-semibold text-slate-600 hover:bg-slate-50 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {r.is_visible ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> Ascunde
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" /> Afișează
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(r)}
                    className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Șterge recenzia"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Răspuns Oficial */}
      <Modal
        open={Boolean(replyTarget)}
        onClose={() => setReplyTarget(null)}
        title="Răspuns Oficial Vila Casa Esy"
        subtitle={
          replyTarget
            ? `Răspunzi recenziei lăsate de ${replyTarget.guest_name} (${replyTarget.booking_code || "Sejur Confirmat"})`
            : ""
        }
        footer={
          <>
            <GhostButton onClick={() => setReplyTarget(null)}>Anulează</GhostButton>
            <PrimaryButton disabled={savingReply} onClick={handleSaveReply}>
              {savingReply ? "Se salvează..." : "Publică Răspunsul Oficial"}
            </PrimaryButton>
          </>
        }
      >
        <Field label="Mesajul Oficial al Conducerii Vila Casa Esy">
          <Textarea
            rows={4}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Vă mulțumim din suflet pentru vizită și pentru cuvintele frumoase! Vă așteptăm cu drag și vara viitoare la Vila Casa Esy..."
          />
        </Field>
      </Modal>
    </div>
  );
}
