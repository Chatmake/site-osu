import { Link, NavLink } from "react-router-dom";
import { Container } from "./Container";
import { useCart, cartTotals } from "../store/cart";

export function NavBar({ onOpenCart }: { onOpenCart: () => void }) {
  const { state } = useCart();
  const { items } = cartTotals(state.lines);

  return (
    <div className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-600 text-white shadow-soft">
              🎟️
            </div>
            <div className="leading-tight">
              <div className="text-sm font-extrabold text-slate-900">OSU Tickets</div>
              <div className="text-xs text-slate-500">Продажа билетов</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 sm:flex">
            <NavLink
              to="/"
              className={({ isActive }) =>
                "rounded-xl px-3 py-2 text-sm font-semibold " +
                (isActive ? "bg-sky-50 text-sky-700" : "text-slate-700 hover:bg-slate-100")
              }
            >
              Афиша
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                "rounded-xl px-3 py-2 text-sm font-semibold " +
                (isActive ? "bg-sky-50 text-sky-700" : "text-slate-700 hover:bg-slate-100")
              }
            >
              О проекте
            </NavLink>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                "rounded-xl px-3 py-2 text-sm font-semibold " +
                (isActive ? "bg-sky-50 text-sky-700" : "text-slate-700 hover:bg-slate-100")
              }
            >
              Админка
            </NavLink>
          </nav>

          <button
            className="relative inline-flex items-center gap-2 rounded-xl bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-soft hover:bg-sky-700"
            onClick={onOpenCart}
          >
            🛒 <span className="hidden sm:inline">Корзина</span>
            {items > 0 ? (
              <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-white text-xs font-extrabold text-sky-700 ring-2 ring-sky-200">
                {items}
              </span>
            ) : null}
          </button>
        </div>
      </Container>
    </div>
  );
}
