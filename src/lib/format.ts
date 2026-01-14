export function rub(cents: number): string {
  const rubles = (cents / 100).toFixed(0);
  return new Intl.NumberFormat("ru-RU").format(Number(rubles)) + " ₽";
}

export function isoToRu(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
