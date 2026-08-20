import { useState } from "react";
import { Modal, Button, Field, inputCls } from "./ui";
import { useToast } from "../Toast";
import { createOverride } from "../../services/pricingService";
import { httpErrorMessage } from "../../services/apiClient";
import type { Nomenclature } from "../../types/rooms";

/** POST /api/pricing/override */
export default function PricingOverrideModal({
  open,
  onClose,
  onSuccess,
  roomTypes,
  defaultRoomTypeId,
  defaultDate,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  roomTypes: Nomenclature[];
  defaultRoomTypeId?: number | string | null;
  defaultDate?: string;
}) {
  const { toast } = useToast();
  const [roomTypeId, setRoomTypeId] = useState(String(defaultRoomTypeId ?? roomTypes[0]?.id ?? ""));
  const [startDate, setStartDate] = useState(defaultDate ?? "");
  const [endDate, setEndDate] = useState(defaultDate ?? "");
  const [price, setPrice] = useState("");
  const [reason, setReason] = useState("");
  const [expiry, setExpiry] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const submit = async () => {
    setError(null);
    const fixed = Number(price);
    if (!roomTypeId) return setError("Alege tipul de cameră.");
    if (!startDate || !endDate) return setError("Completează perioada.");
    if (endDate < startDate) return setError("Data de sfârșit trebuie să fie ≥ data de început.");
    if (!Number.isFinite(fixed) || fixed <= 0) return setError("Prețul trebuie să fie un număr pozitiv.");
    if (reason.trim().length < 3) return setError("Motivul trebuie să aibă minimum 3 caractere.");

    setSaving(true);
    try {
      await createOverride({
        room_type_id: roomTypeId,
        start_date: startDate,
        end_date: endDate,
        fixed_price: fixed,
        reason: reason.trim(),
        expires_at: expiry || null,
      });
      toast("Override salvat.", "success");
      onClose();
      onSuccess();
    } catch (e) {
      setError(httpErrorMessage(e, "Override-ul nu a putut fi salvat."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Override manual de preț">
      <div className="space-y-4">
        <Field label="Tip cameră">
          <select value={roomTypeId} onChange={(e) => setRoomTypeId(e.target.value)} className={inputCls}>
            <option value="">Alege…</option>
            {roomTypes.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Start">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Sfârșit">
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Preț fix (RON)">
            <input
              type="number"
              min={1}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Expiră la (opțional)">
            <input
              type="datetime-local"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Motiv">
          <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} className={inputCls} />
        </Field>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Anulează
          </Button>
          <Button variant="primary" onClick={() => void submit()} disabled={saving}>
            {saving ? "Se salvează…" : "Salvează override"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
