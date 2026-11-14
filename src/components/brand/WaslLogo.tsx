/* eslint-disable @next/next/no-img-element */
import React from "react";

export type WaslLogoVariant = "full" | "icon";
export type WaslLogoSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface WaslLogoProps {
  /** "full" = complete emblem + Arabic wordmark; "icon" = standalone geometric emblem */
  variant?: WaslLogoVariant;
  /** Responsive size preset (overridden if custom height/width classes are passed via className) */
  size?: WaslLogoSize;
  /** Force a specific surface contrast regardless of global theme (e.g., export cards) */
  forceTheme?: "light" | "dark";
  className?: string;
  alt?: string;
  priority?: boolean;
}

const BRAND_ASSETS = {
  full: {
    light: "/branding/wasl-logo-light.png",
    dark: "/branding/wasl-logo-dark.png",
    width: 766,
    height: 173,
    aspectRatio: "766 / 173",
  },
  icon: {
    light: "/branding/wasl-icon-light.png",
    dark: "/branding/wasl-icon-dark.png",
    width: 173,
    height: 173,
    aspectRatio: "1 / 1",
  },
} as const;

const SIZE_PRESETS: Record<WaslLogoVariant, Record<WaslLogoSize, string>> = {
  full: {
    xs: "h-7",
    sm: "h-8 sm:h-9",
    md: "h-9 sm:h-10 lg:h-11",
    lg: "h-12 sm:h-14",
    xl: "h-14 sm:h-16",
  },
  icon: {
    xs: "h-7 w-7",
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-14 w-14 sm:h-16 sm:w-16",
  },
};

export function WaslLogo({
  variant = "full",
  size,
  forceTheme,
  className = "",
  alt = "منصة وصل الإسلامية — Wasl Islamic",
  priority = false,
}: WaslLogoProps) {
  const asset = BRAND_ASSETS[variant];
  const hasExplicitHeight = /\bh-\d|\bh-\[/.test(className);
  const hasDisplayClass = /\b(hidden|block|flex|inline-flex|inline-block|grid)\b/.test(
    className
  );
  const displayClass = hasDisplayClass ? "" : "inline-flex";
  const sizeClass = size
    ? SIZE_PRESETS[variant][size]
    : hasExplicitHeight
      ? ""
      : SIZE_PRESETS[variant].md;

  const fetchPriority = priority ? "high" : "auto";

  if (forceTheme) {
    const src = forceTheme === "dark" ? asset.dark : asset.light;
    return (
      <span
        className={`relative ${displayClass} shrink-0 items-center justify-center select-none ${sizeClass} ${className}`.trim()}
        style={{ aspectRatio: asset.aspectRatio }}
      >
        <img
          src={src}
          alt={alt}
          width={asset.width}
          height={asset.height}
          loading="eager"
          decoding="async"
          fetchPriority={fetchPriority}
          className="block h-full w-full object-contain"
          draggable={false}
        />
      </span>
    );
  }

  return (
    <span
      className={`relative ${displayClass} shrink-0 items-center justify-center select-none ${sizeClass} ${className}`.trim()}
      style={{ aspectRatio: asset.aspectRatio }}
    >
      <img
        src={asset.light}
        alt={alt}
        width={asset.width}
        height={asset.height}
        loading="eager"
        decoding="async"
        fetchPriority={fetchPriority}
        className="wasl-logo-img wasl-logo-img--light block h-full w-auto max-w-full object-contain"
        draggable={false}
      />
      <img
        src={asset.dark}
        alt=""
        aria-hidden="true"
        width={asset.width}
        height={asset.height}
        loading="eager"
        decoding="async"
        fetchPriority={fetchPriority}
        className="wasl-logo-img wasl-logo-img--dark absolute inset-0 h-full w-full object-contain"
        draggable={false}
      />
    </span>
  );
}
