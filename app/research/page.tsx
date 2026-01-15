// app/research/page.tsx
"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

/* --------------------------------- Icons --------------------------------- */
function Icon({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200 shadow-[0_18px_60px_rgba(2,8,23,.06)]",
        className
      )}
    >
      {children}
    </span>
  );
}

function HeartbeatIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-5 w-5", className)}
      fill="none"
    >
      <path
        d="M3 12h4l2-5 3 10 2-5h7"
        className="stroke-current"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M12 21s-7-4.7-9-10.3C1.6 6.2 4.4 3 8 3c1.9 0 3.2.9 4 2 0.8-1.1 2.1-2 4-2 3.6 0 6.4 3.2 5 7.7C19 16.3 12 21 12 21Z"
        className="stroke-current opacity-25"
        strokeWidth="1.2"
        strokeLinejoin="round"
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
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-5"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BeakerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M10 2v5l-5.6 9.7A3 3 0 0 0 7 21h10a3 3 0 0 0 2.6-4.3L14 7V2"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M9 9h6"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M4 5.5C4 4.1 5.1 3 6.5 3H20v17.5a.5.5 0 0 1-.5.5H6.5C5.1 21 4 19.9 4 18.5v-13Z"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M8 7h8M8 11h8M8 15h6"
        className="stroke-current"
        strokeWidth="1.7"
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

/* --------------------------------- Types --------------------------------- */
type OutputType = "Publication" | "Trial" | "Guideline" | "Dataset";

type OutputItem = {
  id: string;
  type: OutputType;
  title: string;
  summary: string;
  area: string;
  tags: string[];
  dateISO: string; // for sorting
  authors?: string[];
  journalOrVenue?: string;
  status?: "Recruiting" | "Active" | "Completed";
  link?: string; // optional external
};

type FAQItem = { q: string; a: string };

/* ------------------------------ Fake dataset ------------------------------ */
const RESEARCH_AREAS = [
  {
    k: "Cardiology",
    title: "Cardiology & Prevention",
    desc: "Risk stratification, early detection, and patient-centred prevention pathways.",
    bullets: ["Hypertension pathways", "Arrhythmia monitoring", "Preventive screening"],
    icon: <HeartbeatIcon className="text-blue-700" />,
  },
  {
    k: "Imaging",
    title: "Imaging & Diagnostics",
    desc: "Faster diagnosis with careful validation and safety-first governance.",
    bullets: ["Radiology workflows", "Clinical decision support", "Accuracy audits"],
    icon: <BeakerIcon className="text-indigo-700" />,
  },
  {
    k: "Dermatology",
    title: "Dermatology",
    desc: "Earlier triage and consistent outcomes through evidence-backed protocols.",
    bullets: ["Inflammatory skin disease", "Lesion triage", "Follow-up outcomes"],
    icon: <ShieldIcon className="text-emerald-700" />,
  },
  {
    k: "Orthopedics",
    title: "Orthopaedics",
    desc: "Rehab optimisation, pain pathways, and post-procedure monitoring.",
    bullets: ["MSK triage", "Recovery tracking", "Outcome measurements"],
    icon: <ShieldIcon className="text-slate-900" />,
  },
  {
    k: "Digital",
    title: "Digital Health",
    desc: "Evidence for portal features, remote monitoring, and patient engagement.",
    bullets: ["Portal usability", "Remote check-ins", "Adherence support"],
    icon: <BookIcon className="text-blue-700" />,
  },
  {
    k: "Quality",
    title: "Safety & Quality",
    desc: "Audit-led improvements, incident reduction, and clear accountability.",
    bullets: ["Clinical audits", "Safety signals", "Continuous improvement"],
    icon: <ShieldIcon className="text-rose-700" />,
  },
] as const;

