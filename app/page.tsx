// app/terms/page.tsx
"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { AuthHeader } from "../components/auth-header";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

/* --------------------------------- Icons --------------------------------- */
function DocIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M7 3h7l3 3v15a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
        className="stroke-current"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M14 3v4h4" className="stroke-current" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 11h6M9 15h6M9 19h4" className="stroke-current" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
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
function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-4 w-4", className)} fill="none">
      <path d="M5 12h12" className="stroke-current" strokeWidth="1.8" strokeLinecap="round" />
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

function SectionHeader({
  kicker,
  title,
  desc,
  right,
}: {
  kicker: string;
  title: string;
  desc?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          <span className="h-2 w-2 rounded-full bg-blue-600" />
          {kicker}
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">{title}</h1>
        {desc ? <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600">{desc}</p> : null}
      </div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  );
}

function TocLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center justify-between rounded-[22px] bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-white"
    >
      <span>{label}</span>
      <ArrowRightIcon className="text-slate-600" />
    </a>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.06)]">
      {children}
    </div>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-28 text-xl font-semibold tracking-tight text-slate-900">
      {children}
    </h2>
  );
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-sm leading-relaxed text-slate-600">{children}</p>;
}
function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-sm font-semibold text-slate-700">
      <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
      <span className="leading-relaxed">{children}</span>
    </li>
  );
}

