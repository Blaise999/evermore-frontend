"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

import StickyHeader from "../components/landing/StickyHeader.client";
import Footer from "../components/landing/Footer";
import GradientDivider from "../components/landing/GradientDivider";

type Job = {
  id: string;
  title: string;
  dept: "Clinical" | "Operations" | "Technology" | "Customer Support" | "Finance";
  location: string; // UK city
  type: "Full-time" | "Part-time" | "Contract";
  work: "On-site" | "Hybrid" | "Remote";
  level: "Entry" | "Mid" | "Senior" | "Lead";
  summary: string;
  bullets: string[];
};

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
      {children}
    </span>
  );
}

function SectionLabel({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 shadow-[0_10px_25px_rgba(2,8,23,.06)]">
      <span className="h-2 w-2 rounded-full bg-blue-600" />
      <span>{title}</span>
      {subtitle ? <span className="text-slate-400">•</span> : null}
      {subtitle ? <span className="text-slate-500">{subtitle}</span> : null}
    </div>
  );
}

function PrimaryButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl bg-blue-700 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(29,78,216,.25)] ring-1 ring-blue-700/20 transition hover:bg-blue-800",
        className
      )}
    >
      {children}
    </Link>
  );
}

function GhostButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-50",
        className
      )}
    >
      {children}
    </Link>
  );
}

