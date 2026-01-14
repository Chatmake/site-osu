import { Container } from "./Container";

export function Footer() {
  return (
    <div className="mt-16 border-t border-slate-100 bg-white">
      <Container>
        <div className="flex flex-col items-start justify-between gap-3 py-8 sm:flex-row sm:items-center">
          <div className="text-sm text-slate-600">
            Учебный проект (вариант 4): продажа билетов на культурно-массовые мероприятия.
          </div>
          <div className="text-xs text-slate-400">© {new Date().getFullYear()} OSU Tickets</div>
        </div>
      </Container>
    </div>
  );
}
