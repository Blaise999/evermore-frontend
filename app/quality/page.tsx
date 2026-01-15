// app/quality/page.tsx
"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { AuthHeader } from "../components/auth-header";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

/* --------------------------------- Icons --------------------------------- */
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M20 6 9 17l-5-5"
        className="stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M4 19V5"
        className="stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M4 19h16"
        className="stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M7 15l3-4 3 2 4-6"
        className="stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 7h2v2"
        className="stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FlagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M5 22V3"
        className="stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M5 4h12l-2 4 2 4H5"
        className="stroke-current"
        strokeWidth="1.8"
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
      <path
        d="M14 3v4h4"
        className="stroke-current"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 11h6M9 15h6M9 19h4"
        className="stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-4 w-4", className)} fill="none">
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

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        className="stroke-current"
        strokeWidth="1.7"
      />
      <path
        d="M16.4 16.4 21 21"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M6 6l12 12M18 6 6 18"
        className="stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* --------------------------------- Types --------------------------------- */
type AuditStatus = "Planned" | "In progress" | "Complete";
type Severity = "Low" | "Medium" | "High";
type Category = "Medication" | "Safeguarding" | "Infection control" | "Access" | "Billing" | "Other";

type AuditItem = {
  id: string;
  title: string;
  area: "Clinical" | "Operations" | "Digital" | "Billing" | "Safety";
  status: AuditStatus;
  owner: string;
  updatedISO: string;
  note: string;
  score?: number; // 0-100
};

type FAQItem = { q: string; a: string };

const AUDITS: AuditItem[] = [
  {
    id: "AUD-1001",
    title: "Medication reconciliation spot-check",
    area: "Clinical",
    status: "In progress",
    owner: "Quality Lead",
    updatedISO: "2025-12-09",
    note: "Random sample of discharge notes and prescriptions, focusing on mismatches.",
    score: 86,
  },
  {
    id: "AUD-1002",
    title: "Portal access and authentication review",
    area: "Digital",
    status: "Complete",
    owner: "Security Owner",
    updatedISO: "2025-11-22",
    note: "Review login paths, session handling, and audit trails for sensitive data access.",
    score: 92,
  },
  {
    id: "AUD-1003",
    title: "Infection control checklist — facilities",
    area: "Safety",
    status: "Planned",
    owner: "Facilities Manager",
    updatedISO: "2025-12-03",
    note: "Surface cleaning protocols, hand hygiene points, signage, and PPE availability.",
    score: 0,
  },
  {
    id: "AUD-1004",
    title: "Appointment wait-time analysis",
    area: "Operations",
    status: "In progress",
    owner: "Ops Analyst",
    updatedISO: "2025-12-05",
    note: "Measure lead times by specialty, identify bottlenecks and no-show patterns.",
    score: 74,
  },
  {
    id: "AUD-1005",
    title: "Billing resolution SLAs",
    area: "Billing",
    status: "Complete",
    owner: "Billing Ops",
    updatedISO: "2025-10-28",
    note: "Time-to-resolution and customer satisfaction for invoice queries and repayments.",
    score: 88,
  },
];

const FAQS: FAQItem[] = [
  {
    q: "What does “quality and safety” mean at Evermore?",
    a: "It means we continuously measure outcomes, reduce risk, and improve care pathways—using audits, governance, and patient feedback. The goal is safer, clearer, more consistent care.",
  },
  {
    q: "How do you handle incident reports?",
    a: "Reports are reviewed, triaged by severity, and assigned owners. Actions are tracked and reviewed. Where needed, we update protocols or training and monitor whether changes reduce recurrence.",
  },
  {
    q: "Can patients submit feedback or complaints here?",
    a: "Yes. You can share feedback in the section below. For urgent medical issues, contact local emergency services or your nearest Emergency Department.",
  },
  {
    q: "Do you publish quality metrics?",
    a: "Some metrics can be shared publicly in a high-level form. More detailed clinical quality dashboards are typically internal and governed to ensure accuracy and privacy.",
  },
];

/* ----------------------------- UI primitives ------------------------------ */
function Pill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  const Comp: any = onClick ? "button" : "span";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition",
        active
          ? "bg-blue-600 text-white ring-blue-600 shadow-[0_18px_44px_rgba(37,99,235,.18)]"
          : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
      )}
    >
      {children}
    </Comp>
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
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          {title}
        </h2>
        {desc ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            {desc}
          </p>
        ) : null}
      </div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  );
}

