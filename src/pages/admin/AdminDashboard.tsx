import React from "react";
import { supabase } from "../../lib/supabase";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Textarea } from "../../components/Textarea";
import { rub, isoToRu } from "../../lib/format";

type Tab = "events" | "venues" | "inventory" | "orders";

export function AdminDashboard({ tab = "orders" as Tab }: { tab?: Tab }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
        {tab === "events" ? <Events /> : tab === "venues" ? <Venues /> : tab === "inventory" ? <Inventory /> : <Orders />}
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
        <div className="text-sm font-bold text-slate-900">Подсказка</div>
        <div className="mt-2 text-sm text-slate-700">
          Если CRUD ругается — значит ты не в таблице <b>admins</b>. Добавь свой <code>auth.uid</code> в <code>public.admins</code>.
        </div>
        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          SQL пример:
          <pre className="mt-2 whitespace-pre-wrap break-words">
            insert into public.admins (user_id) values ('&lt;uid&gt;');
          </pre>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Events ---------------- */

type EventRow = {
  id: string;
  title: string;
  start_at: string;
  venue_id: string;
};

function Events() {
  const [list, setList] = React.useState<EventRow[]>([]);
  const [venues, setVenues] = React.useState<Array<{ id: string; name: string }>>([]);
  const [title, setTitle] = React.useState("");
  const [participants, setParticipants] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [startAt, setStartAt] = React.useState("");
  const [venueId, setVenueId] = React.useState("");
  const [msg, setMsg] = React.useState<string | null>(null);

  async function load() {
    setMsg(null);
    const { data: v } = await supabase.from("venues").select("id,name").order("name");
    setVenues((v ?? []) as any);
    if (!venueId && v?.[0]) setVenueId(v[0].id);

    const { data, error } = await supabase.from("events").select("id,title,start_at,venue_id").order("start_at", { ascending: false }).limit(50);
    if (error) setMsg(error.message);
    setList((data ?? []) as any);
  }

  React.useEffect(() => { load(); }, []);

  async function add() {
    setMsg(null);
    const startIso = startAt ? new Date(startAt).toISOString() : null;
    const { error } = await supabase.from("events").insert({
      title: title.trim(),
      participants: participants.trim(),
      description: description.trim(),
      start_at: startIso,
      venue_id: venueId,
    });
    if (error) setMsg(error.message);
    else {
      setTitle(""); setParticipants(""); setDescription(""); setStartAt("");
      await load();
      setMsg("Сохранено.");
    }
  }

  async function remove(id: string) {
    if (!confirm("Удалить мероприятие?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) setMsg(error.message);
    else load();
  }

  return (
    <>
      <div className="text-lg font-extrabold text-slate-900">Мероприятия</div>

      <div className="mt-4 grid gap-4">
        <Input label="Название" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Спектакль / концерт / фильм" />
        <Input label="Участники" value={participants} onChange={(e) => setParticipants(e.target.value)} placeholder="Группа, актёры, режиссёр…" />
        <Textarea label="Описание" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Краткая аннотация" />
        <label className="block">
          <div className="mb-1 text-sm font-medium text-slate-700">Заведение</div>
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
          >
            {venues.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </label>
        <Input label="Дата и время" type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />

        {msg ? <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{msg}</div> : null}

        <Button onClick={add} disabled={!title.trim() || !startAt || !venueId}>Добавить</Button>
      </div>

      <div className="mt-8 text-sm font-bold text-slate-900">Последние</div>
      <div className="mt-3 space-y-2">
        {list.map((e) => (
          <div key={e.id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-3">
            <div>
              <div className="text-sm font-bold text-slate-900">{e.title}</div>
              <div className="mt-1 text-xs text-slate-500">{isoToRu(e.start_at)}</div>
            </div>
            <Button variant="danger" onClick={() => remove(e.id)}>Удалить</Button>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------------- Venues ---------------- */

type VenueRow = { id: string; name: string; type: string; address: string };

function Venues() {
  const [list, setList] = React.useState<VenueRow[]>([]);
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState("Театр");
  const [address, setAddress] = React.useState("");
  const [msg, setMsg] = React.useState<string | null>(null);

  async function load() {
    setMsg(null);
    const { data, error } = await supabase.from("venues").select("id,name,type,address").order("name");
    if (error) setMsg(error.message);
    setList((data ?? []) as any);
  }
  React.useEffect(() => { load(); }, []);

  async function add() {
    setMsg(null);
    const { error } = await supabase.from("venues").insert({ name: name.trim(), type, address: address.trim() });
    if (error) setMsg(error.message);
    else { setName(""); setAddress(""); load(); setMsg("Сохранено."); }
  }

  async function remove(id: string) {
    if (!confirm("Удалить заведение?")) return;
    const { error } = await supabase.from("venues").delete().eq("id", id);
    if (error) setMsg(error.message);
    else load();
  }

  return (
    <>
      <div className="text-lg font-extrabold text-slate-900">Заведения</div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input label="Название" value={name} onChange={(e) => setName(e.target.value)} placeholder="Театр оперы и балета" />
        <label className="block">
          <div className="mb-1 text-sm font-medium text-slate-700">Тип</div>
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {["Театр", "Музей", "Цирк", "Кинотеатр", "Дворец культуры", "Другое"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <div className="sm:col-span-2">
          <Input label="Адрес" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="г. …, ул. …" />
        </div>

        {msg ? <div className="sm:col-span-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{msg}</div> : null}

        <div className="sm:col-span-2">
          <Button onClick={add} disabled={!name.trim() || !address.trim()}>Добавить</Button>
        </div>
      </div>

      <div className="mt-8 space-y-2">
        {list.map((v) => (
          <div key={v.id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-3">
            <div>
              <div className="text-sm font-bold text-slate-900">{v.name}</div>
              <div className="mt-1 text-xs text-slate-500">{v.type} • {v.address}</div>
            </div>
            <Button variant="danger" onClick={() => remove(v.id)}>Удалить</Button>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------------- Inventory ---------------- */

type InvRow = {
  event_id: string;
  event_title: string;
  start_at: string;
  seat_category_id: string;
  category_name: string;
  price_cents: number;
  total_qty: number;
  sold_qty: number;
};

function Inventory() {
  const [list, setList] = React.useState<InvRow[]>([]);
  const [msg, setMsg] = React.useState<string | null>(null);

  async function load() {
    setMsg(null);
    const { data, error } = await supabase.from("admin_view_inventory").select("*").order("start_at", { ascending: false }).limit(200);
    if (error) setMsg(error.message);
    setList((data ?? []) as any);
  }
  React.useEffect(() => { load(); }, []);

  async function save(row: InvRow, patch: Partial<Pick<InvRow, "price_cents" | "total_qty">>) {
    setMsg(null);
    // upsert price
    if (patch.price_cents !== undefined) {
      const { error } = await supabase.from("event_prices").upsert({
        event_id: row.event_id,
        seat_category_id: row.seat_category_id,
        price_cents: patch.price_cents,
      });
      if (error) { setMsg(error.message); return; }
    }

    if (patch.total_qty !== undefined) {
      const { error } = await supabase.from("event_inventory").upsert({
        event_id: row.event_id,
        seat_category_id: row.seat_category_id,
        total_qty: patch.total_qty,
      });
      if (error) { setMsg(error.message); return; }
    }

    await load();
    setMsg("Сохранено.");
  }

  return (
    <>
      <div className="text-lg font-extrabold text-slate-900">Остатки и цены</div>
      <div className="mt-1 text-xs text-slate-500">Список берётся из представления admin_view_inventory.</div>

      {msg ? <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{msg}</div> : null}

      <div className="mt-4 space-y-3">
        {list.map((r) => {
          const available = Math.max(0, r.total_qty - r.sold_qty);
          return (
            <div key={`${r.event_id}::${r.seat_category_id}`} className="rounded-2xl border border-slate-100 p-3">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <div className="text-sm font-extrabold text-slate-900">{r.event_title}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {isoToRu(r.start_at)} • {r.category_name} • Доступно: <b className="text-slate-900">{available}</b>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="block">
                    <div className="mb-1 text-xs font-semibold text-slate-700">Цена (коп.)</div>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                      defaultValue={r.price_cents}
                      onBlur={(e) => save(r, { price_cents: Number(e.target.value) })}
                    />
                    <div className="mt-1 text-[11px] text-slate-500">{rub(r.price_cents)}</div>
                  </label>
                  <label className="block">
                    <div className="mb-1 text-xs font-semibold text-slate-700">Всего мест</div>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                      defaultValue={r.total_qty}
                      onBlur={(e) => save(r, { total_qty: Number(e.target.value) })}
                    />
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ---------------- Orders ---------------- */

type OrderRow = {
  id: string;
  created_at: string;
  status: string;
  total_cents: number;
  delivery_required: boolean;
  customer_full_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  items_summary: string;
};

function Orders() {
  const [list, setList] = React.useState<OrderRow[]>([]);
  const [msg, setMsg] = React.useState<string | null>(null);

  async function load() {
    setMsg(null);
    const { data, error } = await supabase.from("admin_view_orders").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) setMsg(error.message);
    setList((data ?? []) as any);
  }

  React.useEffect(() => { load(); }, []);

  return (
    <>
      <div className="text-lg font-extrabold text-slate-900">Заказы</div>
      <div className="mt-1 text-xs text-slate-500">Доступно только админам (RLS).</div>

      <div className="mt-4 flex items-center justify-between">
        <Button onClick={load} variant="ghost">Обновить</Button>
        {msg ? <div className="text-sm text-rose-700">{msg}</div> : null}
      </div>

      <div className="mt-4 space-y-3">
        {list.map((o) => (
          <div key={o.id} className="rounded-2xl border border-slate-100 p-3">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
              <div>
                <div className="text-sm font-extrabold text-slate-900">Заказ #{o.id}</div>
                <div className="mt-1 text-xs text-slate-500">{isoToRu(o.created_at)} • {o.status}</div>
              </div>
              <div className="text-lg font-extrabold text-slate-900">{rub(o.total_cents)}</div>
            </div>

            <div className="mt-3 text-sm text-slate-700">
              <b>Состав:</b> {o.items_summary}
            </div>

            {o.delivery_required ? (
              <div className="mt-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                <div className="text-xs font-semibold text-slate-600">Доставка</div>
                <div className="mt-1">{o.customer_full_name}</div>
                <div className="text-xs text-slate-600">{o.customer_phone}</div>
                <div className="text-xs text-slate-600">{o.customer_address}</div>
              </div>
            ) : (
              <div className="mt-2 text-xs text-slate-500">Без доставки</div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
