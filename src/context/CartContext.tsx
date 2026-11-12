import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "../lib/api";
import { hasStoredAuth } from "../lib/token";

export interface CartLine {
  id: string;
  title: string;
  price: number;
  image_url?: string | null;
  qty: number;
}

type CartMap = Record<string, CartLine>;

const CART_STORAGE_KEY = "casa_esy_room_service_cart";
const SESSION_CHANGED_EVENT = "auth-session-changed";

function loadStoredCart(): CartMap {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const valid: CartMap = {};
    for (const [key, item] of Object.entries(parsed)) {
      const line = item as Partial<CartLine> | null;
      if (
        line &&
        typeof line.id === "string" &&
        typeof line.title === "string" &&
        typeof line.price === "number" &&
        typeof line.qty === "number" &&
        line.qty > 0
      ) {
        valid[key] = {
          id: line.id,
          title: line.title,
          price: line.price,
          image_url: line.image_url ?? null,
          qty: line.qty,
        };
      }
    }
    return valid;
  } catch {
    return {};
  }
}

function saveStoredCart(cart: CartMap) {
  try {
    if (Object.keys(cart).length === 0) {
      localStorage.removeItem(CART_STORAGE_KEY);
    } else {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  } catch {
    // Ignore storage quota or private-mode errors
  }
}

function arrayToCartMap(items: CartLine[]): CartMap {
  const map: CartMap = {};
  for (const item of items) {
    if (item && item.id && item.qty > 0) {
      map[String(item.id)] = {
        id: String(item.id),
        title: item.title,
        price: Number(item.price || 0),
        image_url: item.image_url ?? null,
        qty: Number(item.qty),
      };
    }
  }
  return map;
}

interface CartContextValue {
  cart: CartMap;
  cartLines: CartLine[];
  totalCount: number;
  subtotalAmount: number;
  addItem: (item: {
    id: number | string;
    title: string;
    price: number | string;
    image_url?: string | null;
  }) => void;
  decItem: (id: number | string) => void;
  removeItem: (id: number | string) => void;
  clearCart: (options?: { skipServer?: boolean }) => void;
  refreshCartFromServer: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartMap>(() =>
    hasStoredAuth() ? {} : loadStoredCart(),
  );
  const syncTimerRef = useRef<number | null>(null);
  const syncSeqRef = useRef(0);

  const refreshCartFromServer = useCallback(async () => {
    if (!hasStoredAuth()) {
      setCart(loadStoredCart());
      return;
    }

    const guestCart = loadStoredCart();
    const guestItems = Object.values(guestCart).map((l) => ({
      id: l.id,
      qty: l.qty,
    }));

    try {
      const res =
        guestItems.length > 0
          ? await apiFetch<{ items: CartLine[] }>("/orders/cart/merge", {
              method: "POST",
              body: JSON.stringify({ items: guestItems }),
            })
          : await apiFetch<{ items: CartLine[] }>("/orders/cart");

      if (guestItems.length > 0) {
        saveStoredCart({});
      }
      setCart(arrayToCartMap(res?.items || []));
    } catch {
      // Fallback gracefully if user token expired or network temporarily failed
      if (guestItems.length > 0) {
        setCart(guestCart);
      }
    }
  }, []);

  useEffect(() => {
    void refreshCartFromServer();

    const onSessionChange = () => {
      void refreshCartFromServer();
    };
    window.addEventListener(SESSION_CHANGED_EVENT, onSessionChange);
    return () => {
      window.removeEventListener(SESSION_CHANGED_EVENT, onSessionChange);
    };
  }, [refreshCartFromServer]);

  const scheduleServerSync = useCallback((nextCart: CartMap) => {
    if (!hasStoredAuth()) {
      saveStoredCart(nextCart);
      return;
    }

    if (syncTimerRef.current) {
      window.clearTimeout(syncTimerRef.current);
    }
    const seq = ++syncSeqRef.current;
    const payloadItems = Object.values(nextCart).map((l) => ({
      id: l.id,
      qty: l.qty,
    }));

    syncTimerRef.current = window.setTimeout(async () => {
      try {
        const res = await apiFetch<{ items: CartLine[] }>("/orders/cart", {
          method: "PUT",
          body: JSON.stringify({ items: payloadItems }),
        });
        if (seq === syncSeqRef.current) {
          setCart(arrayToCartMap(res?.items || []));
        }
      } catch {
        // Keep optimistic state if sync fails temporarily
      }
    }, 220);
  }, []);

  const addItem = useCallback(
    (it: {
      id: number | string;
      title: string;
      price: number | string;
      image_url?: string | null;
    }) => {
      const k = String(it.id);
      setCart((prev) => {
        const existing = prev[k];
        const next: CartMap = {
          ...prev,
          [k]: {
            id: k,
            title: it.title,
            price: Number(it.price || 0),
            image_url: it.image_url,
            qty: existing ? existing.qty + 1 : 1,
          },
        };
        scheduleServerSync(next);
        return next;
      });
    },
    [scheduleServerSync],
  );

  const decItem = useCallback(
    (id: number | string) => {
      const k = String(id);
      setCart((prev) => {
        const existing = prev[k];
        if (!existing) return prev;
        let next: CartMap;
        if (existing.qty <= 1) {
          next = { ...prev };
          delete next[k];
        } else {
          next = { ...prev, [k]: { ...existing, qty: existing.qty - 1 } };
        }
        scheduleServerSync(next);
        return next;
      });
    },
    [scheduleServerSync],
  );

  const removeItem = useCallback(
    (id: number | string) => {
      const k = String(id);
      setCart((prev) => {
        if (!prev[k]) return prev;
        const next = { ...prev };
        delete next[k];
        scheduleServerSync(next);
        return next;
      });
    },
    [scheduleServerSync],
  );

  const clearCart = useCallback((options?: { skipServer?: boolean }) => {
    if (syncTimerRef.current) {
      window.clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }
    syncSeqRef.current++;
    setCart({});
    saveStoredCart({});
    if (hasStoredAuth() && !options?.skipServer) {
      void apiFetch("/orders/cart", { method: "DELETE" }).catch(() => {});
    }
  }, []);

  const cartLines = Object.values(cart);
  const totalCount = cartLines.reduce((acc, l) => acc + l.qty, 0);
  const subtotalAmount =
    Math.round(cartLines.reduce((acc, l) => acc + l.price * l.qty, 0) * 100) / 100;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartLines,
        totalCount,
        subtotalAmount,
        addItem,
        decItem,
        removeItem,
        clearCart,
        refreshCartFromServer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart trebuie folosit în interiorul CartProvider.");
  }
  return ctx;
}
