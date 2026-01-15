// app/components/landing/Hero.client.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { cn, SectionLabel, Sparkle, PrimaryButton } from "./ui";

export default function Hero() {
  const slides = [
    {
      img: "/Pictures/hero-1.jpg",
      headline: "Specialists, diagnostics, and clear next steps.",
      sub: "From cardiology to dermatology — coordinated care, clear instructions, and faster follow-up when you need answers.",
      tag: "Specialty services",
    },
    {
      img: "/Pictures/hero-2.jpg",
      headline: "Same-day care, calmer visits.",
      sub: "Book online, arrive prepared, and keep your records in one secure portal — for you and your family.",
      tag: "Express & primary care",
    },
    {
      img: "/Pictures/hero-3.jpg",
      headline: "Your results and visits — organized.",
      sub: "Appointments, lab and imaging results, prescriptions, and billing — all in one secure place.",
      tag: "Patient portal",
    },
  ];

  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 5200);
    return () => clearInterval(t);
  }, [slides.length]);

  const s = slides[i];

  return (
    <section className="relative overflow-hidden">
      <div className="relative min-h-[720px]">
        <div className="absolute inset-0">
          <Image
            src={s.img}
            alt="Evermore hero"
            fill
            priority={i === 0}
            quality={88}
            sizes="100vw"
            className="object-cover [filter:saturate(1.18)_contrast(1.12)_brightness(1.02)]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/12 to-slate-950/8" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/68 via-slate-950/20 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-14 lg:pb-16 lg:pt-20">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
            <div className="max-w-xl text-white">
              <SectionLabel icon={<Sparkle />} text={s.tag} tone="dark" />

              <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
                {s.headline}
                <span className="block bg-gradient-to-r from-cyan-200 via-blue-200 to-white bg-clip-text text-transparent">
                  Evermore Hospitals.
                </span>
              </h1>

              <p className="mt-5 text-sm leading-relaxed text-white/85 md:text-base">{s.sub}</p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <PrimaryButton href="/locations">Find a location</PrimaryButton>
                <Link
                  href="/signup"
                  prefetch={false}
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 ring-1 ring-white/25 transition hover:bg-slate-50"
                >
                  Create your account
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { k: "Same-day visits", v: "Daily" },
                  { k: "Specialty clinics", v: "40+" },
                  { k: "Patient support", v: "24/7" },
                ].map((x) => (
                  <div key={x.k} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                    <div className="text-[11px] font-semibold text-white/70">{x.k}</div>
                    <div className="mt-2 text-2xl font-semibold">{x.v}</div>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex items-center gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setI(idx)}
                    className={cn(
                      "h-2.5 w-2.5 rounded-full ring-1 transition",
                      idx === i ? "bg-cyan-200 ring-white/30" : "bg-white/20 ring-white/25 hover:bg-white/30"
                    )}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="relative">{/* keep your right-side block here if you had one */}</div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-white" />
        </div>
      </div>
    </section>
  );
}
