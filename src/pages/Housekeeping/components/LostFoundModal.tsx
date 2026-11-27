import { Modal, Field, Select, TextInput, Textarea, Button } from "../../../components/admin/ui";
import type { HousekeepingUnit } from "../../../services/housekeepingService";
import { roomTitle, unitNumber } from "../types";

export interface LostFormState {
  item_name: string;
  category: string;
  storage_location: string;
  description: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  booking_id: string;
}

interface LostFoundModalProps {
  unit: HousekeepingUnit | null;
  form: LostFormState;
  setForm: (f: LostFormState) => void;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function LostFoundModal({
  unit,
  form,
  setForm,
  submitting,
  onClose,
  onSubmit,
}: LostFoundModalProps) {
  return (
    <Modal
      open={Boolean(unit)}
      title={`Obiect găsit · Camera ${unit ? unitNumber(unit) : ""}`}
      subtitle={unit ? `${roomTitle(unit)} · Se salvează direct în registrul recepției` : undefined}
      onClose={onClose}
      width="max-w-lg"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Ce obiect a fost găsit?">
            <TextInput
              required
              value={form.item_name}
              onChange={(e) => setForm({ ...form, item_name: e.target.value })}
              placeholder="Ex: Încărcător Apple / Ochelari"
            />
          </Field>
          <Field label="Categorie">
            <Select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="electronice">Electronice & Gadgeturi</option>
              <option value="bijuterii">Bijuterii & Valori</option>
              <option value="haine">Îmbrăcăminte & Accesorii</option>
              <option value="acte_bani">Documente & Portofele</option>
              <option value="altele">Alte Obiecte</option>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Unde a fost depozitat?">
            <TextInput
              value={form.storage_location}
              onChange={(e) => setForm({ ...form, storage_location: e.target.value })}
              placeholder="Seif Recepție / Depozit Etaj"
            />
          </Field>
          <Field label="Oaspete asociat (auto-sugerat)">
            <TextInput
              value={form.guest_name}
              onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
              placeholder="Nume oaspete (opțional)"
            />
          </Field>
        </div>

        <Field label="Detalii / locul din cameră">
          <Textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Ex: Găsit sub noptiera din dreapta la curățenia de check-out."
          />
        </Field>

        <div className="flex justify-end gap-2 border-t border-[#eef2f7] pt-4">
          <Button variant="ghost" onClick={onClose}>
            Renunță
          </Button>
          <Button type="submit" variant="gold" disabled={submitting}>
            {submitting ? "Se înregistrează…" : "Înregistrează în Lost & Found"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
