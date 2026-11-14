import Link from "next/link";
import { BookOpen, Home } from "lucide-react";
import { WaslLogo } from "@/components/brand/WaslLogo";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[65vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="wasl-surface w-full rounded-3xl p-8 sm:p-12 space-y-5 shadow-sm">
        <div className="flex justify-center">
          <WaslLogo variant="icon" className="h-14 w-14" />
        </div>
        <span className="inline-flex rounded-full bg-[var(--wasl-primary)]/10 px-4 py-1.5 font-mono text-sm font-bold text-[var(--wasl-primary)]">
          404
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--wasl-text)]">
          الصفحة المطلوبة غير موجودة
        </h1>
        <p className="text-sm text-[var(--wasl-text-muted)] leading-relaxed">
          ربما تم نقل الرابط أو كتابته بصورة غير صحيحة. يمكنك العودة إلى الصفحة الرئيسية أو تصفح القرآن الكريم.
        </p>
        <p dir="ltr" className="text-xs text-[var(--wasl-text-muted)]">
          The page you are looking for could not be found.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--wasl-primary)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--wasl-primary-hover)] transition"
          >
            <Home className="h-4 w-4" />
            <span>الرئيسية</span>
          </Link>
          <Link
            href="/quran"
            className="inline-flex items-center gap-2 rounded-2xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--wasl-text)] hover:border-[var(--wasl-primary)] transition"
          >
            <BookOpen className="h-4 w-4" />
            <span>القرآن الكريم</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
