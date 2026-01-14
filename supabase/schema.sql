-- Supabase schema for OSU Tickets (вариант 4)
-- Запусти это в Supabase SQL Editor.

create extension if not exists pgcrypto;

-- Helper: admin check
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.admins a
    where a.user_id = auth.uid()
  );
$$;

-- Admins table (manual enrollment)
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Venues
create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('Театр','Музей','Цирк','Кинотеатр','Дворец культуры','Другое')),
  address text not null,
  created_at timestamptz not null default now()
);

-- Events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete restrict,
  title text not null,
  description text not null default '',
  participants text not null default '',
  start_at timestamptz not null,
  poster_url text null,
  created_at timestamptz not null default now()
);

-- Seat categories
create table if not exists public.seat_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null default '',
  created_at timestamptz not null default now()
);

-- Price per event + category
create table if not exists public.event_prices (
  event_id uuid not null references public.events(id) on delete cascade,
  seat_category_id uuid not null references public.seat_categories(id) on delete restrict,
  price_cents integer not null check (price_cents >= 0),
  primary key (event_id, seat_category_id)
);

-- Inventory per event + category
create table if not exists public.event_inventory (
  event_id uuid not null references public.events(id) on delete cascade,
  seat_category_id uuid not null references public.seat_categories(id) on delete restrict,
  total_qty integer not null default 0 check (total_qty >= 0),
  sold_qty integer not null default 0 check (sold_qty >= 0),
  primary key (event_id, seat_category_id),
  constraint sold_not_more_than_total check (sold_qty <= total_qty)
);

-- Customers (only for delivery)
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  address text not null,
  created_at timestamptz not null default now()
);

-- Orders + items
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'new',
  delivery_required boolean not null default true,
  customer_id uuid null references public.customers(id) on delete set null,
  total_cents integer not null default 0 check (total_cents >= 0)
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete restrict,
  seat_category_id uuid not null references public.seat_categories(id) on delete restrict,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  qty integer not null check (qty > 0)
);

create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_order_items_order_id on public.order_items(order_id);

-- ---------- RLS ----------
alter table public.admins enable row level security;
alter table public.venues enable row level security;
alter table public.events enable row level security;
alter table public.seat_categories enable row level security;
alter table public.event_prices enable row level security;
alter table public.event_inventory enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Public read access for "афиша" data
drop policy if exists "public read venues" on public.venues;
create policy "public read venues" on public.venues
for select to anon, authenticated
using (true);

drop policy if exists "public read events" on public.events;
create policy "public read events" on public.events
for select to anon, authenticated
using (true);

drop policy if exists "public read seat_categories" on public.seat_categories;
create policy "public read seat_categories" on public.seat_categories
for select to anon, authenticated
using (true);

drop policy if exists "public read event_prices" on public.event_prices;
create policy "public read event_prices" on public.event_prices
for select to anon, authenticated
using (true);

drop policy if exists "public read event_inventory" on public.event_inventory;
create policy "public read event_inventory" on public.event_inventory
for select to anon, authenticated
using (true);

-- Admin-only write access for catalog tables
drop policy if exists "admins manage venues" on public.venues;
create policy "admins manage venues" on public.venues
for insert, update, delete to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage events" on public.events;
create policy "admins manage events" on public.events
for insert, update, delete to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage seat_categories" on public.seat_categories;
create policy "admins manage seat_categories" on public.seat_categories
for insert, update, delete to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage event_prices" on public.event_prices;
create policy "admins manage event_prices" on public.event_prices
for insert, update, delete to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage event_inventory" on public.event_inventory;
create policy "admins manage event_inventory" on public.event_inventory
for insert, update, delete to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Admins table: only admins can view (optional)
drop policy if exists "admins read admins" on public.admins;
create policy "admins read admins" on public.admins
for select to authenticated
using (public.is_admin());

-- Orders/Customers: inserts allowed for public via SECURITY DEFINER function only (we block direct inserts)
-- Direct select is admin-only
drop policy if exists "admins read orders" on public.orders;
create policy "admins read orders" on public.orders
for select to authenticated
using (public.is_admin());

drop policy if exists "admins read order_items" on public.order_items;
create policy "admins read order_items" on public.order_items
for select to authenticated
using (public.is_admin());

drop policy if exists "admins read customers" on public.customers;
create policy "admins read customers" on public.customers
for select to authenticated
using (public.is_admin());

-- block direct inserts/updates from client (security: only through function)
drop policy if exists "no direct write orders" on public.orders;
create policy "no direct write orders" on public.orders
for insert, update, delete to anon, authenticated
using (false) with check (false);

drop policy if exists "no direct write order_items" on public.order_items;
create policy "no direct write order_items" on public.order_items
for insert, update, delete to anon, authenticated
using (false) with check (false);

drop policy if exists "no direct write customers" on public.customers;
create policy "no direct write customers" on public.customers
for insert, update, delete to anon, authenticated
using (false) with check (false);

-- ---------- Views for client/admin ----------

