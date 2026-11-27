import { type CasaEsyLottieId } from "../../components/lottie/casaEsyLottieData";

export type CategoryFilter =
  | "all"
  | "room_service"
  | "bookings_payments"
  | "concierge_vip"
  | "operations_system";

export type StageBg = "white" | "slate" | "navy";

export const CATEGORY_TABS: Array<{ id: CategoryFilter; label: string; count: number }> = [
  { id: "all", label: "Toate Animațiile", count: 16 },
  { id: "room_service", label: "Room Service Live", count: 4 },
  { id: "bookings_payments", label: "Rezervări & Plăți", count: 4 },
  { id: "concierge_vip", label: "Concierge & VIP", count: 4 },
  { id: "operations_system", label: "Operațiuni & Sistem", count: 4 },
];

export const ROOM_SERVICE_STEPS: Array<{
  id: CasaEsyLottieId;
  num: string;
  title: string;
  subtitle: string;
}> = [
  {
    id: "order-registered",
    num: "01",
    title: "Înregistrată",
    subtitle: "Preluată în bucătărie",
  },
  {
    id: "order-preparing",
    num: "02",
    title: "În Preparare",
    subtitle: "Gătită proaspăt acum",
  },
  {
    id: "order-delivering",
    num: "03",
    title: "Pe Drum",
    subtitle: "Ospătarul se apropie",
  },
  {
    id: "order-delivered",
    num: "04",
    title: "Livrată",
    subtitle: "Predată · Poftă bună",
  },
];
