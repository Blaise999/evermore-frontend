// app/components/landing/Testimonials.tsx
import Image from "next/image";
import React from "react";

type IconProps = { className?: string };
function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function Quote({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-6 w-6", className)} fill="none">
      <path
        d="M10.5 11.2c0 4-2.2 7.3-6.2 8.3v-2.4c2.2-.8 3.3-2.3 3.6-4.1H4.2V6.5h6.3v4.7Zm9.3 0c0 4-2.2 7.3-6.2 8.3v-2.4c2.2-.8 3.3-2.3 3.6-4.1h-3.7V6.5h6.3v4.7Z"
        className="fill-current"
        opacity="0.18"
      />
      <path
        d="M10.5 11.2c0 4-2.2 7.3-6.2 8.3v-2.4c2.2-.8 3.3-2.3 3.6-4.1H4.2V6.5h6.3v4.7Zm9.3 0c0 4-2.2 7.3-6.2 8.3v-2.4c2.2-.8 3.3-2.3 3.6-4.1h-3.7V6.5h6.3v4.7Z"
        className="stroke-current"
        strokeWidth="1.2"
        opacity="0.35"
      />
    </svg>
  );
}

function Star({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-4 w-4", className)} fill="none">
      <path
        d="M12 2l2.6 6.9 7.4.4-5.7 4.5 2 7.1-6.3-4.1-6.3 4.1 2-7.1L2 9.3l7.4-.4L12 2Z"
        className="fill-current"
        opacity="0.9"
      />
    </svg>
  );
}

function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 shadow-[0_10px_25px_rgba(2,8,23,.06)]">
      <span className="text-blue-600">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function MiniTag({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
      {text}
    </span>
  );
}

export default function Testimonials() {
  const items = [
    {
      name: "Amara N.",
      role: "Patient",
      quote:
        "The portal made everything feel simple. I could see my appointment, prep steps, and results without calling anyone.",
      img: "/Pictures/doctor-5.jpg",
    },
    {
      name: "Daniel K.",
      role: "Patient",
      quote:
        "Check-in was fast and the instructions were clear. Billing history and receipts were easy to find.",
      img: "/Pictures/doctor-6.jpg",
    },
    {
      name: "Priya S.",
      role: "Caregiver",
      quote:
        "I liked the calm layout—appointments, summaries, and next steps are all in one place. Very reassuring.",
      img: "/Pictures/doctor-2.jpg",
    },
  ];

  return (
    <section id="testimonials" className="mx-auto max-w-7xl px-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionLabel icon={<span className="text-blue-600"><Star /></span>} text="Testimonials" />
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Trusted by patients and families
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            A modern experience that still feels human: clear instructions, calm care, and secure access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-amber-500">
            <Star />
            <Star />
            <Star />
            <Star />
            <Star />
          </div>
          <div className="text-sm font-semibold text-slate-700">4.9</div>
          <div className="text-xs text-slate-500">Average rating</div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {items.map((t) => (
          <div
            key={t.name}
            className="relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_80px_rgba(2,8,23,.10)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-2xl ring-1 ring-slate-200">
                  <Image
                    src={t.img}
                    alt={t.name}
                    fill
                    className="object-cover"
                    quality={82}
                    sizes="48px"
                  />
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">{t.role}</div>
                </div>
              </div>

              <div className="text-blue-700">
                <Quote />
              </div>
            </div>

            <div className="mt-4 text-sm leading-relaxed text-slate-700">
              “{t.quote}”
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <MiniTag text="Clear instructions" />
              <MiniTag text="Fast check-in" />
              <MiniTag text="Secure portal" />
            </div>

            <div className="mt-5 flex items-center gap-1 text-amber-500">
              <Star />
              <Star />
              <Star />
              <Star />
              <Star />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-900 p-6 text-white shadow-[0_28px_90px_rgba(37,99,235,.30)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold opacity-90">Patient-first experience</div>
            <div className="mt-2 text-xl font-semibold tracking-tight">
              Everything you need, without the stress.
            </div>
            <div className="mt-2 text-sm opacity-90">
              Appointments, results, billing, and visit notes — organized and easy to use.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
              <div className="text-xs font-semibold opacity-80">Support</div>
              <div className="mt-1 text-sm font-semibold">24/7 guidance</div>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
              <div className="text-xs font-semibold opacity-80">Security</div>
              <div className="mt-1 text-sm font-semibold">Protected access</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
