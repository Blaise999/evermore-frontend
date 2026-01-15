// app/components/landing/CareCard.tsx
import Link from "next/link";
import Image from "next/image";
import { MiniTag, PrimaryButton, ArrowRight } from "./ui";

export default function CareCard({
  title,
  desc,
  meta,
  href,
  img,
}: {
  title: string;
  desc: string;
  meta: string[];
  href: string;
  img: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 shadow-[0_20px_55px_rgba(2,8,23,.08)]">
      <div className="relative h-44">
        <Image src={img} alt={title} fill className="object-cover" quality={82} sizes="50vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/15 to-transparent" />
        <div className="absolute left-5 top-5">
          <MiniTag text={meta[0] ?? "Open daily"} />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="text-xl font-semibold tracking-tight text-white">{title}</h3>
          <p className="mt-1 text-sm text-white/85">{desc}</p>
        </div>
      </div>

      <div className="p-6">
        <ul className="space-y-2 text-sm text-slate-700">
          {meta.slice(1).map((m) => (
            <li key={m} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600/60" />
              <span>{m}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <PrimaryButton href={href} className="px-5 py-3 text-xs rounded-2xl">
            Book / Explore
          </PrimaryButton>
          <Link
            href={href}
            prefetch={false}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-semibold text-blue-700 hover:bg-blue-50"
          >
            Details <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
