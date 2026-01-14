import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function Input({ label, hint, className = "", ...rest }: Props) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      <input
        className={
          "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100 " +
          className
        }
        {...rest}
      />
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </label>
  );
}
