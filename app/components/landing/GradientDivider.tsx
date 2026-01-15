// app/components/landing/GradientDivider.tsx
export default function GradientDivider() {
  return (
    <div className="relative my-14 h-px w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/25 to-transparent blur-sm" />
    </div>
  );
}
