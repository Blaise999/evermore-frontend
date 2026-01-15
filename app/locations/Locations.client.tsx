"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { LOCATIONS, CareMode, LocationItem } from "./data";
import {
  cn,
  SectionLabel,
  Sparkle,
  MapPin,
  Phone,
  PrimaryButton,
  GhostButton,
  Pic,
} from "../components/landing/ui";

const MODES: CareMode[] = ["Express", "Primary", "Specialty", "Labs", "Imaging"];
const REGIONS: LocationItem["region"][] = [
  "London",
  "South East",
  "South West",
  "Midlands",
  "North West",
  "Yorkshire",
  "Scotland",
  "Wales",
];

function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition",
        active
          ? "bg-blue-600 text-white ring-blue-200 shadow-[0_12px_30px_rgba(37,99,235,.22)]"
          : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
      )}
    >
      {children}
    </button>
  );
}

function badgeTone(text: string) {
  if (/same-day|rapid|open/i.test(text)) return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (/imaging|labs|results/i.test(text)) return "bg-violet-50 text-violet-700 ring-violet-100";
  return "bg-blue-50 text-blue-700 ring-blue-100";
}

function LocationCard({ x }: { x: LocationItem }) {
  const mapsQ = encodeURIComponent([x.name, ...x.addressLines, x.postcode].join(", "));
  const mapsHref = `https://www.google.com/maps?q=${mapsQ}`;

  return (
    <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 shadow-[0_24px_80px_rgba(2,8,23,.10)]">
      <div className="relative h-[220px]">
        <Pic src={x.heroImg} alt={x.name} className="h-full w-full" sizes="(max-width: 1024px) 100vw, 33vw" />
        <div className="absolute left-5 top-5 flex flex-wrap gap-2">
          {x.badges.slice(0, 2).map((b) => (
            <span
              key={b}
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ring-1 backdrop-blur",
                badgeTone(b)
              )}
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">{x.name}</div>
            <div className="mt-1 text-sm text-slate-600">{x.hoursLabel}</div>
          </div>
          <div className="rounded-2xl bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_10px_25px_rgba(2,8,23,.18)]">
            UK
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-sm text-slate-700">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-blue-600">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <div className="font-medium">{x.city}</div>
              <div className="text-slate-600">
                {x.addressLines.join(", ")}, {x.postcode}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-blue-600">
              <Phone className="h-5 w-5" />
            </span>
            <div className="text-slate-600">{x.phone}</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {x.modes.map((m) => (
            <span
              key={m}
              className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
            >
              {m}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/locations/${x.slug}`}
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(37,99,235,.18)] hover:bg-blue-700"
          >
            View details
          </Link>

          {/* MVP gating: if you don’t have auth checks yet, this can go to /signup */}
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50 hover:text-blue-900"
          >
            Book here
          </Link>

          <a
            href={mapsHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Directions
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LocationsClient() {
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<CareMode | "All">("All");
  const [region, setRegion] = useState<LocationItem["region"] | "All">("All");

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return LOCATIONS.filter((x) => {
      const hitQuery =
        !s ||
        x.name.toLowerCase().includes(s) ||
        x.city.toLowerCase().includes(s) ||
        x.postcode.toLowerCase().includes(s) ||
        x.addressLines.join(" ").toLowerCase().includes(s);
      const hitMode = mode === "All" || x.modes.includes(mode);
      const hitRegion = region === "All" || x.region === region;
      return hitQuery && hitMode && hitRegion;
    });
  }, [q, mode, region]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionLabel icon={<Sparkle />} text="Clinics & Locations" />
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Find an Evermore clinic in the UK
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            Search by city or postcode, filter by care type, then view details for directions and booking.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <GhostButton href="/signup" className="px-5 py-3 text-sm">
            Create account
          </GhostButton>
          <PrimaryButton href="/login" className="px-5 py-3 text-sm">
            Book now
          </PrimaryButton>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="mt-8 rounded-3xl bg-white p-5 ring-1 ring-slate-200 shadow-[0_20px_60px_rgba(2,8,23,.08)]">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div>
            <div className="text-[11px] font-semibold text-slate-500">Search</div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="City or postcode (e.g. London, M1 1AE)"
              className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-200 outline-none transition focus:bg-white focus:ring-blue-200"
            />
          </div>

          <div>
            <div className="text-[11px] font-semibold text-slate-500">Care type</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Chip active={mode === "All"} onClick={() => setMode("All")}>
                All
              </Chip>
              {MODES.map((m) => (
                <Chip key={m} active={mode === m} onClick={() => setMode(m)}>
                  {m}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-slate-500">Region</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Chip active={region === "All"} onClick={() => setRegion("All")}>
                All
              </Chip>
              {REGIONS.map((r) => (
                <Chip key={r} active={region === r} onClick={() => setRegion(r)}>
                  {r}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <div className="text-slate-600">
            Showing <span className="font-semibold text-slate-900">{results.length}</span> location(s)
          </div>
          <button
            type="button"
            onClick={() => {
              setQ("");
              setMode("All");
              setRegion("All");
            }}
            className="rounded-2xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-white"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Emergency note */}
      <div className="mt-6 rounded-3xl bg-slate-950 p-6 text-white shadow-[0_30px_100px_rgba(2,8,23,.35)]">
        <div className="text-sm font-semibold">Emergency?</div>
        <p className="mt-2 text-sm opacity-85">
          If it’s life-threatening, call <span className="font-semibold">999</span>. For urgent medical advice in the UK,
          you can contact <span className="font-semibold">NHS 111</span>.
        </p>
      </div>

      {/* Results */}
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {results.map((x) => (
          <LocationCard key={x.slug} x={x} />
        ))}
      </div>
    </div>
  );
}