-- Client view: join price + inventory + category for event
create or replace view public.event_view_pricing as
select
  ep.event_id,
  sc.id as seat_category_id,
  sc.name,
  sc.description,
  ep.price_cents,
  coalesce(inv.total_qty, 0) as total_qty,
  coalesce(inv.sold_qty, 0) as sold_qty
from public.event_prices ep
join public.seat_categories sc on sc.id = ep.seat_category_id
left join public.event_inventory inv
  on inv.event_id = ep.event_id and inv.seat_category_id = ep.seat_category_id;

-- Admin view: inventory with event title + category name + price
create or replace view public.admin_view_inventory as
select
  e.id as event_id,
  e.title as event_title,
  e.start_at,
  sc.id as seat_category_id,
  sc.name as category_name,
  coalesce(ep.price_cents, 0) as price_cents,
  coalesce(inv.total_qty, 0) as total_qty,
  coalesce(inv.sold_qty, 0) as sold_qty
from public.events e
cross join public.seat_categories sc
left join public.event_prices ep
  on ep.event_id = e.id and ep.seat_category_id = sc.id
left join public.event_inventory inv
  on inv.event_id = e.id and inv.seat_category_id = sc.id;

-- Orders summary for admin
create or replace view public.admin_view_orders as
select
  o.id,
  o.created_at,
  o.status,
  o.total_cents,
  o.delivery_required,
  c.full_name as customer_full_name,
  c.phone as customer_phone,
  c.address as customer_address,
  (
    select string_agg(e.title || ' — ' || sc.name || ' × ' || oi.qty::text, '; ' order by oi.id)
    from public.order_items oi
    join public.events e on e.id = oi.event_id
    join public.seat_categories sc on sc.id = oi.seat_category_id
    where oi.order_id = o.id
  ) as items_summary
from public.orders o
left join public.customers c on c.id = o.customer_id;

-- ---------- Atomic order placement ----------
-- p_customer: { full_name, phone, address }
-- p_items: [{ event_id, seat_category_id, qty }, ...]
create or replace function public.place_order(
  p_delivery_required boolean,
  p_customer jsonb,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_customer_id uuid;
  v_total integer := 0;
  v_item jsonb;
  v_event_id uuid;
  v_seat_category_id uuid;
  v_qty int;
  v_price int;
  v_total_qty int;
  v_sold_qty int;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'items must be non-empty array';
  end if;

  if p_delivery_required then
    if coalesce(p_customer->>'full_name','') = '' or coalesce(p_customer->>'phone','') = '' or coalesce(p_customer->>'address','') = '' then
      raise exception 'customer fields are required for delivery';
    end if;

    insert into public.customers(full_name, phone, address)
    values (p_customer->>'full_name', p_customer->>'phone', p_customer->>'address')
    returning id into v_customer_id;
  else
    v_customer_id := null;
  end if;

  -- Lock & validate inventory, calculate total
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_event_id := (v_item->>'event_id')::uuid;
    v_seat_category_id := (v_item->>'seat_category_id')::uuid;
    v_qty := (v_item->>'qty')::int;

    if v_qty is null or v_qty <= 0 then
      raise exception 'qty must be > 0';
    end if;

    select ep.price_cents into v_price
    from public.event_prices ep
    where ep.event_id = v_event_id and ep.seat_category_id = v_seat_category_id;

    if v_price is null then
      raise exception 'price not found for event %, category %', v_event_id, v_seat_category_id;
    end if;

    -- Ensure inventory row exists (if not, create zero)
    insert into public.event_inventory(event_id, seat_category_id, total_qty, sold_qty)
    values (v_event_id, v_seat_category_id, 0, 0)
    on conflict (event_id, seat_category_id) do nothing;

    select total_qty, sold_qty into v_total_qty, v_sold_qty
    from public.event_inventory
    where event_id = v_event_id and seat_category_id = v_seat_category_id
    for update;

    if (v_total_qty - v_sold_qty) < v_qty then
      raise exception 'not enough tickets: available %, requested %', (v_total_qty - v_sold_qty), v_qty;
    end if;

    v_total := v_total + (v_price * v_qty);
  end loop;

  insert into public.orders(delivery_required, customer_id, total_cents)
  values (p_delivery_required, v_customer_id, v_total)
  returning id into v_order_id;

  -- Insert items + update inventory
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_event_id := (v_item->>'event_id')::uuid;
    v_seat_category_id := (v_item->>'seat_category_id')::uuid;
    v_qty := (v_item->>'qty')::int;

    select ep.price_cents into v_price
    from public.event_prices ep
    where ep.event_id = v_event_id and ep.seat_category_id = v_seat_category_id;

    insert into public.order_items(order_id, event_id, seat_category_id, unit_price_cents, qty)
    values (v_order_id, v_event_id, v_seat_category_id, v_price, v_qty);

    update public.event_inventory
    set sold_qty = sold_qty + v_qty
    where event_id = v_event_id and seat_category_id = v_seat_category_id;
  end loop;

  return v_order_id;
end;
$$;

-- Allow anon/authenticated to execute the function
grant execute on function public.place_order(boolean, jsonb, jsonb) to anon, authenticated;
