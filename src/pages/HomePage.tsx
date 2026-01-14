import React from "react";
import { Link } from "react-router-dom";
import { Container } from "../components/Container";
import { Badge } from "../components/Badge";
import { Input } from "../components/Input";
import { supabase } from "../lib/supabase";
import type { Event, Venue } from "../types";
import { isoToRu } from "../lib/format";

type Row = Event & { venues: Venue | null };

export function HomePage() {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [q, setQ] = React.useState("");
  const [from, setFrom] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [to, setTo] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });

  async function load() {
    setLoading(true);

    const fromIso = new Date(from + "T00:00:00").toISOString();
    const toIso = new Date(to + "T23:59:59").toISOString();

    let query = supabase
      .from("events")
      .select("id, venue_id, title, description, participants, start_at, poster_url, venues ( id, name, type, address )")
      .gte("start_at", fromIso)
      .lte("start_at", toIso)
      .order("start_at", { ascending: true });

    if (q.trim()) query = query.ilike("title", `%${q.trim()}%`);

    const { data, error } = await query;
    if (error) {
      console.error(error);
      setRows([]);
    } else {
      setRows((data ?? []) as Row[]);
    }

    setLoading(false);
  }

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container>
      <div className="py-10">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge>Афиша</Badge>
              <Badge>Фильтр по периоду</Badge>
              <Badge>Наличие билетов</Badge>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Мероприятия</h1>
            <p className="mt-2 text-sm text-slate-600">Выбирай событие, добавляй билеты в корзину и оформляй заказ.</p>
          </div>

          <div className="grid w-full gap-3 sm:max-w-xl sm:grid-cols-3">
            <Input label="Поиск" placeholder="Напр. концерт" value={q} onChange={(e) => setQ(e.target.value)} />
            <Input label="С" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <Input label="По" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            <button
              className="sm:col-span-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              onClick={load}
            >
              Показать
            </button>
          </div>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-5">Загрузка…</div>
          ) : rows.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-5">
              Ничего не найдено. Проверь период или добавь данные в админке.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((e) => (
                <Link
                  key={e.id}
                  to={`/event/${e.id}`}
                  className="group rounded-2xl border border-slate-100 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-sky-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-extrabold text-slate-900 group-hover:text-sky-700">{e.title}</div>
                      <div className="mt-1 text-xs text-slate-500">{isoToRu(e.start_at)}</div>
                    </div>
                    <span className="rounded-xl bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700">
                      {e.venues?.type ?? "—"}
                    </span>
                  </div>
                  <div className="mt-3 line-clamp-3 text-sm text-slate-700">{e.description}</div>
                  <div className="mt-3 text-xs text-slate-500">
                    {e.venues?.name ?? "—"} • {e.venues?.address ?? "—"}
                  </div>
                  <div className="mt-4 text-sm font-semibold text-sky-700">Открыть →</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
