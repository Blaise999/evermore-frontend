import Image from "next/image";
import Link from "next/link";

export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-3">
      <span className="relative h-10 w-10 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <Image
          src="/Pictures/Logo.png"
          alt="Evermore Hospitals"
          fill
          className="object-contain p-1"
          priority
        />
      </span>
      <span className="leading-tight">
        <span className="block text-sm text-slate-500">Evermore</span>
        <span className="block text-lg font-semibold tracking-tight text-slate-900">
          Hospitals
        </span>
      </span>
    </Link>
  );
}
