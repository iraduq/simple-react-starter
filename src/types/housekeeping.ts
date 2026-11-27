import type { HousekeepingUnit } from "../services/housekeepingService";
import type { SessionUser } from "../lib/auth";

export const STAFF_ROLES_ALLOWED = new Set([
  "admin",
  "menajera",
  "manajera",
  "intretinere",
  "receptionist",
]);

export const isHousekeepingStaff = (u: NonNullable<SessionUser>) =>
  STAFF_ROLES_ALLOWED.has((u.role || "").toLowerCase().trim());

export const unitId = (u: HousekeepingUnit) => u.id || u.unit_id || "";
export const roomTitle = (u: HousekeepingUnit) => u.room_title || u.title || "Cameră";
export const unitNumber = (u: HousekeepingUnit) =>
  u.unit_number || u.number || u.code || "—";

export const extractFloor = (u: HousekeepingUnit) => {
  if (typeof u.floor === "number" && u.floor > 0) return u.floor;
  const digits = unitNumber(u).replace(/\D/g, "");
  if (digits.length >= 3) return Number(digits[0]) || 1;
  return 1;
};

export const normalizedCleanState = (u: HousekeepingUnit) => {
  if (u.status === "maintenance") return "maintenance";
  if (u.clean_status === "inspecting") return "inspecting";
  if (u.status === "cleaning" || u.clean_status === "dirty") return "dirty";
  return "clean";
};

export type CleanState = ReturnType<typeof normalizedCleanState>;

export const stateMeta = (
  state: ReturnType<typeof normalizedCleanState>,
): { label: string; tone: "green" | "gold" | "red" | "navy" | "muted" } => {
  switch (state) {
    case "clean":
      return { label: "Curată & Pregătită", tone: "green" };
    case "inspecting":
      return { label: "În Inspecție", tone: "navy" };
    case "maintenance":
      return { label: "În Mentenanță", tone: "red" };
    default:
      return { label: "Necesită Curățenie", tone: "gold" };
  }
};

export const formatShortDate = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ro-RO", { day: "2-digit", month: "short" });
};

export const ROLE_TITLES: Record<string, { eyebrow: string; heading: string; badge: string }> = {
  admin: {
    eyebrow: "Operare & Supervizare Generală",
    heading: "Panou Housekeeping & Camere",
    badge: "Administrator",
  },
  menajera: {
    eyebrow: "Operațiuni Housekeeping · Vila Casa Esy",
    heading: "Portal Cameriste & Igienizare",
    badge: "Echipa Housekeeping",
  },
  manajera: {
    eyebrow: "Operațiuni Housekeeping · Vila Casa Esy",
    heading: "Portal Cameriste & Igienizare",
    badge: "Echipa Housekeeping",
  },
  intretinere: {
    eyebrow: "Intervenții & Pregătire Unități",
    heading: "Status Camere & Tehnic",
    badge: "Echipa Întreținere",
  },
  receptionist: {
    eyebrow: "Front Desk & Coordonare Sosiri",
    heading: "Situație Camere & Curățenie",
    badge: "Recepție",
  },
};

export const EASE = [0.22, 1, 0.36, 1] as const;

export type PortalSection = "rooms" | "maintenance" | "lost_found" | "breakfast";
