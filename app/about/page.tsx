import Image from "next/image";
import Link from "next/link";

import StickyHeader from "../components/landing/StickyHeader.client";
import Footer from "../components/landing/Footer";
import GradientDivider from "../components/landing/GradientDivider";
import {
  cn,
  SectionLabel,
  Sparkle,
  Shield,
  Heartbeat,
  MapPin,
  Phone,
  PrimaryButton,
  GhostButton,
  ArrowRight,
} from "../components/landing/ui";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M20 6L9 17l-5-5"
        className="stroke-current"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
      <div className="text-[11px] font-semibold text-white/70">{k}</div>
      <div className="mt-2 text-2xl font-semibold">{v}</div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="bg-white text-slate-900">
      <StickyHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="relative min-h-[520px]">
          <div className="absolute inset-0">
            <Image
              src="/Pictures/facility-5.jpg"
              alt="Evermore Hospitals facility"
              fill
              priority
              quality={88}
              sizes="100vw"
              className="object-cover [filter:saturate(1.12)_contrast(1.1)_brightness(1.02)]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/18 to-white/0" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/25 to-transparent" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-14 lg:pb-16 lg:pt-18">
            <div className="max-w-2xl text-white">
              <SectionLabel icon={<Sparkle />} text="About Evermore" tone="dark" />

              <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
                Calm care. Clear communication.
                <span className="block bg-gradient-to-r from-cyan-200 via-blue-200 to-white bg-clip-text text-transparent">
                  Built around patients and families.
                </span>
              </h1>

              <p className="mt-5 text-sm leading-relaxed text-white/85 md:text-base">
                Evermore Hospitals is a UK-based care network focused on clear pathways, safe clinical standards,
                and a portal experience that keeps appointments, results, and billing organised in one place.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <PrimaryButton href="/signup">Create account</PrimaryButton>
                <Link
                  href="/locations"
                  prefetch={false}
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 ring-1 ring-white/25 transition hover:bg-slate-50"
                >
                  Find a location
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Stat k="Patient support" v="24/7" />
                <Stat k="Same-day options" v="Daily" />
                <Stat k="Specialty clinics" v="40+" />
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-white" />
          </div>
        </div>
      </section>

      {/* PAGE BODY */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-10">
        {/* Mission / Promise */}
        <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
              <Shield className="h-4 w-4" />
              Our promise
            </div>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
              A hospital experience that feels organised — before you arrive.
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-slate-600 md:text-base">
              We design care journeys with clear next steps: what to do before your visit, what to expect during it,
              and what happens after. From reception to follow-up, we reduce confusion and keep you informed.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                {
                  t: "Clear instructions",
                  d: "Prep checklists, directions, and realistic timelines — so you’re not guessing.",
                },
                {
                  t: "Secure portal access",
                  d: "Appointments, results, prescriptions, and billing — in one protected place.",
                },
                {
                  t: "Safer pathways",
                  d: "Standard protocols that prioritize patient safety and consistent care delivery.",
                },
                {
                  t: "Coordinated follow-up",
                  d: "Results and next steps are organised — less chasing, more clarity.",
                },
              ].map((x) => (
                <div
                  key={x.t}
                  className="rounded-3xl bg-white p-5 ring-1 ring-slate-200 shadow-[0_20px_60px_rgba(2,8,23,.06)]"
                >
                  <div className="text-sm font-semibold text-slate-900">{x.t}</div>
                  <div className="mt-2 text-sm leading-relaxed text-slate-600">{x.d}</div>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <PrimaryButton href="/signup">Create your account</PrimaryButton>
              <GhostButton href="/contact">Contact</GhostButton>
            </div>
          </div>

          {/* Right: image stack */}
          <div className="relative">
            <div className="grid gap-4">
              <div className="relative overflow-hidden rounded-3xl ring-1 ring-slate-200 shadow-[0_30px_90px_rgba(2,8,23,.10)]">
                <div className="relative h-[260px]">
                  <Image
                    src="/Pictures/facility-2.jpg"
                    alt="Care facility"
                    fill
                    quality={86}
                    className="object-cover"
                    sizes="50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-cyan-500/10" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="relative overflow-hidden rounded-3xl ring-1 ring-slate-200 shadow-[0_30px_90px_rgba(2,8,23,.10)]">
                  <div className="relative h-[190px]">
                    <Image
                      src="/Pictures/facility-1.jpg"
                      alt="Clinician team"
                      fill
                      quality={86}
                      className="object-cover"
                      sizes="30vw"
                    />
                  </div>
                </div>

                <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-[0_30px_100px_rgba(2,8,23,.25)]">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/15">
                    <Heartbeat className="h-4 w-4 text-cyan-200" />
                    Patient-first care
                  </div>

                  <div className="mt-4 text-xl font-semibold tracking-tight">
                    Clinical quality that’s visible in the details.
                  </div>

                  <p className="mt-3 text-sm leading-relaxed opacity-85">
                    Protocols, preparation, and follow-through — engineered to keep care safer and calmer.
                  </p>

                  <Link
                    href="/signup"
                    prefetch={false}
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-blue-700 ring-1 ring-white/25 hover:bg-slate-50"
                  >
                    Create account <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <GradientDivider />

        {/* Values */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 shadow-[0_10px_25px_rgba(2,8,23,.06)]">
              <span className="text-blue-600">
                <Sparkle className="h-4 w-4" />
              </span>
              Values & standards
            </div>

            <h3 className="mt-4 text-2xl font-semibold tracking-tight">
              What “Evermore standard” means.
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              The goal isn’t just treatment — it’s the whole experience: clarity, safety, and follow-up that makes sense.
            </p>

            <div className="mt-6 rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200">
                  <Phone className="h-5 w-5 text-blue-700" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Need support?</div>
                  <div className="text-xs font-medium text-slate-600">
                    We’ll route you fast to the right team.
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <PrimaryButton href="/contact" className="px-5 py-3">
                  Contact
                </PrimaryButton>
                <GhostButton href="/help" className="px-5 py-3">
                  Help center
                </GhostButton>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: <Shield className="h-5 w-5 text-blue-700" />,
                  title: "Safety-first protocols",
                  bullets: [
                    "Structured triage guidance",
                    "Standardised clinical pathways",
                    "Clear escalation rules",
                  ],
                },
                {
                  icon: <MapPin className="h-5 w-5 text-blue-700" />,
                  title: "Prepared visits",
                  bullets: [
                    "Directions and arrival guidance",
                    "What to bring checklist",
                    "Estimated visit flow",
                  ],
                },
                {
                  icon: <Heartbeat className="h-5 w-5 text-blue-700" />,
                  title: "Patient experience",
                  bullets: [
                    "Less confusion, more clarity",
                    "Comfort-forward environments",
                    "Respectful communication",
                  ],
                },
                {
                  icon: <Sparkle className="h-5 w-5 text-blue-700" />,
                  title: "Follow-up that closes the loop",
                  bullets: [
                    "Results organised in the portal",
                    "Next steps explained simply",
                    "Billing that’s easy to track",
                  ],
                },
              ].map((x) => (
                <div
                  key={x.title}
                  className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-[0_25px_70px_rgba(2,8,23,.06)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{x.title}</div>
                      <div className="mt-3 space-y-2">
                        {x.bullets.map((b) => (
                          <div key={b} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="mt-0.5 text-emerald-600">
                              <CheckIcon className="h-4 w-4" />
                            </span>
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 ring-1 ring-blue-100">
                      {x.icon}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-3xl bg-slate-950 p-7 text-white shadow-[0_30px_120px_rgba(2,8,23,.28)]">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs font-semibold opacity-80">Ready to use the portal?</div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight">
                    Create an account in minutes.
                  </div>
                  <div className="mt-2 text-sm opacity-85">
                    Book visits, access results, and manage billing in one secure place.
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/signup"
                    prefetch={false}
                    className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-blue-700 ring-1 ring-white/25 hover:bg-slate-50"
                  >
                    Create account <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/login"
                    prefetch={false}
                    className="inline-flex items-center justify-center rounded-2xl bg-white/10 px-6 py-3.5 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/15"
                  >
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <GradientDivider />

        {/* UK contact strip */}
        <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
          <div className="grid gap-4 md:grid-cols-[1.2fr_.8fr] md:items-center">
            <div>
              <div className="text-sm font-semibold text-slate-900">UK-based care network</div>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Find your nearest clinic, view opening hours, and get directions before you arrive.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 md:justify-end">
              <PrimaryButton href="/locations" className="px-5 py-3">
                View locations
              </PrimaryButton>
              <GhostButton href="/contact" className="px-5 py-3">
                Contact
              </GhostButton>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
