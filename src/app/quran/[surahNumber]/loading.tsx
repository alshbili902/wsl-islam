import { WaslLogo } from "@/components/brand/WaslLogo";

export default function SurahLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-[var(--wasl-border)] bg-[var(--wasl-surface)] p-6">
        <WaslLogo variant="icon" className="h-12 w-12 animate-pulse" />
        <div className="h-4 w-48 rounded-full wasl-skeleton" />
        <div className="h-3 w-32 rounded-full wasl-skeleton" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 rounded-3xl border border-[var(--wasl-border)] bg-[var(--wasl-surface)] p-6 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