function JobCard({ job, onOpen }: { job: Job; onOpen: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(job.id)}
      className="group w-full rounded-3xl bg-white p-6 text-left ring-1 ring-slate-200 shadow-[0_24px_70px_rgba(2,8,23,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_30px_90px_rgba(2,8,23,.10)]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Chip>{job.dept}</Chip>
        <Chip>{job.location}</Chip>
        <Chip>{job.work}</Chip>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold text-slate-900">{job.title}</div>
          <div className="mt-1 text-sm text-slate-600">
            {job.type} • {job.level}
          </div>
        </div>

        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 ring-1 ring-blue-100 text-blue-700 transition group-hover:bg-blue-100">
          →
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-600">{job.summary}</p>

      <div className="mt-4 text-xs font-semibold text-blue-700">View details</div>
    </button>
  );
}

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
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-slate-950/60" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-[0_40px_120px_rgba(2,8,23,.35)] ring-1 ring-slate-200">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 p-5">
            <div>
              <div className="text-sm font-semibold text-slate-900">{title}</div>
              <div className="mt-1 text-xs text-slate-500">
                UK-based roles • Apply via email or contact page (wire to ATS later)
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function CareersPage() {
  const jobs: Job[] = useMemo(
    () => [
      {
        id: "clinical-nurse-london",
        title: "Registered Nurse (Outpatient)",
        dept: "Clinical",
        location: "London",
        type: "Full-time",
        work: "On-site",
        level: "Mid",
        summary:
          "Support outpatient care pathways with calm communication, accurate documentation, and strong patient experience.",
        bullets: [
          "Patient intake and preparation",
          "Assist clinicians during procedures and consults",
          "Maintain accurate clinical notes and follow-up steps",
          "Coordinate with reception and labs for smooth flow",
        ],
      },
      {
        id: "ops-reception-manchester",
        title: "Clinic Reception & Patient Experience Associate",
        dept: "Operations",
        location: "Manchester",
        type: "Full-time",
        work: "On-site",
        level: "Entry",
        summary:
          "Be the first calm point of contact—check-in, guidance, and smooth handoffs that reduce patient stress.",
        bullets: [
          "Check-in, scheduling support, and patient guidance",
          "Handle calls, messages, and routing to the right team",
          "Coordinate clinic flow and minor admin tasks",
          "Maintain service quality and hospitality standards",
        ],
      },
      {
        id: "tech-frontend-birmingham",
        title: "Frontend Engineer (Next.js / Portal)",
        dept: "Technology",
        location: "Birmingham",
        type: "Full-time",
        work: "Hybrid",
        level: "Senior",
        summary:
          "Build fast, secure portal UX for bookings, billing, and records—performance and clarity first.",
        bullets: [
          "Own portal UI components and page performance",
          "Work with backend APIs and secure sessions",
          "Implement robust state and caching patterns",
          "Ship polished UI consistent with Evermore brand",
        ],
      },
      {
        id: "support-customer-remote",
        title: "Customer Support Specialist (Portal & Billing)",
        dept: "Customer Support",
        location: "Leeds",
        type: "Full-time",
        work: "Remote",
        level: "Mid",
        summary:
          "Help patients resolve portal access, booking questions, and billing clarity with empathy and accuracy.",
        bullets: [
          "Resolve login/OTP/account access issues",
          "Billing support: invoices, receipts, and payment routing",
          "Escalate clinical matters safely to the right teams",
          "Write and maintain help-center articles",
        ],
      },
      {
        id: "finance-billing-london",
        title: "Billing & Revenue Operations Associate",
        dept: "Finance",
        location: "London",
        type: "Full-time",
        work: "Hybrid",
        level: "Mid",
        summary:
          "Keep billing and receipts clean, accurate, and patient-friendly—reduce confusion through better workflows.",
        bullets: [
          "Invoice accuracy and reconciliation support",
          "Manage payment status workflows and exceptions",
          "Coordinate with support and clinics on billing disputes",
          "Improve billing clarity and portal guidance",
        ],
      },
    ],
    []
  );

  const [q, setQ] = useState("");
  const [dept, setDept] = useState<"All" | Job["dept"]>("All");
  const [work, setWork] = useState<"All" | Job["work"]>("All");
  const [openId, setOpenId] = useState<string | null>(null);

  const openJob = jobs.find((j) => j.id === openId) ?? null;

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return jobs.filter((j) => {
      const hitQ =
        !s ||
        j.title.toLowerCase().includes(s) ||
        j.location.toLowerCase().includes(s) ||
        j.dept.toLowerCase().includes(s) ||
        j.summary.toLowerCase().includes(s);
      const hitDept = dept === "All" || j.dept === dept;
      const hitWork = work === "All" || j.work === work;
      return hitQ && hitDept && hitWork;
    });
  }, [jobs, q, dept, work]);

  return (
    <main className="bg-white text-slate-900">
      <StickyHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute -right-40 -top-48 h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-white" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-12">
          <SectionLabel title="Careers" subtitle="UK-based" />

          <div className="mt-5 grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                Join Evermore.
                <span className="block bg-gradient-to-r from-blue-700 via-cyan-600 to-slate-900 bg-clip-text text-transparent">
                  Build calmer healthcare experiences.
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
                We’re building a UK-first care network with a portal that keeps appointments, results, and billing
                organised. We hire people who communicate clearly, move fast, and care deeply about patient experience.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <PrimaryButton href="/signup">Create account</PrimaryButton>
                <GhostButton href="/contact">Contact</GhostButton>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Chip>Patient-first</Chip>
                <Chip>High standards</Chip>
                <Chip>Clear communication</Chip>
                <Chip>Portal-driven care</Chip>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-950 p-7 text-white shadow-[0_30px_110px_rgba(2,8,23,.25)]">
              <div className="text-xs font-semibold opacity-80">Hiring process</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">Fast, respectful, transparent.</div>
              <div className="mt-3 space-y-3 text-sm leading-relaxed opacity-85">
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <div className="font-semibold">1) Apply</div>
                  <div className="text-xs opacity-85">Send a CV + short note.</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <div className="font-semibold">2) Interview</div>
                  <div className="text-xs opacity-85">Role-specific and practical.</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <div className="font-semibold">3) Offer</div>
                  <div className="text-xs opacity-85">Clear expectations and onboarding.</div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                <div className="text-sm font-semibold">Apply by email</div>
                <div className="mt-1 text-sm opacity-85">careers@evermore.health</div>
                <div className="mt-3">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-blue-700 ring-1 ring-white/25 hover:bg-slate-50"
                  >
                    Use contact form →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <GradientDivider />

      {/* FILTERS */}
      <section className="mx-auto max-w-7xl px-4 pb-14 pt-10">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <div>
            <div className="text-sm font-semibold text-slate-900">Open roles</div>
            <div className="mt-2 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200 shadow-[0_16px_45px_rgba(2,8,23,.06)]">
              <span className="text-slate-400">⌕</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search role, city, department…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200 shadow-[0_16px_45px_rgba(2,8,23,.06)]">
            <div className="text-[11px] font-semibold text-slate-500">Department</div>
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value as any)}
              className="mt-2 w-full rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 outline-none"
            >
              <option value="All">All</option>
              <option value="Clinical">Clinical</option>
              <option value="Operations">Operations</option>
              <option value="Technology">Technology</option>
              <option value="Customer Support">Customer Support</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200 shadow-[0_16px_45px_rgba(2,8,23,.06)]">
            <div className="text-[11px] font-semibold text-slate-500">Work style</div>
            <select
              value={work}
              onChange={(e) => setWork(e.target.value as any)}
              className="mt-2 w-full rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 outline-none"
            >
              <option value="All">All</option>
              <option value="On-site">On-site</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {filtered.map((j) => (
            <JobCard key={j.id} job={j} onOpen={setOpenId} />
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
            <div className="text-sm font-semibold text-slate-900">No matches</div>
            <div className="mt-2 text-sm text-slate-600">
              Try a different search, or switch filters. You can also send your CV to{" "}
              <span className="font-semibold text-slate-900">careers@evermore.health</span>.
            </div>
          </div>
        ) : null}
      </section>

      <GradientDivider />

      {/* BENEFITS + VALUES */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <SectionLabel title="Why Evermore" />
            <h2 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
              Work that feels meaningful — and organised.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              We’re obsessive about clarity: patients should understand what’s happening, and teams should have
              clean workflows. If you love high standards and calm execution, you’ll fit in.
            </p>

            <div className="mt-6 rounded-3xl bg-slate-950 p-7 text-white shadow-[0_30px_110px_rgba(2,8,23,.25)]">
              <div className="text-xs font-semibold opacity-80">Not seeing your role?</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">Send a speculative application.</div>
              <p className="mt-3 text-sm leading-relaxed opacity-85">
                Tell us what you do, where you’re based in the UK, and what kind of team you want to join.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-blue-700 ring-1 ring-white/25 hover:bg-slate-50"
                >
                  Contact →
                </Link>
                <Link
                  href="/locations"
                  className="inline-flex items-center justify-center rounded-2xl bg-white/10 px-6 py-3.5 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/15"
                >
                  View locations
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  t: "Clear communication",
                  d: "We write things down, confirm assumptions, and keep patients informed.",
                },
                { t: "High standards", d: "We care about details: quality, safety, and consistency." },
                { t: "Fast feedback", d: "Short loops, quick fixes, and clean handoffs." },
                { t: "Respectful teams", d: "No chaos culture. Calm work and real ownership." },
              ].map((x) => (
                <div
                  key={x.t}
                  className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-[0_24px_70px_rgba(2,8,23,.06)]"
                >
                  <div className="text-sm font-semibold text-slate-900">{x.t}</div>
                  <div className="mt-2 text-sm leading-relaxed text-slate-600">{x.d}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
              <div className="text-sm font-semibold text-slate-900">Benefits (example)</div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {[
                  "Competitive salary (UK market)",
                  "Training & certifications",
                  "Flexible scheduling where possible",
                  "Wellbeing support",
                  "Clear progression tracks",
                  "Modern tools & workflows",
                ].map((b) => (
                  <div key={b} className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200">
                    {b}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-slate-500">
                Replace this section with your real benefits package.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JOB MODAL */}
      <Modal
        open={!!openJob}
        onClose={() => setOpenId(null)}
        title={openJob?.title ?? "Role"}
      >
        {openJob ? (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Chip>{openJob.dept}</Chip>
              <Chip>{openJob.location}</Chip>
              <Chip>{openJob.work}</Chip>
              <Chip>
                {openJob.type} • {openJob.level}
              </Chip>
            </div>

            <div className="text-sm leading-relaxed text-slate-600">{openJob.summary}</div>

            <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
              <div className="text-sm font-semibold text-slate-900">What you’ll do</div>
              <ul className="mt-3 space-y-2">
                {openJob.bullets.map((b) => (
                  <li key={b} className="text-sm text-slate-600">
                    • {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
              <div className="text-sm font-semibold text-slate-900">How to apply</div>
              <div className="mt-2 text-sm text-slate-600">
                Email your CV and a short note to{" "}
                <span className="font-semibold text-slate-900">careers@evermore.health</span> with the subject:
                <span className="font-semibold text-slate-900"> “{openJob.title} — {openJob.location}”</span>.
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <PrimaryButton href="/contact">Apply via contact</PrimaryButton>
                <GhostButton href="/help">Help center</GhostButton>
              </div>

              <div className="mt-3 text-xs text-slate-500">
                Later you can wire this to an ATS and replace email applications.
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <Footer />
    </main>
  );
}
