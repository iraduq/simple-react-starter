/**
 * broadcastSync.ts
 *
 * Motor nativ de sincronizare în timp real între taburile deschise ale aplicației.
 * Utilizează API-ul nativ BroadcastChannel din browser, dublat de fallback prin StorageEvent
 * și CustomEvents pentru comunicare inter-taburi și intra-taburi cu latență zero (0ms).
 */

export type SyncTopic =
  | "bookings"
  | "units"
  | "rooms"
  | "smartlocks"
  | "pricing"
  | "facilities"
  | "nomenclature"
  | "places"
  | "menu"
  | "users"
  | "audit"
  | "lost_found"
  | "analytics"
  | "all";

export interface SyncMessage {
  topics: SyncTopic[];
  path?: string;
  action?: string;
  timestamp: number;
  sourceTabId: string;
  payload?: any;
}

const CHANNEL_NAME = "casa-esy-realtime-bus-v1";
const STORAGE_KEY = "casa-esy-realtime-sync-fallback";

// Generează un ID unic pentru tabul curent
export const TAB_ID =
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `tab_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

// Instanță persistentă de BroadcastChannel (dacă este suportat de browser)
const broadcastChannel: BroadcastChannel | null =
  typeof window !== "undefined" && "BroadcastChannel" in window
    ? new BroadcastChannel(CHANNEL_NAME)
    : null;

const listeners = new Set<(msg: SyncMessage) => void>();

// Ascultător pentru mesaje sosite prin BroadcastChannel (de la alte taburi)
if (broadcastChannel) {
  broadcastChannel.onmessage = (event: MessageEvent<SyncMessage>) => {
    if (!event.data || event.data.sourceTabId === TAB_ID) return;
    notifyLocalListeners(event.data);
  };
}

// Fallback prin StorageEvent pentru browsere sau contexte izolate
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY || !e.newValue) return;
    try {
      const parsed: SyncMessage = JSON.parse(e.newValue);
      if (parsed.sourceTabId === TAB_ID) return;
      notifyLocalListeners(parsed);
    } catch {
      // ignore
    }
  });

  // Ascultător local pentru evenimente din același tab
  window.addEventListener("casa-esy-internal-mutation", (e: Event) => {
    const custom = e as CustomEvent<SyncMessage>;
    if (custom.detail) {
      notifyLocalListeners(custom.detail);
    }
  });
}

function notifyLocalListeners(msg: SyncMessage) {
  listeners.forEach((callback) => {
    try {
      callback(msg);
    } catch (err) {
      console.warn("[BroadcastSync] Listener error:", err);
    }
  });
}

/**
 * Înregistrează un callback pentru primirea oricărei notificări de sincronizare
 */
export function subscribeToBroadcastSync(
  callback: (msg: SyncMessage) => void
): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Detectează topicurile afectate pe baza URL-ului REST al mutației
 */
export function detectTopicsFromPath(path: string): SyncTopic[] {
  const p = (path || "").toLowerCase();

  if (p.includes("/rooms/facilities") || p.includes("/facilities")) {
    return ["nomenclature", "facilities", "rooms"];
  }
  if (p.includes("/rooms") && p.includes("/units")) {
    return ["units", "rooms", "smartlocks"];
  }
  if (p.includes("/rooms") && p.includes("/pricing-rules")) {
    return ["pricing", "rooms"];
  }
  if (p.includes("/rooms")) {
    return ["rooms", "units", "pricing", "bookings"];
  }
  if (p.includes("/bookings")) {
    return ["bookings", "units", "smartlocks", "audit", "analytics"];
  }
  if (p.includes("/lost-found") || p.includes("/lost_found")) {
    return ["lost_found"];
  }
  if (p.includes("/pricing")) {
    return ["pricing", "rooms"];
  }
  if (p.includes("/places")) {
    return ["places", "menu"];
  }
  if (p.includes("/menu")) {
    return ["menu", "places"];
  }
  if (p.includes("/users")) {
    return ["users", "audit"];
  }
  if (p.includes("/smartlocks") || p.includes("/smart_locks") || p.includes("/doors")) {
    return ["smartlocks", "units"];
  }
  if (p.includes("/analytics")) {
    return ["analytics"];
  }
  if (p.includes("/audit")) {
    return ["audit"];
  }

  return ["all"];
}

/**
 * Emite un eveniment de mutație către toate celelalte taburi și către tabul curent
 */
export function emitSyncMutation(
  topicsInput: SyncTopic | SyncTopic[] | string,
  meta?: { path?: string; action?: string; payload?: any }
): void {
  let topics: SyncTopic[] = [];
  if (Array.isArray(topicsInput)) {
    topics = topicsInput as SyncTopic[];
  } else if (typeof topicsInput === "string") {
    if (topicsInput.startsWith("/")) {
      topics = detectTopicsFromPath(topicsInput);
    } else {
      topics = [topicsInput as SyncTopic];
    }
  }

  const msg: SyncMessage = {
    topics,
    path: meta?.path,
    action: meta?.action,
    payload: meta?.payload,
    timestamp: Date.now(),
    sourceTabId: TAB_ID,
  };

  // 1. Trimite prin BroadcastChannel către toate celelalte taburi deschise
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(msg);
    } catch {
      // fallback handled below
    }
  }

  // 2. Trimite prin localStorage ca fallback garantat pentru toate ferestrele
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(msg));
    } catch {
      // ignore quota errors
    }

    // 3. Emite un CustomEvent intern în tabul curent
    try {
      window.dispatchEvent(
        new CustomEvent("casa-esy-internal-mutation", { detail: msg })
      );
    } catch {
      // ignore
    }
  }
}
