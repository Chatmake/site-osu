import React from "react";

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 shadow-soft">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="text-lg font-bold text-slate-900">{title}</div>
          <button
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            onClick={onClose}
            aria-label="Закрыть"
            title="Закрыть"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
