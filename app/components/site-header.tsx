"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type NavItem = { label: string; href: string };
type DrawerSection = { title: string; links: NavItem[] };
type Drawer = { key: "patients" | "portal"; label: string; sections: DrawerSection[] };

const BRAND = {
  name: "Evermore Hospitals",
  blue: "#0B5FFF", // your brand blue (change if you want)
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function useLocalStorageFlag(key: string, initial = true) {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return;
      setValue(raw === "1");
    } catch {}
  }, [key]);

  const update = (next: boolean) => {
    setValue(next);
    try {
      localStorage.setItem(key, next ? "1" : "0");
    } catch {}
  };
  return [value, update] as const;
}

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<Drawer["key"] | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const [showOutage, setShowOutage] = useLocalStorageFlag("evermore_outage_banner", true);
  const [showPolicy, setShowPolicy] = useLocalStorageFlag("evermore_policy_banner", true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const mainNav: NavItem[] = useMemo(
    () => [
      { label: "Doctors & Providers", href: "/doctors" },
      { label: "Clinics & Locations", href: "/locations" },
      { label: "Conditions & Treatments", href: "/conditions" },
    ],
    []
  );

  const drawers: Drawer[] = useMemo(
    () => [
      {
        key: "patients",
        label: "Patients & Visitors",
        sections: [
          {
            title: "Quick Links",
            links: [
              { label: "Billing", href: "/patients/billing" },
              { label: "Insurance", href: "/patients/insurance" },
              { label: "Medical Records", href: "/patients/records" },
              { label: "Support Groups", href: "/patients/support-groups" },
              { label: "Financial Assistance", href: "/patients/financial-assistance" },
            ],
          },
          {
            title: "Plan Your Visit",
            links: [
              { label: "Locations & Parking", href: "/patients/parking" },
              { label: "Visitor Policy", href: "/patients/visitor-policy" },
              { label: "Hospital Check-in", href: "/patients/check-in" },
              { label: "Video Visits", href: "/patients/video-visits" },
              { label: "International Patients", href: "/patients/international" },
              { label: "Contact Us", href: "/contact" },
            ],
          },
        ],
      },
      {
        key: "portal",
        label: "MyHealth",
        sections: [
          {
            title: "New to MyHealth?",
            links: [
              { label: "Activate Account", href: "/myhealth/activate" },
              { label: "Create a New Account", href: "/myhealth/create" },
              { label: "Learn More", href: "/myhealth" },
              { label: "Get the iPhone App", href: "/myhealth/ios" },
              { label: "Get the Android App", href: "/myhealth/android" },
            ],
          },
        ],
      },
    ],
    []
  );

  const active = drawers.find((d) => d.key === activeDrawer) ?? null;

  const toggleDrawer = (key: Drawer["key"]) => {
    setActiveDrawer((prev) => (prev === key ? null : key));
  };

  return (
    <header className="relative z-50">
      {/* Skip link */}
      <a
        href="#main-container"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to main content
      </a>

      {/* Alert banners (like your pasted HTML) */}
      <div className="w-full">
        {showOutage && (
          <div className="border-b border-slate-200 bg-slate-50">
            <div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-2 md:items-center">
              <span
                className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: BRAND.blue }}
              />
              <p className="text-sm text-slate-700">
                <b className="font-semibold">Notice:</b> Some pages may load slowly right now. We’re working to resolve it.
              </p>
              <button
                className="ml-auto rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
                onClick={() => setShowOutage(false)}
                aria-label="Dismiss notice"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {showPolicy && (
          <div className="border-b border-blue-100 bg-blue-50">
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
              <p className="text-sm text-slate-800">
                <Link className="font-medium underline hover:no-underline" href="/policies/masking">
                  See our updated masking policy
                </Link>
              </p>
              <button
                className="ml-auto rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-blue-100"
                onClick={() => setShowPolicy(false)}
                aria-label="Dismiss policy"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky masthead */}
      <div
        className={cx(
          "sticky top-0 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75",
          scrolled ? "shadow-sm" : "shadow-none"
        )}
      >
        <div
          className={cx(
            "mx-auto flex max-w-6xl items-center justify-between px-4 transition-[padding,height] duration-200",
            scrolled ? "h-14" : "h-20"
          )}
        >
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-slate-100"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <span className="text-xl leading-none">☰</span>
            </button>

            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/Pictures/Logo.png"
                alt={BRAND.name}
                width={140}
                height={40}
                className={cx("h-8 w-auto", scrolled ? "md:h-7" : "md:h-9")}
                priority
              />
              <span className="hidden text-sm font-semibold text-slate-800 md:inline">
                {BRAND.name}
              </span>
            </Link>
          </div>

          {/* Right: search + quick action */}
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Search
            </Link>

            <Link
              href="/appointments"
              className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-white md:inline-flex"
              style={{ backgroundColor: BRAND.blue }}
            >
              Make Appointment
            </Link>
          </div>
        </div>

        {/* Desktop nav row (matches your “Doctors / Clinics / Conditions” + dropdowns) */}
        <div className="hidden border-t border-slate-200 md:block">
          <div className="mx-auto flex max-w-6xl items-center justify-center gap-1 px-4">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-5 py-3 text-sm font-semibold text-slate-700 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}

            {/* Dropdown triggers */}
            <button
              className={cx(
                "relative px-5 py-3 text-sm font-semibold",
                activeDrawer === "patients" ? "text-slate-900" : "text-slate-700 hover:text-slate-900"
              )}
              onClick={() => toggleDrawer("patients")}
              aria-expanded={activeDrawer === "patients"}
            >
              Patients & Visitors <span className="ml-1">▾</span>
            </button>

            <button
              className={cx(
                "relative px-5 py-3 text-sm font-semibold",
                activeDrawer === "portal" ? "text-slate-900" : "text-slate-700 hover:text-slate-900"
              )}
              onClick={() => toggleDrawer("portal")}
              aria-expanded={activeDrawer === "portal"}
            >
              MyHealth <span className="ml-1">▾</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop drawer panel (mega menu) */}
      {active && (
        <div className="hidden border-b border-slate-200 bg-white md:block">
          <div className="mx-auto max-w-6xl px-4 py-6">
            <div className="flex items-start justify-between gap-8">
              {/* Left: sections */}
              <div className="grid flex-1 grid-cols-2 gap-8">
                {active.sections.map((section) => (
                  <div key={section.title}>
                    <h3 className="text-base font-semibold text-slate-900">{section.title}</h3>
                    <ul className="mt-3 space-y-2">
                      {section.links.map((l) => (
                        <li key={l.href}>
                          <Link
                            href={l.href}
                            className="text-sm text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-900 hover:decoration-slate-400"
                          >
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Right: contact card (like your pasted “We are available 24/7” block) */}
              <div className="w-[320px] rounded-2xl border border-slate-200 p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">We’re available 24/7.</div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-600">Phone</span>
                    <a className="font-medium text-slate-900" href="tel:+2340000000000">
                      +234 000 000 0000
                    </a>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-600">Email</span>
                    <a className="font-medium underline" href="mailto:support@evermore.example">
                      support@evermore.example
                    </a>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    href="/contact"
                    className="flex-1 rounded-xl px-3 py-2 text-center text-sm font-semibold text-white"
                    style={{ backgroundColor: BRAND.blue }}
                  >
                    Contact Us
                  </Link>
                  <button
                    onClick={() => setActiveDrawer(null)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to close drawer on desktop */}
      {activeDrawer && (
        <button
          className="hidden md:fixed md:inset-0 md:z-40 md:block"
          onClick={() => setActiveDrawer(null)}
          aria-label="Close menu backdrop"
        />
      )}

      {/* Mobile offcanvas */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[86%] max-w-[320px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-4 py-4">
              <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                <Image src="/Pictures/Logo.png" alt={BRAND.name} width={120} height={36} className="h-7 w-auto" />
              </Link>
              <button
                className="rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              <div className="space-y-1">
                {mainNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl px-3 py-3 text-sm font-semibold text-white"
                    style={{ backgroundColor: BRAND.blue }}
                  >
                    {item.label}
                  </Link>
                ))}

                <Link
                  href="/myhealth/login"
                  onClick={() => setMobileOpen(false)}
                  className="mt-3 block rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-800"
                >
                  MyHealth Login
                </Link>
              </div>

              <div className="mt-6 space-y-4">
                {drawers.map((d) => (
                  <div key={d.key} className="rounded-2xl border border-slate-200 p-3">
                    <div className="text-sm font-semibold text-slate-900">{d.label}</div>
                    <div className="mt-2 space-y-2">
                      {d.sections.flatMap((s) => s.links).slice(0, 6).map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          onClick={() => setMobileOpen(false)}
                          className="block text-sm text-slate-700 underline decoration-slate-300 underline-offset-4"
                        >
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-3">
                <div className="text-xs font-semibold uppercase text-slate-600">Need help?</div>
                <div className="mt-1 text-sm text-slate-800">
                  Call{" "}
                  <a className="font-semibold" href="tel:+2340000000000">
                    +234 000 000 0000
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
