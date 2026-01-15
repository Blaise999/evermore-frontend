// app/components/landing/FloatingCTA.client.tsx
"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

type IconProps = { className?: string };
function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function Sparkle({ className }: IconProps) {
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

export default function FloatingCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-5 left-1/2 z-[75] w-[min(720px,calc(100%-24px))] -translate-x-1/2 transition",
        show ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 pointer-events-none"
      )}
    >
      <div className="flex items-center justify-between gap-3 rounded-3xl bg-white p-3 ring-1 ring-slate-200 shadow-[0_30px_90px_rgba(2,8,23,.18)]">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
            <Sparkle />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">Book in seconds. Track your care.</div>
            <div className="text-xs text-slate-600">Your account unlocks appointments, results, and billing.</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-2xl px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 sm:inline-flex"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,99,235,.25)] transition hover:bg-blue-700"
          >
            Create
          </Link>
        </div>
      </div>
    </div>
  );
}
