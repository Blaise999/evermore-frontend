import Link from "next/link";
import StickyHeader from "../components/landing/StickyHeader.client";
import Footer from "../components/landing/Footer";
import GradientDivider from "../components/landing/GradientDivider";
import {
  SectionLabel,
  Shield,
  Sparkle,
  Lock,
  PrimaryButton,
  GhostButton,
} from "../components/landing/ui";

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-sm leading-relaxed text-slate-600">
      <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span>{children}</span>
    </li>
  );
}

function InfoCard({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-[0_24px_70px_rgba(2,8,23,.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <div className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</div>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 ring-1 ring-blue-100 text-blue-700">
          {icon}
        </span>
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <main className="bg-white text-slate-900">
      <StickyHeader />

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-12">
        <SectionLabel icon={<Sparkle />} text="Legal" />
        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base">
          This Privacy Policy explains how Evermore Hospitals (“Evermore”, “we”, “us”) collects, uses,
          and protects personal information when you use our website, services, and patient portal.
          It’s written in a clear UK-friendly way. Replace placeholders with your final legal wording
          before production.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <PrimaryButton href="/signup">Create account</PrimaryButton>
          <GhostButton href="/contact">Contact</GhostButton>
        </div>
      </section>

      <GradientDivider />

      {/* SUMMARY CARDS */}
      <section className="mx-auto max-w-7xl px-4 pb-14 pt-10">
        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard
            title="We collect only what we need"
            desc="Account info, booking details, and portal activity needed to provide care services."
            icon={<Shield className="h-5 w-5" />}
          />
          <InfoCard
            title="We protect access"
            desc="We use secure sessions and access controls to keep your portal data private."
            icon={<Lock className="h-5 w-5" />}
          />
          <InfoCard
            title="You control your info"
            desc="You can request access, correction, or deletion where applicable under UK GDPR."
            icon={<Sparkle className="h-5 w-5" />}
          />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
          {/* LEFT: POLICY BODY */}
          <div className="rounded-3xl bg-white p-7 ring-1 ring-slate-200 shadow-[0_30px_90px_rgba(2,8,23,.08)]">
            <div className="text-sm font-semibold text-slate-900">Effective date</div>
            <p className="mt-2 text-sm text-slate-600">
              <span className="font-medium">[Insert date]</span> (update this when you publish)
            </p>

            <GradientDivider />

            <h2 className="text-xl font-semibold tracking-tight">1) Information we collect</h2>
            <ul className="mt-4 space-y-3">
              <Bullet>
                <span className="font-medium text-slate-900">Account details:</span> name, email, phone,
                and login/security events.
              </Bullet>
              <Bullet>
                <span className="font-medium text-slate-900">Bookings & services:</span> appointment requests,
                preferences, and visit-related metadata.
              </Bullet>
              <Bullet>
                <span className="font-medium text-slate-900">Billing & receipts:</span> invoice references,
                payment status, and transaction metadata (not full card details if processed by a payment provider).
              </Bullet>
              <Bullet>
                <span className="font-medium text-slate-900">Usage data:</span> device/browser info, basic analytics,
                and security logs to protect the platform.
              </Bullet>
            </ul>

            <GradientDivider />

            <h2 className="text-xl font-semibold tracking-tight">2) How we use your information</h2>
            <ul className="mt-4 space-y-3">
              <Bullet>To create and manage your portal account and authenticate you securely.</Bullet>
              <Bullet>To process bookings, follow-ups, notifications, and support requests.</Bullet>
              <Bullet>To generate receipts/invoices and show your billing history.</Bullet>
              <Bullet>To protect the platform (fraud prevention, auditing, incident response).</Bullet>
              <Bullet>To improve the service performance and user experience (aggregated insights).</Bullet>
            </ul>

            <GradientDivider />

            <h2 className="text-xl font-semibold tracking-tight">3) Legal bases (UK GDPR)</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Depending on the context, we may process your data under one or more lawful bases such as:
              <span className="font-medium text-slate-900"> contract</span>,{" "}
              <span className="font-medium text-slate-900">legitimate interests</span>,{" "}
              <span className="font-medium text-slate-900">legal obligation</span>, and/or{" "}
              <span className="font-medium text-slate-900">consent</span>.
              Finalise this section with your legal counsel for production.
            </p>

            <GradientDivider />

            <h2 className="text-xl font-semibold tracking-tight">4) Sharing & processors</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              We may share limited data with trusted service providers (“processors”) who help operate the platform,
              such as hosting, email/SMS delivery, analytics, and payment processing—only as necessary to provide the service.
              We do not sell personal data.
            </p>

            <GradientDivider />

            <h2 className="text-xl font-semibold tracking-tight">5) Data retention</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              We keep personal data only as long as needed for the purposes described above, including legal,
              accounting, and security obligations. Retention periods should be documented internally and reviewed regularly.
            </p>

            <GradientDivider />

            <h2 className="text-xl font-semibold tracking-tight">6) Your rights</h2>
            <ul className="mt-4 space-y-3">
              <Bullet>Access your personal data and receive a copy where applicable.</Bullet>
              <Bullet>Request correction of inaccurate or incomplete data.</Bullet>
              <Bullet>Request deletion (where applicable) or restriction of processing.</Bullet>
              <Bullet>Object to processing based on legitimate interests (subject to balancing tests).</Bullet>
              <Bullet>Data portability (in certain cases).</Bullet>
              <Bullet>Withdraw consent at any time (where consent is the lawful basis).</Bullet>
            </ul>

            <GradientDivider />

            <h2 className="text-xl font-semibold tracking-tight">7) Contact</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              For privacy requests, contact{" "}
              <span className="font-medium text-slate-900">[privacy@evermore.health]</span> or use our{" "}
              <Link href="/contact" className="font-semibold text-blue-700 hover:underline">
                contact page
              </Link>
              . If you are in the UK, you may also have the right to lodge a complaint with the ICO.
            </p>
          </div>

          {/* RIGHT: QUICK NAV + CTA */}
          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-950 p-7 text-white shadow-[0_30px_110px_rgba(2,8,23,.28)]">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/15">
                <Shield className="h-4 w-4 text-cyan-200" />
                Privacy in plain language
              </div>
              <div className="mt-4 text-2xl font-semibold tracking-tight">
                Your portal data stays structured and controlled.
              </div>
              <p className="mt-3 text-sm leading-relaxed opacity-85">
                Use the portal for bookings and sensitive details instead of sending them over random chats or emails.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-blue-700 ring-1 ring-white/25 hover:bg-slate-50"
                >
                  Create account
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-2xl bg-white/10 px-6 py-3.5 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/15"
                >
                  Login
                </Link>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
              <div className="text-sm font-semibold text-slate-900">Related pages</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href="/terms"
                  className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  Terms
                </Link>
                <Link
                  href="/help"
                  className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  Help
                </Link>
                <Link
                  href="/contact"
                  className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  Contact
                </Link>
              </div>

              <div className="mt-4 text-xs leading-relaxed text-slate-600">
                Before production, replace placeholders, add your official company address, data controller info,
                and confirm your processors list + cookie policy requirements.
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
