// app/emergency/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import {
  Ambulance,
  BadgeAlert,
  Bolt,
  ExternalLink,
  Flame,
  Hospital,
  MessageSquareText,
  PhoneCall,
  Shield,
  Siren,
} from "lucide-react";

import { AuthHeader } from "../components/auth-header";

export const metadata: Metadata = {
  title: "Emergency Support — Evermore",
  description:
    "UK emergency information: 999/112, NHS 111, Police 101, gas and power emergencies, and official authority links.",
};

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-7xl px-4">{children}</div>;
}

function Pill({
  tone = "slate",
  children,
}: {
  tone?: "red" | "blue" | "green" | "amber" | "slate";
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    red: "bg-rose-50 text-rose-800 ring-1 ring-rose-200",
    blue: "bg-blue-50 text-blue-800 ring-1 ring-blue-200",
    green: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
    amber: "bg-amber-50 text-amber-900 ring-1 ring-amber-200",
    slate: "bg-slate-50 text-slate-800 ring-1 ring-slate-200",
  };
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold", tones[tone])}>
      {children}
    </span>
  );
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[28px] bg-white p-6 shadow-[0_26px_90px_rgba(2,8,23,.10)] ring-1 ring-slate-200",
        className
      )}
    >
      {children}
    </div>
  );
}

function ExtA({
  href,
  children,
  className,
  "aria-label": ariaLabel,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(2,8,23,.18)] transition hover:bg-slate-950 active:translate-y-[1px]",
        className
      )}
    >
      {children}
      <ExternalLink className="h-4 w-4 opacity-90" />
    </a>
  );
}

function TelA({
  tel,
  label,
  hint,
  icon,
  tone = "blue",
}: {
  tel: string;
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  tone?: "red" | "blue" | "green" | "amber" | "slate";
}) {
  const toneBtn: Record<string, string> = {
    red: "bg-rose-600 hover:bg-rose-700 shadow-[0_18px_44px_rgba(225,29,72,.22)]",
    blue: "bg-blue-600 hover:bg-blue-700 shadow-[0_18px_44px_rgba(37,99,235,.22)]",
    green: "bg-emerald-600 hover:bg-emerald-700 shadow-[0_18px_44px_rgba(5,150,105,.20)]",
    amber: "bg-amber-600 hover:bg-amber-700 shadow-[0_18px_44px_rgba(217,119,6,.20)]",
    slate: "bg-slate-900 hover:bg-slate-950 shadow-[0_18px_44px_rgba(2,8,23,.18)]",
  };

  return (
    <a
      href={`tel:${tel}`}
      className={cn(
        "group inline-flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition active:translate-y-[1px]",
        toneBtn[tone]
      )}
      aria-label={`Call ${tel}`}
    >
      <span className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15">
          {icon ?? <PhoneCall className="h-5 w-5" />}
        </span>
        <span className="flex flex-col">
          <span className="leading-none">{label}</span>
          {hint ? <span className="mt-1 text-xs font-medium text-white/80">{hint}</span> : null}
        </span>
      </span>
      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{tel}</span>
    </a>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-sm leading-relaxed text-slate-700">
      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
      <span>{children}</span>
    </li>
  );
}

