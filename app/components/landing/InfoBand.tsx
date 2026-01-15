// app/components/landing/InfoBand.tsx
import Image from "next/image";
import { MiniTag } from "./ui";

export default function InfoBand() {
  const points = [
    {
      t: "A smoother visit from start to finish",
      d: "Create an account, book a visit, and get clear prep instructions — then review your results and summaries afterward.",
      img: "/Pictures/portal-2.jpg",
      tag: "Patient journey",
    },
    {
      t: "Results & records you can actually find",
      d: "Labs, imaging, prescriptions, and notes — organized and easy to access when you need them.",
      img: "/Pictures/specialty-2.jpg",
      tag: "Health records",
    },
    {
      t: "Coordinated care across departments",
      d: "Teams share context, so your next steps are clear and your follow-up is faster.",
      img: "/Pictures/facility-3.jpg",
      tag: "Care coordination",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="grid gap-4 lg:grid-cols-3">
        {points.map((p) => (
          <div
            key={p.t}
            className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 shadow-[0_22px_70px_rgba(2,8,23,.10)]"
          >
            <div className="relative h-40">
              <Image src={p.img} alt={p.t} fill className="object-cover" quality={82} sizes="33vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/15 to-transparent" />
              <div className="absolute left-4 top-4">
                <MiniTag text={p.tag} />
              </div>
            </div>
            <div className="p-6">
              <div className="text-lg font-semibold tracking-tight text-slate-900">{p.t}</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.d}</p>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">Learn more</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
