import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import { Container } from "../../components/Container";
import { supabase } from "../../lib/supabase";
import { Button } from "../../components/Button";
import { AdminLoginPage } from "./AdminLoginPage";
import { AdminDashboard } from "./AdminDashboard";

export function AdminEntry() {
  const [session, setSession] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <Container>
        <div className="py-10">
          <div className="rounded-2xl border border-slate-100 bg-white p-5">Загрузка…</div>
        </div>
      </Container>
    );
  }

  if (!session) {
    return <AdminLoginPage />;
  }

  return (
    <Container>
      <div className="py-10">
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="text-xs text-slate-500">Админка</div>
            <div className="text-2xl font-extrabold text-slate-900">Управление</div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                "rounded-xl px-3 py-2 text-sm font-semibold " +
                (isActive ? "bg-sky-50 text-sky-700" : "text-slate-700 hover:bg-slate-100")
              }
            >
              Дашборд
            </NavLink>
            <NavLink
              to="/admin/events"
              className={({ isActive }) =>
                "rounded-xl px-3 py-2 text-sm font-semibold " +
                (isActive ? "bg-sky-50 text-sky-700" : "text-slate-700 hover:bg-slate-100")
              }
            >
              Мероприятия
            </NavLink>
            <NavLink
              to="/admin/venues"
              className={({ isActive }) =>
                "rounded-xl px-3 py-2 text-sm font-semibold " +
                (isActive ? "bg-sky-50 text-sky-700" : "text-slate-700 hover:bg-slate-100")
              }
            >
              Заведения
            </NavLink>
            <NavLink
              to="/admin/inventory"
              className={({ isActive }) =>
                "rounded-xl px-3 py-2 text-sm font-semibold " +
                (isActive ? "bg-sky-50 text-sky-700" : "text-slate-700 hover:bg-slate-100")
              }
            >
              Остатки
            </NavLink>
            <NavLink
              to="/admin/orders"
              className={({ isActive }) =>
                "rounded-xl px-3 py-2 text-sm font-semibold " +
                (isActive ? "bg-sky-50 text-sky-700" : "text-slate-700 hover:bg-slate-100")
              }
            >
              Заказы
            </NavLink>
            <Button variant="ghost" onClick={() => supabase.auth.signOut()}>
              Выйти
            </Button>
          </div>
        </div>

        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/events" element={<AdminDashboard tab="events" />} />
          <Route path="/venues" element={<AdminDashboard tab="venues" />} />
          <Route path="/inventory" element={<AdminDashboard tab="inventory" />} />
          <Route path="/orders" element={<AdminDashboard tab="orders" />} />
        </Routes>
      </div>
    </Container>
  );
}
