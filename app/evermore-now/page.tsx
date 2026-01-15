"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import StickyHeader from "../components/landing/StickyHeader.client";
import Footer from "../components/landing/Footer";
import GradientDivider from "../components/landing/GradientDivider";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

type Category =
  | "Updates"
  | "New locations"
  | "Care guides"
  | "Partnerships"
  | "Press";

type Post = {
  id: string;
  title: string;
  excerpt: string;
  content: string[];
  date: string; // e.g. "2025-12-30"
  category: Category;
  readMins: number;
  heroImage?: string;
  tags: string[];
};

function Pill({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: "blue" | "slate" | "emerald";
}) {
  const tones =
    tone === "blue"
      ? "bg-blue-50 text-blue-700 ring-blue-100"
      : tone === "emerald"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : "bg-white text-slate-700 ring-slate-200";
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1", tones)}>
      {children}
    </span>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl bg-white ring-1 ring-slate-200 shadow-[0_24px_70px_rgba(2,8,23,.06)]",
        className
      )}
    >
      {children}
    </div>
  );
}

function Modal({
  open,
  onClose,
  post,
}: {
  open: boolean;
  onClose: () => void;
  post: Post | null;
}) {
  if (!open || !post) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-slate-950/60" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 shadow-[0_40px_120px_rgba(2,8,23,.35)]">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 p-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Pill>{post.category}</Pill>
                <Pill tone="slate">{post.readMins} min read</Pill>
                <span className="text-xs font-semibold text-slate-500">{post.date}</span>
              </div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{post.title}</div>
              <div className="mt-1 text-sm text-slate-600">{post.excerpt}</div>
            </div>

            <button
              onClick={onClose}
              className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Close
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-6">
            {post.heroImage ? (
              <div className="relative mb-6 overflow-hidden rounded-3xl ring-1 ring-slate-200">
                <div className="relative h-[220px]">
                  <Image
                    src={post.heroImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="object-cover"
                    priority={false}
                  />
                </div>
              </div>
            ) : null}

            <div className="space-y-4">
              {post.content.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-slate-700">
                  {p}
                </p>
              ))}
            </div>

            <div className="mt-6 rounded-3xl bg-slate-950 p-6 text-white shadow-[0_30px_110px_rgba(2,8,23,.25)]">
              <div className="text-xs font-semibold opacity-80">Quick actions</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">Use the portal for the cleanest flow.</div>
              <p className="mt-2 text-sm leading-relaxed opacity-85">
                Book appointments, track receipts, and keep records structured in one place.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-blue-700 ring-1 ring-white/25 hover:bg-slate-50"
                >
                  Create account →
                </Link>
                <Link
                  href="/locations"
                  className="inline-flex items-center justify-center rounded-2xl bg-white/10 px-6 py-3.5 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/15"
                >
                  Find a location
                </Link>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-500">
              Tags:{" "}
              <span className="font-semibold text-slate-700">{post.tags.join(", ")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EvermoreNowPage() {
  const posts: Post[] = useMemo(
    () => [
      {
        id: "portal-updates-q4",
        title: "Portal improvements: faster bookings, clearer billing, cleaner receipts",
        excerpt:
          "We refined the booking flow and improved billing clarity so you can see what’s owed, what’s paid, and what’s next — instantly.",
        date: "2025-12-30",
        category: "Updates",
        readMins: 3,
        heroImage: "/Pictures/facility-5.jpg",
        tags: ["Portal", "Billing", "Performance"],
        content: [
          "We shipped a set of updates focused on speed and clarity across the patient portal.",
          "Bookings now require fewer steps and reduce the chance of missing details. Billing views are clearer, with outstanding and paid items separated cleanly, so you always know what you’re looking at.",
          "We also tightened receipt generation and download behaviors so your payment proof stays accessible and consistent after refresh/relogin.",
          "If you ever see something confusing in your billing area, contact support and we’ll route it quickly.",
        ],
      },
      {
        id: "care-guide-appointments",
        title: "Care guide: what to bring to your appointment (UK clinics)",
        excerpt:
          "A simple checklist that makes your visit smoother — especially for specialist appointments and diagnostics.",
        date: "2025-12-18",
        category: "Care guides",
        readMins: 2,
        heroImage: "/Pictures/facility-2.jpg",
        tags: ["Care", "Checklist", "UK"],
        content: [
          "For most visits, you’ll want ID, your appointment confirmation, and any referral notes if applicable.",
          "If you’re using private insurance, bring your policy details and any authorisation code (if required).",
          "For diagnostic visits, follow any prep instructions you received. If you’re unsure, check Help Center or contact support.",
        ],
      },
      {
        id: "new-locations-2026",
        title: "New locations coming soon across the UK",
        excerpt:
          "We’re expanding access with additional clinics — more availability, shorter travel times, and better coverage.",
        date: "2025-11-27",
        category: "New locations",
        readMins: 2,
        heroImage: "/Pictures/facility-1.jpg",
        tags: ["Expansion", "Clinics", "UK"],
        content: [
          "We’re planning new UK locations to improve access and reduce delays for routine bookings.",
          "Updates will appear in Locations as new clinics are confirmed and activated.",
          "If you want a clinic in a specific city, contact support — we track demand signals.",
        ],
      },
      {
        id: "partners-labs",
        title: "Partnership note: improving turnaround for lab results",
        excerpt:
          "We’re working on better lab turnaround and clearer result presentation inside the portal.",
        date: "2025-11-05",
        category: "Partnerships",
        readMins: 3,
        tags: ["Labs", "Results", "Portal"],
        content: [
          "We’re optimising result workflows to reduce delays and keep results easy to interpret.",
          "Your portal will remain the primary place to check results and follow-up actions.",
          "As always, urgent concerns should be handled via the appropriate medical channels.",
        ],
      },
    ],
    []
  );

  const categories: Array<Category | "All"> = useMemo(
    () => ["All", "Updates", "New locations", "Care guides", "Partnerships", "Press"],
    []
  );

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "All">("All");
  const [openId, setOpenId] = useState<string | null>(null);

  const openPost = posts.find((p) => p.id === openId) ?? null;

  const featured = posts[0];

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return posts.filter((p) => {
      const hitCat = cat === "All" || p.category === cat;
      const hitQ =
        !s ||
        p.title.toLowerCase().includes(s) ||
        p.excerpt.toLowerCase().includes(s) ||
        p.tags.some((t) => t.toLowerCase().includes(s));
      return hitCat && hitQ;
    });
  }, [posts, q, cat]);

  return (
    <main className="bg-white text-slate-900">
      <StickyHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[440px] w-[440px] rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute -right-40 -top-48 h-[540px] w-[540px] rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-white" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-12">
          <div className="flex flex-wrap items-center gap-2">
            <Pill>Evermore Now</Pill>
            <Pill tone="slate">News • Updates • Care guides</Pill>
          </div>

          <div className="mt-5 grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                Updates that keep care calmer.
                <span className="block bg-gradient-to-r from-blue-700 via-cyan-600 to-slate-900 bg-clip-text text-transparent">
                  Transparent changes, not random surprises.
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
                Product releases, new locations, care guides, and service improvements — in one clean feed.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-2xl bg-blue-700 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(29,78,216,.25)] ring-1 ring-blue-700/20 transition hover:bg-blue-800"
                >
                  Create account →
                </Link>
                <Link
                  href="/help"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-50"
                >
                  Help center
                </Link>
              </div>
            </div>

            {/* Featured */}
            <Card className="overflow-hidden">
              {featured?.heroImage ? (
                <div className="relative h-[180px]">
                  <Image
                    src={featured.heroImage}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 520px"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-slate-950/0 to-slate-950/35" />
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <Pill>{featured.category}</Pill>
                    <Pill tone="slate">{featured.readMins} min</Pill>
                  </div>
                </div>
              ) : null}
              <div className="p-6">
                <div className="text-xs font-semibold text-slate-500">{featured?.date}</div>
                <div className="mt-2 text-base font-semibold text-slate-900">{featured?.title}</div>
                <div className="mt-2 text-sm leading-relaxed text-slate-600">{featured?.excerpt}</div>

                <button
                  onClick={() => setOpenId(featured.id)}
                  className="mt-5 inline-flex items-center justify-center rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white ring-1 ring-blue-700/20 hover:bg-blue-800"
                >
                  Read update →
                </button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <GradientDivider />

      {/* FILTERS + FEED */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-10">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="text-sm font-semibold text-slate-900">Search</div>
            <div className="mt-2 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200 shadow-[0_16px_45px_rgba(2,8,23,.06)]">
              <span className="text-slate-400">⌕</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search updates, tags, locations…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Try: “billing”, “portal”, “locations”, “lab results”, “insurance”.
            </div>
          </div>

          <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200 shadow-[0_16px_45px_rgba(2,8,23,.06)]">
            <div className="text-[11px] font-semibold text-slate-500">Category</div>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value as any)}
              className="mt-2 w-full rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => setOpenId(p.id)}
              className="group w-full text-left"
            >
              <Card className="overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[0_30px_90px_rgba(2,8,23,.10)]">
                {p.heroImage ? (
                  <div className="relative h-[160px]">
                    <Image
                      src={p.heroImage}
                      alt={p.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 420px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/0 via-slate-950/0 to-slate-950/25" />
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <Pill>{p.category}</Pill>
                      <Pill tone="slate">{p.readMins} min</Pill>
                    </div>
                  </div>
                ) : null}

                <div className="p-6">
                  <div className="text-xs font-semibold text-slate-500">{p.date}</div>
                  <div className="mt-2 text-base font-semibold text-slate-900">{p.title}</div>
                  <div className="mt-2 text-sm leading-relaxed text-slate-600">{p.excerpt}</div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.tags.slice(0, 3).map((t) => (
                      <Pill key={t} tone="slate">
                        {t}
                      </Pill>
                    ))}
                  </div>

                  <div className="mt-5 text-xs font-semibold text-blue-700">
                    Read →
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
            <div className="text-sm font-semibold text-slate-900">No results</div>
            <div className="mt-2 text-sm text-slate-600">
              Try a different keyword or switch categories.
            </div>
          </div>
        ) : null}

        {/* CTA STRIP */}
        <div className="mt-10 rounded-3xl bg-slate-950 p-8 text-white shadow-[0_30px_110px_rgba(2,8,23,.25)]">
          <div className="grid gap-6 md:grid-cols-[1.2fr_.8fr] md:items-center">
            <div>
              <div className="text-xs font-semibold opacity-80">Ready for the portal experience?</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">Create your account in minutes.</div>
              <div className="mt-2 text-sm leading-relaxed opacity-85">
                Book visits, access results, and track invoices/receipts with clean structure.
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-blue-700 ring-1 ring-white/25 hover:bg-slate-50"
              >
                Create account →
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl bg-white/10 px-6 py-3.5 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/15"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Modal open={!!openId} onClose={() => setOpenId(null)} post={openPost} />

      <Footer />
    </main>
  );
}
