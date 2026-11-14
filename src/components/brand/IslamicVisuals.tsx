import React from "react";

export { WaslLogo } from "./WaslLogo";
export type { WaslLogoProps, WaslLogoSize, WaslLogoVariant } from "./WaslLogo";

export function GeometricLattice({
  className = "",
  opacity = 0.045,
}: {
  className?: string;
  opacity?: number;
}) {
  const patternId = React.useId();
  return (
    <svg
      className={`pointer-events-none select-none ${className}`}
      style={{ opacity }}
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={patternId}
          width="88"
          height="88"
          patternUnits="userSpaceOnUse"
        >
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <polygon points="44,6 54,34 82,44 54,54 44,82 34,54 6,44 34,34" />
            <rect x="23" y="23" width="42" height="42" />
            <rect
              x="23"
              y="23"
              width="42"
              height="42"
              transform="rotate(45 44 44)"
            />
            <circle cx="44" cy="44" r="7" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

export function OrnamentalDivider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-3 text-[var(--brand-gold)] ${className}`}
      aria-hidden="true"
    >
      <span className="h-px w-12 sm:w-20 bg-gradient-to-l from-[var(--brand-gold)] to-transparent opacity-60" />
      <svg
        viewBox="0 0 36 24"
        className="h-5 w-8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18 2L22 12L18 22L14 12L18 2Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M8 12L18 8L28 12L18 16L8 12Z"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.7"
        />
        <circle cx="18" cy="12" r="2" fill="currentColor" />
      </svg>
      <span className="h-px w-12 sm:w-20 bg-gradient-to-r from-[var(--brand-gold)] to-transparent opacity-60" />
    </div>
  );
}

export function BismillahBanner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`text-center font-quran text-xl sm:text-2xl text-[var(--brand-gold)] tracking-normal select-none ${className}`}
      dir="rtl"
    >
      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
    </div>
  );
}
