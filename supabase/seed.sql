-- Optional seed data

insert into public.seat_categories (name, description) values
  ('Партер', 'Ближайшие места к сцене'),
  ('Балкон', 'Выше, обзор шире'),
  ('Ложа', 'Отдельная зона, комфорт')
on conflict (name) do nothing;

insert into public.venues (name, type, address) values
  ('Городской театр', 'Театр', 'г. Казань, ул. Примерная, 1'),
  ('Киноцентр «Синема»', 'Кинотеатр', 'г. Казань, пр. Примерный, 10'),
  ('Музей современного искусства', 'Музей', 'г. Казань, ул. Арт, 5')
on conflict do nothing;

-- Create a couple events
insert into public.events (venue_id, title, description, participants, start_at)
select v.id, 'Спектакль «Гамлет»', 'Классическая постановка. Продолжительность 2 часа 30 минут.', 'Труппа театра', now() + interval '2 days'
from public.venues v where v.name='Городской театр'
on conflict do nothing;

insert into public.events (venue_id, title, description, participants, start_at)
select v.id, 'Концерт «Зимние хиты»', 'Лучшие композиции сезона. Живой звук.', 'Группа OSU Band', now() + interval '6 days'
from public.venues v where v.name='Городской театр'
on conflict do nothing;

-- Prices and inventory for all categories for all events
insert into public.event_prices (event_id, seat_category_id, price_cents)
select e.id, sc.id,
  case sc.name
    when 'Партер' then 250000
    when 'Ложа' then 400000
    else 150000
  end
from public.events e
cross join public.seat_categories sc
on conflict (event_id, seat_category_id) do update set price_cents = excluded.price_cents;

insert into public.event_inventory (event_id, seat_category_id, total_qty, sold_qty)
select e.id, sc.id, 80, 0
from public.events e
cross join public.seat_categories sc
on conflict (event_id, seat_category_id) do update set total_qty = excluded.total_qty;
