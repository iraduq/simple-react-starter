import { Clock, ChefHat, Bell, CheckCircle2 } from "lucide-react";
import type { CasaEsyLottieId } from "../../components/lottie/casaEsyLottieData";

export interface OrderItem {
  id: string;
  title: string;
  qty: number;
  price: number;
}

export interface OrderData {
  id: number;
  order_code: string;
  location_type: string;
  location_label: string;
  items: OrderItem[];
  subtotal_amount?: number | null;
  discount_percent?: number | null;
  discount_amount?: number | null;
  discount_reason?: string | null;
  vip_tier?: string | null;
  total_amount: number;
  payment_method: string;
  payment_status?: string;
  booking_code?: string | null;
  notes?: string;
  status: string;
  created_at: string;
}

export const STEPS: Array<{
  key: string;
  title: string;
  subtitle: string;
  icon: typeof Clock;
  lottieId: CasaEsyLottieId;
}> = [
  {
    key: "new",
    title: "Înregistrată",
    subtitle: "Preluată în bucătărie",
    icon: Clock,
    lottieId: "order-registered",
  },
  {
    key: "preparing",
    title: "În Preparare",
    subtitle: "Gătită proaspăt acum",
    icon: ChefHat,
    lottieId: "order-preparing",
  },
  {
    key: "ready",
    title: "Pe Drum",
    subtitle: "Ospătarul se apropie",
    icon: Bell,
    lottieId: "order-delivering",
  },
  {
    key: "delivered",
    title: "Livrată",
    subtitle: "Predată · Poftă bună!",
    icon: CheckCircle2,
    lottieId: "order-delivered",
  },
];

export const lei = (n: number) => `${Number(n || 0).toFixed(0)} Lei`;

export function parseLocationDisplay(rawLabel?: string): {
  primary: string;
  secondary: string | null;
} {
  if (!rawLabel) return { primary: "Camera ta", secondary: null };
  const cleaned = rawLabel.replace(/\s*\(#[A-Za-z0-9-]+\)\s*$/, "").trim();
  const parts = cleaned.split("·").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { primary: parts[0], secondary: parts.slice(1).join(" · ") };
  }
  return { primary: cleaned, secondary: null };
}

export function formatOrderTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
}
