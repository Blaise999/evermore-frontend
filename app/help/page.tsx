// app/help/page.tsx
"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { AuthHeader } from "../components/auth-header";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

/* --------------------------------- Icons --------------------------------- */
function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-4 w-4", className)} fill="none">
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
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" className="stroke-current" strokeWidth="1.7" />
      <path d="M16.4 16.4 21 21" className="stroke-current" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function LifeRingIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z"
        className="stroke-current"
        strokeWidth="1.8"
      />
      <path
        d="M8.2 8.2 4.6 4.6M19.4 19.4l-3.6-3.6M15.8 8.2l3.6-3.6M4.6 19.4l3.6-3.6"
        className="stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        className="stroke-current"
        strokeWidth="1.8"
      />
    </svg>
  );
}
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M12 2l8 4v6c0 5-3.4 9.5-8 10-4.6-.5-8-5-8-10V6l8-4Z"
        className="stroke-current"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-5"
        className="stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function DocIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M7 3h7l3 3v15a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
        className="stroke-current"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M14 3v4h4" className="stroke-current" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 11h6M9 15h6M9 19h4" className="stroke-current" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path d="M6 6l12 12M18 6 6 18" className="stroke-current" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconWrap({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "blue" | "emerald" | "rose" | "slate" | "indigo";
}) {
  const toneCls =
    tone === "blue"
      ? "text-blue-700 bg-blue-50 ring-blue-200"
      : tone === "emerald"
      ? "text-emerald-700 bg-emerald-50 ring-emerald-200"
      : tone === "rose"
      ? "text-rose-700 bg-rose-50 ring-rose-200"
      : tone === "indigo"
      ? "text-indigo-700 bg-indigo-50 ring-indigo-200"
      : "text-slate-900 bg-slate-50 ring-slate-200";
  return (
    <span
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-2xl ring-1 shadow-[0_18px_60px_rgba(2,8,23,.06)]",
        toneCls
      )}
    >
      {children}
    </span>
  );
}

function SectionHeader({
  id,
  kicker,
  title,
  desc,
  icon,
  right,
}: {
  id?: string;
  kicker: string;
  title: string;
  desc?: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div id={id} className="flex flex-wrap items-end justify-between gap-4 scroll-mt-24">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          <span className="h-2 w-2 rounded-full bg-blue-600" />
          {icon ? <span className="text-blue-700">{icon}</span> : null}
          {kicker}
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">{title}</h1>
        {desc ? (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600">{desc}</p>
        ) : null}
      </div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  );
}

type Topic = {
  id: string;
  title: string;
  desc: string;
  tone: "blue" | "emerald" | "rose" | "indigo" | "slate";
  tags: string[];
  href: string; // can be anchor or route
};

type Article = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  section: "Portal" | "Appointments" | "Billing" | "Records" | "Security" | "General";
  steps: string[];
};

const TOPICS: Topic[] = [
  {
    id: "portal",
    title: "Portal access",
    desc: "Login, account recovery, and session issues.",
    tone: "blue",
    tags: ["login", "password", "cookies", "session"],
    href: "#portal",
  },
  {
    id: "appointments",
    title: "Appointments",
    desc: "Booking, rescheduling, cancellations, and reminders.",
    tone: "emerald",
    tags: ["booking", "reschedule", "cancel"],
    href: "#appointments",
  },
  {
    id: "billing",
    title: "Billing & CareFlex",
    desc: "Invoices, repayment, and billing questions.",
    tone: "indigo",
    tags: ["invoice", "repayment", "CareFlex"],
    href: "#billing",
  },
  {
    id: "records",
    title: "Records",
    desc: "Viewing results, downloads, and sharing records.",
    tone: "slate",
    tags: ["labs", "reports", "pdf"],
    href: "#records",
  },
  {
    id: "security",
    title: "Security",
    desc: "Privacy, data access, and safety information.",
    tone: "rose",
    tags: ["privacy", "2FA", "audit"],
    href: "#security",
  },
];

