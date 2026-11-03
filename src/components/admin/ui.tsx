import { createPortal } from "react-dom";
import { useEffect, useState, type ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[#e1e8f0] bg-white shadow-[0_1px_2px_rgba(13,44,92,0.04),0_12px_32px_rgba(13,44,92,0.05)] ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        {eyebrow && (
          <div className="mb-3 inline-flex items-center gap-2.5 rounded-full border border-[#c69a3f]/25 bg-[#fdf8ec] py-1 pl-1.5 pr-3.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0d2c5c]">
              <span className="h-1.5 w-1.5 rotate-45 bg-[#e6b85c]" />
            </span>
            <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#8a6420]">
              {eyebrow}
            </span>
          </div>
        )}
        <h2
          className="font-['Cormorant_Garamond',serif] text-[28px] md:text-[34px] font-bold text-[#0d2c5c] leading-none"
        >
          {title}
        </h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "gold" | "ghost" | "danger";
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
};

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled,
  className = "",
}: BtnProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-[0.14em] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = size === "sm" ? "text-[10px] px-3.5 py-2" : "text-[11px] px-5 py-2.5";
  const variants: Record<string, string> = {
    primary: "bg-[#0d2c5c] text-white hover:bg-[#07203f]",
    gold: "bg-[#c69a3f] text-white hover:bg-[#b0862f]",
    ghost: "border border-[#e1e8f0] text-[#0d2c5c] bg-white hover:border-[#0d2c5c]",
    danger: "border border-[#0d2c5c] text-[#0d2c5c] bg-white hover:bg-[#0d2c5c] hover:text-white",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7c99] mb-1.5 ml-0.5">
        {label}
      </span>
      {children}
      {error && <span className="block mt-1.5 text-[11px] font-medium text-rose-600">{error}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-[#e1e8f0] bg-[#f8fafd] px-4 py-2.5 text-[13.5px] font-medium text-[#0d2c5c] outline-none transition-all focus:bg-white focus:border-[#c69a3f] focus:ring-2 focus:ring-[#c69a3f]/15 placeholder:text-[#94a3b8]";

export function Badge({
  children,
  tone = "navy",
}: {
  children: ReactNode;
  tone?: "navy" | "gold" | "green" | "red" | "muted";
}) {
  const tones: Record<string, string> = {
    navy: "bg-[#eef2f7] text-[#0d2c5c]",
    gold: "bg-[#f4e5c8] text-[#8a6420]",
    green: "bg-[#e6f2ea] text-[#1f6b45]",
    red: "bg-[#8c2f39] text-white",
    muted: "bg-[#f4f6f9] text-[#2a3b52]",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export const statusTone = (s?: string | null) =>
  s === "confirmed"
    ? "green"
    : s === "pending"
      ? "gold"
      : s === "cancelled"
        ? "red"
        : s === "completed"
          ? "navy"
          : ("muted" as const);

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[#eef2f7] ${className}`} />;
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-11 w-full" />
      ))}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="py-14 text-center">
      <p className="text-sm font-semibold text-[#0d2c5c]">{title}</p>
      {hint && <p className="mt-1 text-[13px] text-[#4f6280]">{hint}</p>}
    </div>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
  width = "max-w-lg",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}) {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-[#07203f]/55 backdrop-blur-md">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div
        className={`relative z-10 w-full ${width} max-h-[calc(100vh-3rem)] flex flex-col rounded-[28px] bg-white shadow-[0_30px_80px_rgba(7,32,63,0.35)] overflow-hidden animate-in fade-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#0d2c5c] via-[#123a72] to-[#07203f] px-6 pt-5 pb-9">
          <svg viewBox="0 0 120 120" fill="none" className="pointer-events-none absolute -right-6 -top-8 h-36 w-36 text-white/10">
            <circle cx="60" cy="60" r="22" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="60" cy="60" r="36" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 5" />
            <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="0.6" />
          </svg>
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#e6b85c]">
                Vila Casa Esy · Admin
              </span>
              <h3
                className="mt-1 text-[26px] font-semibold leading-tight !text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 cursor-pointer"
              aria-label="Închide"
            >
              ✕
            </button>
          </div>
          <svg viewBox="0 0 400 24" preserveAspectRatio="none" className="absolute bottom-0 left-0 h-6 w-full text-white">
            <path d="M0 24 V12 Q50 0 100 12 T200 12 T300 12 T400 12 V24 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="overflow-y-auto px-6 pb-6 pt-3 text-[#2a3b52]">{children}</div>
      </div>
    </div>,
    document.body
  );
}
/* ─────────────── SEARCH + PAGINARE ─────────────── */
export function SearchBox({
  value,
  onChange,
  placeholder = "Caută…",
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative w-full sm:max-w-xs ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7c99]"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} pl-10`}
      />
    </div>
  );
}

export function usePaged<T>(items: T[], perPage = 10) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(page, pages);
  useEffect(() => {
    if (page !== current) setPage(current);
  }, [page, current]);
  const slice = items.slice((current - 1) * perPage, current * perPage);
  return { slice, page: current, pages, setPage, total: items.length, perPage };
}

export function Pagination({
  page,
  pages,
  total,
  perPage,
  onPage,
}: {
  page: number;
  pages: number;
  total: number;
  perPage: number;
  onPage: (p: number) => void;
}) {
  if (total === 0) return null;
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-[#eef2f7] px-4 py-3 sm:flex-row sm:px-5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4f6280]">
        {from}–{to} din {total}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-[#e1e8f0] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0d2c5c] transition-colors hover:bg-[#f4f6f9] disabled:opacity-40"
        >
          ‹ Anterior
        </button>
        <span className="px-2 text-[12px] font-semibold text-[#0d2c5c]">
          {page} / {pages}
        </span>
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= pages}
          className="rounded-lg border border-[#e1e8f0] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0d2c5c] transition-colors hover:bg-[#f4f6f9] disabled:opacity-40"
        >
          Următor ›
        </button>
      </div>
    </div>
  );
}
