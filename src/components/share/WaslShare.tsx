"use client";

import React from "react";
import { Share2 } from "lucide-react";
import { useWasl } from "@/components/providers/WaslProvider";
import type { ShareCardPayload } from "@/types/islamic";

export interface WaslShareProps {
  payload: ShareCardPayload;
  variant?: "icon" | "pill" | "button";
  label?: string;
  className?: string;
  stopPropagation?: boolean;
}

export function WaslShare({
  payload,
  variant = "pill",
  label,
  className = "",
  stopPropagation = false,
}: WaslShareProps) {
  const { locale, openShareCard } = useWasl();
  const defaultLabel = locale === "ar" ? "مشاركة" : "Share";
  const text = label ?? defaultLabel;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
    openShareCard(payload);
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={text}
        title={text}
        className={`inline-flex items-center justify-center rounded-lg p-1.5 text-[var(--brand-gold)] hover:bg-[var(--brand-gold-soft)] transition-colors ${className}`.trim()}
      >
        <Share2 className="h-4 w-4" />
      </button>
    );
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={text}
        className={`inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand-gold-soft)] border border-[var(--brand-gold)]/40 px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--brand-gold)]/20 transition-colors ${className}`.trim()}
      >
        <Share2 className="h-3.5 w-3.5 text-[var(--brand-gold)]" />
        <span>{text}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={text}
      className={`inline-flex items-center gap-1.5 rounded-xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] px-3 py-1.5 text-xs font-medium text-[var(--wasl-text-muted)] hover:border-[var(--brand-gold)] hover:text-[var(--wasl-primary)] transition-colors ${className}`.trim()}
    >
      <Share2 className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{text}</span>
    </button>
  );
}

export { WaslShare as WaslShareButton };
