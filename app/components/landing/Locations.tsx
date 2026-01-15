// app/components/landing/Locations.tsx
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

function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 shadow-[0_10px_25px_rgba(2,8,23,.06)]">
      <span className="text-blue-600">{icon}</span>
      <span>{text}</span>
    </div>
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

export default function Locations() {
  const locs = [
    { t: "Evermore Express • Midtown", d: "Open today • 7AM – 7PM • Walk-in + video", img: "/Pictures/locations-1.png" },
    { t: "Evermore Specialty • Downtown", d: "Specialists • Imaging • Labs • Results access", img: "/Pictures/locations-2.jpg" },
    { t: "Evermore Primary • Uptown", d: "Checkups • Preventive care • Referrals", img: "/Pictures/locations-3.png" },
  ];

  return (
    <section id="locations" className="mx-auto max-w-7xl px-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionLabel icon={<Sparkle />} text="Locations" />
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Find a clinic near you
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            Hours, directions, and services — all in one place.
          </p>
        </div>
        <PrimaryButton href="/locations" className="px-5 py-3 text-sm">
          Search locations
        </PrimaryButton>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {locs.map((x) => (
          <div
            key={x.t}
            className="relative overflow-hidden rounded-3xl ring-1 ring-slate-200 shadow-[0_24px_80px_rgba(2,8,23,.12)]"
          >
            <div className="relative h-[260px]">
              <Image src={x.img} alt={x.t} fill className="object-cover" quality={82} sizes="33vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <div className="text-lg font-semibold tracking-tight">{x.t}</div>
              <div className="mt-1 text-sm opacity-90">{x.d}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/login"
                  className="rounded-2xl bg-white/15 px-4 py-2.5 text-sm font-semibold ring-1 ring-white/20 hover:bg-white/20"
                >
                  Book
                </Link>
                <Link
                  href="/locations"
                  className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                >
                  Directions
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { k: "Hours", v: "Most sites open daily", img: "/Pictures/locations-2.jpg" },
          { k: "Check-in", v: "Faster check-in with your account", img: "/Pictures/portal-1.jpg" },
          { k: "Accessibility", v: "Clear entrances and guidance", img: "/Pictures/Wheelchair.jpg" },
        ].map((x) => (
          <div
            key={x.k}
            className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 shadow-[0_20px_60px_rgba(2,8,23,.08)]"
          >
            <div className="relative h-28">
              <Image src={x.img} alt={x.k} fill className="object-cover" quality={82} sizes="33vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
            </div>
            <div className="p-5">
              <div className="text-sm font-semibold text-slate-900">{x.k}</div>
              <div className="mt-1 text-sm text-slate-600">{x.v}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
