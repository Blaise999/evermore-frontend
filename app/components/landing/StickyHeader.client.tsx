// app/components/landing/StickyHeader.client.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { cn, ChevronDown, ArrowRight, Shield, Sparkle, MiniTag } from "./ui";

type NavItem = {
  label: string;
  href: string;
  accent: string;
  featuredImg: string;
  featuredTitle: string;
  featuredDesc: string;
  quick: Array<{ label: string; href: string }>;
  items: Array<{ label: string; href: string; desc: string; meta: string }>;
};

export default function StickyHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);

  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav: NavItem[] = [
    {
      label: "Get Care",
      href: "#care",
      accent: "Care options",
      featuredImg: "/Pictures/facility-2.jpg",
      featuredTitle: "Same-day care when you need it",
      featuredDesc:
        "Express Care, Primary Care, and Specialty Clinics — simple booking and clear next steps.",
      quick: [
        { label: "Book now", href: "/login" },
        { label: "Express Care", href: "/login" },
        { label: "Emergency", href: "/login" },
      ],
      items: [
        { label: "Express Care", href: "/login", desc: "Fever, infections, sprains, urgent concerns", meta: "Open daily • Same-day" },
        { label: "Primary Care", href: "/login", desc: "Checkups, prevention, screenings, long-term follow-up", meta: "Continuity of care" },
        { label: "Specialty Clinics", href: "/login", desc: "Cardiology, Dermatology, Orthopedics, and more", meta: "Expert consults" },
        { label: "Emergency", href: "/login", desc: "For severe symptoms and emergencies (24/7 guidance)", meta: "Fast triage info" },
      ],
    },
    {
      label: "Patient Portal",
      href: "#portal",
      accent: "Your health information",
      featuredImg: "/Pictures/portal-1.jpg",
      featuredTitle: "Appointments, results, and bills — organized",
      featuredDesc:
        "See upcoming visits, lab and imaging results, prescriptions, and billing — in one secure place.",
      quick: [
        { label: "Create account", href: "/signup" },
        { label: "Login", href: "/login" },
        { label: "Open portal", href: "/login" },
      ],
      items: [
        { label: "Portal overview", href: "/login", desc: "Everything you can do as a patient", meta: "Simple & secure" },
        { label: "Appointments", href: "/login", desc: "Book, reschedule, prep checklists, directions", meta: "Reminders included" },
        { label: "Results", href: "/login", desc: "Labs and imaging results, clinical notes, prescriptions", meta: "Private access" },
        { label: "Billing", href: "/login", desc: "Pay bills, view statements, download receipts", meta: "Clear breakdown" },
        { label: "Messages", href: "/login", desc: "Get guidance from your care team", meta: "Less phone time" },
        { label: "Insurance", href: "/insurance", desc: "Plans accepted, coverage help, estimates", meta: "Support available" },
      ],
    },
    {
      label: "Locations",
      href: "#locations",
      accent: "Visit us",
      featuredImg: "/Pictures/locations-1.png",
      featuredTitle: "Multiple sites, one standard of care",
      featuredDesc:
        "Find an Evermore location near you, get directions, and see hours — faster check-in at the front desk.",
      quick: [
        { label: "Search", href: "/locations" },
        { label: "Directions", href: "/locations" },
        { label: "Contact", href: "/contact" },
      ],
      items: [
        { label: "Find a location", href: "/locations", desc: "Search by city, area, or clinic type", meta: "Fast search" },
        { label: "Express sites", href: "/login", desc: "Same-day care near you", meta: "Open daily" },
        { label: "Specialty centers", href: "/login", desc: "Centers for advanced care and diagnostics", meta: "Expert teams" },
        { label: "Primary care", href: "/login", desc: "Preventive visits and referrals", meta: "Continuity" },
        { label: "Labs & imaging", href: "/login", desc: "Schedule tests and view results in the portal", meta: "Quick turnaround" },
      ],
    },
    {
      label: "About",
      href: "#about",
      accent: "Standards & mission",
      featuredImg: "/Pictures/facility-5.jpg",
      featuredTitle: "Calm care. Clear communication.",
      featuredDesc:
        "Patient-centered pathways, safe clinical protocols, and teams that keep you informed.",
      quick: [
        { label: "Our story", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "News", href: "/evermore-now" },
      ],
      items: [
        { label: "Our story", href: "/about", desc: "Mission, leadership, and values", meta: "Patient-first" },
        { label: "Quality & safety", href: "/quality", desc: "Safety standards, protocols, and outcomes", meta: "Always improving" },
        { label: "Research", href: "/research", desc: "Clinical research and trials", meta: "Innovation" },
        { label: "Careers", href: "/careers", desc: "Join Evermore Hospitals", meta: "Hiring" },
        { label: "News & stories", href: "/evermore-now", desc: "Updates and community stories", meta: "Latest" },
      ],
    },
  ];

  const active = nav.find((n) => n.label === openLabel) ?? null;

  const openDropdown = (label: string) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpenLabel(label);
  };

  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenLabel(null), 120);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenLabel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (openMobile) setOpenLabel(null);
  }, [openMobile]);

  const headerVars = {
    ["--hdr-h" as any]: "clamp(72px, 6.5vw, 86px)",
    ["--logo-h" as any]: "clamp(52px, 4.8vw, 64px)",
    ["--logo-w" as any]: "clamp(135px, 12.5vw, 170px)",
  } as React.CSSProperties;

  return (
    <>
      <header
        style={headerVars}
        className={cn(
          "sticky top-0 z-[80] w-full transition",
          scrolled
            ? "bg-white/95 ring-1 ring-slate-200 shadow-[0_16px_50px_rgba(2,8,23,.10)]"
            : "bg-white/75"
        )}
      >
        <div className="relative h-[var(--hdr-h)] w-full">
          <div className="flex h-[var(--hdr-h)] w-full items-center pl-1 pr-3 sm:pl-2 sm:pr-6 lg:pl-4 lg:pr-10">
            <Link href="/" prefetch={false} className="flex items-center flex-shrink-0 ml-5 sm:ml-6">
              <div className="relative h-[var(--logo-h)] w-[var(--logo-w)]">
                <Image
                  src="/Pictures/Logos.png"
                  alt="Evermore Hospitals"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 52vw, (max-width: 1200px) 220px, 260px"
                />
              </div>
            </Link>

            <nav
              className="hidden md:flex flex-1 items-center justify-center gap-1"
              onMouseLeave={scheduleClose}
              onMouseEnter={() => {
                if (closeTimer.current) window.clearTimeout(closeTimer.current);
              }}
            >
              {nav.map((n) => (
                <button
                  key={n.label}
                  onMouseEnter={() => openDropdown(n.label)}
                  onFocus={() => openDropdown(n.label)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold transition",
                    openLabel === n.label ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {n.label}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 opacity-70 transition",
                      openLabel === n.label ? "rotate-180" : "rotate-0"
                    )}
                  />
                </button>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/login"
                prefetch={false}
                className="hidden rounded-2xl bg-white px-4 py-2 text-[13px] font-semibold text-blue-700 ring-1 ring-blue-200 transition hover:bg-blue-50 md:inline-flex"
              >
                Login
              </Link>
              <Link
                href="/signup"
                prefetch={false}
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_16px_34px_rgba(37,99,235,.22)] transition hover:bg-blue-700 active:translate-y-[1px]"
              >
                Create Account
              </Link>

              <button
                onClick={() => setOpenMobile((v) => !v)}
                className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-slate-200 shadow-sm transition hover:bg-slate-50"
                aria-label="Toggle menu"
                aria-expanded={openMobile}
              >
                <span className="relative block h-5 w-5">
                  <span
                    className={cn(
                      "absolute left-0 top-[3px] h-0.5 w-5 rounded-full bg-slate-800 transition-transform duration-200",
                      openMobile ? "translate-y-[7px] rotate-45" : ""
                    )}
                  />
                  <span
                    className={cn(
                      "absolute left-0 top-[9px] h-0.5 w-5 rounded-full bg-slate-800 transition-opacity duration-200",
                      openMobile ? "opacity-0" : "opacity-100"
                    )}
                  />
                  <span
                    className={cn(
                      "absolute left-0 top-[15px] h-0.5 w-5 rounded-full bg-slate-800 transition-transform duration-200",
                      openMobile ? "-translate-y-[5px] -rotate-45" : ""
                    )}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop mega dropdown panel — only mount when open */}
        {openLabel && active ? (
          <div className="hidden md:block">
            <div
              className="fixed left-0 right-0 z-[90]"
              style={{ top: "var(--hdr-h)" }}
              onMouseEnter={() => {
                if (closeTimer.current) window.clearTimeout(closeTimer.current);
              }}
              onMouseLeave={scheduleClose}
            >
              <div className="mx-auto max-w-7xl px-4">
                <div className="rounded-[28px] bg-white p-3 ring-1 ring-slate-200 shadow-[0_30px_90px_rgba(2,8,23,.16)]">
                  <div className="max-h-[calc(100vh-110px)] overflow-auto rounded-[22px]">
                    <div className="grid gap-3 lg:grid-cols-[1fr_.9fr]">
                      <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-[11px] font-semibold text-slate-500">{active.accent}</div>
                            <div className="mt-1 text-sm font-semibold text-slate-900">{active.label}</div>
                          </div>

                          <div className="hidden lg:flex items-center gap-2">
                            {active.quick.slice(0, 3).map((q) => (
                              <Link
                                key={q.label}
                                href={q.href}
                                prefetch={false}
                                className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50"
                              >
                                {q.label}
                              </Link>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {active.items.map((it) => (
                            <Link
                              key={it.label}
                              href={it.href}
                              prefetch={false}
                              className="group rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200 hover:bg-slate-50"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-sm font-semibold text-slate-900">{it.label}</div>
                                  <div className="mt-0.5 text-xs font-medium text-slate-600">{it.desc}</div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-blue-700 opacity-0 transition group-hover:opacity-80" />
                              </div>
                              <div className="mt-2 text-[11px] font-semibold text-slate-500">{it.meta}</div>
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div className="relative overflow-hidden rounded-2xl ring-1 ring-slate-200">
                        <div className="relative h-[260px]">
                          <Image
                            src={active.featuredImg}
                            alt={active.featuredTitle}
                            fill
                            quality={82}
                            className="object-cover"
                            sizes="40vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/65 via-blue-700/30 to-cyan-500/15" />
                        </div>

                        <div className="absolute inset-0 p-5 text-white">
                          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/15">
                            <Sparkle className="h-4 w-4" />
                            Evermore care
                          </div>

                          <div className="mt-4 text-2xl font-semibold tracking-tight">{active.featuredTitle}</div>
                          <p className="mt-2 text-sm leading-relaxed opacity-90">{active.featuredDesc}</p>

                          <div className="mt-5 grid grid-cols-2 gap-2">
                            <Link
                              href={active.quick[0]?.href ?? "/"}
                              prefetch={false}
                              className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                            >
                              {active.quick[0]?.label ?? "Open"}
                            </Link>
                            <Link
                              href={active.quick[1]?.href ?? "/"}
                              prefetch={false}
                              className="rounded-2xl bg-white/15 px-4 py-3 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/20"
                            >
                              {active.quick[1]?.label ?? "Explore"}
                            </Link>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <MiniTag text="Faster scheduling" />
                            <MiniTag text="Clear instructions" />
                            <MiniTag text="Secure records" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <Shield className="h-4 w-4 text-blue-700" />
                        Privacy-first handling of patient information
                      </div>
                      <Link
                        href={active.href ?? "#"}
                        prefetch={false}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50"
                        onClick={() => setOpenLabel(null)}
                      >
                        Jump to section <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <button
                aria-label="Close menu"
                onClick={() => setOpenLabel(null)}
                className="fixed inset-0 -z-10 bg-slate-950/15"
              />
            </div>
          </div>
        ) : null}
      </header>

      {/* Mobile slide-over menu — only mount when open */}
      {openMobile ? (
        <div className="md:hidden">
          <button
            className="fixed inset-0 z-[85] bg-slate-950/45"
            aria-label="Close mobile menu"
            onClick={() => setOpenMobile(false)}
          />
          <div className="fixed inset-y-0 right-0 z-[86] w-[min(420px,100%)] bg-white shadow-[0_40px_120px_rgba(2,8,23,.25)]">
            <div className="flex items-center justify-between px-4 py-4 ring-1 ring-slate-200">
              <div className="relative h-[44px] w-[160px]">
                <Image src="/Pictures/Logos.png" alt="Evermore Hospitals" fill className="object-contain" sizes="160px" />
              </div>
              <button
                onClick={() => setOpenMobile(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 ring-1 ring-slate-200"
                aria-label="Close"
              >
                <span className="relative block h-5 w-5">
                  <span className="absolute left-0 top-[9px] h-0.5 w-5 rotate-45 rounded-full bg-slate-800" />
                  <span className="absolute left-0 top-[9px] h-0.5 w-5 -rotate-45 rounded-full bg-slate-800" />
                </span>
              </button>
            </div>

            <div className="p-4">
              <div className="grid gap-3">
                {nav.map((n) => (
                  <div key={n.label} className="overflow-hidden rounded-3xl bg-slate-50 ring-1 ring-slate-200">
                    <div className="px-4 py-3 text-sm font-semibold text-slate-900">{n.label}</div>

                    <div className="px-4 pb-3">
                      <div className="relative h-28 overflow-hidden rounded-2xl ring-1 ring-slate-200">
                        <Image src={n.featuredImg} alt={n.featuredTitle} fill className="object-cover" quality={82} sizes="90vw" />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/65 via-blue-700/30 to-cyan-500/15" />
                        <div className="absolute inset-0 p-3 text-white">
                          <div className="text-xs font-semibold opacity-90">{n.accent}</div>
                          <div className="mt-1 text-sm font-semibold">{n.featuredTitle}</div>
                        </div>
                      </div>
                    </div>

                    <div className="px-2 pb-2">
                      {n.items.map((it) => (
                        <Link
                          key={it.label}
                          href={it.href}
                          prefetch={false}
                          className="block rounded-2xl px-3 py-2 hover:bg-white"
                          onClick={() => setOpenMobile(false)}
                        >
                          <div className="text-sm font-semibold text-slate-900">{it.label}</div>
                          <div className="text-xs font-medium text-slate-600">
                            {it.desc} • <span className="font-semibold">{it.meta}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/login"
                    prefetch={false}
                    className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50"
                    onClick={() => setOpenMobile(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    prefetch={false}
                    className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                    onClick={() => setOpenMobile(false)}
                  >
                    Create account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