export default function EmergencyPage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#F6FAFF] via-white to-white text-slate-900">
      <AuthHeader />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_350px_at_10%_10%,rgba(37,99,235,.15),transparent_65%),radial-gradient(700px_350px_at_90%_20%,rgba(225,29,72,.12),transparent_60%)]" />
        <Container>
          <div className="relative py-10 md:py-14">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-3">
                <Pill tone="red">
                  <Siren className="h-4 w-4" />
                  UK emergency guidance
                </Pill>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
                  Emergency support & official contacts
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
                  If someone is in immediate danger or needs urgent medical help, call{" "}
                  <span className="font-semibold text-slate-900">999</span> or{" "}
                  <span className="font-semibold text-slate-900">112</span> right away. For urgent (but not
                  life-threatening) health advice, use <span className="font-semibold text-slate-900">NHS 111</span>.
                </p>
              </div>

              <div className="grid w-full gap-3 sm:max-w-md">
                <TelA
                  tel="999"
                  label="Call emergency services"
                  hint="Ambulance • Police • Fire • Coastguard"
                  icon={<Ambulance className="h-5 w-5" />}
                  tone="red"
                />
                <TelA
                  tel="112"
                  label="Call emergency services (alternative)"
                  hint="Works like 999 in the UK"
                  icon={<BadgeAlert className="h-5 w-5" />}
                  tone="red"
                />
                <TelA
                  tel="111"
                  label="NHS 111 (urgent medical advice)"
                  hint="24/7 health guidance and routing"
                  icon={<Hospital className="h-5 w-5" />}
                  tone="blue"
                />
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-500">What counts as an emergency?</div>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
                      Call 999/112 for life-threatening situations
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      If there’s immediate danger to life, a serious injury, or a crime in progress, contact emergency
                      services now.
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <div className="grid h-12 w-12 place-items-center rounded-3xl bg-blue-50 ring-1 ring-blue-200">
                      <Shield className="h-6 w-6 text-blue-700" />
                    </div>
                  </div>
                </div>

                <ul className="mt-5 grid gap-3 md:grid-cols-2">
                  <ListItem>Someone is not breathing, unconscious, or having severe breathing difficulty.</ListItem>
                  <ListItem>Suspected stroke, heart attack, severe chest pain, or heavy bleeding.</ListItem>
                  <ListItem>Serious road traffic collision or major trauma.</ListItem>
                  <ListItem>Fire, gas explosion, or immediate threat to safety.</ListItem>
                </ul>

                <div className="mt-6 flex flex-wrap gap-2">
                  <ExtA href="https://www.gov.uk/guidance/999-and-112-the-uks-national-emergency-numbers" className="bg-slate-900">
                    999/112 official guidance
                  </ExtA>
                  <ExtA
                    href="https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-call-999/"
                    className="bg-blue-700 hover:bg-blue-800"
                  >
                    NHS: when to call 999
                  </ExtA>
                </div>
              </Card>

              <Card className="bg-slate-950 text-white ring-1 ring-white/10">
                <div className="text-xs font-semibold text-white/70">If you’re not sure</div>
                <div className="mt-2 text-lg font-semibold">Use NHS 111 first (when it’s safe)</div>
                <p className="mt-2 text-sm leading-relaxed text-white/80">
                  NHS 111 can assess symptoms, tell you what to do next, and direct you to the right service. If it’s
                  an emergency, call 999/112.
                </p>
                <div className="mt-4 grid gap-2">
                  <a
                    href="https://111.nhs.uk/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900"
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquareText className="h-4 w-4" />
                      NHS 111 online (England)
                    </span>
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  <a
                    href="https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-go-to-ae/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
                  >
                    <span className="flex items-center gap-2">
                      <Hospital className="h-4 w-4" />
                      NHS: when to go to A&E
                    </span>
                    <ExternalLink className="h-4 w-4 opacity-90" />
                  </a>
                </div>

                <div className="mt-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <div className="text-xs font-semibold text-white/80">Note</div>
                  <p className="mt-1 text-xs leading-relaxed text-white/70">
                    NHS 111 online is for England and for people aged 5+. If you’re in Wales or Scotland, use the links
                    below.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* OFFICIAL CONTACTS GRID */}
      <section className="py-10 md:py-14">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <Pill tone="blue">
                <PhoneCall className="h-4 w-4" />
                Official UK contacts
              </Pill>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                Choose the right number
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
                These links go to official UK authorities and services (NHS, GOV.UK, emergency utilities, and national
                partners).
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-3xl bg-rose-50 ring-1 ring-rose-200">
                  <Siren className="h-5 w-5 text-rose-700" />
                </div>
                <Pill tone="red">Emergency</Pill>
              </div>
              <h3 className="mt-4 text-lg font-semibold">999 / 112</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Life-threatening emergencies: ambulance, police, fire, coastguard.
              </p>
              <div className="mt-4 grid gap-2">
                <TelA tel="999" label="Call 999" tone="red" />
                <TelA tel="112" label="Call 112" tone="red" />
              </div>
              <div className="mt-4">
                <ExtA href="https://www.gov.uk/guidance/999-and-112-the-uks-national-emergency-numbers" className="w-full justify-center">
                  GOV.UK guidance
                </ExtA>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-3xl bg-blue-50 ring-1 ring-blue-200">
                  <Hospital className="h-5 w-5 text-blue-700" />
                </div>
                <Pill tone="blue">Health</Pill>
              </div>
              <h3 className="mt-4 text-lg font-semibold">NHS 111</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Urgent medical advice when it’s not a 999/112 emergency.
              </p>
              <div className="mt-4 grid gap-2">
                <TelA tel="111" label="Call 111" tone="blue" icon={<Hospital className="h-5 w-5" />} />
                <ExtA href="https://111.nhs.uk/" className="w-full justify-center bg-blue-700 hover:bg-blue-800">
                  NHS 111 online (England)
                </ExtA>
              </div>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-xs font-semibold text-slate-500">Wales & Scotland</div>
                <div className="mt-2 grid gap-2">
                  <a
                    href="https://111.wales.nhs.uk/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                  >
                    NHS 111 Wales (online) <ExternalLink className="h-4 w-4 text-slate-500" />
                  </a>
                  <a
                    href="https://www.nhs24.scot/111/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                  >
                    NHS 24 (Scotland) <ExternalLink className="h-4 w-4 text-slate-500" />
                  </a>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-600">
                  Northern Ireland uses different routes for non-emergency health advice—use NI Direct to find the right
                  service for your area.
                </p>
                <a
                  href="https://www.nidirect.gov.uk/articles/how-use-your-health-services"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  NI Direct health services <ExternalLink className="h-4 w-4 text-slate-500" />
                </a>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-3xl bg-slate-50 ring-1 ring-slate-200">
                  <Shield className="h-5 w-5 text-slate-700" />
                </div>
                <Pill tone="slate">Police</Pill>
              </div>
              <h3 className="mt-4 text-lg font-semibold">Police (non-emergency)</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                If it’s not immediate danger, call 101 or use official reporting routes.
              </p>
              <div className="mt-4 grid gap-2">
                <TelA tel="101" label="Call 101 (non-emergency police)" tone="slate" icon={<Shield className="h-5 w-5" />} />
                <ExtA href="https://www.gov.uk/contact-police" className="w-full justify-center">
                  GOV.UK: contact police
                </ExtA>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-xs font-semibold text-slate-500">Anonymous crime reporting</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  For anonymous tips (not for immediate danger), use Crimestoppers.
                </p>
                <div className="mt-3 grid gap-2">
                  <a
                    href="tel:0800555111"
                    className="inline-flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                  >
                    <span>Call Crimestoppers</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                      0800 555 111
                    </span>
                  </a>
                  <a
                    href="https://www.gov.uk/report-crime"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                  >
                    GOV.UK: report a crime anonymously <ExternalLink className="h-4 w-4 text-slate-500" />
                  </a>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-3xl bg-amber-50 ring-1 ring-amber-200">
                  <Flame className="h-5 w-5 text-amber-800" />
                </div>
                <Pill tone="amber">Utilities</Pill>
              </div>
              <h3 className="mt-4 text-lg font-semibold">Gas emergency (smell gas)</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                If you suspect a gas leak, call the National Gas Emergency line.
              </p>
              <div className="mt-4 grid gap-2">
                <TelA
                  tel="0800111999"
                  label="National Gas Emergency"
                  hint="Gas escapes / suspected leak"
                  tone="amber"
                  icon={<Flame className="h-5 w-5" />}
                />
                <ExtA href="https://www.nationalgas.com/emergency-contacts" className="w-full justify-center bg-amber-700 hover:bg-amber-800">
                  National Gas: emergency contacts
                </ExtA>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-3xl bg-emerald-50 ring-1 ring-emerald-200">
                  <Bolt className="h-5 w-5 text-emerald-700" />
                </div>
                <Pill tone="green">Utilities</Pill>
              </div>
              <h3 className="mt-4 text-lg font-semibold">Power cuts</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Report power cuts by calling 105 (free) or using your local network operator.
              </p>
              <div className="mt-4 grid gap-2">
                <TelA tel="105" label="Call 105 (power cuts)" tone="green" icon={<Bolt className="h-5 w-5" />} />
                <ExtA href="https://prepare.campaign.gov.uk/be-informed-about-hazards/power-cuts/" className="w-full justify-center bg-emerald-700 hover:bg-emerald-800">
                  GOV.UK: power cut guidance
                </ExtA>
              </div>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-xs font-semibold text-slate-500">Network operators</div>
                <a
                  href="https://powercuts.nationalgrid.co.uk/power-cut-advice/who-to-contact"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  National Grid: who to contact <ExternalLink className="h-4 w-4 text-slate-500" />
                </a>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-3xl bg-slate-50 ring-1 ring-slate-200">
                  <MessageSquareText className="h-5 w-5 text-slate-700" />
                </div>
                <Pill tone="slate">Accessibility</Pill>
              </div>
              <h3 className="mt-4 text-lg font-semibold">If you can’t speak on the phone</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                If you’re deaf, hard of hearing, or unable to speak, there are official options to contact emergency
                services.
              </p>

              <div className="mt-4 grid gap-2">
                <ExtA href="https://www.relayuk.bt.com/how-to-use-relay-uk/contact-999-using-relay-uk.html" className="w-full justify-center">
                  Contact 999 using Relay UK
                </ExtA>
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="text-xs font-semibold text-slate-500">Relay dial code</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    With Relay UK, you may need to dial <span className="font-semibold text-slate-900">18000</span>{" "}
                    to reach 999 through the service.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* SMALL PRINT + INTERNAL LINKS */}
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="flex items-start gap-3">
                <div className="mt-1 grid h-10 w-10 place-items-center rounded-3xl bg-slate-50 ring-1 ring-slate-200">
                  <BadgeAlert className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Important</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    This page provides quick access to official contacts. If someone is in immediate danger, call{" "}
                    <span className="font-semibold text-slate-900">999</span> or{" "}
                    <span className="font-semibold text-slate-900">112</span>. Evermore does not replace emergency
                    services.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href="https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                    >
                      NHS urgent & emergency care <ExternalLink className="h-4 w-4 text-slate-500" />
                    </a>
                    <a
                      href="https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/find-urgent-and-emergency-care-services/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                    >
                      Find urgent care services <ExternalLink className="h-4 w-4 text-slate-500" />
                    </a>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-950 text-white ring-1 ring-white/10">
              <div className="text-xs font-semibold text-white/70">Need portal help?</div>
              <div className="mt-2 text-lg font-semibold">Help centre</div>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                For account and portal questions (not emergencies), visit the help centre.
              </p>
              <Link
                href="/help"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900"
              >
                Go to Help Centre
              </Link>
            </Card>
          </div>
        </Container>
      </section>

      {/* FOOTER STRIP */}
      <footer className="border-t border-slate-200 py-10">
        <Container>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Evermore Hospitals</div>
              <div className="mt-1 text-xs font-medium text-slate-500">
                Emergency numbers: 999 / 112 • Urgent medical advice: 111 • Police non-emergency: 101 • Power cuts: 105
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/terms"
                className="inline-flex items-center rounded-full bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-white"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="inline-flex items-center rounded-full bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-white"
              >
                Privacy
              </Link>
              <Link
                href="/quality"
                className="inline-flex items-center rounded-full bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-white"
              >
                Quality & safety
              </Link>
            </div>
          </div>
        </Container>
      </footer>
    </main>
  );
}
