// app/locations/[slug]/page.tsx
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { findLocation, LOCATIONS } from "../data";
import { cn, SectionLabel, Sparkle, MapPin, Phone, PrimaryButton, GhostButton, MiniTag } from "../../components/landing/ui";

export function generateStaticParams() {
  return LOCATIONS.map((x) => ({ slug: x.slug }));
}

export default function LocationDetailPage({ params }: { params: { slug: string } }) {
  const x = findLocation(params.slug);
  if (!x) return notFound();

  const mapsQ = encodeURIComponent([x.name, ...x.addressLines, x.postcode].join(", "));
  const mapsHref = `https://www.google.com/maps?q=${mapsQ}`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F6FAFF] via-white to-white text-slate-900">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <SectionLabel icon={<Sparkle />} text="Location details" />
            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">{x.name}</h1>
            <p className="mt-2 text-sm text-slate-600">{x.hoursLabel}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <GhostButton href="/locations" className="px-5 py-3 text-sm">
              Back to locations
            </GhostButton>
            <PrimaryButton href="/signup" className="px-5 py-3 text-sm">
              Book here
            </PrimaryButton>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-3xl ring-1 ring-slate-200 shadow-[0_24px_80px_rgba(2,8,23,.10)]">
            <div className="relative h-[360px]">
              <Image src={x.heroImg} alt={x.name} fill className="object-cover" quality={88} sizes="(max-width: 1024px) 100vw, 66vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent" />
              <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
                {x.badges.map((b) => (
                  <MiniTag key={b} text={b} />
                ))}
              </div>
            </div>

            <div className="p-6">
              <div className="text-sm font-semibold text-slate-900">About this site</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{x.blurb}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {x.modes.map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-[0_20px_60px_rgba(2,8,23,.08)]">
              <div className="text-sm font-semibold text-slate-900">Address</div>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
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

              <div className="mt-5 flex flex-wrap gap-2">
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  Directions
                </a>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Book at this location
                </Link>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-[0_20px_60px_rgba(2,8,23,.08)]">
              <div className="text-sm font-semibold text-slate-900">Getting here</div>
              <p className="mt-2 text-sm text-slate-600">{x.transportNote}</p>
              <div className="mt-4 text-sm font-semibold text-slate-900">Accessibility</div>
              <p className="mt-2 text-sm text-slate-600">{x.accessibilityNote}</p>
            </div>

            <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-[0_30px_100px_rgba(2,8,23,.35)]">
              <div className="text-sm font-semibold">Emergency note</div>
              <p className="mt-2 text-sm opacity-85">
                If it’s life-threatening, call <span className="font-semibold">999</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {x.gallery.slice(0, 3).map((src, i) => (
            <div
              key={src}
              className="relative h-44 overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 shadow-[0_16px_36px_rgba(2,8,23,.08)]"
            >
              <Image src={src} alt={`${x.name} gallery ${i + 1}`} fill className="object-cover" quality={82} sizes="33vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
