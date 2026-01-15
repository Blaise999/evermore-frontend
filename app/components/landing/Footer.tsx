// app/components/landing/Footer.tsx
import Link from "next/link";
import Image from "next/image";
import React from "react";

function MiniTag({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
      {text}
    </span>
  );
}

export default function Footer() {
  return (
    <footer className="mx-auto max-w-7xl px-4 pb-14 pt-10">
      <div className="rounded-3xl bg-slate-950 p-8 text-white shadow-[0_30px_120px_rgba(2,8,23,.35)]">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-64">
                <Image
                  src="/Pictures/Logos.png"
                  alt="Evermore Hospitals"
                  fill
                  className="object-contain"
                  quality={90}
                  sizes="256px"
                />
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed opacity-80">
              Clear care pathways, secure records access, and coordinated follow-up — built around patients and families.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <MiniTag text="Express Care" />
              <MiniTag text="Primary Care" />
              <MiniTag text="Specialty Clinics" />
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <div className="text-xs font-semibold opacity-80">Patients</div>
              <div className="mt-3 space-y-2 text-sm opacity-80">
                <Link href="/signup" className="block hover:opacity-100">Create account</Link>
                <Link href="/login" className="block hover:opacity-100">Login</Link>
                <Link href="/login" className="block hover:opacity-100">Book appointment</Link>
                <Link href="/login" className="block hover:opacity-100">Receipts</Link>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold opacity-80">Evermore</div>
              <div className="mt-3 space-y-2 text-sm opacity-80">
                <Link href="/locations" className="block hover:opacity-100">Locations</Link>
                <Link href="/login" className="block hover:opacity-100">Specialties</Link>
                <Link href="/insurance" className="block hover:opacity-100">Insurance</Link>
                <Link href="/careers" className="block hover:opacity-100">Careers</Link>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold opacity-80">Support</div>
              <div className="mt-3 space-y-2 text-sm opacity-80">
                <Link href="/help" className="block hover:opacity-100">Help center</Link>
                <Link href="/privacy" className="block hover:opacity-100">Privacy</Link>
                <Link href="/terms" className="block hover:opacity-100">Terms</Link>
                <Link href="/contact" className="block hover:opacity-100">Contact</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs opacity-70">
          <div>© {new Date().getFullYear()} Evermore Hospitals. All rights reserved.</div>
          <div className="flex flex-wrap gap-4">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
              Secure portal access
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-400/80" />
              Patient-first care
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