const ARTICLES: Article[] = [
  {
    id: "a1",
    title: "I can’t log in — what should I check?",
    summary: "Most login issues are email formatting, password typos, or expired sessions.",
    tags: ["login", "password", "portal"],
    section: "Portal",
    steps: [
      "Make sure you’re using the same email you used to create your account.",
      "Double-check caps lock and your keyboard layout (especially on mobile).",
      "Try “Forgot password” to reset your password.",
      "If you’re stuck in a login loop, clear site cookies for Evermore and try again.",
      "If the issue persists, contact support with the exact error text.",
    ],
  },
  {
    id: "a2",
    title: "Resetting your password",
    summary: "Request a reset link and choose a strong password you don’t reuse elsewhere.",
    tags: ["password", "reset"],
    section: "Security",
    steps: [
      "Go to the login page and select “Forgot password”.",
      "Enter your email and submit the request.",
      "Check your inbox and spam/junk folder for the reset email.",
      "Open the link and set a new password.",
      "Return to login and sign in with the updated password.",
    ],
  },
  {
    id: "a3",
    title: "Booking an appointment",
    summary: "Choose the specialty, pick a date/time, and confirm your details.",
    tags: ["booking", "appointments"],
    section: "Appointments",
    steps: [
      "From the dashboard, open Appointments and select “Book”.",
      "Choose a specialty and clinician (if available).",
      "Pick a date and time slot.",
      "Add a brief reason for visit (optional) and confirm.",
      "You’ll see the appointment in your timeline with reminders.",
    ],
  },
  {
    id: "a4",
    title: "Rescheduling or cancelling",
    summary: "Use the appointment card actions and confirm changes.",
    tags: ["reschedule", "cancel"],
    section: "Appointments",
    steps: [
      "Open Appointments and select the appointment you want to change.",
      "Choose “Reschedule” or “Cancel”.",
      "If rescheduling, pick a new time and confirm.",
      "If cancelling, confirm the cancellation reason (optional).",
      "Check the updated status on your appointment timeline.",
    ],
  },
  {
    id: "a5",
    title: "Understanding invoices and CareFlex",
    summary: "Invoices show charges; CareFlex tracks outstanding owed and repayments.",
    tags: ["invoice", "CareFlex", "billing"],
    section: "Billing",
    steps: [
      "Open Billing to see outstanding invoices and totals owed.",
      "Select an invoice to view line items and due date.",
      "If available, choose “Pay now” (immediate) or submit a repayment request.",
      "Repayments reduce the total outstanding owed (applied oldest-first in the background).",
      "You can view payment/repayment history in the Payments section.",
    ],
  },
  {
    id: "a6",
    title: "Downloading an invoice or record PDF",
    summary: "Open the item details and use the download action.",
    tags: ["pdf", "download", "records"],
    section: "Records",
    steps: [
      "Open Billing or Records and select the item.",
      "Choose “View” or “Download PDF”.",
      "If the button is missing, ensure the item has a valid ID and refresh.",
      "Try again on a different browser if downloads are blocked.",
      "If it still fails, contact support and include the item ID.",
    ],
  },
];

function FAQItem({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "w-full rounded-[28px] p-4 text-left transition",
        open ? "bg-slate-50" : "hover:bg-slate-50"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold text-slate-900">{q}</div>
        <span
          className={cn(
            "mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white ring-1 ring-slate-200 transition",
            open ? "rotate-45" : ""
          )}
        >
          <span className="text-slate-700">+</span>
        </span>
      </div>
      {open ? <p className="mt-2 text-sm leading-relaxed text-slate-600">{a}</p> : null}
    </button>
  );
}

