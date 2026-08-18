import type { ReactNode } from "react";

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
          <span className="block text-[11px] font-bold uppercase tracking-[0.25em] text-[#c69a3f] mb-2">
            {eyebrow}
          </span>
        )}
        <h2
          className="text-[clamp(1.5rem,2.4vw,2rem)] leading-tight text-[#0d2c5c]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h2>
      </div>
      {action}
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
    danger: "border border-red-200 text-red-700 bg-red-50 hover:bg-red-100",
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
      <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#4f6280] mb-1.5">
        {label}
      </span>
      {children}
      {error && <span className="block mt-1 text-[11px] text-red-600">{error}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-[#e1e8f0] bg-white px-3.5 py-2.5 text-sm text-[#0d2c5c] outline-none transition-colors focus:border-[#0d2c5c] placeholder:text-[#8595aa]";

export function Badge({
  children,
  tone = "navy",
}: {
  children: ReactNode;
  tone?: "navy" | "gold" | "green" | "red" | "muted";
}) {
  const tones: Record<string, string> = {
    navy: "bg-[#eaf0f9] text-[#0d2c5c]",
    gold: "bg-[#f4e5c8] text-[#8a6413]",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    muted: "bg-[#f4f6f9] text-[#4f6280]",
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
      {hint && <p className="mt-1 text-[13px] text-[#6b7c99]">{hint}</p>}
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
  return (
    <div className="fixed inset-0 z-[500] flex items-start justify-center overflow-y-auto bg-[#07203f]/50 p-4 py-10 backdrop-blur-sm">
      <div className={`w-full ${width} rounded-2xl border border-[#e1e8f0] bg-white shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-[#eef2f7] px-6 py-4">
          <h3 className="text-lg text-[#0d2c5c]" style={{ fontFamily: "var(--font-display)" }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-[#6b7c99] transition-colors hover:text-[#0d2c5c]"
            aria-label="Închide"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}