function StatusChip({ status }: { status: AuditStatus }) {
  const cls =
    status === "Complete"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status === "In progress"
      ? "bg-blue-50 text-blue-700 ring-blue-200"
      : "bg-slate-50 text-slate-700 ring-slate-200";
  return (
    <span className={cn("rounded-full px-3 py-1.5 text-xs font-semibold ring-1", cls)}>
      {status}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(score)));
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>Score</span>
        <span className="text-slate-700">{pct}%</span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-slate-100 ring-1 ring-slate-200">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function InputBase(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40",
        props.className
      )}
    />
  );
}

function TextareaBase(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40",
        props.className
      )}
    />
  );
}

function SelectBase(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40",
        props.className
      )}
    />
  );
}

/* ---------------------------------- Page --------------------------------- */
export default function QualityPage() {
  // scroll progress
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

  // Audits explorer
  const [q, setQ] = useState("");
  const [area, setArea] = useState<AuditItem["area"] | "All">("All");
  const [status, setStatus] = useState<AuditStatus | "All">("All");

  const filteredAudits = useMemo(() => {
    const query = q.trim().toLowerCase();
    const out = AUDITS.filter((a) => {
      if (area !== "All" && a.area !== area) return false;
      if (status !== "All" && a.status !== status) return false;
      if (!query) return true;
      const hay = [a.id, a.title, a.area, a.status, a.owner, a.note].join(" ").toLowerCase();
      return hay.includes(query);
    });
    out.sort((x, y) => (x.updatedISO < y.updatedISO ? 1 : x.updatedISO > y.updatedISO ? -1 : 0));
    return out;
  }, [q, area, status]);

  // Incident report (UI only)
  const [incident, setIncident] = useState({
    category: "Other" as Category,
    severity: "Low" as Severity,
    details: "",
    contact: "",
  });
  const [incidentToast, setIncidentToast] = useState<string | null>(null);

  const submitIncident = (e: React.FormEvent) => {
    e.preventDefault();
    setIncidentToast("Incident received. A quality officer will review it.");
    setIncident({ category: "Other", severity: "Low", details: "", contact: "" });
    window.setTimeout(() => setIncidentToast(null), 3500);
  };

  // Feedback (UI only)
  const [feedback, setFeedback] = useState({ rating: "5", message: "", contact: "" });
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackToast("Thanks. Your feedback helps improve care quality.");
    setFeedback({ rating: "5", message: "", contact: "" });
    window.setTimeout(() => setFeedbackToast(null), 3500);
  };

  // FAQ
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#F6FAFF] via-white to-white text-slate-900">
      {/* Top progress */}
      <div className="fixed left-0 right-0 top-0 z-[70] h-[3px] bg-transparent">
        <div className="h-full bg-blue-600" style={{ width: `${progress}%` }} />
      </div>

      {/* Ambient background blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-[-140px] h-[420px] w-[420px] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -right-24 top-[80px] h-[420px] w-[420px] rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute left-1/2 top-[820px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-sky-200/35 blur-3xl" />
      </div>

      {/* Your existing header */}
      <div className={cn("sticky top-0 z-[60]", scrolled ? "shadow-[0_10px_50px_rgba(2,8,23,.06)]" : "")}>
        <AuthHeader />
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-10 md:pt-14">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Quality & safety
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              Safer care through measurable standards.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600">
              Evermore quality is built on three things: clear governance, strong audit trails, and patient feedback that
              turns into action. We track outcomes, resolve issues, and improve pathways without adding friction.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href="#metrics"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,99,235,.22)] hover:bg-blue-700"
              >
                View metrics <ArrowRightIcon />
              </a>
              <a
                href="#audits"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                Audits & governance <ArrowRightIcon />
              </a>
              <Link
                href="/research"
                className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-white"
              >
                Research <ArrowRightIcon />
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { k: "Governance-led", v: "Owners + accountability" },
                { k: "Audit-ready", v: "Traceable actions" },
                { k: "Patient-first", v: "Feedback → change" },
              ].map((x) => (
                <div
                  key={x.k}
                  className="rounded-[28px] bg-white p-4 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)]"
                >
                  <div className="text-xs font-semibold text-slate-500">{x.k}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{x.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* TOC card */}
          <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.10)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-500">On this page</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                  Quality overview
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Jump to the areas you need: metrics, audits, incident reporting, policies, and feedback.
                </p>
              </div>
              <IconWrap tone="blue">
                <ShieldIcon />
              </IconWrap>
            </div>

            <div className="mt-5 grid gap-2">
              {[
                { id: "metrics", label: "Quality metrics" },
                { id: "pillars", label: "Quality pillars" },
                { id: "audits", label: "Audits & reviews" },
                { id: "policies", label: "Policies & governance" },
                { id: "incident", label: "Report an incident" },
                { id: "feedback", label: "Feedback & complaints" },
                { id: "faq", label: "FAQ" },
              ].map((x) => (
                <a
                  key={x.id}
                  href={`#${x.id}`}
                  className="flex items-center justify-between rounded-[22px] bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-white"
                >
                  <span>{x.label}</span>
                  <ArrowRightIcon className="text-slate-600" />
                </a>
              ))}
            </div>

            <div className="mt-5 rounded-[28px] bg-rose-50 p-4 ring-1 ring-rose-200">
              <div className="text-xs font-semibold text-rose-700">Emergency notice</div>
              <p className="mt-2 text-sm font-semibold text-rose-700/90">
                For emergencies, contact local emergency services or go to the nearest Emergency Department.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto mt-10 max-w-7xl px-4">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      {/* Metrics */}
      <section id="metrics" className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeader
          kicker="Quality metrics"
          title="What we measure"
          desc="High-level indicators that reflect safety, consistency, and patient experience. Replace placeholders with real analytics when you wire it."
          icon={<ChartIcon />}
          right={
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,99,235,.20)] hover:bg-blue-700"
            >
              Open Portal <ArrowRightIcon />
            </Link>
          }
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "Follow-up completion", v: "91%", sub: "Within 14 days", tone: "emerald" as const, icon: <CheckIcon /> },
            { t: "Median wait-time", v: "3.2 days", sub: "For booked visits", tone: "blue" as const, icon: <ChartIcon /> },
            { t: "Issue resolution", v: "36 hrs", sub: "Billing queries", tone: "indigo" as const, icon: <DocIcon /> },
            { t: "Patient satisfaction", v: "4.7/5", sub: "Recent feedback", tone: "slate" as const, icon: <ShieldIcon /> },
          ].map((m) => (
            <div
              key={m.t}
              className="rounded-[32px] bg-white p-5 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-500">{m.t}</div>
                  <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{m.v}</div>
                  <div className="mt-1 text-xs font-semibold text-slate-600">{m.sub}</div>
                </div>
                <IconWrap tone={m.tone}>{m.icon}</IconWrap>
              </div>
              <div className="mt-4 h-2 w-full rounded-full bg-slate-100 ring-1 ring-slate-200">
                <div className="h-full w-[72%] rounded-full bg-blue-600" />
              </div>
              <div className="mt-2 text-xs font-semibold text-slate-500">
                Placeholder metric bar — wire to real data later.
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">How we use metrics</div>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
                Metrics are only useful if they drive action. We track trends, identify bottlenecks, assign owners, and
                re-check improvements over time. Changes should show up as better wait times, higher follow-up completion,
                fewer repeat issues, and clearer patient journeys.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Owner assigned", "Action tracked", "Review scheduled", "Outcome measured"].map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      {/* Pillars */}
      <section id="pillars" className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeader
          kicker="Quality pillars"
          title="The standards we hold ourselves to"
          desc="A practical model: prevention, verification, response, and continuous improvement."
          icon={<ShieldIcon />}
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {[
            {
              t: "Clinical safety",
              d: "Protocols, escalation paths, and consistent documentation.",
              tone: "emerald" as const,
              points: ["Clear triage rules", "Safety escalation", "Clinical ownership"],
            },
            {
              t: "Operational reliability",
              d: "Reduce delays, improve follow-up, and keep appointments predictable.",
              tone: "blue" as const,
              points: ["Wait-time monitoring", "No-show reduction", "Follow-up completion"],
            },
            {
              t: "Digital governance",
              d: "Secure access, audit trails, and controlled change management.",
              tone: "indigo" as const,
              points: ["Access controls", "Audit logs", "Release review"],
            },
          ].map((p) => (
            <div
              key={p.t}
              className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold tracking-tight text-slate-900">{p.t}</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.d}</p>
                </div>
                <IconWrap tone={p.tone}>
                  <ShieldIcon />
                </IconWrap>
              </div>

              <div className="mt-4 space-y-2">
                {p.points.map((x) => (
                  <div key={x} className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-700">
                      <CheckIcon />
                    </span>
                    <div className="text-sm font-semibold text-slate-700">{x}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <a
                  href="#audits"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-white"
                >
                  See audits <ArrowRightIcon />
                </a>
                <a
                  href="#incident"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  Report issue <ArrowRightIcon />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      {/* Audits */}
      <section id="audits" className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeader
          kicker="Audits & reviews"
          title="Continuous monitoring and improvement"
          desc="A rolling set of audits and reviews. Filter by area, status, and keyword."
          icon={<FlagIcon />}
          right={
            <button
              type="button"
              onClick={() => {
                setQ("");
                setArea("All");
                setStatus("All");
              }}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Reset filters
            </button>
          }
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {/* Filters */}
          <div className="rounded-[32px] bg-white p-5 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)] lg:sticky lg:top-24 lg:h-fit">
            <div className="text-sm font-semibold text-slate-900">Search & filters</div>

            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-600">Search</label>
              <div className="mt-2 flex items-center gap-2 rounded-2xl bg-white px-3 py-3 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-blue-500/40">
                <span className="text-slate-500">
                  <SearchIcon />
                </span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="e.g. portal, billing, infection..."
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold text-slate-600">Area</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["All", "Clinical", "Safety", "Operations", "Digital", "Billing"] as const).map((x) => (
                  <Pill key={x} active={area === x} onClick={() => setArea(x as any)}>
                    {x}
                  </Pill>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold text-slate-600">Status</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["All", "Planned", "In progress", "Complete"] as const).map((x) => (
                  <Pill key={x} active={status === x} onClick={() => setStatus(x as any)}>
                    {x}
                  </Pill>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="text-xs font-semibold text-slate-500">Results</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{filteredAudits.length}</div>
              <div className="mt-1 text-xs font-semibold text-slate-600">Matched audits</div>
            </div>
          </div>

          {/* Audit list */}
          <div className="lg:col-span-2">
            <div className="grid gap-4">
              {filteredAudits.map((a) => (
                <div
                  key={a.id}
                  className="rounded-[32px] bg-white p-5 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                          {a.id}
                        </span>
                        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
                          {a.area}
                        </span>
                        <StatusChip status={a.status} />
                      </div>

                      <div className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
                        {a.title}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {a.note}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                          Owner: {a.owner}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                          Updated:{" "}
                          {new Date(a.updatedISO).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-[220px]">
                      <div className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-200">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-semibold text-slate-500">Audit health</div>
                          <IconWrap tone={a.status === "Complete" ? "emerald" : "blue"}>
                            <ChartIcon />
                          </IconWrap>
                        </div>
                        {typeof a.score === "number" && a.score > 0 ? (
                          <ScoreBar score={a.score} />
                        ) : (
                          <div className="mt-3 text-sm font-semibold text-slate-700">
                            Score pending
                            <div className="mt-1 text-xs font-semibold text-slate-500">
                              This audit hasn’t been scored yet.
                            </div>
                          </div>
                        )}
                        <div className="mt-4 flex gap-2">
                          <a
                            href="#policies"
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                          >
                            Policies <ArrowRightIcon />
                          </a>
                          <a
                            href="#feedback"
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            Feedback <ArrowRightIcon />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredAudits.length === 0 ? (
                <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)]">
                  <div className="text-lg font-semibold text-slate-900">No matches</div>
                  <p className="mt-2 text-sm text-slate-600">Try clearing filters or using a broader search.</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      {/* Policies */}
      <section id="policies" className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeader
          kicker="Policies & governance"
          title="Clear rules, consistent outcomes"
          desc="High-level policies your platform can surface publicly. Link these to real pages or PDFs when you’re ready."
          icon={<DocIcon />}
          right={
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Privacy <ArrowRightIcon />
            </Link>
          }
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {[
            {
              t: "Clinical governance",
              d: "Ownership, escalation pathways, and measurable pathway reviews.",
              tone: "blue" as const,
              items: ["Clinical owners", "Escalation rules", "Review cadence"],
            },
            {
              t: "Data protection",
              d: "Secure access, audit trails, and minimum necessary data handling.",
              tone: "indigo" as const,
              items: ["Access controls", "Audit logging", "De-identification"],
            },
            {
              t: "Safety management",
              d: "Incident reporting, triage, actions, and recurrence reduction.",
              tone: "emerald" as const,
              items: ["Incident triage", "Action tracking", "Outcome monitoring"],
            },
          ].map((p) => (
            <div
              key={p.t}
              className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold tracking-tight text-slate-900">{p.t}</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.d}</p>
                </div>
                <IconWrap tone={p.tone}>
                  <DocIcon />
                </IconWrap>
              </div>

              <div className="mt-4 space-y-2">
                {p.items.map((x) => (
                  <div key={x} className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-700">
                      <CheckIcon />
                    </span>
                    <div className="text-sm font-semibold text-slate-700">{x}</div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => alert("Hook this to a real PDF or policy route later.")}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-white"
              >
                Download policy <ArrowRightIcon />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[32px] bg-gradient-to-b from-slate-900 to-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(2,8,23,.22)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-white/70">Accountability</div>
              <div className="mt-2 text-xl font-semibold">Everything has an owner.</div>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80">
                For quality work to matter, actions must be owned, deadlines clear, and results measurable. This page is
                designed to make quality visible: audits, reporting, and feedback in one place.
              </p>
            </div>
            <Link
              href="/help"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900"
            >
              Get help <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      {/* Incident report */}
      <section id="incident" className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeader
          kicker="Report an incident"
          title="Tell us what happened"
          desc="This is UI-only right now. Wire it to your backend (e.g. POST /api/quality/incidents) to store and triage reports."
          icon={<FlagIcon />}
        />

        {incidentToast ? (
          <div className="mt-6 rounded-3xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
            {incidentToast}
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.10)] lg:col-span-2">
            <form onSubmit={submitIncident} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="text-sm font-semibold text-slate-900">Category</label>
                <SelectBase
                  value={incident.category}
                  onChange={(e) => setIncident((s) => ({ ...s, category: e.target.value as Category }))}
                  className="mt-2"
                >
                  {(["Medication", "Safeguarding", "Infection control", "Access", "Billing", "Other"] as Category[]).map(
                    (c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    )
                  )}
                </SelectBase>
              </div>

              <div className="sm:col-span-1">
                <label className="text-sm font-semibold text-slate-900">Severity</label>
                <SelectBase
                  value={incident.severity}
                  onChange={(e) => setIncident((s) => ({ ...s, severity: e.target.value as Severity }))}
                  className="mt-2"
                >
                  {(["Low", "Medium", "High"] as Severity[]).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </SelectBase>
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-slate-900">Details</label>
                <TextareaBase
                  value={incident.details}
                  onChange={(e) => setIncident((s) => ({ ...s, details: e.target.value }))}
                  className="mt-2 min-h-[140px]"
                  placeholder="Describe what happened, when it occurred, and any helpful context."
                  required
                />
                <div className="mt-2 text-xs font-semibold text-slate-500">
                  Don’t include highly sensitive details if not necessary. If this is an emergency, contact local
                  emergency services.
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-slate-900">Contact (optional)</label>
                <InputBase
                  value={incident.contact}
                  onChange={(e) => setIncident((s) => ({ ...s, contact: e.target.value }))}
                  className="mt-2"
                  placeholder="Email or phone number (optional)"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,99,235,.24)] transition hover:bg-blue-700 active:translate-y-[1px]"
                >
                  Submit incident report
                </button>
              </div>
            </form>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-500">What happens next</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">Triage → action → review</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Reports are triaged by severity, assigned to an owner, and tracked until resolved. Patterns trigger
                    audits or protocol updates.
                  </p>
                </div>
                <IconWrap tone="emerald">
                  <CheckIcon />
                </IconWrap>
              </div>
              <div className="mt-4 space-y-2 text-sm font-semibold text-slate-700">
                {["Severity triage", "Owner assigned", "Actions tracked", "Outcome monitored"].map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <span className="text-emerald-700">
                      <CheckIcon />
                    </span>
                    {t}
                  </div>
                ))}
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
      <div className="mx-auto max-w-7xl px-4">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      {/* Feedback */}
      <section id="feedback" className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeader
          kicker="Feedback & complaints"
          title="Tell us what worked (and what didn’t)"
          desc="Patient feedback is a core quality signal. This section is UI-only—wire it to a backend route when ready."
          icon={<DocIcon />}
        />

        {feedbackToast ? (
          <div className="mt-6 rounded-3xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
            {feedbackToast}
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.10)] lg:col-span-2">
            <form onSubmit={submitFeedback} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="text-sm font-semibold text-slate-900">Rating</label>
                <SelectBase
                  value={feedback.rating}
                  onChange={(e) => setFeedback((s) => ({ ...s, rating: e.target.value }))}
                  className="mt-2"
                >
                  {["5", "4", "3", "2", "1"].map((r) => (
                    <option key={r} value={r}>
                      {r} / 5
                    </option>
                  ))}
                </SelectBase>
              </div>

              <div className="sm:col-span-1">
                <label className="text-sm font-semibold text-slate-900">Contact (optional)</label>
                <InputBase
                  value={feedback.contact}
                  onChange={(e) => setFeedback((s) => ({ ...s, contact: e.target.value }))}
                  className="mt-2"
                  placeholder="Email or phone (optional)"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-slate-900">Message</label>
                <TextareaBase
                  value={feedback.message}
                  onChange={(e) => setFeedback((s) => ({ ...s, message: e.target.value }))}
                  className="mt-2 min-h-[140px]"
                  placeholder="What went well? What could be improved? If something went wrong, what outcome would you like?"
                  required
                />
                <div className="mt-2 text-xs font-semibold text-slate-500">
                  For emergencies, contact local emergency services.
                </div>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,99,235,.24)] transition hover:bg-blue-700 active:translate-y-[1px]"
                >
                  Submit feedback
                </button>
              </div>
            </form>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-500">How feedback helps</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">Signal → improvement</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Feedback helps prioritise fixes, improve communication, and reduce repeat problems. Patterns inform
                    audits and training.
                  </p>
                </div>
                <IconWrap tone="blue">
                  <ChartIcon />
                </IconWrap>
              </div>
              <div className="mt-4 space-y-2 text-sm font-semibold text-slate-700">
                {["Identify bottlenecks", "Improve clarity", "Reduce recurrence", "Measure changes"].map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <span className="text-emerald-700">
                      <CheckIcon />
                    </span>
                    {t}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] bg-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(2,8,23,.22)]">
              <div className="text-xs font-semibold text-white/70">Need help now?</div>
              <div className="mt-2 text-lg font-semibold">Portal support</div>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                If you’re having trouble logging in or accessing records, use the help centre.
              </p>
              <Link
                href="/help"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900"
              >
                Help centre <ArrowRightIcon />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeader
          kicker="FAQ"
          title="Common questions"
          desc="Quick answers about quality, reporting, and governance."
          icon={<ShieldIcon />}
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)]">
            <div className="text-xs font-semibold text-slate-500">Quality approach</div>
            <div className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
              Transparent, measurable, owned
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Quality work should be visible: clear owners, actions, and outcomes. This page is designed so you can
              surface those signals in your product.
            </p>

            <div className="mt-5 space-y-2 text-sm font-semibold text-slate-700">
              {["Clear ownership", "Audit trails", "Action tracking", "Outcome review"].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <span className="text-emerald-700">
                    <CheckIcon />
                  </span>
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-2 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)]">
            {FAQS.map((f, idx) => {
              const open = openFAQ === idx;
              return (
                <button
                  key={f.q}
                  type="button"
                  onClick={() => setOpenFAQ((v) => (v === idx ? null : idx))}
                  className={cn(
                    "w-full rounded-[28px] p-4 text-left transition",
                    open ? "bg-slate-50" : "hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-semibold text-slate-900">{f.q}</div>
                    <span
                      className={cn(
                        "mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white ring-1 ring-slate-200 transition",
                        open ? "rotate-45" : ""
                      )}
                    >
                      <span className="text-slate-700">+</span>
                    </span>
                  </div>
                  {open ? (
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.a}</p>
                  ) : null}
                </button>
              );
            })}
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
                  <ShieldIcon />
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Evermore</div>
                  <div className="text-xs font-semibold text-slate-500">Quality & Safety</div>
                </div>
              </div>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
                Safer care through measurable standards, audit-ready governance, and patient feedback that drives action.
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
              <Link href="/help" className="hover:underline">
                Help
              </Link>
            </div>

            <div className="grid gap-2 text-sm font-semibold text-slate-700">
              <a href="#metrics" className="hover:underline">
                Metrics
              </a>
              <a href="#audits" className="hover:underline">
                Audits
              </a>
              <a href="#incident" className="hover:underline">
                Report incident
              </a>
              <a href="#feedback" className="hover:underline">
                Feedback
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

      {/* Floating CTA */}
      <div className="fixed bottom-4 right-4 z-[65]">
        <div className="rounded-[28px] bg-white p-2 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.12)]">
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,99,235,.18)] hover:bg-blue-700"
            >
              Open Portal <ArrowRightIcon />
            </Link>
            <a
              href="#incident"
              className="hidden rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 sm:inline-flex"
            >
              Report issue
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
