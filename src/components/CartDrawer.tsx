import React from "react";
import { Link } from "react-router-dom";
import { useCart, cartTotals } from "../store/cart";
import { rub } from "../lib/format";
import { Button } from "./Button";

export function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { state, dispatch } = useCart();
  const totals = cartTotals(state.lines);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-soft">
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
          <div className="text-base font-bold">Корзина</div>
          <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="flex h-[calc(100%-64px)] flex-col">
          <div className="flex-1 overflow-auto p-4">
            {state.lines.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                Пусто. Добавь билеты из афиши.
              </div>
            ) : (
              <div className="space-y-3">
                {state.lines.map((l) => {
                  const key = `${l.event_id}::${l.seat_category_id}`;
                  return (
                    <div key={key} className="rounded-2xl border border-slate-100 bg-white p-3">
                      <div className="text-sm font-bold text-slate-900">{l.title}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {l.venue} • {l.when} • {l.category}
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-900">{rub(l.unit_price_cents)}</div>

                        <div className="flex items-center gap-2">
                          <button
                            className="h-9 w-9 rounded-xl border border-slate-200 hover:bg-slate-50"
                            onClick={() => dispatch({ type: "dec", key })}
                            aria-label="Уменьшить"
                          >
                            −
                          </button>
                          <div className="w-8 text-center text-sm font-bold">{l.qty}</div>
                          <button
                            className="h-9 w-9 rounded-xl border border-slate-200 hover:bg-slate-50"
                            onClick={() => dispatch({ type: "inc", key })}
                            aria-label="Увеличить"
                          >
                            +
                          </button>
                          <button
                            className="ml-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                            onClick={() => dispatch({ type: "remove", key })}
                          >
                            удалить
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">Итого:</div>
              <div className="text-lg font-extrabold text-slate-900">{rub(totals.total_cents)}</div>
            </div>

            <div className="mt-3 flex gap-2">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => dispatch({ type: "clear" })}
                disabled={state.lines.length === 0}
              >
                Очистить
              </Button>

              <Link
                to="/checkout"
                className={`flex-1 ${state.lines.length === 0 ? "pointer-events-none opacity-50" : ""}`}
                onClick={onClose}
              >
                <Button className="w-full">Оформить</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
