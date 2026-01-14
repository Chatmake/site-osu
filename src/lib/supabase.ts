import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anon) {
  // Чтобы в сборке не падать "молча" — покажем понятную ошибку в консоли.
  console.warn(
    "[supabase] Missing env: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. " +
      "Создай .env и перезапусти dev-сервер."
  );
}

export const supabase = createClient(url ?? "", anon ?? "", {
  auth: { persistSession: true },
});
