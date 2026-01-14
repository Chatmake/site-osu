import React from "react";
import { Container } from "../../components/Container";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { supabase } from "../../lib/supabase";

export function AdminLoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [mode, setMode] = React.useState<"login" | "signup">("login");
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setMsg(null);

    const fn = mode === "login" ? supabase.auth.signInWithPassword : supabase.auth.signUp;
    const { error } = await fn({ email: email.trim(), password });
    if (error) setMsg(error.message);
    else setMsg(mode === "signup" ? "Аккаунт создан. Добавь user_id в таблицу admins (см. README)." : "Вход выполнен.");

    setBusy(false);
  }

  return (
    <Container>
      <div className="py-10">
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <div className="text-xs text-slate-500">Админка</div>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
            {mode === "login" ? "Вход" : "Регистрация админа"}
          </h1>

          <div className="mt-5 grid gap-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hint="Для учебного проекта: минимум 6 символов."
            />

            {msg ? (
              <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{msg}</div>
            ) : null}

            <Button onClick={submit} disabled={busy || !email.trim() || password.length < 6}>
              {busy ? "…" : mode === "login" ? "Войти" : "Создать аккаунт"}
            </Button>

            <button
              className="text-sm font-semibold text-sky-700 hover:text-sky-800"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              type="button"
            >
              {mode === "login" ? "Нужна регистрация админа →" : "Уже есть аккаунт →"}
            </button>

            <div className="text-xs text-slate-500">
              Важно: доступ к CRUD защищён RLS‑политиками в БД. После регистрации добавь user_id в таблицу
              <code className="mx-1 rounded bg-slate-100 px-1">admins</code>.
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
