// app/components/landing/FAQ.client.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";

type IconProps = { className?: string };
function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

/** Icons */
function ChevronDown({ className }: IconProps) {
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
function ArrowRight({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M5 12h12"
        className="stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
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

/** Reusable */
function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 shadow-[0_10px_25px_rgba(2,8,23,.06)]">
      <span className="text-blue-600">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
function MiniTag({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
      {text}
    </span>
  );
}
function PrimaryButton({
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
function GhostButton({
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
      className={cn(
        "inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-blue-700 ring-1 ring-blue-200 transition hover:bg-blue-50 hover:text-blue-900",
        className
      )}
    >
      {children}
    </Link>
  );
}

export default function FAQ() {
  const items = [
    {
      q: "How does my Evermore Hospital ID work?",
      a: "After you create an account, a unique ID (e.g., EM-2049-1182) links your appointments, results, and billing across locations.",
    },
    { q: "Can I access lab and imaging results?", a: "Yes — results and visit summaries appear in your portal as they become available." },
    { q: "Can I download receipts and statements?", a: "Yes — billing includes downloadable receipts and statements for your records." },
    { q: "Is my information protected?", a: "The portal is designed for secure access to sensitive health information, with privacy-first defaults." },
    { q: "Will this work well on mobile?", a: "Yes — large tap targets, clean layout, and a modern menu for quick navigation." },
  ];

  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-7xl px-4">
      <div className="grid gap-8 md:grid-cols-[1fr_.95fr] md:items-start">
        <div>
          <SectionLabel icon={<Sparkle />} text="FAQ" />
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Common questions
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Quick answers to help you feel prepared.
          </p>

          <div className="mt-6 relative overflow-hidden rounded-3xl ring-1 ring-slate-200 shadow-[0_28px_90px_rgba(2,8,23,.12)]">
            <div className="relative h-56">
              <Image
                src="/Pictures/facility-1.jpg"
                alt="Evermore"
                fill
                className="object-cover"
                quality={82}
                sizes="50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/55 via-blue-700/20 to-transparent" />
            </div>
            <div className="absolute inset-0 p-6 text-white">
              <div className="text-xs font-semibold opacity-90">Need help before your visit?</div>
              <div className="mt-2 text-xl font-semibold tracking-tight">
                Bring your ID, insurance card, and medication list.
              </div>
              <p className="mt-2 text-sm leading-relaxed opacity-90">
                Your portal also includes prep notes and directions for your appointment.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <MiniTag text="Prep checklist" />
                <MiniTag text="Directions" />
                <MiniTag text="Secure results" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200 shadow-[0_26px_80px_rgba(2,8,23,.10)]">
          <div className="space-y-3">
            {items.map((it, idx) => {
              const isOpen = open === idx;
              return (
                <div key={it.q} className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                  <button
                    onClick={() => setOpen(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between gap-4 text-left"
                  >
                    <div className="text-sm font-semibold text-slate-900">{it.q}</div>
                    <ChevronDown className={cn("text-slate-700 transition", isOpen ? "rotate-180" : "rotate-0")} />
                  </button>

                  <div
                    className={cn(
                      "grid overflow-hidden transition-all",
                      isOpen ? "grid-rows-[1fr] mt-3" : "grid-rows-[0fr] mt-0"
                    )}
                  >
                    <div className="min-h-0">
                      <p className="text-sm leading-relaxed text-slate-600">{it.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <PrimaryButton href="/signup" className="px-5 py-3 text-sm">
              Create account
            </PrimaryButton>
            <GhostButton href="/contact" className="px-5 py-3 text-sm">
              Contact Evermore
            </GhostButton>
          </div>
        </div>
      </div>
    </section>
  );
}
