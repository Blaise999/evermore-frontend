// app/login/page.tsx (Server Component)
import Link from "next/link";
import Image from "next/image";
import { AuthHeader } from "../components/auth-header";
import LoginForm from "./LoginForm.client";

// ✅ Static import = blur placeholder + better perf
import portal1 from "@/public/Pictures/portal-1.jpg";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function LoginPage() {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-[#F6FAFF] via-white to-white text-slate-900">
      <AuthHeader mode="login" />

      <div className="mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr] lg:items-stretch">
          {/* Left: Server-rendered panel (no client JS) */}
          <div className="relative overflow-hidden rounded-[32px] ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.10)]">
            <div className="relative min-h-[520px]">
              <Image
                src={portal1}
                alt="Evermore portal"
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
                Secure patient portal
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                Welcome back
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/85">
                View results, manage appointments, and keep your billing and records in one secure place.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {["Appointments", "Lab results", "Prescriptions", "Receipts"].map((t) => (
                  <div key={t} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                    <div className="text-sm font-semibold">{t}</div>
                    <div className="mt-1 text-xs text-white/75">Organized & easy to access</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 max-w-lg rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                <div className="text-xs font-semibold text-white/80">New to Evermore?</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Link
                    href="/signup"
                    prefetch={false}
                    className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                  >
                    Create account
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

          {/* Right: ONLY this is client */}
          <LoginForm />
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
