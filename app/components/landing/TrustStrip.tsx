// app/components/landing/TrustStrip.tsx
export default function TrustStrip() {
  const items = [
    { k: "Avg wait time", v: "12–18 min" },
    { k: "Same-day slots", v: "350+ / week" },
    { k: "Specialty clinics", v: "40+" },
    { k: "Patient rating", v: "4.8 / 5" },
  ];

  return (
    <section className="relative mx-auto max-w-7xl px-4 -mt-10">
      <div className="grid gap-4 rounded-3xl bg-white p-5 ring-1 ring-slate-200 shadow-[0_20px_60px_rgba(2,8,23,.10)] md:grid-cols-4">
        {items.map((x) => (
          <div key={x.k} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <div className="text-[11px] font-semibold text-slate-500">{x.k}</div>
            <div className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{x.v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
