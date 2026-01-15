import Link from "next/link";
import Image from "next/image";
import React from "react";

type AuthMode = "login" | "signup";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-4 w-4", className)} fill="none">
      <path
        d="M7.5 11V8.6A4.5 4.5 0 0 1 12 4.1a4.5 4.5 0 0 1 4.5 4.5V11"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M7 11h10a2 2 0 0 1 2 2v6.2a2.2 2.2 0 0 1-2.2 2.2H7.2A2.2 2.2 0 0 1 5 19.2V13a2 2 0 0 1 2-2Z"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 15.2v2.3"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HelpIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z"
        className="stroke-current"
        strokeWidth="1.7"
      />
      <path
        d="M9.6 9.2a2.6 2.6 0 1 1 4.6 1.6c-.7.8-1.6 1.1-2 1.9-.2.3-.2.6-.2 1.1"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 17.2h.01"
        className="stroke-current"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AuthHeader({
  mode = "login",
  showEmergency = true,
  showHelp = true,
}: {
  mode?: AuthMode;
  showEmergency?: boolean;
  showHelp?: boolean;
}) {
  const switchCta =
    mode === "login"
      ? { label: "Create account", href: "/signup" }
      : { label: "Login", href: "/login" };

  const headerVars = {
    ["--auth-h" as any]: "clamp(64px, 5.5vw, 76px)",
    ["--logo-h" as any]: "clamp(44px, 4.2vw, 54px)",
    ["--logo-w" as any]: "clamp(140px, 14vw, 190px)",
  } as React.CSSProperties;

  return (
    <header
      style={headerVars}
      className="sticky top-0 z-[80] w-full bg-white/85 backdrop-blur ring-1 ring-slate-200 shadow-[0_12px_40px_rgba(2,8,23,.08)]"
    >
      <div className="mx-auto flex h-[var(--auth-h)] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-[var(--logo-h)] w-[var(--logo-w)]">
            <Image
              src="/Pictures/Logos.png"
              alt="Evermore Hospitals"
              fill
              priority
              quality={100}
              className="object-contain"
              sizes="(max-width: 768px) 52vw, 220px"
            />
          </div>
          <span className="sr-only">Evermore Hospitals</span>
        </Link>

        {/* Right: Trust + actions (desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
            <LockIcon className="text-blue-700" />
            Secure patient portal
          </div>

          {showHelp ? (
            <Link
              href="/help"
              className="rounded-2xl bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Help
            </Link>
          ) : null}

          {showEmergency ? (
            <Link
              href="/emergency"
              className="rounded-2xl bg-white px-4 py-2 text-[13px] font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50"
            >
              Emergency
            </Link>
          ) : null}

          <Link
            href={switchCta.href}
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_16px_34px_rgba(37,99,235,.22)] transition hover:bg-blue-700 active:translate-y-[1px]"
          >
            {switchCta.label}
          </Link>
        </div>

        {/* Mobile: compact actions */}
        <div className="md:hidden flex items-center gap-2">
          {showHelp ? (
            <Link
              href="/help"
              aria-label="Help"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-slate-200 shadow-sm hover:bg-slate-50"
            >
              <HelpIcon className="text-slate-800" />
            </Link>
          ) : null}

          <Link
            href={switchCta.href}
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-[0_14px_30px_rgba(37,99,235,.22)] hover:bg-blue-700"
          >
            {switchCta.label}
          </Link>
        </div>
      </div>
    </header>
  );
}