export default function TermsPage() {
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

  const updated = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  }, []);

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#F6FAFF] via-white to-white text-slate-900">
      {/* Top progress */}
      <div className="fixed left-0 right-0 top-0 z-[70] h-[3px] bg-transparent">
        <div className="h-full bg-blue-600" style={{ width: `${progress}%` }} />
      </div>

      {/* Ambient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-[-140px] h-[420px] w-[420px] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -right-24 top-[80px] h-[420px] w-[420px] rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute left-1/2 top-[860px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-sky-200/35 blur-3xl" />
      </div>

      {/* Header */}
      <div className={cn("sticky top-0 z-[60]", scrolled ? "shadow-[0_10px_50px_rgba(2,8,23,.06)]" : "")}>
        <AuthHeader />
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-10 md:pt-14">
        <SectionHeader
          kicker="Legal"
          title="Terms of Service"
          desc="These Terms govern access to the Evermore website and patient portal. This is a template-style page for your product UI—replace details with your final legal wording before production use."
          right={
            <div className="flex flex-wrap gap-2">
              <Link
                href="/privacy"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                Privacy <ArrowRightIcon />
              </Link>
              <Link
                href="/help"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,99,235,.20)] hover:bg-blue-700"
              >
                Help Center <ArrowRightIcon />
              </Link>
            </div>
          }
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-500">Last updated</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{updated}</div>
                <p className="mt-2 text-sm font-semibold text-slate-600">
                  If we make material changes, we’ll post an update here.
                </p>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-200">
                <DocIcon />
              </span>
            </div>
            <div className="mt-5 rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="text-xs font-semibold text-slate-500">Important</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                This page is not legal advice. Get a qualified solicitor to review before launch.
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-500">Summary</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">Plain-English overview</div>
                <P>
                  Use the service responsibly, keep credentials safe, and don’t attempt to misuse systems. Medical
                  information is sensitive—privacy and access controls matter.
                </P>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                <ShieldIcon />
              </span>
            </div>
            <ul className="mt-4 space-y-2">
              <Li>Use the portal only for lawful, personal purposes.</Li>
              <Li>Keep your login credentials secure.</Li>
              <Li>Don’t try to scrape, hack, or disrupt systems.</Li>
              <Li>Health guidance here isn’t emergency care.</Li>
            </ul>
          </Card>

          <Card>
            <div className="text-xs font-semibold text-slate-500">Contents</div>
            <div className="mt-2 text-lg font-semibold text-slate-900">Jump to a section</div>
            <div className="mt-4 grid gap-2">
              <TocLink href="#eligibility" label="1. Eligibility" />
              <TocLink href="#account" label="2. Account & security" />
              <TocLink href="#portal" label="3. Portal use" />
              <TocLink href="#medical" label="4. Medical disclaimer" />
              <TocLink href="#billing" label="5. Billing & payments" />
              <TocLink href="#privacy" label="6. Privacy" />
              <TocLink href="#ip" label="7. Intellectual property" />
              <TocLink href="#liability" label="8. Liability" />
              <TocLink href="#termination" label="9. Termination" />
              <TocLink href="#law" label="10. Governing law" />
              <TocLink href="#contact" label="11. Contact" />
            </div>
          </Card>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto mt-10 max-w-7xl px-4">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      {/* Terms body */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <H2 id="eligibility">1. Eligibility</H2>
              <P>
                You must be able to form a legally binding contract in your jurisdiction to use the service. If you are
                using the service on behalf of someone else, you confirm you have authority to do so.
              </P>
              <ul className="mt-4 space-y-2">
                <Li>You are responsible for ensuring information you provide is accurate.</Li>
                <Li>We may refuse service where required for safety, compliance, or integrity reasons.</Li>
              </ul>
            </Card>

            <Card>
              <H2 id="account">2. Account & security</H2>
              <P>
                You are responsible for maintaining the confidentiality of your login credentials. You agree to notify
                us promptly if you suspect unauthorised access.
              </P>
              <ul className="mt-4 space-y-2">
                <Li>Do not share your password or access tokens.</Li>
                <Li>Use a strong password and update it when necessary.</Li>
                <Li>We may log access events to maintain security and auditability.</Li>
              </ul>
            </Card>

            <Card>
              <H2 id="portal">3. Portal use</H2>
              <P>
                The patient portal is provided to help you view records, manage appointments, and handle billing related
                to your care. You agree not to misuse the portal or attempt to access data that does not belong to you.
              </P>
              <ul className="mt-4 space-y-2">
                <Li>No reverse engineering, scraping, or automated abuse.</Li>
                <Li>No interference with service availability or security controls.</Li>
                <Li>We may monitor for suspicious activity and rate-limit abusive usage.</Li>
              </ul>
            </Card>

            <Card>
              <H2 id="medical">4. Medical disclaimer</H2>
              <P>
                Content on the website or portal may be informational and is not a substitute for professional medical
                advice. If you have urgent symptoms, seek immediate medical attention.
              </P>
              <div className="mt-4 rounded-[24px] bg-rose-50 p-4 ring-1 ring-rose-200">
                <div className="text-xs font-semibold text-rose-700">Emergency</div>
                <div className="mt-2 text-sm font-semibold text-rose-800">
                  If you think you have a medical emergency, contact local emergency services.
                </div>
              </div>
            </Card>

            <Card>
              <H2 id="billing">5. Billing & payments</H2>
              <P>
                Billing and repayment features may be available depending on your care pathway. Invoices and payment
                records shown in the portal are provided for your convenience and may be updated as processing completes.
              </P>
              <ul className="mt-4 space-y-2">
                <Li>Charges may be subject to verification and correction.</Li>
                <Li>Payment requests may require review/approval before finalisation.</Li>
                <Li>If you believe an invoice is incorrect, contact support with the invoice number.</Li>
              </ul>
            </Card>

            <Card>
              <H2 id="privacy">6. Privacy</H2>
              <P>
                We handle personal data in accordance with our Privacy Policy. Health information is particularly
                sensitive; access is restricted and may be audited.
              </P>
              <div className="mt-4">
                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  View Privacy Policy <ArrowRightIcon />
                </Link>
              </div>
            </Card>

            <Card>
              <H2 id="ip">7. Intellectual property</H2>
              <P>
                The service, including design, text, graphics, and software, is owned by Evermore or its licensors.
                Except as permitted by law, you may not reproduce, modify, or distribute content without permission.
              </P>
            </Card>

            <Card>
              <H2 id="liability">8. Liability</H2>
              <P>
                To the maximum extent permitted by law, Evermore is not liable for indirect, incidental, or consequential
                damages arising from use of the service. Nothing in these Terms limits liability where it cannot be
                excluded by law.
              </P>
            </Card>

            <Card>
              <H2 id="termination">9. Termination</H2>
              <P>
                We may suspend or terminate access where we reasonably believe this is necessary to protect users, comply
                with legal obligations, or prevent misuse. You may stop using the service at any time.
              </P>
            </Card>

            <Card>
              <H2 id="law">10. Governing law</H2>
              <P>
                These Terms are governed by the laws applicable to your operating jurisdiction (commonly England and
                Wales for UK services). Replace this clause with your final legal jurisdiction wording.
              </P>
            </Card>

            <Card>
              <H2 id="contact">11. Contact</H2>
              <P>
                For support, questions, or complaints, contact Evermore support. Please include your account email and
                relevant screenshots if available.
              </P>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="text-xs font-semibold text-slate-500">Email</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">support@evermore.health</div>
                </div>
                <div className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="text-xs font-semibold text-slate-500">Help Center</div>
                  <Link href="/help" className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                    Open Help Center <ArrowRightIcon />
                  </Link>
                </div>
              </div>
            </Card>
          </div>

          {/* Side rail */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
            <Card>
              <div className="text-xs font-semibold text-slate-500">Quick links</div>
              <div className="mt-3 grid gap-2">
                <Link
                  href="/privacy"
                  className="flex items-center justify-between rounded-[22px] bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-white"
                >
                  Privacy
                  <ArrowRightIcon className="text-slate-600" />
                </Link>
                <Link
                  href="/quality"
                  className="flex items-center justify-between rounded-[22px] bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-white"
                >
                  Quality & Safety
                  <ArrowRightIcon className="text-slate-600" />
                </Link>
                <Link
                  href="/help"
                  className="flex items-center justify-between rounded-[22px] bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-white"
                >
                  Help Center
                  <ArrowRightIcon className="text-slate-600" />
                </Link>
              </div>
            </Card>

            <div className="rounded-[32px] bg-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(2,8,23,.22)]">
              <div className="text-xs font-semibold text-white/70">Quick actions</div>
              <div className="mt-2 text-lg font-semibold">Need something specific?</div>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
             Jump to the exact section, or get help with account access and billing questions in the Help Center.
              </p>
              <Link
                href="/help"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900"
              >
                Need help? <ArrowRightIcon />
              </Link>
            </div>
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
                  <DocIcon />
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Evermore</div>
                  <div className="text-xs font-semibold text-slate-500">Terms</div>
                </div>
              </div>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
                Terms of Service for using the Evermore website and patient portal.
              </p>
            </div>

            <div className="grid gap-2 text-sm font-semibold text-slate-700">
              <Link href="/about" className="hover:underline">
                About
              </Link>
              <Link href="/privacy" className="hover:underline">
                Privacy
              </Link>
              <Link href="/help" className="hover:underline">
                Help
              </Link>
              <Link href="/quality" className="hover:underline">
                Quality
              </Link>
            </div>

            <div className="grid gap-2 text-sm font-semibold text-slate-700">
              <a href="#eligibility" className="hover:underline">
                Eligibility
              </a>
              <a href="#billing" className="hover:underline">
                Billing
              </a>
              <a href="#privacy" className="hover:underline">
                Privacy
              </a>
              <a href="#contact" className="hover:underline">
                Contact
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
    </main>
  );
}
