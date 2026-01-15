// app/forgot-password/page.tsx (Server Component)
import Link from "next/link";
import Image from "next/image";
import { AuthHeader } from "../components/auth-header";
import ForgotPasswordSteps from "./ForgotPasswordSteps.client";

// ✅ Static import = blur placeholder + better perf
import facility2 from "@/public/Pictures/facility-2.jpg";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function Shield({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M12 2l8 4v6c0 5.2-3.4 9.9-8 10-4.6-.1-8-4.8-8-10V6l8-4Z"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-5"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StaticPill({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/15">
      <span className="grid h-5 w-5 place-items-center rounded-full bg-white/15 text-[11px] font-semibold ring-1 ring-white/15">
        {n}
      </span>
      {label}
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-[#F6FAFF] via-white to-white text-slate-900">
      <AuthHeader mode="login" />

      <div className="mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr] lg:items-stretch">
          {/* Left visual (Server-rendered) */}
          <div className="relative overflow-hidden rounded-[32px] ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.10)]">
            <div className="relative min-h-[520px]">
              <Image
                src={facility2}
                alt="Evermore Hospitals"
                fill
                priority
                quality={80}
                placeholder="blur"
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-950/70 via-blue-800/35 to-cyan-500/10" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
            </div>

            <div className="absolute inset-0 p-7 sm:p-10 text-white">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/15">
                <Shield className="h-4 w-4" />
                Account recovery
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                Reset your password
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/85">
                We’ll send a verification code to confirm it’s you, then you can set a new password.
              </p>

              {/* Static pills (no client state needed) */}
              <div className="mt-6 flex flex-wrap gap-2">
                <StaticPill n={1} label="Email" />
                <StaticPill n={2} label="Verify" />
                <StaticPill n={3} label="New password" />
              </div>

              <div className="mt-6 max-w-lg rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                <div className="text-xs font-semibold text-white/80">Remembered it?</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Link
                    href="/login"
                    prefetch={false}
                    className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                  >
                    Back to login
                  </Link>
                  <Link
                    href="/help"
                    prefetch={false}
                    className="rounded-2xl bg-white/15 px-4 py-2 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/20"
                  >
                    Need help?
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right: client island only */}
          <ForgotPasswordSteps />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div>© {new Date().getFullYear()} Evermore Hospitals</div>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" prefetch={false} className="hover:text-slate-700">
              Privacy
            </Link>
            <Link href="/terms" prefetch={false} className="hover:text-slate-700">
              Terms
            </Link>
            <Link href="/contact" prefetch={false} className="hover:text-slate-700">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