function Modal({
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
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[min(720px,92vw)] -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.18)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-500">Help article</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{title}</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-600 hover:bg-slate-50"
              aria-label="Close"
            >
              <XIcon />
            </button>
          </div>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function HelpCenterPage() {
  const [progress, setProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      setScrolled(y > 10);
      const doc = document.documentElement;
      const total = Math.max(1, doc.scrollHeight - doc.clientHeight);
      setProgress(Math.min(100, Math.max(0, (y / total) * 100)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [query, setQuery] = useState("");
  const [section, setSection] = useState<Article["section"] | "All">("All");
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const [openArticleId, setOpenArticleId] = useState<string | null>(null);
  const activeArticle = useMemo(
    () => ARTICLES.find((a) => a.id === openArticleId) || null,
    [openArticleId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = ARTICLES.filter((a) => {
      if (section !== "All" && a.section !== section) return false;
      if (!q) return true;
      const hay = [a.title, a.summary, a.section, ...a.tags, ...a.steps].join(" ").toLowerCase();
      return hay.includes(q);
    });
    return out;
  }, [query, section]);

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#F6FAFF] via-white to-white text-slate-900">
      {/* Top progress */}
      <div className="fixed left-0 right-0 top-0 z-[70] h-[3px] bg-transparent">
        <div className="h-full bg-blue-600" style={{ width: `${progress}%` }} />
      </div>

      {/* Ambient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-[-140px] h-[420px] w-[420px] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -right-24 top-[80px] h-[420px] w-[420px] rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute left-1/2 top-[860px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-sky-200/35 blur-3xl" />
      </div>

      {/* Your header */}
      <div className={cn("sticky top-0 z-[60]", scrolled ? "shadow-[0_10px_50px_rgba(2,8,23,.06)]" : "")}>
        <AuthHeader />
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-10 md:pt-14">
        <SectionHeader
          kicker="Help Center"
          title="Get support fast"
          desc="Search common issues, read step-by-step guides, and find the right place to contact us."
          icon={<LifeRingIcon />}
          right={
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,99,235,.20)] hover:bg-blue-700"
            >
              Open Portal <ArrowRightIcon />
            </Link>
          }
        />

        <div className="mt-7 grid gap-4 lg:grid-cols-3">
          {/* Search + quick filters */}
          <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.10)] lg:col-span-2">
            <div className="text-sm font-semibold text-slate-900">Search</div>
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white px-3 py-3 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-blue-500/40">
              <span className="text-slate-500">
                <SearchIcon />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try: login, invoice, repayment, download..."
                className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="rounded-full p-2 text-slate-600 hover:bg-slate-50"
                  aria-label="Clear search"
                >
                  <XIcon />
                </button>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(["All", "Portal", "Appointments", "Billing", "Records", "Security", "General"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSection(s as any)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition",
                    section === s
                      ? "bg-blue-600 text-white ring-blue-600 shadow-[0_18px_44px_rgba(37,99,235,.18)]"
                      : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {TOPICS.map((t) => (
                <a
                  key={t.id}
                  href={t.href}
                  className="group rounded-[28px] bg-slate-50 p-5 ring-1 ring-slate-200 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-slate-900">{t.title}</div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.desc}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {t.tags.slice(0, 4).map((x) => (
                          <span
                            key={x}
                            className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                          >
                            {x}
                          </span>
                        ))}
                      </div>
                    </div>
                    <IconWrap tone={t.tone}>
                      <DocIcon />
                    </IconWrap>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                    Explore <ArrowRightIcon className="transition group-hover:translate-x-0.5" />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Contact card */}
          <div className="grid gap-4">
            <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-500">Support</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">Contact us</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    If you can’t solve it here, contact support and include your email plus a screenshot (if possible).
                  </p>
                </div>
                <IconWrap tone="blue">
                  <LifeRingIcon />
                </IconWrap>
              </div>

              <div className="mt-4 space-y-2 text-sm font-semibold text-slate-700">
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="text-xs font-semibold text-slate-500">Email</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">support@evermore.health</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="text-xs font-semibold text-slate-500">Hours</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">Mon–Fri, 9:00–17:00</div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  href="/quality#incident"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Report issue <ArrowRightIcon />
                </Link>
                <Link
                  href="/terms"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  Terms <ArrowRightIcon />
                </Link>
              </div>
            </div>

            <div className="rounded-[32px] bg-rose-50 p-6 ring-1 ring-rose-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-rose-700">Emergency</div>
                  <div className="mt-2 text-lg font-semibold text-rose-800">Need urgent help?</div>
                  <p className="mt-2 text-sm font-semibold text-rose-700/90">
                    Contact local emergency services or go to the nearest Emergency Department.
                  </p>
                </div>
                <IconWrap tone="rose">
                  <ShieldIcon />
                </IconWrap>
              </div>
              <Link
                href="/emergency"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50"
              >
                Emergency info <ArrowRightIcon />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto mt-10 max-w-7xl px-4">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      {/* Articles */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500">Guides</div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Step-by-step help articles
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
              Click an article to open it. Use search above to narrow results.
            </p>
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
            Showing <span className="text-slate-900">{filtered.length}</span> articles
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {filtered.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setOpenArticleId(a.id)}
              className="text-left rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)] hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    {a.section}
                  </div>
                  <div className="mt-3 text-lg font-semibold tracking-tight text-slate-900">{a.title}</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{a.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {a.tags.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <IconWrap tone="blue">
                  <DocIcon />
                </IconWrap>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                Open <ArrowRightIcon />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Anchored sections (nice “jump” content) */}
      <section id="portal" className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)]">
          <div className="text-xs font-semibold text-slate-500">Portal access</div>
          <div className="mt-2 text-xl font-semibold text-slate-900">Login and account issues</div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            If you’re having trouble signing in, start with password reset and cookies. If you see a specific error code,
            share it with support.
          </p>
        </div>
      </section>

      <section id="appointments" className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)]">
          <div className="text-xs font-semibold text-slate-500">Appointments</div>
          <div className="mt-2 text-xl font-semibold text-slate-900">Booking, rescheduling, and reminders</div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Appointments can be booked and managed from the portal. If a slot disappears, refresh and try again. For
            urgent symptoms, seek immediate medical help.
          </p>
        </div>
      </section>

      <section id="billing" className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)]">
          <div className="text-xs font-semibold text-slate-500">Billing</div>
          <div className="mt-2 text-xl font-semibold text-slate-900">Invoices and repayments</div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Invoices show your charges. CareFlex tracks outstanding owed and repayments. If you see a mismatch, take a
            screenshot and contact billing support with the invoice number.
          </p>
        </div>
      </section>

      <section id="records" className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)]">
          <div className="text-xs font-semibold text-slate-500">Records</div>
          <div className="mt-2 text-xl font-semibold text-slate-900">Viewing and downloads</div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            If downloads fail, try another browser and ensure pop-ups/downloads aren’t blocked. If the “View PDF” button
            is missing, refresh and try again.
          </p>
        </div>
      </section>

      <section id="security" className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)]">
          <div className="text-xs font-semibold text-slate-500">Security</div>
          <div className="mt-2 text-xl font-semibold text-slate-900">Protecting your data</div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Only authorised access is permitted. Sensitive actions should be logged and reviewed. For policy details,
            see Privacy and Terms.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/privacy"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Terms
            </Link>
            <Link
              href="/quality"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Quality & Safety
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-4 pb-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500">FAQ</div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Quick answers
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
              If you still need help, contact support with details of what you tried.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)]">
            <div className="text-xs font-semibold text-slate-500">Support promise</div>
            <div className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Fast, clear, accountable</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              We aim to respond within one business day. For complex issues, we’ll keep you updated while it’s being
              investigated.
            </p>

            <div className="mt-5 space-y-2 text-sm font-semibold text-slate-700">
              {["Clear next steps", "Respect for privacy", "Escalation when needed", "Audit-ready records"].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                    ✓
                  </span>
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-2 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)]">
            {[
              {
                q: "Where do I reset my password?",
                a: "From the Login page, use “Forgot password”. If the email doesn’t arrive, check spam/junk and ensure the email address is correct.",
              },
              {
                q: "Why can’t I download a PDF?",
                a: "Your browser may be blocking downloads. Try another browser or disable strict download blocking. If the item has an invalid ID, refresh and try again.",
              },
              {
                q: "How do repayments work with CareFlex?",
                a: "Repayments reduce total outstanding owed, applied oldest-first in the background. Invoices are marked paid once fully covered.",
              },
              {
                q: "How do I report a safety issue?",
                a: "Use the incident reporting section under Quality & Safety. If it’s urgent or an emergency, contact local emergency services.",
              },
            ].map((f, idx) => (
              <FAQItem
                key={f.q}
                q={f.q}
                a={f.a}
                open={openFAQ === idx}
                onToggle={() => setOpenFAQ((v) => (v === idx ? null : idx))}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white/60">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-b from-blue-600 to-indigo-600 text-white shadow-[0_18px_44px_rgba(37,99,235,.18)]">
                  <LifeRingIcon />
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Evermore</div>
                  <div className="text-xs font-semibold text-slate-500">Help Center</div>
                </div>
              </div>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
                Find answers quickly, or contact support for help with portal access, billing, and records.
              </p>
            </div>

            <div className="grid gap-2 text-sm font-semibold text-slate-700">
              <Link href="/about" className="hover:underline">
                About
              </Link>
              <Link href="/privacy" className="hover:underline">
                Privacy
              </Link>
              <Link href="/terms" className="hover:underline">
                Terms
              </Link>
              <Link href="/quality" className="hover:underline">
                Quality
              </Link>
            </div>

            <div className="grid gap-2 text-sm font-semibold text-slate-700">
              <a href="#portal" className="hover:underline">
                Portal
              </a>
              <a href="#billing" className="hover:underline">
                Billing
              </a>
              <a href="#records" className="hover:underline">
                Records
              </a>
              <a href="#security" className="hover:underline">
                Security
              </a>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/60 pt-6">
            <div className="text-xs font-semibold text-slate-500">
              © {new Date().getFullYear()} Evermore. All rights reserved.
            </div>
            <div className="text-xs font-semibold text-slate-500">
              For emergencies, contact local emergency services.
            </div>
          </div>
        </div>
      </footer>

      {/* Article modal */}
      <Modal
        open={!!activeArticle}
        title={activeArticle?.title || ""}
        onClose={() => setOpenArticleId(null)}
      >
        {activeArticle ? (
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
                {activeArticle.section}
              </span>
              {activeArticle.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                >
                  {t}
                </span>
              ))}
            </div>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">{activeArticle.summary}</p>

            <div className="mt-5 rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="text-xs font-semibold text-slate-500">Steps</div>
              <ol className="mt-3 space-y-2">
                {activeArticle.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-semibold text-slate-800">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white ring-1 ring-slate-200 text-xs">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed text-slate-700">{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Open Portal <ArrowRightIcon />
              </Link>
              <Link
                href="/quality#incident"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                Report issue <ArrowRightIcon />
              </Link>
            </div>
          </div>
        ) : null}
      </Modal>
    </main>
  );
}
