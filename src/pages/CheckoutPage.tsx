import React from "react";
import { Container } from "../components/Container";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { useCart, cartTotals } from "../store/cart";
import { rub } from "../lib/format";
import { supabase } from "../lib/supabase";
import type { OrderDraft } from "../types";

function normalizePhone(s: string) {
  return s.replace(/\D/g, "");
}

export function CheckoutPage() {
  const { state, dispatch } = useCart();
  const totals = cartTotals(state.lines);

  const [delivery, setDelivery] = React.useState(true);
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");

  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{ ok: boolean; message: string } | null>(null);

  const canSubmit =
    state.lines.length > 0 &&
    (!delivery || (fullName.trim() && normalizePhone(phone).length >= 10 && address.trim()));

  async function submit() {
    if (!canSubmit) return;

    setSubmitting(true);
    setResult(null);

    const draft: OrderDraft = {
      delivery_required: delivery,
      customer: { full_name: fullName.trim(), phone: normalizePhone(phone), address: address.trim() },
      items: state.lines.map((l) => ({
        event_id: l.event_id,
        seat_category_id: l.seat_category_id,
        qty: l.qty,
      })),
    };

    const { data, error } = await supabase.rpc("place_order", {
      p_delivery_required: draft.delivery_required,
      p_customer: draft.customer,
      p_items: draft.items,
    });

    if (error) {
      console.error(error);
      setResult({ ok: false, message: error.message });
    } else {
      dispatch({ type: "clear" });
      setResult({ ok: true, message: `Заказ принят! Номер: ${data}` });
    }

    setSubmitting(false);
  }

  return (
    <Container>
      <div className="py-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Оформление заказа</h1>
        <p className="mt-2 text-sm text-slate-600">Проверь корзину и заполни данные для доставки (если нужно).</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-slate-900">Доставка</div>
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={delivery} onChange={(e) => setDelivery(e.target.checked)} />
                Нужна доставка
              </label>
            </div>

            <div className={`mt-4 grid gap-4 sm:grid-cols-2 ${delivery ? "" : "opacity-50"}`}>
              <Input
                label="ФИО"
                placeholder="Иванов Иван Иванович"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!delivery}
              />
              <Input
                label="Телефон"
                placeholder="+7 999 123-45-67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!delivery}
                hint="Можно без пробелов — мы нормализуем."
              />
              <div className="sm:col-span-2">
                <Input
                  label="Адрес"
                  placeholder="г. …, ул. …, дом …, кв …"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={!delivery}
                />
              </div>
            </div>

            <div className="mt-6">
              <Button onClick={submit} disabled={!canSubmit || submitting} className="w-full">
                {submitting ? "Отправка…" : `Подтвердить и оплатить (условно) • ${rub(totals.total_cents)}`}
              </Button>
              <div className="mt-2 text-xs text-slate-500">
                Для учебного проекта: оплата считается условной, но заказ фиксируется в БД и списывает остатки.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
            <div className="text-sm font-bold text-slate-900">Состав заказа</div>
            <div className="mt-3 space-y-3">
              {state.lines.length === 0 ? (
                <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">Корзина пустая.</div>
              ) : (
                state.lines.map((l) => (
                  <div key={`${l.event_id}::${l.seat_category_id}`} className="rounded-2xl border border-slate-100 p-3">
                    <div className="text-sm font-bold text-slate-900">{l.title}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {l.category} • {l.when}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <div className="text-slate-600">
                        {l.qty} × {rub(l.unit_price_cents)}
                      </div>
                      <div className="font-extrabold text-slate-900">{rub(l.qty * l.unit_price_cents)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="text-sm text-slate-600">Итого</div>
              <div className="text-lg font-extrabold text-slate-900">{rub(totals.total_cents)}</div>
            </div>
          </div>
        </div>

        <Modal open={!!result} title={result?.ok ? "Готово" : "Ошибка"} onClose={() => setResult(null)}>
          <div className="text-sm text-slate-700">{result?.message}</div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setResult(null)}>Закрыть</Button>
          </div>
        </Modal>
      </div>
    </Container>
  );
}
