"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { useWasl } from "@/components/providers/WaslProvider";

export interface CrumbItem {
  labelAr: string;
  labelEn: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: CrumbItem[] }) {
  const { locale, isRtl } = useWasl();
  const Separator = isRtl ? ChevronLeft : ChevronRight;

  return (
    <nav
      aria-label={locale === "ar" ? "مسار التنقل" : "Breadcrumb"}
      className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-[var(--text-muted)] mb-5"
    >
      <Link
        href="/"
        className="inline-flex items-center gap-1 hover:text-[var(--brand-emerald)] transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span>{locale === "ar" ? "الرئيسية" : "Home"}</span>
      </Link>
      {items.map((item, idx) => {
        const label = locale === "ar" ? item.labelAr : item.labelEn;
        const isLast = idx === items.length - 1;
        return (
          <span key={idx} className="inline-flex items-center gap-1.5">
            <Separator className="h-3.5 w-3.5 opacity-60" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-[var(--brand-emerald)] transition-colors"
              >
                {label}
              </Link>
            ) : (
              <span className="font-medium text-[var(--text-primary)]">
                {label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
