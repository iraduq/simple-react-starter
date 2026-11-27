import { Modal, Field, Select, TextInput, Textarea, Button } from "../../../components/admin/ui";
import type { HousekeepingUnit } from "../../../services/housekeepingService";
import { extractFloor, roomTitle, unitNumber } from "../types";

export interface TicketFormState {
  category: string;
  priority: string;
  title: string;
  description: string;
  setMaintenanceStatus: boolean;
}

interface MaintenanceTicketModalProps {
  unit: HousekeepingUnit | null;
  form: TicketFormState;
  setForm: (f: TicketFormState) => void;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function MaintenanceTicketModal({
  unit,
  form,
  setForm,
  submitting,
  onClose,
  onSubmit,
}: MaintenanceTicketModalProps) {
  return (
    <Modal
      open={Boolean(unit)}
      title={`Raportează defecțiune · Camera ${unit ? unitNumber(unit) : ""}`}
      subtitle={unit ? `${roomTitle(unit)} · Etajul ${extractFloor(unit)}` : undefined}
      onClose={onClose}
      width="max-w-lg"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Categorie problemă">
            <Select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="instalatii">Instalații sanitare / Apă</option>
              <option value="ac">Aer condiționat / Încălzire</option>
              <option value="electric">Instalație electrică / Lumini</option>
              <option value="tv">Televizor / Smart Lock / Wi-Fi</option>
              <option value="mobilier">Mobilier / Uși / Ferestre</option>
              <option value="curatenie">Igienizare specială</option>
              <option value="altele">Altă problemă tehnică</option>
            </Select>
          </Field>
          <Field label="Prioritate">
            <Select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="normal">Normală (SLA standard)</option>
              <option value="urgent">Urgentă (intervenție imediată)</option>
            </Select>
          </Field>
        </div>

        <Field label="Titlu scurt defecțiune">
          <TextInput
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Ex: Baterie lavoar slăbită / AC nu răcește"
          />
        </Field>

        <Field label="Detalii pentru echipa de întreținere">
          <Textarea
            required
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Descrie exact ce ai observat în cameră…"
          />
        </Field>

        <label className="flex items-center gap-3 rounded-xl border border-[#e1e8f0] bg-[#f9f7f2] px-4 py-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.setMaintenanceStatus}
            onChange={(e) =>
              setForm({ ...form, setMaintenanceStatus: e.target.checked })
            }
            className="h-4 w-4 accent-[#8c2f39]"
          />
          <span className="text-[12.5px] font-medium text-[#0d2c5c]">
            Trece automat camera în status <strong>„În Mentenanță”</strong> până la remediere
          </span>
        </label>

        <div className="flex justify-end gap-2 border-t border-[#eef2f7] pt-4">
          <Button variant="ghost" onClick={onClose}>
            Renunță
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Se trimite…" : "Trimite la Întreținere"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
