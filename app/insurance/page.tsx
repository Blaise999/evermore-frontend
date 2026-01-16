"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CreditCard,
  FileText,
  HelpCircle,
  Lock,
  Phone,
  Shield,
  Sparkles,
  Stethoscope,
} from "lucide-react";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

// ✅ Evermore Brand Logo Mark
function EvermoreMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-6 w-6", className)} fill="none">
      <rect width="32" height="32" rx="8" className="fill-[rgb(var(--evermore-brand))]" />
      <path
        d="M8 16h16M16 10v12M10 12h12M10 20h12"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Pill({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--evermore-brand))]/20 bg-[rgb(var(--evermore-brand))]/10 px-3 py-1 text-xs font-semibold text-white/90">
      <span className="text-[rgb(var(--evermore-brand-light))]">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function Card({
  children,
  className = "",
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-[rgb(var(--evermore-brand))]/15 bg-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl",
        glow && "shadow-[0_0_30px_rgba(var(--evermore-brand-glow),0.15)]",
        className
      )}
    >
      {children}
    </div>
  );
}

function Divider() {
  return <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-[rgb(var(--evermore-brand))]/20 to-transparent" />;
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      className="w-full rounded-3xl border border-[rgb(var(--evermore-brand))]/15 bg-white/5 p-5 text-left transition hover:bg-[rgb(var(--evermore-brand))]/10"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="text-sm font-extrabold">{q}</div>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-[rgb(var(--evermore-brand))]/20 bg-black/35">
          <ArrowRight
            className={cn(
              "h-4 w-4 text-[rgb(var(--evermore-brand-light))] transition",
              open ? "rotate-90" : "rotate-0"
            )}
          />
        </span>
      </div>
      <div
        className={cn(
          "grid transition-all",
          open ? "mt-3 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-70"
        )}
      >
        <div className="overflow-hidden text-sm leading-relaxed text-white/70">
          {a}
        </div>
      </div>
    </button>
  );
}

