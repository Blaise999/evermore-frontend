"use client";

import React, { useEffect } from "react";
import { cn } from "./_utils";

export function Button({
  children,
  onClick,
  disabled,
  tone = "primary",
  size = "md",
  className,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit";
}) {
  const base = cn(
    "inline-flex items-center justify-center rounded-2xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50",
    size === "sm" && "px-3 py-1.5 text-xs",
    size === "md" && "px-4 py-2.5 text-sm",
    size === "lg" && "px-6 py-3 text-base"
  );

  const tones: Record<string, string> = {
    primary: "bg-blue-600 text-white ring-1 ring-blue-600 hover:bg-blue-700",
    secondary: "bg-white text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
    danger: "bg-rose-600 text-white ring-1 ring-rose-600 hover:bg-rose-700",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(base, tones[tone], className)}
    >
      {children}
    </button>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  className,
  type = "text",
  disabled,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  type?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <input
      autoFocus={autoFocus}
      value={value}
      type={type}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:bg-slate-50 disabled:text-slate-500",
        className
      )}
    />
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(
        "w-full resize-none rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40",
        className
      )}
    />
  );
}

/** ✅ Updated Select: supports either `options` OR manual children <option/> */
export type SelectOption = { label: string; value: string; disabled?: boolean };

export function Select({
  value,
  onChange,
  options,
  children,
  className,
  disabled,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  /** Pass options like: [{label:"25", value:"25"}] */
  options?: SelectOption[];
  /** Or pass <option/> children (works as before) */
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  /** Optional placeholder row (disabled) */
  placeholder?: string;
}) {
  const hasOptions = Array.isArray(options) && options.length > 0;

  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full appearance-none rounded-2xl bg-white px-4 py-2.5 pr-10 text-sm font-medium text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:bg-slate-50 disabled:text-slate-500",
          className
        )}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}

        {hasOptions
          ? options!.map((o) => (
              <option key={o.value} value={o.value} disabled={o.disabled}>
                {o.label}
              </option>
            ))
          : children}
      </select>

      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("grid gap-1.5", className)} aria-label={label}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">{label}</span>
        {hint ? <span className="text-[11px] font-medium text-slate-400">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

export function Card({
  title,
  subtitle,
  right,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 shadow-[0_22px_70px_rgba(2,8,23,.10)]",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-7 py-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        {right ? <div className="flex flex-wrap items-center gap-3">{right}</div> : null}
      </div>
      <div className="px-7 py-6">{children}</div>
    </div>
  );
}

export function Modal({
  title,
  open,
  onClose,
  children,
  footer,
  maxW = "900px",
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxW?: string;
}) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-[var(--mw)]" style={{ ["--mw" as any]: maxW }}>
        <div className="overflow-hidden rounded-[32px] bg-white ring-1 ring-slate-200 shadow-[0_40px_140px_rgba(2,8,23,.35)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-7 py-6">
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <Button tone="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto px-7 py-6">{children}</div>

          {footer && <div className="border-t border-slate-100 px-7 py-6">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
