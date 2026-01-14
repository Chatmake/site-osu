# OSU Tickets (вариант 4: продажа билетов)

Это простой учебный сайт (SPA) под твою предметную область:
- афиша мероприятий за период
- корзина
- оформление заказа (доставка — ФИО/телефон/адрес)
- админка (CRUD + заказы + остатки билетов)
- база данных: Supabase (PostgreSQL) — бесплатный тариф
- деплой: GitHub Pages через GitHub Actions

## 1) Быстрый старт локально

```bash
npm i
cp .env.example .env
npm run dev
```

Открой: http://localhost:5173

## 2) Настройка базы данных (Supabase)

1) Создай проект в Supabase
2) В Supabase → SQL Editor выполни:
- `supabase/schema.sql`
- `supabase/seed.sql` (не обязательно, но полезно)

3) В Supabase → Project settings → API скопируй:
- Project URL
- anon public key

Заполни `.env`:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## 3) Админка

Маршрут: `/#/admin`

Логин — через Supabase Auth (email+password).
После регистрации админа добавь его в таблицу `public.admins`:

```sql
insert into public.admins (user_id) values ('<auth.uid админа>');
```

В админке можно:
- заведения/мероприятия
- цены и остатки по категориям мест
- смотреть заказы

## 4) Деплой на GitHub Pages

1) Запушь всё в репозиторий (ветка `main`)
2) Repo → Settings → Pages:
   - Source: GitHub Actions
3) Repo → Settings → Secrets and variables → Actions → New repository secret:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4) Пуш в main → Actions сам соберёт и задеплоит

Важно: мы используем HashRouter (`/#/`), чтобы GitHub Pages не ломал роуты.

## 5) Структура проекта

- `src/pages/*` — страницы (клиент + админ)
- `src/components/*` — UI
- `src/store/cart.tsx` — корзина (сохраняется в localStorage)
- `supabase/schema.sql` — таблицы/политики/функция place_order (атомарно списывает остатки)

## 6) Отчёты по заданию

В `supabase/reports.sql` лежат готовые SQL‑запросы для двух ежегодных отчётов из формулировки.
