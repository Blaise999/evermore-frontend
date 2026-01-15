// app/components/landing/ui.tsx
import Link from "next/link";
import Image from "next/image";
import React from "react";

export type IconProps = { className?: string };

export function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

/** ---------- Icons ---------- */
export function ChevronDown({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M6 9l6 6 6-6"
        className="stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowRight({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path d="M5 12h12" className="stroke-current" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M13 6l6 6-6 6"
        className="stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Shield({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M12 2l8 4v6c0 5.2-3.4 9.9-8 10-4.6-.1-8-4.8-8-10V6l8-4Z"
        className="stroke-current"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-5"
        className="stroke-current"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Sparkle({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M12 2l1.6 6.1L20 10l-6.4 1.9L12 18l-1.6-6.1L4 10l6.4-1.9L12 2Z"
        className="stroke-current"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M19 14l.9 3.2L23 18l-3.1.8L19 22l-.9-3.2L15 18l3.1-.8L19 14Z"
        className="stroke-current opacity-60"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** ✅ ADD: Lock icon (fixes Vercel build error) */
export function Lock({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M7 11V8a5 5 0 0 1 10 0v3"
        className="stroke-current"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 11h12a2.2 2.2 0 0 1 2.2 2.2v6.6A2.2 2.2 0 0 1 18 22H6a2.2 2.2 0 0 1-2.2-2.2v-6.6A2.2 2.2 0 0 1 6 11Z"
        className="stroke-current"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Calendar({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path d="M7 2v3M17 2v3M3.5 9h17" className="stroke-current" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M6 5h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z"
        className="stroke-current"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 12h3M7.5 15.5h3M13.5 12h3M13.5 15.5h3"
        className="stroke-current opacity-70"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Heartbeat({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M12 21s-7-4.4-9.5-9C.6 8.6 2.5 5.5 6 5.5c2 0 3.3 1.1 4 2.1.7-1 2-2.1 4-2.1 3.5 0 5.4 3.1 3.5 6.5C19 16.6 12 21 12 21Z"
        className="stroke-current"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M3.8 12h3l1.2-2.2L10.3 15l1.4-3 1.2 2.2h3.3"
        className="stroke-current opacity-70"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Phone({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        className="stroke-current"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10 18h4" className="stroke-current opacity-70" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function MapPin({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M12 22s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Z"
        className="stroke-current"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 11.5a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z"
        className="stroke-current opacity-70"
        strokeWidth="1.6"
      />
    </svg>
  );
}

/** ---------- Reusable UI ---------- */
export function SectionLabel({
  icon,
  text,
  tone = "light",
}: {
  icon: React.ReactNode;
  text: string;
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold ring-1 shadow-[0_10px_25px_rgba(2,8,23,.06)]",
        tone === "dark" ? "bg-slate-950/30 text-white ring-white/15" : "bg-white text-slate-700 ring-slate-200"
      )}
    >
      <span className={cn(tone === "dark" ? "text-cyan-200" : "text-blue-600")}>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

export function PrimaryButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,99,235,.28)] transition hover:bg-blue-700 hover:shadow-[0_22px_50px_rgba(37,99,235,.33)] active:translate-y-[1px]",
        className
      )}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
    </Link>
  );
}

export function GhostButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-blue-700 ring-1 ring-blue-200 transition hover:bg-blue-50 hover:text-blue-900",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function MiniTag({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
      {text}
    </span>
  );
}

export function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 shadow-[0_16px_36px_rgba(2,8,23,.08)]">
      <div className="text-[11px] font-semibold text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</div>
    </div>
  );
}

/** Optional image helper */
export function Pic({
  src,
  alt,
  className,
  priority,
  overlay = true,
  sizes = "(max-width: 768px) 100vw, 50vw",
  quality = 82,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  overlay?: boolean;
  sizes?: string;
  quality?: number;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image src={src} alt={alt} fill priority={priority} quality={quality} className="object-cover" sizes={sizes} />
      {overlay ? (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/35 via-slate-950/10 to-transparent" />
      ) : null}
    </div>
  );
}
