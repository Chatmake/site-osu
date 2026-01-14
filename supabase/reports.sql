-- Отчёты по заданию (вариант 4)

-- 1) Количество проданных билетов на каждое мероприятие для каждого вида культурного заведения
-- (Группировка: вид заведения -> мероприятие)
select
  v.type as venue_type,
  e.title as event_title,
  date_trunc('day', e.start_at) as event_day,
  sum(oi.qty) as sold_tickets
from public.order_items oi
join public.events e on e.id = oi.event_id
join public.venues v on v.id = e.venue_id
group by v.type, e.title, date_trunc('day', e.start_at)
order by v.type, sold_tickets desc;

-- 2) Наиболее посещаемые мероприятия (топ-N по проданным билетам)
select
  e.title as event_title,
  v.name as venue_name,
  v.type as venue_type,
  sum(oi.qty) as sold_tickets
from public.order_items oi
join public.events e on e.id = oi.event_id
join public.venues v on v.id = e.venue_id
group by e.title, v.name, v.type
order by sold_tickets desc
limit 10;
