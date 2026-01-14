import React from "react";
import type { CartLine } from "../types";

type CartState = { lines: CartLine[] };
type CartAction =
  | { type: "add"; line: Omit<CartLine, "qty">; qty: number }
  | { type: "inc"; key: string }
  | { type: "dec"; key: string }
  | { type: "remove"; key: string }
  | { type: "clear" };

const LS_KEY = "osu_cart_v1";

function keyOf(l: Pick<CartLine, "event_id" | "seat_category_id">) {
  return `${l.event_id}::${l.seat_category_id}`;
}

function reducer(state: CartState, action: CartAction): CartState {
  const copy = [...state.lines];

  const persist = (lines: CartLine[]) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(lines));
    } catch {}
    return { lines };
  };

  if (action.type === "clear") return persist([]);

  if (action.type === "add") {
    const k = keyOf(action.line);
    const idx = copy.findIndex((x) => keyOf(x) === k);
    if (idx >= 0) copy[idx] = { ...copy[idx], qty: copy[idx].qty + action.qty };
    else copy.push({ ...action.line, qty: action.qty });
    return persist(copy);
  }

  const idx = copy.findIndex((x) => keyOf(x) === action.key);
  if (idx < 0) return state;

  if (action.type === "inc") {
    copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
    return persist(copy);
  }

  if (action.type === "dec") {
    const next = copy[idx].qty - 1;
    if (next <= 0) copy.splice(idx, 1);
    else copy[idx] = { ...copy[idx], qty: next };
    return persist(copy);
  }

  if (action.type === "remove") {
    copy.splice(idx, 1);
    return persist(copy);
  }

  return state;
}

function loadInitial(): CartState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { lines: [] };
    const lines = JSON.parse(raw) as CartLine[];
    if (!Array.isArray(lines)) return { lines: [] };
    return { lines };
  } catch {
    return { lines: [] };
  }
}

const CartCtx = React.createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

export function CartProvider(props: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, undefined, loadInitial);
  return <CartCtx.Provider value={{ state, dispatch }}>{props.children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export function cartTotals(lines: CartLine[]) {
  const items = lines.reduce((s, l) => s + l.qty, 0);
  const total_cents = lines.reduce((s, l) => s + l.qty * l.unit_price_cents, 0);
  return { items, total_cents };
}
