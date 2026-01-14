import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
};

export function Button({ variant = "primary", className = "", ...rest }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed";
  const v =
    variant === "primary"
      ? "bg-sky-600 text-white hover:bg-sky-700 shadow-soft"
      : variant === "danger"
      ? "bg-rose-600 text-white hover:bg-rose-700 shadow-soft"
      : "bg-transparent text-slate-700 hover:bg-slate-100";
  return <button className={`${base} ${v} ${className}`} {...rest} />;
}
