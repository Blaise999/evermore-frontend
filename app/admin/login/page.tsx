// app/admin/login/page.tsx  (Server Component)
import Image from "next/image";
import { Suspense } from "react";
import AdminLoginClient from "./AdminLogin.client";

// ✅ same pattern as your /admin page
import logo from "@/public/Pictures/Logos.png";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F6FAFF] via-white to-white text-slate-900">
      {/* Top header (server-rendered, no client JS) */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur ring-1 ring-slate-200">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <div className="relative h-12 w-60 sm:h-14 sm:w-72">
            <Image
              src={logo}
              alt="Evermore Hospitals"
              fill
              priority
              placeholder="blur"
              className="object-contain object-left"
              sizes="(min-width: 640px) 288px, 240px"
              quality={70}
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:inline text-xs font-semibold text-slate-600">Admin Login</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
              Staff
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* ✅ fixes the build error caused by useSearchParams() */}
        <Suspense
          fallback={
            <div className="mx-auto max-w-xl rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-[0_22px_70px_rgba(2,8,23,.10)]">
              <div className="text-sm font-semibold text-slate-900">Loading…</div>
              <div className="mt-2 text-sm text-slate-600">Preparing admin login.</div>
            </div>
          }
        >
          <AdminLoginClient />
        </Suspense>
      </div>
    </main>
  );
}