const OUTPUTS: OutputItem[] = [
  {
    id: "PUB-001",
    type: "Publication",
    area: "Cardiology",
    tags: ["Hypertension", "Prevention", "Primary care"],
    dateISO: "2025-10-14",
    title: "Improving blood pressure control through structured follow-up in primary care",
    summary:
      "A prospective evaluation of structured follow-up, reminders, and lifestyle coaching with outcome tracking across 12 weeks.",
    authors: ["A. Morgan", "S. Patel", "E. Clarke"],
    journalOrVenue: "Evermore Clinical Notes",
    link: "#",
  },
  {
    id: "TRIAL-013",
    type: "Trial",
    area: "Digital",
    tags: ["Remote monitoring", "Adherence", "Patient portal"],
    dateISO: "2025-11-20",
    title: "Remote follow-up reminders vs standard care for appointment adherence",
    summary:
      "A pragmatic trial measuring no-show rates, patient satisfaction, and time-to-care across two reminder strategies.",
    status: "Recruiting",
    link: "#",
  },
  {
    id: "GUIDE-004",
    type: "Guideline",
    area: "Imaging",
    tags: ["Radiology", "Safety", "Workflow"],
    dateISO: "2025-09-02",
    title: "Imaging triage guideline for urgent referrals",
    summary:
      "Standardised triage rules for urgent imaging referrals with safety checks and escalation criteria.",
    link: "#",
  },
  {
    id: "DATA-002",
    type: "Dataset",
    area: "Quality",
    tags: ["Audit", "Outcomes", "Quality improvement"],
    dateISO: "2025-08-18",
    title: "Quality improvement dataset: follow-up completion rates (de-identified)",
    summary:
      "De-identified metrics designed for internal review and benchmarking across care pathways.",
    link: "#",
  },
  {
    id: "PUB-014",
    type: "Publication",
    area: "Dermatology",
    tags: ["Triage", "Outcomes", "Dermatology"],
    dateISO: "2025-12-05",
    title: "Dermatology triage consistency: a before-and-after outcomes review",
    summary:
      "A quality review focusing on triage consistency, wait times, and outcome tracking after protocol rollout.",
    authors: ["J. Smith", "A. Khan", "T. Johnson"],
    journalOrVenue: "Evermore Review",
    link: "#",
  },
  {
    id: "TRIAL-019",
    type: "Trial",
    area: "Orthopedics",
    tags: ["Rehab", "MSK", "Recovery"],
    dateISO: "2025-07-11",
    title: "Early rehab check-ins for MSK recovery (pilot)",
    summary:
      "A pilot evaluating whether early check-ins improve pain scores and reduce repeat visits after MSK consultations.",
    status: "Completed",
    link: "#",
  },
];

