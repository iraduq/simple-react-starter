import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { searchAvailability } from "../services/roomsService";
import { getRoomPricing } from "../services/pricingService";
import { httpErrorMessage } from "../services/apiClient";
import { useToast } from "../components/Toast";
import { useAdminLiveSync } from "../context/AdminLiveSyncContext";
import { toISODate } from "../lib/format";
import { mapRoom, type ApiRoom, type DisplayRoom } from "../types/roomsPage";

export function useRoomsData(
  checkIn: string,
  checkOut: string,
  adults: number,
  children: number,
  setActiveTab: (tab: string) => void,
) {
  const { toast } = useToast();
  const [, setParams] = useSearchParams();

  const [allRooms, setAllRooms] = useState<DisplayRoom[]>([]);
  const [results, setResults] = useState<DisplayRoom[] | null>(null);
  const [searched, setSearched] = useState<{ in: string; out: string; guests: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewsSummary, setReviewsSummary] = useState<Record<string, { average: number; count: number }>>({});

  const loadReviewsSummary = async () => {
    try {
      const summary = await apiFetch<Record<string, { average: number; count: number }>>("/reviews/summary");
      if (summary && typeof summary === "object") setReviewsSummary(summary);
    } catch {}
  };

  const loadAllRooms = async () => {
    try {
      const data = await apiFetch<unknown>("/rooms");
      const arr = Array.isArray(data) ? (data as ApiRoom[]) : ((data as { items?: ApiRoom[] })?.items ?? []);
      const activeRaw = arr.filter((r) => r.is_active !== false);
      const mapped = activeRaw.map(mapRoom);
      setAllRooms(mapped);

      const missingDynamic = activeRaw.filter((r) => r.price_per_night == null);
      if (missingDynamic.length > 0) {
        const now = new Date();
        const todayIso = toISODate(now);
        const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
        const quotes = await Promise.allSettled(missingDynamic.map((r) => getRoomPricing(String(r.id), todayIso, toISODate(tomorrow), "flexible", 2, 0)));
        const dynamicById = new Map<string, number>();
        quotes.forEach((res, idx) => {
          if (res.status === "fulfilled" && res.value && res.value.nights > 0) {
            dynamicById.set(String(missingDynamic[idx].id), Math.round(res.value.subtotal / res.value.nights));
          }
        });
        if (dynamicById.size > 0) {
          setAllRooms((prev) => prev.map((item) => {
            const dyn = dynamicById.get(String(item.id));
            return dyn != null ? { ...item, price: dyn } : item;
          }));
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nu am putut încărca camerele.");
    } finally {
      setLoading(false);
    }
  };

  const runSearch = async (ci: string, co: string, ad: number, ch: number, silent = false) => {
    if (!ci || !co) return;
    if (!silent) setSearching(true);
    try {
      const res = await searchAvailability({ check_in: ci, check_out: co, adults: ad, children: ch, sort_by: "price" });
      const mapped = (res as any[]).map((r) => {
        const base = allRooms.find((a) => String(a.id) === String(r.id));
        const m = mapRoom(r as ApiRoom);
        return base ? { ...base, price: m.price || base.price, total: m.total } : m;
      });
      setResults(mapped);
      setSearched({ in: ci, out: co, guests: ad + ch });
      setActiveTab("Toate");
    } catch (err) {
      if (!silent) toast(httpErrorMessage(err, "Căutarea a eșuat."), "error");
    } finally {
      if (!silent) setSearching(false);
    }
  };

  useAdminLiveSync({
    topic: "all",
    onSync: () => {
      void loadAllRooms();
      void loadReviewsSummary();
      if (searched?.in && searched?.out) void runSearch(searched.in, searched.out, adults, children, true);
    },
  });

  useEffect(() => {
    void loadAllRooms();
    void loadReviewsSummary();
  }, []);

  const autoRan = useRef(false);
  useEffect(() => {
    if (loading || autoRan.current || !checkIn || !checkOut) return;
    autoRan.current = true;
    void runSearch(checkIn, checkOut, adults, children);
  }, [loading]);

  const clearSearch = () => {
    setResults(null);
    setSearched(null);
    setParams({}, { replace: true });
  };

  return {
    allRooms,
    results,
    searched,
    loading,
    searching,
    error,
    reviewsSummary,
    loadReviewsSummary,
    clearSearch,
  };
}
