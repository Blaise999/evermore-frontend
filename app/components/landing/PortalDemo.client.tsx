// app/components/landing/PortalDemo.client.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";

type IconProps = { className?: string };
function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

/** ---------- Icons ---------- */
function Shield({ className }: IconProps) {
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

/** ---------- Reusable UI ---------- */
function MiniTag({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
      {text}
    </span>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 shadow-[0_16px_36px_rgba(2,8,23,.08)]">
      <div className="text-[11px] font-semibold text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </div>
    </div>
  );
}

function SectionLabel({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 shadow-[0_10px_25px_rgba(2,8,23,.06)]">
      <span className="text-blue-600">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

export default function PortalDemo() {
  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "appointments", label: "Appointments" },
    { key: "billing", label: "Billing" },
    { key: "records", label: "Results" },
  ] as const;

  type TabKey = (typeof tabs)[number]["key"];
  const [active, setActive] = useState<TabKey>("overview");
  const [maskMoney, setMaskMoney] = useState(false);

  const amount = "$18,500";
  const masked = "•••••";

  const panels: Record<TabKey, React.ReactNode> = {
    overview: (
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-500">This month</div>
            <button
              onClick={() => setMaskMoney((v) => !v)}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
            >
              {maskMoney ? "Show" : "Hide"}
            </button>
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {maskMoney ? masked : amount}
          </div>
          <div className="mt-2 text-xs text-slate-600">
            Statements and receipts available.
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <MiniTag text="Receipts" />
            <MiniTag text="Statements" />
            <MiniTag text="Payments" />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
          <div className="text-xs font-semibold text-slate-500">
            Next appointment
          </div>
          <div className="mt-2 text-xl font-semibold text-slate-900">
            Mon, 10:30 AM
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Internal Medicine — Dr. S. Harper
          </div>
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <div className="text-xs font-semibold text-slate-500">
              What to bring
            </div>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {["ID & insurance card", "Medication list", "Symptoms timeline"].map(
                (x) => (
                  <li key={x} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600/60" />
                    <span>{x}</span>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl ring-1 ring-slate-200 shadow-[0_24px_70px_rgba(37,99,235,.18)]">
          <div className="relative h-full min-h-[210px]">
            <Image
              src="/Pictures/portal-1.jpg"
              alt="Portal"
              fill
              className="object-cover"
              quality={82}
              sizes="33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/65 via-blue-700/40 to-cyan-500/15" />
          </div>
          <div className="absolute inset-0 p-5 text-white">
            <div className="text-xs font-semibold opacity-90">Hospital ID</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">
              EM-2049-1182
            </div>
            <div className="mt-2 text-xs opacity-90">
              Used across visits and locations.
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {["Book visit", "View results", "Pay bill", "Message team"].map(
                (x) => (
                  <button
                    key={x}
                    className="rounded-2xl bg-white/10 px-3 py-3 text-xs font-semibold ring-1 ring-white/15 hover:bg-white/15"
                  >
                    {x}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    ),

    appointments: (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">
              Upcoming visits
            </div>
            <MiniTag text="Reminders" />
          </div>

          <div className="mt-5 space-y-3">
            {[
              {
                day: "Mon",
                time: "10:30 AM",
                dept: "Internal Medicine",
                who: "Dr. Harper",
              },
              {
                day: "Wed",
                time: "2:00 PM",
                dept: "Cardiology",
                who: "Dr. Salim",
              },
              {
                day: "Fri",
                time: "9:10 AM",
                dept: "Dermatology",
                who: "Dr. Choi",
              },
            ].map((a) => (
              <div
                key={a.day + a.time}
                className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200 hover:bg-white transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-500">
                      {a.day} • {a.time}
                    </div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      {a.dept}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">{a.who}</div>
                  </div>
                  <button className="rounded-2xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_28px_rgba(37,99,235,.22)] hover:bg-blue-700">
                    Details
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <MiniTag text="Check-in online" />
                  <MiniTag text="Reschedule" />
                  <MiniTag text="Directions" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl ring-1 ring-slate-200">
          <div className="relative h-[420px]">
            <Image
              src="/Pictures/portal-2.jpg"
              alt="Appointments"
              fill
              className="object-cover"
              quality={82}
              sizes="50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/20 to-transparent" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <div className="text-xs font-semibold opacity-80">Visit prep</div>
            <div className="mt-2 text-2xl font-semibold">Arrive prepared.</div>
            <p className="mt-2 text-sm opacity-90">
              Prep notes, checklists, and directions — right where you need them.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <MiniTag text="Prep checklist" />
              <MiniTag text="Add to calendar" />
              <MiniTag text="One-tap directions" />
            </div>
          </div>
        </div>
      </div>
    ),

    billing: (
      <div className="grid gap-4 md:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">Billing</div>
            <MiniTag text="Clear statements" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <StatChip label="Total spend" value={maskMoney ? masked : "$52,120"} />
            <StatChip label="Pending" value={maskMoney ? masked : "$210"} />
            <StatChip label="Last payment" value={maskMoney ? masked : "$95"} />
          </div>

          <div className="mt-6 rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">
                Recent activity
              </div>
              <button
                onClick={() => setMaskMoney((v) => !v)}
                className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
              >
                {maskMoney ? "Show amounts" : "Hide amounts"}
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {[
                { title: "Express Care visit", date: "Dec 12", amt: "$95", status: "Paid" },
                { title: "Lab work (CBC)", date: "Dec 10", amt: "$45", status: "Paid" },
                { title: "Specialist consult", date: "Dec 04", amt: "$210", status: "Pending" },
                { title: "Imaging", date: "Nov 28", amt: "$1,020", status: "Paid" },
              ].map((x) => (
                <div
                  key={x.title + x.date}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{x.title}</div>
                    <div className="mt-1 text-xs text-slate-500">{x.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-900">
                      {maskMoney ? masked : x.amt}
                    </div>
                    <div
                      className={cn(
                        "mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1",
                        x.status === "Paid"
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                          : "bg-amber-50 text-amber-700 ring-amber-100"
                      )}
                    >
                      {x.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/receipts"
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(37,99,235,.22)] hover:bg-blue-700"
              >
                Download receipts
              </Link>
              <Link
                href="/pay"
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50"
              >
                Pay bill
              </Link>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl ring-1 ring-slate-200">
          <div className="relative h-full min-h-[420px]">
            <Image
              src="/Pictures/specialty-2.jpg"
              alt="Insurance"
              fill
              className="object-cover"
              quality={82}
              sizes="50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-blue-700/35 to-cyan-500/15" />
          </div>
          <div className="absolute inset-0 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold opacity-90">Coverage</div>
              <MiniTag text="Help available" />
            </div>

            <div className="mt-3 text-2xl font-semibold tracking-tight">
              Insurance support
            </div>
            <p className="mt-2 text-sm leading-relaxed opacity-90">
              View plan details, estimates, and claim updates — with guidance when needed.
            </p>

            <div className="mt-6 grid gap-3">
              {[
                { k: "Plan", v: "BlueCross PPO" },
                { k: "Deductible met", v: "62%" },
                { k: "Next claim ETA", v: "3–5 days" },
              ].map((row) => (
                <div
                  key={row.k}
                  className="flex items-center justify-between rounded-2xl bg-white/10 p-4 ring-1 ring-white/15"
                >
                  <div className="text-xs font-semibold opacity-80">{row.k}</div>
                  <div className="text-sm font-semibold">{row.v}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
              <div className="text-xs font-semibold opacity-80">Estimate example</div>
              <div className="mt-3 text-sm font-semibold">MRI • Knee</div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs opacity-80">Estimated out-of-pocket</div>
                <div className="text-lg font-semibold">
                  {maskMoney ? masked : "$140"}
                </div>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[68%] rounded-full bg-white/70" />
              </div>
              <div className="mt-2 text-xs opacity-80">Final cost may vary.</div>
            </div>
          </div>
        </div>
      </div>
    ),

    records: (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">
              Results & records
            </div>
            <MiniTag text="Secure" />
          </div>

          <div className="mt-5 space-y-3">
            {[
              { t: "Lab results • CBC", d: "Dec 10", s: "Ready" },
              { t: "Imaging • X-ray", d: "Nov 28", s: "Ready" },
              { t: "Clinical note • Follow-up", d: "Nov 12", s: "Ready" },
              { t: "Prescription history", d: "Updated", s: "Synced" },
            ].map((x) => (
              <div
                key={x.t}
                className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 hover:bg-white transition"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900">{x.t}</div>
                  <div className="mt-1 text-xs text-slate-500">{x.d}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                    {x.s}
                  </span>
                  <button className="rounded-2xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700">
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl bg-blue-50 p-5 ring-1 ring-blue-100">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-blue-700 ring-1 ring-blue-100">
                <Shield />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Privacy-first access
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Protected access to sensitive health information.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl ring-1 ring-slate-200">
          <div className="relative h-[520px]">
            <Image
              src="/Pictures/facility-5.jpg"
              alt="Records sharing"
              fill
              className="object-cover"
              quality={82}
              sizes="50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-950/35 to-blue-900/15" />
          </div>

          <div className="absolute inset-0 p-6 text-white">
            <div className="text-xs font-semibold opacity-75">Share records</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">
              Send records to another clinic quickly
            </div>
            <p className="mt-2 text-sm leading-relaxed opacity-85">
              Share a time-limited link (or QR) for read-only access.
            </p>

            <div className="mt-6 rounded-3xl bg-white/10 p-5 ring-1 ring-white/15">
              <div className="text-xs font-semibold opacity-80">One-time share link</div>
              <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
                <div className="truncate text-xs font-semibold opacity-90">
                  evermore.health/share/9F2A-44B1-7C0D
                </div>
                <button className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-blue-50">
                  Copy
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <div className="text-xs font-semibold opacity-75">Expires</div>
                  <div className="mt-2 text-lg font-semibold">15 min</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <div className="text-xs font-semibold opacity-75">Access</div>
                  <div className="mt-2 text-lg font-semibold">Read-only</div>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button className="flex-1 rounded-2xl bg-white/15 px-4 py-3 text-sm font-semibold ring-1 ring-white/20 hover:bg-white/20">
                  Generate QR
                </button>
                <button className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold hover:bg-blue-700">
                  Share now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <section id="portal" className="mx-auto max-w-7xl px-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionLabel icon={<Sparkle />} text="Patient Portal" />
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            A secure portal for your care journey
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            Appointments, results, billing, and visit summaries — easy to find and simple to use.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={cn(
                "rounded-2xl px-4 py-2 text-sm font-semibold ring-1 transition",
                active === t.key
                  ? "bg-blue-600 text-white ring-blue-600 shadow-[0_16px_40px_rgba(37,99,235,.25)]"
                  : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-[32px] bg-white p-5 ring-1 ring-slate-200 shadow-[0_26px_80px_rgba(2,8,23,.10)]">
        <div className="rounded-[28px] bg-gradient-to-br from-blue-50 via-white to-white ring-1 ring-blue-100 p-5 md:p-6">
          {panels[active]}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Shield className="h-4 w-4 text-blue-600" />
            Secure access to sensitive health information.
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/signup"
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,.25)] hover:bg-blue-700"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50"
            >
              Open portal
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
