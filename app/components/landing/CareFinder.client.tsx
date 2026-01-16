// app/components/landing/CareFinder.client.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import { cn, MapPin, MiniTag } from "./ui";

export default function CareFinder() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("London, UK");
  const [type, setType] = useState<"Express" | "Primary" | "Specialty">("Express");

  const suggestions = useMemo(() => {
    const base = [
      "Fever / Flu symptoms",
      "Chest pain",
      "Skin rash",
      "Migraine",
      "Sports injury",
      "Annual checkup",
      "Medication refill",
      "Blood pressure",
      "Pediatric cough",
      "Prenatal visit",
      "Dermatology consult",
      "Cardiology follow-up",
    ];
    const q = query.trim().toLowerCase();
    if (!q) return base.slice(0, 6);
    return base.filter((x) => x.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  return (
    <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-[0_24px_70px_rgba(2,8,23,.10)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">Find the right care fast</div>
          <div className="mt-1 text-xs text-slate-600">Search symptoms, choose care type, and book.</div>
        </div>

        <div className="flex items-center gap-2">
          {(["Express", "Primary", "Specialty"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                "rounded-2xl px-4 py-2 text-xs font-semibold ring-1 transition",
                type === t
                  ? "bg-blue-600 text-white ring-blue-600 shadow-[0_16px_38px_rgba(37,99,235,.26)]"
                  : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1.3fr_.9fr_.8fr]">
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you feeling? (e.g., cough, rash, pain)"
            className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="rounded-2xl bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-white"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <div className="text-xs font-semibold text-slate-500">Location</div>
          <div className="mt-2">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
          <div className="mt-3 text-xs text-slate-600">Enter your city or neighborhood to see nearby Evermore clinics.</div>

          <div className="mt-4 relative h-28 overflow-hidden rounded-2xl ring-1 ring-slate-200">
            <Image src="/Pictures/locations-2.jpg" alt="Location visual" fill className="object-cover" quality={82} sizes="33vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent" />
            <div className="absolute left-3 bottom-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-900 ring-1 ring-white/40">
              <MapPin className="h-4 w-4 text-blue-700" />
              Find nearby clinics
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl ring-1 ring-slate-200">
          <div className="relative h-[268px]">
            <Image src="/Pictures/specialty-1.jpg" alt="Recommended care" fill className="object-cover" quality={82} sizes="33vw" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/55 via-blue-700/35 to-cyan-500/15" />
          </div>
          <div className="absolute inset-0 p-4 text-white">
            <div className="text-xs font-semibold opacity-90">Recommended</div>
            <div className="mt-2 text-lg font-semibold tracking-tight">{type} Care</div>
            <div className="mt-2 text-xs opacity-90">Book a slot or start a video visit (where available).</div>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/login"
                prefetch={false}
                className="rounded-2xl bg-white/15 px-4 py-2.5 text-sm font-semibold ring-1 ring-white/20 hover:bg-white/20"
              >
                Book appointment
              </Link>
              <Link
                href="/video-visit"
                prefetch={false}
                className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
              >
                Start video visit
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <MiniTag text="Clear prep notes" />
              <MiniTag text="Fast check-in" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
