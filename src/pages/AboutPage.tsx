import { Container } from "../components/Container";
import { Badge } from "../components/Badge";

export function AboutPage() {
  return (
    <Container>
      <div className="py-10">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge>Вариант №4</Badge>
          <Badge>Корзина</Badge>
          <Badge>База данных</Badge>
          <Badge>Админка</Badge>
          <Badge>GitHub Pages</Badge>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Продажа билетов на культурно‑массовые мероприятия
        </h1>

        <p className="mt-4 max-w-3xl text-slate-700">
          Этот проект — учебная реализация: сотрудники создают события и управляют остатками билетов,
          клиенты выбирают мероприятия, добавляют билеты в корзину и оформляют заказ (с доставкой по необходимости).
          Продажи фиксируются в базе данных, а в админке доступен просмотр заказов.
        </p>

        <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
          <div className="text-sm font-bold text-slate-900">Технологии</div>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
            <li>Vite + React + TypeScript</li>
            <li>Tailwind CSS (адаптивность)</li>
            <li>Supabase (PostgreSQL + Auth + RLS)</li>
            <li>Деплой на GitHub Pages (Actions)</li>
          </ul>
        </div>
      </div>
    </Container>
  );
}
