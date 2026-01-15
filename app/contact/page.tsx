"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  HelpCircle,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Shield,
  Sparkles,
} from "lucide-react";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl",
        className
      )}
    >
      {children}
    </div>
  );
}

function Pill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
      <span className="opacity-90">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function Divider() {
  return <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />;
}

function MiniLink({
  href,
  label,
  desc,
  icon,
}: {
  href: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold">{label}</div>
          <div className="mt-1 text-xs leading-relaxed text-white/65">{desc}</div>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/35">
          {icon}
        </span>
      </div>
      <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-white/75">
        Open <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export default function ContactPage() {
  const prefersReduced = useReducedMotion();

  // simple form state (MVP: no backend required)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<"Booking" | "Billing" | "Records" | "General">("General");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const support = useMemo(
    () => ({
      // Replace with your real details (UK-based formatting)
      phone: "+44 20 0000 0000",
      email: "support@evermore.health",
      addressLabel: "Evermore Support (UK)",
      addressLines: ["10 Evermore Way", "London", "EC2A 1AA"],
      hours: "Mon–Sat • 8:00 – 18:00 (UK time)",
    }),
    []
  );

  const mapsQ = encodeURIComponent([support.addressLabel, ...support.addressLines].join(", "));
  const mapsHref = `https://www.google.com/maps?q=${mapsQ}`;

  return (
    <main className="min-h-screen bg-[#070A0F] text-white">
      {/* ambient bg */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_18%_10%,rgba(255,255,255,0.10),transparent_55%),radial-gradient(900px_500px_at_82%_20%,rgba(255,255,255,0.07),transparent_60%),radial-gradient(900px_600px_at_50%_90%,rgba(255,255,255,0.06),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/15 to-black/35" />
      </div>

      {/* top bar */}
      <div className="sticky top-0 z-30 border-b border-white/10 bg-black/25 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <MessageSquare className="h-4 w-4 text-white/85" />
              </span>
              <div>
                <div className="text-sm font-extrabold tracking-tight">Evermore</div>
                <div className="text-[11px] font-semibold text-white/55">
                  Contact & support
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/help"
                className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10 sm:inline"
              >
                Help
              </Link>
              <Link
                href="/locations"
                className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10 sm:inline"
              >
                Locations
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black text-black transition hover:opacity-90"
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
              <Pill icon={<Lock className="h-3.5 w-3.5" />} text="Secure support" />
              <Pill icon={<Shield className="h-3.5 w-3.5" />} text="Privacy-first" />
              <Pill icon={<Sparkles className="h-3.5 w-3.5" />} text="UK-based" />
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
              Get help fast.
              <span className="block bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                We’ll route you properly.
              </span>
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              Booking, billing, records, account issues—send a message and we’ll direct it to the right team.
              For emergencies, call <span className="font-semibold text-white/80">999</span>.
            </p>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:opacity-90"
              >
                Book an appointment <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/help"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10"
              >
                Help center <HelpCircle className="h-4 w-4" />
              </Link>
            </div>

            <div className="text-xs text-white/55">
              Urgent advice (UK): <span className="font-semibold text-white/75">NHS 111</span>.
            </div>
          </div>

          <Card className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                  Support channels
                </div>
                <div className="mt-2 text-lg font-black tracking-tight">
                  Choose what’s easiest
                </div>
                <div className="mt-1 text-xs text-white/60">
                  Replace these with your real details.
                </div>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <BadgeCheck className="h-5 w-5 text-white/85" />
              </span>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <Phone className="h-4 w-4 text-white/85" />
                  Phone
                </div>
                <div className="mt-1 text-sm text-white/70">{support.phone}</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <Mail className="h-4 w-4 text-white/85" />
                  Email
                </div>
                <div className="mt-1 text-sm text-white/70">{support.email}</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <Clock className="h-4 w-4 text-white/85" />
                  Hours
                </div>
                <div className="mt-1 text-sm text-white/70">{support.hours}</div>
              </div>

              <a
                href={mapsHref}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl border border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-white/10 px-4 py-3 transition hover:bg-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-extrabold">
                      <MapPin className="h-4 w-4 text-white/85" />
                      Address
                    </div>
                    <div className="mt-1 text-xs leading-relaxed text-white/65">
                      {support.addressLines.join(", ")}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/85" />
                </div>
              </a>
            </div>
          </Card>
        </motion.div>

        <Divider />
      </header>

      {/* main content */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* form */}
          <Card className="p-6 lg:col-span-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                  Send a message
                </div>
                <div className="mt-2 text-xl font-black tracking-tight">
                  We’ll reply with the right next step
                </div>
                <div className="mt-1 text-xs text-white/60">
                  MVP: this form can be wired later. For now it gives you a clean UI.
                </div>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <MessageSquare className="h-5 w-5 text-white/85" />
              </span>
            </div>

            {sent ? (
              <div className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-white/10 p-6">
                <div className="text-lg font-black">Message queued ✅</div>
                <div className="mt-2 text-sm text-white/70">
                  We’ll respond as soon as possible. If it’s urgent, use phone support.
                </div>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => {
                      setSent(false);
                      setName("");
                      setEmail("");
                      setTopic("General");
                      setMessage("");
                    }}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/10"
                  >
                    Send another
                  </button>
                  <Link
                    href="/help"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-black transition hover:opacity-90"
                  >
                    Read help articles <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <form
                className="mt-6 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  // wire later: POST to /api/contact
                  setSent(true);
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-white/70">Full name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/85 outline-none transition focus:border-white/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/70">Email</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      type="email"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/85 outline-none transition focus:border-white/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/70">Topic</label>
                  <div className="mt-2 grid gap-2 sm:grid-cols-4">
                    {(["General", "Booking", "Billing", "Records"] as const).map((t) => {
                      const active = topic === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTopic(t)}
                          className={cn(
                            "rounded-2xl border px-4 py-2 text-sm font-semibold transition",
                            active
                              ? "border-white/15 bg-white text-black"
                              : "border-white/10 bg-white/5 text-white/85 hover:bg-white/10"
                          )}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/70">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you need help with…"
                    rows={6}
                    className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/85 outline-none transition focus:border-white/20"
                    required
                  />
                  <div className="mt-2 text-xs text-white/55">
                    Don’t include passwords or sensitive health information in this message.
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:opacity-90"
                  >
                    Send message <ArrowRight className="h-4 w-4" />
                  </button>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10"
                  >
                    Create account <Shield className="h-4 w-4" />
                  </Link>
                </div>
              </form>
            )}
          </Card>

          {/* right column */}
          <div className="space-y-4 lg:col-span-5">
            <MiniLink
              href="/help"
              label="Help center"
              desc="Booking, billing, portal access, and common questions."
              icon={<HelpCircle className="h-5 w-5 text-white/85" />}
            />
            <MiniLink
              href="/insurance"
              label="Insurance guidance"
              desc="Understand cover routes, pre-authorisation, and receipts."
              icon={<Shield className="h-5 w-5 text-white/85" />}
            />
            <MiniLink
              href="/locations"
              label="Find a UK location"
              desc="Search by city or postcode and view details."
              icon={<MapPin className="h-5 w-5 text-white/85" />}
            />

            <Card className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-extrabold">Security note</div>
                  <div className="mt-1 text-xs text-white/65">
                    Keep your account safe.
                  </div>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <Lock className="h-5 w-5 text-white/85" />
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                Evermore support will never ask for your password. If you need to share patient info,
                use your portal after creating an account.
              </p>
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <BadgeCheck className="h-4 w-4 text-white/85" />
                  Recommended
                </div>
                <div className="mt-1 text-xs text-white/65">
                  Use the portal for bookings, receipts, and records—everything stays structured.
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-white/65">
              © {new Date().getFullYear()} Evermore Hospitals. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/privacy"
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/5"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/5"
              >
                Terms
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black text-black transition hover:opacity-90"
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