export default function InsurancePage() {
  const prefersReduced = useReducedMotion();

  const faqs = useMemo(
    () => [
      {
        q: "Do I need insurance to be seen at Evermore?",
        a: "No. You can self-pay, use corporate cover (where applicable), or use private insurance if your policy includes outpatient/inpatient services. We'll guide you to the right route.",
      },
      {
        q: "Do you work with the NHS?",
        a: "Evermore is presented here as a private provider experience. If you need NHS-specific guidance, use NHS pathways. For emergencies, call 999. For urgent advice, NHS 111.",
      },
      {
        q: "What documents should I bring?",
        a: "Bring a photo ID, your insurance membership details (if applicable), referral/authorisation letters if your policy requires it, and your current medication list.",
      },
      {
        q: "How does pre-authorisation work?",
        a: "Some policies require pre-authorisation for certain tests or specialist procedures. If needed, you'll request it from your insurer and provide the authorisation reference to Evermore.",
      },
      {
        q: "Can you bill my insurer directly?",
        a: "Where direct billing is supported, we can. Otherwise, you may pay upfront and submit a claim to your insurer. The exact route depends on your policy.",
      },
      {
        q: "What's the fastest way to confirm cover?",
        a: "Check your policy benefits for outpatient/specialist/diagnostics, and confirm if you need a GP referral or insurer authorisation. If you're unsure, contact support and we'll help you interpret the requirements.",
      },
    ],
    []
  );

  return (
    <main className="min-h-screen bg-[rgb(var(--evermore-surface-dark))] text-white">
      {/* ✅ Evermore branded ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 evermore-gradient-dark" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,rgba(var(--evermore-brand),0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--evermore-brand),0.3)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/15 to-black/35" />
      </div>

      {/* ✅ Branded top bar with logo */}
      <div className="sticky top-0 z-30 border-b border-[rgb(var(--evermore-brand))]/10 bg-black/25 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2">
              <EvermoreMark />
              <div>
                <div className="text-sm font-extrabold tracking-tight">Evermore</div>
                <div className="text-[11px] font-semibold text-[rgb(var(--evermore-brand-light))]/70">
                  Insurance & billing guidance
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/locations"
                className="hidden rounded-full border border-[rgb(var(--evermore-brand))]/20 bg-[rgb(var(--evermore-brand))]/10 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-[rgb(var(--evermore-brand))]/20 sm:inline"
              >
                Locations
              </Link>
              <Link
                href="/help"
                className="hidden rounded-full border border-[rgb(var(--evermore-brand))]/20 bg-[rgb(var(--evermore-brand))]/10 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-[rgb(var(--evermore-brand))]/20 sm:inline"
              >
                Help
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--evermore-brand))] px-3 py-1.5 text-xs font-black text-white transition hover:bg-[rgb(var(--evermore-brand-light))]"
              >
                Create account <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* hero */}
      <header className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 10 }}
          animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"
        >
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Pill icon={<Lock className="h-3.5 w-3.5" />} text="Privacy-first billing" />
              <Pill icon={<BadgeCheck className="h-3.5 w-3.5" />} text="Clear requirements" />
              <Pill icon={<Sparkles className="h-3.5 w-3.5" />} text="UK-based clinics" />
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
              Insurance that doesn't feel confusing.
              <span className="block bg-gradient-to-r from-[rgb(var(--evermore-brand-light))] via-white to-white/70 bg-clip-text text-transparent">
                Just clear steps.
              </span>
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              This page explains how cover usually works for private healthcare in the UK context
              (policy rules vary). If you're unsure, contact support and we'll help you route it properly.
            </p>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[rgb(var(--evermore-brand))] px-5 py-3 text-sm font-black text-white transition hover:bg-[rgb(var(--evermore-brand-light))] shadow-[0_0_20px_rgba(var(--evermore-brand-glow),0.3)]"
              >
                Create account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[rgb(var(--evermore-brand))]/20 bg-[rgb(var(--evermore-brand))]/10 px-5 py-3 text-sm font-semibold text-white/85 transition hover:bg-[rgb(var(--evermore-brand))]/20"
              >
                Talk to support <Phone className="h-4 w-4" />
              </Link>
            </div>

            <div className="text-xs text-white/55">
              Emergency? Call <span className="font-semibold text-white/75">999</span>. Urgent advice:{" "}
              <span className="font-semibold text-white/75">NHS 111</span>.
            </div>
          </div>

          <Card className="p-5 sm:p-6" glow>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--evermore-brand-light))]/70">
                  Quick cover check
                </div>
                <div className="mt-2 text-lg font-black tracking-tight">
                  Know what to confirm in 60 seconds
                </div>
                <div className="mt-1 text-xs text-white/60">
                  No guessing. Just verify these items.
                </div>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgb(var(--evermore-brand))]/20 bg-[rgb(var(--evermore-brand))]/10">
                <HelpCircle className="h-5 w-5 text-[rgb(var(--evermore-brand-light))]" />
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {[
                { t: "Outpatient cover", d: "Does your policy include outpatient & specialist visits?" },
                { t: "Diagnostics", d: "Are lab tests / imaging included (and any limits)?" },
                { t: "Referral rules", d: "Do you need a GP referral for specialists?" },
                { t: "Pre-authorisation", d: "Do you need an authorisation code for procedures?" },
                { t: "Excess / co-pay", d: "Is there an excess you must pay first?" },
              ].map((x, i) => (
                <div
                  key={x.t}
                  className="rounded-2xl border border-[rgb(var(--evermore-brand))]/15 bg-black/25 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-[rgb(var(--evermore-brand))]/20 bg-[rgb(var(--evermore-brand))]/15 text-xs font-black text-[rgb(var(--evermore-brand-light))]">
                      {i + 1}
                    </div>
                    <div className="text-sm font-extrabold">{x.t}</div>
                  </div>
                  <div className="mt-1 text-xs leading-relaxed text-white/65">{x.d}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-[rgb(var(--evermore-brand))]/20 bg-gradient-to-r from-[rgb(var(--evermore-brand))]/15 via-[rgb(var(--evermore-brand))]/5 to-[rgb(var(--evermore-brand))]/15 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-extrabold">Want us to help confirm it?</div>
                  <div className="mt-1 text-xs text-white/65">
                    Create an account and send your details securely.
                  </div>
                </div>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[rgb(var(--evermore-brand))] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[rgb(var(--evermore-brand-light))]"
                >
                  Start <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>

        <Divider />
      </header>

      {/* sections */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-extrabold">Direct billing</div>
                <div className="mt-1 text-xs text-white/65">
                  Where supported by your policy/provider.
                </div>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgb(var(--evermore-brand))]/20 bg-[rgb(var(--evermore-brand))]/10">
                <CreditCard className="h-5 w-5 text-[rgb(var(--evermore-brand-light))]" />
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              If your policy allows direct settlement, Evermore can bill according to the approved authorisation
              and covered services.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-extrabold">Pay & claim</div>
                <div className="mt-1 text-xs text-white/65">
                  Pay upfront, then claim back from your insurer.
                </div>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgb(var(--evermore-brand))]/20 bg-[rgb(var(--evermore-brand))]/10">
                <FileText className="h-5 w-5 text-[rgb(var(--evermore-brand-light))]" />
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              If direct billing isn't available, you can self-pay, receive a receipt/invoice in your portal,
              and submit your claim per your insurer's process.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-extrabold">GP referral pathway</div>
                <div className="mt-1 text-xs text-white/65">
                  Some specialist services require it.
                </div>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgb(var(--evermore-brand))]/20 bg-[rgb(var(--evermore-brand))]/10">
                <Stethoscope className="h-5 w-5 text-[rgb(var(--evermore-brand-light))]" />
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              If your policy requires a referral, we'll ask for it before specialist booking or certain diagnostics,
              to keep your claim clean.
            </p>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--evermore-brand-light))]/70">
                  What to prepare
                </div>
                <div className="mt-2 text-xl font-black tracking-tight">
                  Bring the right info, avoid delays.
                </div>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgb(var(--evermore-brand))]/20 bg-[rgb(var(--evermore-brand))]/10">
                <BadgeCheck className="h-5 w-5 text-[rgb(var(--evermore-brand-light))]" />
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                { t: "Photo ID", d: "Passport / driving licence (or approved ID)." },
                { t: "Membership details", d: "Insurer name + membership number." },
                { t: "Referral letter", d: "If your policy requires GP referral." },
                { t: "Authorisation code", d: "If pre-authorisation is required." },
                { t: "Medication list", d: "Current meds and allergies." },
                { t: "Claims rules", d: "Excess, limits, and covered services." },
              ].map((x) => (
                <div key={x.t} className="rounded-2xl border border-[rgb(var(--evermore-brand))]/15 bg-black/25 p-4">
                  <div className="text-sm font-extrabold">{x.t}</div>
                  <div className="mt-1 text-xs leading-relaxed text-white/65">{x.d}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--evermore-brand-light))]/70">
                  Fast lane
                </div>
                <div className="mt-2 text-xl font-black tracking-tight">
                  Book first, confirm in parallel
                </div>
                <div className="mt-1 text-xs text-white/60">
                  (If you already know your policy rules)
                </div>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgb(var(--evermore-brand))]/20 bg-[rgb(var(--evermore-brand))]/10">
                <CalendarCheck className="h-5 w-5 text-[rgb(var(--evermore-brand-light))]" />
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-white/70">
              If you're confident about cover, you can book immediately. If you need help interpreting requirements,
              contact support and we'll guide you.
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[rgb(var(--evermore-brand))] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[rgb(var(--evermore-brand-light))] shadow-[0_0_15px_rgba(var(--evermore-brand-glow),0.2)]"
              >
                Book an appointment <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[rgb(var(--evermore-brand))]/20 bg-[rgb(var(--evermore-brand))]/10 px-4 py-2.5 text-sm font-semibold text-white/85 transition hover:bg-[rgb(var(--evermore-brand))]/20"
              >
                Contact support <Phone className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-4 rounded-2xl border border-[rgb(var(--evermore-brand))]/15 bg-black/25 p-4">
              <div className="flex items-center gap-2 text-sm font-extrabold">
                <Sparkles className="h-4 w-4 text-[rgb(var(--evermore-brand-light))]" />
                Tip
              </div>
              <div className="mt-1 text-xs text-white/65">
                If your insurer needs pre-authorisation, request it before high-cost diagnostics or specialist procedures.
              </div>
            </div>
          </Card>
        </div>

        <Divider />

        {/* FAQ */}
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--evermore-brand))]/20 bg-[rgb(var(--evermore-brand))]/10 px-3 py-1 text-xs font-semibold text-white/80">
              <Sparkles className="h-3.5 w-3.5 text-[rgb(var(--evermore-brand-light))]" />
              FAQ
            </div>
            <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
              Quick answers before you book.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Policies vary. These are typical routes in the UK private healthcare context.
            </p>

            <div className="mt-6 rounded-3xl border border-[rgb(var(--evermore-brand))]/20 bg-gradient-to-r from-[rgb(var(--evermore-brand))]/15 via-[rgb(var(--evermore-brand))]/5 to-[rgb(var(--evermore-brand))]/15 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-black tracking-tight">Ready to get started?</div>
                  <div className="mt-1 text-sm text-white/70">
                    Create an account to manage bookings, receipts, and records.
                  </div>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgb(var(--evermore-brand))]/20 bg-black/35">
                  <EvermoreMark className="h-5 w-5" />
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[rgb(var(--evermore-brand))] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[rgb(var(--evermore-brand-light))]"
                >
                  Create account <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/help"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[rgb(var(--evermore-brand))]/20 bg-[rgb(var(--evermore-brand))]/10 px-4 py-2.5 text-sm font-semibold text-white/85 transition hover:bg-[rgb(var(--evermore-brand))]/20"
                >
                  Help center <HelpCircle className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map((x) => (
              <FaqItem key={x.q} q={x.q} a={x.a} />
            ))}
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-[rgb(var(--evermore-brand))]/10">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <EvermoreMark className="h-5 w-5" />
              <div className="text-sm text-white/65">
                © {new Date().getFullYear()} Evermore Hospitals. All rights reserved.
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/privacy" className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-[rgb(var(--evermore-brand))]/10">
                Privacy
              </Link>
              <Link href="/terms" className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-[rgb(var(--evermore-brand))]/10">
                Terms
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--evermore-brand))] px-3 py-1.5 text-xs font-black text-white transition hover:bg-[rgb(var(--evermore-brand-light))]"
              >
                Create account <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