const FAQS: FAQItem[] = [
  {
    q: "Can patients participate in research or trials?",
    a: "Yes. Where appropriate, eligible patients may be invited to opt in. Participation is always voluntary, with clear information and consent.",
  },
  {
    q: "How do you handle ethics and consent?",
    a: "We follow a governance-first approach: clear purpose, minimum necessary data, consent where required, and continuous oversight.",
  },
  {
    q: "Do you share data with third parties?",
    a: "Only where appropriate and governed by policy and agreements. For published datasets, information should be de-identified and released with strict safeguards.",
  },
  {
    q: "How can universities or partners collaborate?",
    a: "Use the collaboration section below to propose a project, share scope, and outline what support you need. We’ll respond with next steps.",
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
  kicker,
  title,
  desc,
  right,
  icon,
  id,
}: {
  id?: string;
  kicker: string;
  title: string;
  desc?: string;
  right?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div id={id} className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          {icon ? (
            <span className="text-blue-700">{icon}</span>
          ) : (
            <span className="h-2 w-2 rounded-full bg-blue-600" />
          )}
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

/* --------------------------------- Modal --------------------------------- */
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
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
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        aria-label="Close modal overlay"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]"
      />
      <div className="relative w-full max-w-2xl rounded-[32px] bg-white p-5 ring-1 ring-slate-200 shadow-[0_40px_140px_rgba(2,8,23,.20)] sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-500">
              Research output
            </div>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-2xl bg-white p-2 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            aria-label="Close"
          >
            <XIcon />
          </button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

/* ---------------------------------- Page --------------------------------- */
export default function ResearchPage() {
  // Scroll progress
  const [progress, setProgress] = useState(0);

  // Header shrink
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      setScrolled(y > 10);

      const doc = document.documentElement;
      const total = Math.max(1, doc.scrollHeight - doc.clientHeight);
      const pct = Math.min(100, Math.max(0, (y / total) * 100));
      setProgress(pct);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Explorer state
  const [q, setQ] = useState("");
  const [type, setType] = useState<OutputType | "All">("All");
  const [area, setArea] = useState<string | "All">("All");
  const [tag, setTag] = useState<string | "All">("All");
  const [selected, setSelected] = useState<OutputItem | null>(null);

  const tagsAll = useMemo(() => {
    const s = new Set<string>();
    for (const it of OUTPUTS) it.tags.forEach((t) => s.add(t));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, []);

  const areasAll = useMemo(() => {
    const s = new Set<string>();
    for (const it of OUTPUTS) s.add(it.area);
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const out = OUTPUTS.filter((it) => {
      if (type !== "All" && it.type !== type) return false;
      if (area !== "All" && it.area !== area) return false;
      if (tag !== "All" && !it.tags.includes(tag)) return false;

      if (!query) return true;
      const hay = [
        it.title,
        it.summary,
        it.area,
        it.type,
        ...(it.tags || []),
        ...(it.authors || []),
        it.journalOrVenue || "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });

    // newest first
    out.sort((a, b) => (a.dateISO < b.dateISO ? 1 : a.dateISO > b.dateISO ? -1 : 0));
    return out;
  }, [q, type, area, tag]);

  // FAQ
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  // Collaborate form (lightweight)
  const [collab, setCollab] = useState({
    name: "",
    org: "",
    email: "",
    interest: "Clinical collaboration",
    message: "",
  });
  const [collabSent, setCollabSent] = useState(false);

  const submitCollab = (e: React.FormEvent) => {
    e.preventDefault();
    // This is UI-only; wire to your backend later if you want.
    setCollabSent(true);
    setTimeout(() => setCollabSent(false), 3500);
    setCollab({
      name: "",
      org: "",
      email: "",
      interest: "Clinical collaboration",
      message: "",
    });
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#F6FAFF] via-white to-white text-slate-900">
      {/* Scroll progress (top bar) */}
      <div className="fixed left-0 right-0 top-0 z-[70] h-[3px] bg-transparent">
        <div
          className="h-full bg-blue-600"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Background blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-[-140px] h-[420px] w-[420px] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -right-24 top-[80px] h-[420px] w-[420px] rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute left-1/2 top-[720px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-sky-200/35 blur-3xl" />
      </div>

      {/* Sticky header (implemented inline) */}
      <header
        className={cn(
          "sticky top-0 z-[60] border-b border-slate-200/60 bg-white/70 backdrop-blur-xl",
          scrolled ? "shadow-[0_10px_50px_rgba(2,8,23,.06)]" : ""
        )}
      >
        <div className="mx-auto max-w-7xl px-4">
          <div
            className={cn(
              "flex items-center justify-between gap-3 transition-all",
              scrolled ? "py-3" : "py-4"
            )}
          >
            <Link href="/" className="group inline-flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-b from-blue-600 to-indigo-600 text-white shadow-[0_18px_44px_rgba(37,99,235,.22)]">
                <HeartbeatIcon />
              </span>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-tight text-slate-900">
                  Evermore
                </div>
                <div className="text-[11px] font-semibold text-slate-500">
                  Patient-first care
                </div>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 md:flex">
              <a
                href="#areas"
                className="rounded-full px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Areas
              </a>
              <a
                href="#process"
                className="rounded-full px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Process
              </a>
              <a
                href="#explore"
                className="rounded-full px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Explore
              </a>
              <a
                href="#collaborate"
                className="rounded-full px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Collaborate
              </a>
              <Link
                href="/login"
                className="ml-1 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,99,235,.20)] hover:bg-blue-700"
              >
                Portal <ArrowRightIcon className="opacity-90" />
              </Link>
            </nav>

            <div className="flex items-center gap-2 md:hidden">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,99,235,.18)] hover:bg-blue-700"
              >
                Portal <ArrowRightIcon />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-10 md:pt-14">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Research & innovation
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              Evidence that improves care—fast.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600">
              Evermore research focuses on real-world outcomes: safer pathways,
              better follow-up, and smarter patient experiences. We validate
              interventions, measure impact, and translate findings into
              everyday care.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href="#explore"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,99,235,.22)] hover:bg-blue-700"
              >
                Explore outputs <ArrowRightIcon />
              </a>
              <a
                href="#collaborate"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                Partner with us <ArrowRightIcon />
              </a>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { k: "Governance-first", v: "Ethics + safety baked in" },
                { k: "Outcome-led", v: "Measure what matters" },
                { k: "Patient-centric", v: "Clear consent and control" },
              ].map((x) => (
                <div
                  key={x.k}
                  className="rounded-[28px] bg-white p-4 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)]"
                >
                  <div className="text-xs font-semibold text-slate-500">
                    {x.k}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {x.v}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right hero card */}
          <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.10)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-500">
                  Research snapshot
                </div>
                <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                  What we publish & measure
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  A balanced mix of pragmatic trials, pathway reviews, safety
                  audits, and guidelines—focused on real patient outcomes.
                </p>
              </div>
              <Icon className="text-blue-700">
                <BeakerIcon />
              </Icon>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                {
                  t: "Pragmatic trials",
                  d: "Real-world effectiveness and adherence",
                  i: <BeakerIcon className="text-blue-700" />,
                },
                {
                  t: "Clinical audits",
                  d: "Safety signals + measurable improvements",
                  i: <ShieldIcon className="text-emerald-700" />,
                },
                {
                  t: "Guidelines",
                  d: "Protocol clarity and repeatable outcomes",
                  i: <BookIcon className="text-indigo-700" />,
                },
                {
                  t: "Datasets",
                  d: "De-identified metrics for benchmarking",
                  i: <BookIcon className="text-slate-900" />,
                },
              ].map((x) => (
                <div
                  key={x.t}
                  className="rounded-[28px] bg-slate-50 p-4 ring-1 ring-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="text-slate-900">{x.i}</Icon>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {x.t}
                      </div>
                      <div className="mt-0.5 text-xs font-semibold text-slate-600">
                        {x.d}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[28px] bg-gradient-to-b from-blue-600 to-indigo-600 p-5 text-white shadow-[0_22px_70px_rgba(37,99,235,.25)]">
              <div className="text-sm font-semibold">
                Want to run a study with us?
              </div>
              <div className="mt-2 text-sm text-white/90">
                Share your hypothesis, proposed cohort, and desired outcomes.
                We’ll respond with governance and feasibility steps.
              </div>
              <a
                href="#collaborate"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900"
              >
                Collaborate <ArrowRightIcon />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip (inline) */}
      <section className="mx-auto mt-10 max-w-7xl px-4">
        <div className="rounded-[32px] bg-white p-5 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-semibold text-slate-900">
              Built for reliability, privacy, and clinical safety
            </div>
            <div className="flex flex-wrap gap-2">
              {["Governance-led", "Audit-ready", "De-identified metrics", "Secure workflows"].map(
                (t) => (
                  <span
                    key={t}
                    className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                  >
                    {t}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto mt-10 max-w-7xl px-4">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      {/* Areas */}
      <section id="areas" className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeader
          kicker="Focus areas"
          title="What we research"
          desc="Clinical research that’s practical, measurable, and designed to improve patient outcomes without adding friction."
          right={
            <a
              href="#explore"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Browse outputs <ArrowRightIcon />
            </a>
          }
          icon={<HeartbeatIcon />}
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {RESEARCH_AREAS.map((a) => (
            <div
              key={a.k}
              className="rounded-[32px] bg-white p-5 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold tracking-tight text-slate-900">
                    {a.title}
                  </div>
                  <div className="mt-2 text-sm leading-relaxed text-slate-600">
                    {a.desc}
                  </div>
                </div>
                <Icon>{a.icon}</Icon>
              </div>

              <div className="mt-4 space-y-2">
                {a.bullets.map((b) => (
                  <div key={b} className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-700">
                      <CheckIcon />
                    </span>
                    <div className="text-sm font-semibold text-slate-700">
                      {b}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Pill
                  onClick={() => {
                    setArea(a.k);
                    setType("All");
                    setTag("All");
                    setQ("");
                    document.getElementById("explore")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  Explore {a.k}
                </Pill>
                <a
                  href="#collaborate"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-white"
                >
                  Collaborate <ArrowRightIcon />
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

      {/* Process */}
      <section id="process" className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeader
          kicker="How we run research"
          title="A governance-first process"
          desc="Clear checkpoints so studies move fast while staying safe: define, validate, review, run, publish, improve."
          icon={<ShieldIcon />}
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)] lg:col-span-2">
            <ol className="space-y-4">
              {[
                {
                  t: "1) Define the question",
                  d: "Outcome-first: what changes for the patient if this works?",
                },
                {
                  t: "2) Minimise risk & data",
                  d: "Minimum necessary data, clear consent, and safety-by-design.",
                },
                {
                  t: "3) Governance review",
                  d: "Ethics, privacy, feasibility, and clinical owner sign-off.",
                },
                {
                  t: "4) Run & monitor",
                  d: "Recruitment rules, safety signals, and continuous monitoring.",
                },
                {
                  t: "5) Analyse & publish",
                  d: "Transparent reporting with clear limitations and next steps.",
                },
                {
                  t: "6) Translate into care",
                  d: "Turn findings into pathways, training, and measurable improvements.",
                },
              ].map((x) => (
                <li
                  key={x.t}
                  className="rounded-[28px] bg-slate-50 p-4 ring-1 ring-slate-200"
                >
                  <div className="text-sm font-semibold text-slate-900">
                    {x.t}
                  </div>
                  <div className="mt-1 text-sm leading-relaxed text-slate-600">
                    {x.d}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-500">
                    Ethics & privacy
                  </div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">
                    Patient control, always
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Clear consent, minimum necessary data, and safeguards for
                    sensitive health information.
                  </p>
                </div>
                <Icon className="text-emerald-700">
                  <ShieldIcon />
                </Icon>
              </div>

              <div className="mt-4 space-y-2 text-sm font-semibold text-slate-700">
                {[
                  "Explicit consent where required",
                  "Audit logs & accountability",
                  "De-identification for metrics",
                  "Secure access controls",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <span className="text-emerald-700">
                      <CheckIcon />
                    </span>
                    {t}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] bg-gradient-to-b from-slate-900 to-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(2,8,23,.22)]">
              <div className="text-xs font-semibold text-white/70">
                Translational impact
              </div>
              <div className="mt-2 text-lg font-semibold">
                Research that changes practice
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                We prioritise work that becomes safer pathways, better follow-up,
                fewer delays, and clearer patient experiences.
              </p>
              <a
                href="#explore"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900"
              >
                See outputs <ArrowRightIcon />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      {/* Explorer */}
      <section id="explore" className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeader
          kicker="Explore"
          title="Publications, trials, guidelines & datasets"
          desc="Search outputs by topic, area, and type. These items are UI placeholders—wire them to your DB when ready."
          right={
            <button
              type="button"
              onClick={() => {
                setQ("");
                setType("All");
                setArea("All");
                setTag("All");
              }}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Reset filters
            </button>
          }
          icon={<BookIcon />}
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {/* Filters */}
          <div className="rounded-[32px] bg-white p-5 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)] lg:sticky lg:top-24 lg:h-fit">
            <div className="text-sm font-semibold text-slate-900">
              Search & filters
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-600">
                Search
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-2xl bg-white px-3 py-3 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-blue-500/40">
                <span className="text-slate-500">
                  <SearchIcon />
                </span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="e.g. hypertension, portal, triage..."
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold text-slate-600">Type</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["All", "Publication", "Trial", "Guideline", "Dataset"] as const).map(
                  (t) => (
                    <Pill key={t} active={type === t} onClick={() => setType(t)}>
                      {t}
                    </Pill>
                  )
                )}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold text-slate-600">Area</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Pill active={area === "All"} onClick={() => setArea("All")}>
                  All
                </Pill>
                {areasAll.map((a) => (
                  <Pill key={a} active={area === a} onClick={() => setArea(a)}>
                    {a}
                  </Pill>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold text-slate-600">Tag</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Pill active={tag === "All"} onClick={() => setTag("All")}>
                  All
                </Pill>
                {tagsAll.slice(0, 12).map((t) => (
                  <Pill key={t} active={tag === t} onClick={() => setTag(t)}>
                    {t}
                  </Pill>
                ))}
              </div>
              {tagsAll.length > 12 ? (
                <div className="mt-3 text-xs font-semibold text-slate-500">
                  Tip: use search to find more tags.
                </div>
              ) : null}
            </div>

            <div className="mt-5 rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="text-xs font-semibold text-slate-500">
                Results
              </div>
              <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                {filtered.length}
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-600">
                Matched outputs
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            <div className="grid gap-4">
              {filtered.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => setSelected(it)}
                  className="group text-left rounded-[32px] bg-white p-5 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)] transition hover:bg-slate-50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                          {it.type}
                        </span>
                        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
                          {it.area}
                        </span>
                        {it.status ? (
                          <span
                            className={cn(
                              "rounded-full px-3 py-1.5 text-xs font-semibold ring-1",
                              it.status === "Recruiting"
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                : it.status === "Active"
                                ? "bg-indigo-50 text-indigo-700 ring-indigo-200"
                                : "bg-slate-50 text-slate-700 ring-slate-200"
                            )}
                          >
                            {it.status}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
                        {it.title}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {it.summary}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-xs font-semibold text-slate-500">
                        Date
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {new Date(it.dateISO).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>

                      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 group-hover:bg-slate-50">
                        View details <ArrowRightIcon />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {it.tags.slice(0, 6).map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </button>
              ))}

              {filtered.length === 0 ? (
                <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)]">
                  <div className="text-lg font-semibold text-slate-900">
                    No matches
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Try removing a filter or searching a broader keyword.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Modal details */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title || ""}
      >
        {selected ? (
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                {selected.type}
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
                {selected.area}
              </span>
              {selected.status ? (
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  {selected.status}
                </span>
              ) : null}
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                {new Date(selected.dateISO).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-700">
              {selected.summary}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-xs font-semibold text-slate-500">
                  Tags
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selected.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-xs font-semibold text-slate-500">
                  Notes
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  {selected.journalOrVenue ? selected.journalOrVenue : "Internal output"}
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  {selected.authors?.length
                    ? `Authors: ${selected.authors.join(", ")}`
                    : "Authors not listed for this item."}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setType(selected.type);
                  setArea(selected.area);
                  setTag("All");
                  setQ("");
                  setSelected(null);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                Filter like this <ArrowRightIcon />
              </button>

              <a
                href="#collaborate"
                onClick={() => setSelected(null)}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,99,235,.20)] hover:bg-blue-700"
              >
                Collaborate <ArrowRightIcon />
              </a>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      {/* Collaborate */}
      <section id="collaborate" className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeader
          kicker="Collaborate"
          title="Partner with Evermore Research"
          desc="Universities, clinical partners, and industry teams can propose research, audits, or digital health studies. Start with a short brief."
          icon={<BeakerIcon />}
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[32px] bg-gradient-to-b from-blue-600 to-indigo-600 p-6 text-white shadow-[0_30px_90px_rgba(37,99,235,.25)] lg:col-span-1">
            <div className="text-xs font-semibold text-white/70">
              What we like to see
            </div>
            <div className="mt-2 text-lg font-semibold">
              Clear outcomes & feasibility
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white/85">
              The best proposals define a measurable outcome, explain the cohort,
              and state what changes for the patient if the work succeeds.
            </p>

            <div className="mt-5 space-y-2 text-sm font-semibold">
              {[
                "A short hypothesis",
                "Proposed cohort + timeframe",
                "Primary outcome metric",
                "Governance considerations",
              ].map((t) => (
                <div key={t} className="flex items-center gap-2 text-white/95">
                  <span className="text-white">
                    <CheckIcon />
                  </span>
                  {t}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[24px] bg-white/10 p-4 ring-1 ring-white/15">
              <div className="text-xs font-semibold text-white/70">
                Response time
              </div>
              <div className="mt-1 text-2xl font-semibold">1–3 days</div>
              <div className="mt-1 text-xs font-semibold text-white/70">
                Typical initial reply (project dependent)
              </div>
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.10)] lg:col-span-2">
            <div className="text-xs font-semibold text-slate-500">
              Collaboration request
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Send a short brief
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              This is UI-only right now. If you want, I’ll wire it to a backend
              route (e.g. POST /api/research/collaborate) and store in Mongo +
              admin inbox.
            </p>

            {collabSent ? (
              <div className="mt-5 rounded-3xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
                Received. We’ll review and respond with next steps.
              </div>
            ) : null}

            <form onSubmit={submitCollab} className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="text-sm font-semibold text-slate-900">
                  Full name
                </label>
                <input
                  value={collab.name}
                  onChange={(e) => setCollab((s) => ({ ...s, name: e.target.value }))}
                  className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  placeholder="Your name"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="text-sm font-semibold text-slate-900">
                  Organisation
                </label>
                <input
                  value={collab.org}
                  onChange={(e) => setCollab((s) => ({ ...s, org: e.target.value }))}
                  className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  placeholder="University / Clinic / Company"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="text-sm font-semibold text-slate-900">
                  Email
                </label>
                <input
                  value={collab.email}
                  onChange={(e) => setCollab((s) => ({ ...s, email: e.target.value }))}
                  className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  placeholder="you@org.com"
                  inputMode="email"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="text-sm font-semibold text-slate-900">
                  Interest
                </label>
                <select
                  value={collab.interest}
                  onChange={(e) => setCollab((s) => ({ ...s, interest: e.target.value }))}
                  className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <option>Clinical collaboration</option>
                  <option>Digital health study</option>
                  <option>Audit / quality improvement</option>
                  <option>Trial / recruitment</option>
                  <option>Publication / review</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-slate-900">
                  Short brief
                </label>
                <textarea
                  value={collab.message}
                  onChange={(e) => setCollab((s) => ({ ...s, message: e.target.value }))}
                  className="mt-2 min-h-[130px] w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  placeholder="Tell us your hypothesis, cohort, primary outcome, and timeframe."
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,99,235,.24)] transition hover:bg-blue-700 active:translate-y-[1px]"
                >
                  Submit request
                </button>

                <div className="mt-3 text-xs font-semibold text-slate-500">
                  By submitting, you confirm you have permission to share this information.
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeader
          kicker="FAQ"
          title="Common questions"
          desc="Quick clarity on participation, ethics, privacy, and collaboration."
          icon={<ShieldIcon />}
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)]">
            <div className="text-xs font-semibold text-slate-500">
              Research & participation
            </div>
            <div className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
              Transparent, voluntary, safe
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Research participation is always opt-in, with clear information and the ability to withdraw where applicable.
            </p>

            <div className="mt-5 space-y-2 text-sm font-semibold text-slate-700">
              {[
                "You can ask questions before consenting",
                "Participation is voluntary",
                "Governance oversight for safety",
                "Minimal data collection where possible",
              ].map((t) => (
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
                    <div className="text-sm font-semibold text-slate-900">
                      {f.q}
                    </div>
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
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {f.a}
                    </p>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer (inline) */}
      <footer className="border-t border-slate-200/60 bg-white/60">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-b from-blue-600 to-indigo-600 text-white shadow-[0_18px_44px_rgba(37,99,235,.18)]">
                  <HeartbeatIcon />
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Evermore
                  </div>
                  <div className="text-xs font-semibold text-slate-500">
                    Research & patient care
                  </div>
                </div>
              </div>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
                Patient-first research focused on measurable outcomes, safer pathways,
                and real-world improvements.
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
              <a href="#areas" className="hover:underline">
                Areas
              </a>
              <a href="#process" className="hover:underline">
                Process
              </a>
              <a href="#explore" className="hover:underline">
                Explore
              </a>
              <a href="#collaborate" className="hover:underline">
                Collaborate
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
              href="#explore"
              className="hidden rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 sm:inline-flex"
            >
              Explore research
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
