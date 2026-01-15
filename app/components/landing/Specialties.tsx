// app/components/landing/Specialties.tsx
import Link from "next/link";
import Image from "next/image";
import React from "react";

type IconProps = { className?: string };
function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
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

function Heartbeat({ className }: IconProps) {
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

export default function Specialties() {
  const items = [
    { t: "Cardiology", d: "Heart screenings, follow-ups, and diagnostics.", img: "/Pictures/specialty-3.jpg" },
    { t: "Dermatology", d: "Skin health, treatments, and procedures.", img: "/Pictures/specialty-4.jpg" },
    { t: "Orthopedics", d: "Sports injuries, rehab, joint & mobility care.", img: "/Pictures/specialty-5.jpg" },
    { t: "Pediatrics", d: "Gentle care for children and families.", img: "/Pictures/specialty-6.jpg" },
    { t: "Women’s Health", d: "Prenatal, postpartum, and routine visits.", img: "/Pictures/specialty-9.jpg" },
    { t: "Imaging & Labs", d: "Testing with results available in your portal.", img: "/Pictures/specialty-2.jpg" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionLabel icon={<Heartbeat />} text="Specialties" />
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Specialty care across key departments
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            Find a specialty clinic, understand what to expect, and book a visit.
          </p>
        </div>
        <PrimaryButton href="/specialties" className="px-5 py-3 text-sm">
          Explore specialties
        </PrimaryButton>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((x) => (
          <Link
            key={x.t}
            href="/specialties"
            className="group relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 shadow-[0_22px_70px_rgba(2,8,23,.10)] transition hover:-translate-y-0.5 hover:shadow-[0_30px_90px_rgba(2,8,23,.14)]"
          >
            <div className="relative h-44">
              <Image src={x.img} alt={x.t} fill className="object-cover" quality={82} sizes="33vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/15 to-transparent" />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-lg font-semibold tracking-tight text-slate-900">{x.t}</div>
                <ArrowRight className="h-4 w-4 text-blue-700 opacity-70 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{x.d}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <MiniTag text="Book online" />
                <MiniTag text="Clear instructions" />
                <MiniTag text="Follow-up" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
