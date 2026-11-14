import { WaslLogo } from "@/components/brand/WaslLogo";

export default function RootLoading() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex flex-col items-center gap-4">
        <WaslLogo variant="full" className="h-11 sm:h-13 animate-pulse" priority />
        <div className="h-1.5 w-36 overflow-hidden rounded-full bg-[var(--bg-surface-alt)]">
          <div className="h-full w-full wasl-skeleton rounded-full" />
        </div>
      </div>
    </div>
  );
}
