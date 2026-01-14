import React from "react";
import { Link, useParams } from "react-router-dom";
import { Container } from "../components/Container";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { supabase } from "../lib/supabase";
import { isoToRu, rub } from "../lib/format";
import type { Event, Venue, SeatCategory } from "../types";
import { useCart } from "../store/cart";

type FullEvent = Event & { venues: Venue | null };
type Row = {
  seat_categories: SeatCategory;
  price_cents: number;
  total_qty: number;
  sold_qty: number;
};

export function EventPage() {
  const { id } = useParams();
  const { dispatch } = useCart();

  const [event, setEvent] = React.useState<FullEvent | null>(null);
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);

  async function load() {
    if (!id) return;
    setLoading(true);

    const { data: e, error: eErr } = await supabase
      .from("events")
      .select("id, venue_id, title, description, participants, start_at, poster_url, venues ( id, name, type, address )")
      .eq("id", id)
      .maybeSingle();

    if (eErr) {
      console.error(eErr);
      setEvent(null);
    } else {
      setEvent((e as FullEvent) ?? null);
    }

    // prices + inventory + category names
    const { data, error } = await supabase
      .from("event_view_pricing")
      .select("seat_categories ( id, name, description ), price_cents, total_qty, sold_qty")
      .eq("event_id", id)
      .order("price_cents", { ascending: true });

    if (error) {
      console.error(error);
      setRows([]);
    } else {
      setRows((data ?? []) as any);
    }

    setLoading(false);
  }

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <Container>
        <div className="py-10">
          <div className="rounded-2xl border border-slate-100 bg-white p-5">Загрузка…</div>
        </div>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container>
        <div className="py-10">
          <div className="rounded-2xl border border-slate-100 bg-white p-5">
            Мероприятие не найдено. <Link to="/" className="text-sky-700">Вернуться к афише</Link>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-10">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Badge>{event.venues?.type ?? "—"}</Badge>
          <Badge>{event.venues?.name ?? "—"}</Badge>
          <Badge>{isoToRu(event.start_at)}</Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{event.title}</h1>
            <div className="mt-2 text-sm text-slate-600">{event.venues?.address ?? ""}</div>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
              <div className="text-sm font-bold text-slate-900">Кратко</div>
              <div className="mt-2 text-sm text-slate-700">{event.description}</div>

              <div className="mt-4 text-sm font-bold text-slate-900">Основные участники</div>
              <div className="mt-2 text-sm text-slate-700">{event.participants || "—"}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
            <div className="text-base font-extrabold text-slate-900">Билеты</div>
            <div className="mt-1 text-xs text-slate-500">Цена зависит от места</div>

            <div className="mt-4 space-y-3">
              {rows.length === 0 ? (
                <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                  Пока нет цен/остатков. Добавь в админке.
                </div>
              ) : (
                rows.map((r) => {
                  const available = Math.max(0, r.total_qty - r.sold_qty);
                  const disabled = available <= 0;

                  return (
                    <div key={r.seat_categories.id} className="rounded-2xl border border-slate-100 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-bold text-slate-900">{r.seat_categories.name}</div>
                          <div className="mt-1 text-xs text-slate-500">{r.seat_categories.description}</div>
                        </div>
                        <div className="text-sm font-extrabold text-slate-900">{rub(r.price_cents)}</div>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-xs text-slate-600">
                          Доступно: <span className="font-bold text-slate-900">{available}</span>
                        </div>
                        <Button
                          onClick={() =>
                            dispatch({
                              type: "add",
                              qty: 1,
                              line: {
                                event_id: event.id,
                                seat_category_id: r.seat_categories.id,
                                title: event.title,
                                venue: event.venues?.name ?? "—",
                                when: isoToRu(event.start_at),
                                category: r.seat_categories.name,
                                unit_price_cents: r.price_cents,
                              },
                            })
                          }
                          disabled={disabled}
                        >
                          {disabled ? "Нет" : "В корзину"}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4">
              <Link to="/checkout">
                <Button className="w-full">Перейти к оформлению</Button>
              </Link>
            </div>

            <div className="mt-3 text-xs text-slate-500">
              Примечание: списание остатков выполняется в базе через функцию <code>place_order()</code>.
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
