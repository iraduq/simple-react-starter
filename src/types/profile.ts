import { User as UserIcon, Shield, CalendarCheck, TriangleAlert, FileText } from "lucide-react";

export type TabKey = "overview" | "personal" | "reservations" | "security" | "danger";

export interface Booking {
  id: string;
  room?: { title?: string } | null;
  check_in: string;
  check_out: string;
  status: string;
  total_price?: number | null;
  cancellation_reason?: string | null;
  booking_code?: string;
  unit_number?: string;
  payment_status?: string;
  access_pin?: string | null;
  self_checkin_completed_at?: string | null;
}

export interface SessionItem {
  id: string;
  browser_family?: string;
  browser_version?: string;
  os_family?: string;
  os_version?: string;
  device_type?: string;
  ip_address?: string;
  created_at?: string;
  is_current?: boolean;
}

export const PROFILE_TABS: {
  key: TabKey;
  label: string;
  icon: typeof UserIcon;
}[] = [
  {
    key: "overview",
    label: "Prezentare și sejur",
    icon: CalendarCheck,
  },
  {
    key: "personal",
    label: "Date personale",
    icon: UserIcon,
  },
  {
    key: "reservations",
    label: "Istoric și facturi",
    icon: FileText,
  },
  {
    key: "security",
    label: "Securitate și sesiuni",
    icon: Shield,
  },
  {
    key: "danger",
    label: "Zonă de siguranță cont",
    icon: TriangleAlert,
  },
];

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}
