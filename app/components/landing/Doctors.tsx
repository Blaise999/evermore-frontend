// app/components/landing/Doctors.tsx
import Image from "next/image";
import React from "react";

type IconProps = { className?: string };
function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function Shield({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M12 2l8 4v6c0 5.2-3.4 9.9-8 10-4.6-.1-8-4.8-8-10V6l8-4Z"
        className="stroke-current"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-5"
        className="stroke-current"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
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

export default function Doctors() {
  const docs = [
    { n: "Dr. Sofia Harper", s: "Internal Medicine", img: "/Pictures/doctor-1.jpg" },
    { n: "Dr. Rami Salim", s: "Cardiology", img: "/Pictures/doctor-2.jpg" },
    { n: "Dr. Mina Choi", s: "Dermatology", img: "/Pictures/doctor-3.jpg" },
    { n: "Dr. Jordan Reyes", s: "Orthopedics", img: "/Pictures/doctor-4.jpg" },
  ];

  return (
    <section id="about" className="mx-auto max-w-7xl px-4">
      <div className="grid gap-8 lg:grid-cols-[1fr_.95fr] lg:items-start">
        <div>
          <SectionLabel icon={<Shield />} text="Care teams" />
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Meet the clinicians patients trust
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
            Experienced teams, clear communication, and coordinated follow-up.
          </p>

          <div className="mt-6 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-900 p-6 text-white shadow-[0_28px_90px_rgba(37,99,235,.30)]">
            <div className="text-xs font-semibold opacity-90">Evermore Standard</div>
            <div className="mt-2 text-xl font-semibold tracking-tight">
              Safer pathways + clear instructions + secure records
            </div>
            <p className="mt-2 text-sm leading-relaxed opacity-90">
              Patients can review prep notes, results, and visit summaries without confusion.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <MiniTag text="Visit prep" />
              <MiniTag text="Results access" />
              <MiniTag text="Care coordination" />
            </div>

            <div className="mt-5 relative h-40 overflow-hidden rounded-3xl ring-1 ring-white/15">
              <Image
                src="/Pictures/facility-8.jpg"
                alt="Evermore facility"
                fill
                className="object-cover"
                quality={82}
                sizes="50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 via-blue-700/25 to-transparent" />
              <div className="absolute left-4 bottom-4 text-sm font-semibold">
                Calm facilities. Clear care.
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {docs.map((d) => (
            <div
              key={d.n}
              className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 shadow-[0_20px_60px_rgba(2,8,23,.08)]"
            >
              {/* Bigger image area */}
              <div className="relative h-52 sm:h-56">
                <Image src={d.img} alt={d.n} fill className="object-cover" quality={82} sizes="50vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
              </div>

              <div className="p-5">
                <div className="text-sm font-semibold text-slate-900">{d.n}</div>
                <div className="mt-1 text-xs font-semibold text-slate-500">{d.s}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <MiniTag text="Book online" />
                  <MiniTag text="Follow-up" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
