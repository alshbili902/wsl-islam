"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpenCheck,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";
import { useWasl } from "@/components/providers/WaslProvider";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageShell } from "@/components/ui/MotionPrimitives";
import { GeometricLattice } from "@/components/brand/IslamicVisuals";
import type {
  QuizCategory,
  QuizDifficulty,
  QuizQuestion,
} from "@/types/islamic";

const QUIZ_STATS_KEY = "wasl-quiz-local-stats-v1";

interface QuizStats {
  roundsPlayed: number;
  bestPct: number;
  totalCorrect: number;
  totalAnswered: number;
}

const DIFFICULTIES: {
  id: "all" | QuizDifficulty;
  nameAr: string;
  nameEn: string;
}[] = [
  { id: "all", nameAr: "جميع المستويات", nameEn: "All Levels" },
  { id: "beginner", nameAr: "مبتدئ", nameEn: "Beginner" },
  { id: "intermediate", nameAr: "متوسط", nameEn: "Intermediate" },
  { id: "advanced", nameAr: "متقدم", nameEn: "Advanced" },
];

const TOPIC_LABELS: Record<
  QuizCategory | "all",
  { ar: string; en: string }
> = {
  all: { ar: "جميع المجالات", en: "All Topics" },
  quran: { ar: "القرآن الكريم", en: "Quran" },
  hadith: { ar: "الحديث الشريف", en: "Hadith" },
  seerah: { ar: "السيرة النبوية", en: "Seerah ﷺ" },
  fiqh: { ar: "الفقه والعبادات", en: "Fiqh & Worship" },
  prophets: { ar: "قصص الأنبياء", en: "Prophets" },
  aqeedah: { ar: "العقيدة الإسلامية", en: "Aqeedah" },
};

function shuffleArray<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function QuizClient({ questions }: { questions: QuizQuestion[] }) {
  const { locale, isRtl } = useWasl();
  const NextArrow = isRtl ? ArrowLeft : ArrowRight;

  const [difficulty, setDifficulty] = useState<"all" | QuizDifficulty>("all");
  const [topic, setTopic] = useState<"all" | QuizCategory>("all");
  const [phase, setPhase] = useState<"setup" | "playing" | "results">("setup");

  const [roundQuestions, setRoundQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answersLog, setAnswersLog] = useState<
    { question: QuizQuestion; chosen: number; isCorrect: boolean }[]
  >([]);

  const [stats, setStats] = useState<QuizStats>({
    roundsPlayed: 0,
    bestPct: 0,
    totalCorrect: 0,
    totalAnswered: 0,
  });

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(QUIZ_STATS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<QuizStats>;
          setStats({
            roundsPlayed: parsed.roundsPlayed ?? 0,
            bestPct: parsed.bestPct ?? 0,
            totalCorrect: parsed.totalCorrect ?? 0,
            totalAnswered: parsed.totalAnswered ?? 0,
          });
        }
      } catch {
        // Ignore storage errors
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const eligibleQuestions = useMemo(
    () =>
      questions.filter((q) => {
        if (difficulty !== "all" && q.difficulty !== difficulty) return false;
        if (topic !== "all" && q.category !== topic) return false;
        return true;
      }),
    [difficulty, topic, questions]
  );

  const startRound = () => {
    const pool = eligibleQuestions.length > 0 ? eligibleQuestions : questions;
    const picked = shuffleArray(pool).slice(0, Math.min(10, pool.length));
    setRoundQuestions(picked);
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswersLog([]);
    setPhase("playing");
  };

  const currentQuestion = roundQuestions[currentIndex];

  const handleSelectAnswer = (idx: number) => {
    if (selectedOption !== null || !currentQuestion) return;
    setSelectedOption(idx);
    const isCorrect = idx === currentQuestion.correctIndex;
    setAnswersLog((prev) => [
      ...prev,
      { question: currentQuestion, chosen: idx, isCorrect },
    ]);
  };

  const handleNext = () => {
    if (currentIndex + 1 < roundQuestions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      return;
    }

    // Complete round and save local stats
    const correctCount = answersLog.filter((a) => a.isCorrect).length;
    const pct =
      roundQuestions.length > 0
        ? Math.round((correctCount / roundQuestions.length) * 100)
        : 0;

    setStats((prev) => {
      const next: QuizStats = {
        roundsPlayed: prev.roundsPlayed + 1,
        bestPct: Math.max(prev.bestPct, pct),
        totalCorrect: prev.totalCorrect + correctCount,
        totalAnswered: prev.totalAnswered + roundQuestions.length,
      };
      try {
        localStorage.setItem(QUIZ_STATS_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
    setPhase("results");
  };

  const roundCorrectCount = useMemo(
    () => answersLog.filter((a) => a.isCorrect).length,
    [answersLog]
  );
  const roundPct =
    roundQuestions.length > 0
      ? Math.round((roundCorrectCount / roundQuestions.length) * 100)
      : 0;

  return (
    <PageShell className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { labelAr: "المسابقة الإسلامية", labelEn: "Islamic Quiz" },
        ]}
      />

      {phase === "setup" && (
        <section className="wasl-surface relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm space-y-8">
          <GeometricLattice className="opacity-[0.045]" />
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--wasl-border)] bg-[var(--wasl-bg)]/85 px-3.5 py-1 text-xs font-medium text-[var(--wasl-primary)]">
                <HelpCircle className="h-3.5 w-3.5 text-[var(--wasl-accent)]" />
                <span>
                  {locale === "ar"
                    ? "أسئلة مراجعة علميًا مع الشرح والتوثيق"
                    : "Verified Questions with Explanations & References"}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-[var(--wasl-text)] sm:text-4xl">
                {locale === "ar" ? "المسابقة الثقافية الإسلامية" : "Islamic Knowledge Quiz"}
              </h1>
              <p className="text-sm leading-relaxed text-[var(--wasl-text-muted)]">
                {locale === "ar"
                  ? "اختبر معرفتك في القرآن الكريم والسنة النبوية والسيرة والعقيدة والفقه، مع بيان الدليل والمرجع لكل إجابة وحفظ تقدمك محليًا."
                  : "Test your knowledge across Quran, Hadith, Seerah ﷺ, Aqeedah, and Fiqh with immediate verified explanations and local score tracking."}
              </p>
            </div>

            {/* Local Progress Card */}
            <div className="grid grid-cols-3 gap-2.5 sm:min-w-[290px]">
              {[
                {
                  labelAr: "الجولات",
                  labelEn: "Rounds",
                  val: String(stats.roundsPlayed),
                },
                {
                  labelAr: "أفضل نتيجة",
                  labelEn: "Best Score",
                  val: `${stats.bestPct}%`,
                },
                {
                  labelAr: "صحيحة",
                  labelEn: "Correct",
                  val: String(stats.totalCorrect),
                },
              ].map((stat) => (
                <div
                  key={stat.labelEn}
                  className="rounded-2xl border border-[var(--wasl-border)] bg-[var(--wasl-bg)]/80 p-3.5 text-center"
                >
                  <p dir="ltr" className="font-mono text-xl font-bold text-[var(--wasl-primary)]">
                    {stat.val}
                  </p>
                  <p className="mt-1 text-[11px] text-[var(--wasl-text-muted)]">
                    {locale === "ar" ? stat.labelAr : stat.labelEn}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="relative z-10 grid gap-6 md:grid-cols-2 border-t border-[var(--wasl-border)] pt-6">
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-[var(--wasl-text-muted)]">
                {locale === "ar" ? "اختر مستوى الصعوبة" : "Difficulty Level"}
              </p>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.id)}
                    className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                      difficulty === d.id
                        ? "border-[var(--wasl-primary)] bg-[var(--wasl-primary)] text-white"
                        : "border-[var(--wasl-border)] bg-[var(--wasl-bg)] text-[var(--wasl-text)] hover:border-[var(--wasl-primary)]"
                    }`}
                  >
                    {locale === "ar" ? d.nameAr : d.nameEn}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-bold text-[var(--wasl-text-muted)]">
                {locale === "ar" ? "اختر المجال العلمي" : "Topic Focus"}
              </p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(TOPIC_LABELS) as ("all" | QuizCategory)[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTopic(key)}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      topic === key
                        ? "border-[var(--wasl-primary)] bg-[var(--wasl-primary)] text-white"
                        : "border-[var(--wasl-border)] bg-[var(--wasl-bg)] text-[var(--wasl-text)] hover:border-[var(--wasl-primary)]"
                    }`}
                  >
                    {locale === "ar" ? TOPIC_LABELS[key].ar : TOPIC_LABELS[key].en}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--wasl-border)] pt-6">
            <p className="text-xs text-[var(--wasl-text-muted)]">
              {eligibleQuestions.length > 0
                ? locale === "ar"
                  ? `الأسئلة المتاحة لهذا الاختيار: ${eligibleQuestions.length} سؤالاً (جولة عشوائية من حتى 10 أسئلة)`
                  : `Available matching questions: ${eligibleQuestions.length} (random round up to 10)`
                : locale === "ar"
                  ? "لا توجد أسئلة مطابقة للفلتر المحدد تمامًا — سيتم السحب من بنك الأسئلة العام."
                  : "No exact filter match — round will draw from the complete question bank."}
            </p>

            <button
              type="button"
              onClick={startRound}
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--wasl-primary)] px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[var(--wasl-primary-hover)] transition"
            >
              <Sparkles className="h-4 w-4 text-[#F4DDA0]" />
              <span>{locale === "ar" ? "ابدأ المسابقة الآن" : "Start Quiz Round"}</span>
              <NextArrow className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {phase === "playing" && currentQuestion && (
        <section className="wasl-surface rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Progress header */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[var(--wasl-primary)]/10 px-3 py-1 font-bold text-[var(--wasl-primary)]">
                  {locale === "ar"
                    ? `السؤال ${currentIndex + 1} من ${roundQuestions.length}`
                    : `Question ${currentIndex + 1} of ${roundQuestions.length}`}
                </span>
                <span className="rounded-full border border-[var(--wasl-border)] px-3 py-1 font-medium text-[var(--wasl-text-muted)]">
                  {locale === "ar"
                    ? TOPIC_LABELS[currentQuestion.category].ar
                    : TOPIC_LABELS[currentQuestion.category].en}
                </span>
              </div>

              <span className="font-mono text-xs font-bold text-[var(--wasl-primary)]">
                {locale === "ar"
                  ? `النقاط: ${roundCorrectCount}`
                  : `Score: ${roundCorrectCount}`}
              </span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--wasl-border)]">
              <div
                className="h-full rounded-full bg-[var(--wasl-primary)] transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / roundQuestions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold leading-relaxed text-[var(--wasl-text)]">
            {locale === "ar" ? currentQuestion.questionAr : currentQuestion.questionEn}
          </h2>

          {/* Options */}
          <div className="grid gap-3">
            {(locale === "ar"
              ? currentQuestion.optionsAr
              : currentQuestion.optionsEn
            ).map((opt, idx) => {
              const answered = selectedOption !== null;
              const isCorrectChoice = idx === currentQuestion.correctIndex;
              const isUserChoice = idx === selectedOption;

              let btnStyle =
                "border-[var(--wasl-border)] bg-[var(--wasl-bg)] hover:border-[var(--wasl-primary)] text-[var(--wasl-text)]";
              if (answered) {
                if (isCorrectChoice) {
                  btnStyle =
                    "border-emerald-500 bg-emerald-500/15 text-[var(--wasl-text)] ring-1 ring-emerald-500/40";
                } else if (isUserChoice) {
                  btnStyle =
                    "border-red-500 bg-red-500/15 text-[var(--wasl-text)]";
                } else {
                  btnStyle =
                    "border-[var(--wasl-border)] bg-[var(--wasl-bg)]/50 text-[var(--wasl-text-muted)] opacity-75";
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={answered}
                  onClick={() => handleSelectAnswer(idx)}
                  className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-start text-sm sm:text-base font-medium transition ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-current/25 text-xs font-mono font-bold">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {answered && isCorrectChoice && (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  )}
                  {answered && isUserChoice && !isCorrectChoice && (
                    <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation & Reference upon answering */}
          {selectedOption !== null && (
            <div className="rounded-2xl border border-[var(--wasl-accent)]/40 bg-[var(--wasl-primary)]/[0.05] p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--wasl-primary)]">
                <BookOpenCheck className="h-4 w-4 text-[var(--wasl-accent)]" />
                <span>
                  {selectedOption === currentQuestion.correctIndex
                    ? locale === "ar"
                      ? "إجابة صحيحة — التوضيح والمرجع:"
                      : "Correct Answer — Explanation & Reference:"
                    : locale === "ar"
                      ? "توضيح الإجابة الصحيحة:"
                      : "Correct Answer Explanation:"}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[var(--wasl-text)]">
                {locale === "ar"
                  ? currentQuestion.explanationAr
                  : currentQuestion.explanationEn}
              </p>
              <p className="text-xs font-semibold text-[var(--wasl-primary)]">
                {locale === "ar"
                  ? currentQuestion.referenceAr
                  : currentQuestion.referenceEn}
              </p>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--wasl-primary)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--wasl-primary-hover)] transition"
                >
                  <span>
                    {currentIndex + 1 < roundQuestions.length
                      ? locale === "ar"
                        ? "السؤال التالي"
                        : "Next Question"
                      : locale === "ar"
                        ? "عرض النتيجة النهائية"
                        : "View Final Results"}
                  </span>
                  <NextArrow className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {phase === "results" && (
        <section className="space-y-6">
          <div className="rounded-3xl border border-[var(--wasl-accent)]/40 bg-gradient-to-br from-[var(--wasl-primary)] to-[var(--wasl-primary-hover)] p-8 text-center text-white shadow-lg space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <Trophy className="h-8 w-8 text-[#F4DDA0]" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold">
              {locale === "ar" ? "نتيجة المسابقة" : "Quiz Round Complete"}
            </h2>

            <p dir="ltr" className="font-mono text-5xl font-bold text-[#F4DDA0]">
              {roundCorrectCount} / {roundQuestions.length} ({roundPct}%)
            </p>

            <p className="text-sm text-white/85 max-w-lg mx-auto">
              {roundPct >= 80
                ? locale === "ar"
                  ? "ما شاء الله! معرفة راسخة ومباركة بالعلم الشرعي والسيرة."
                  : "Excellent work! Strong command of authenticated Islamic knowledge."
                : roundPct >= 50
                  ? locale === "ar"
                    ? "نتيجة طيبة! يمكنك مراجعة التفاسير والأحاديث في المنصة لتعزيز معرفتك."
                    : "Good effort! Explore the knowledge & hadith sections to strengthen more topics."
                  : locale === "ar"
                    ? "بداية موفقة في طلب العلم؛ راجع الشروحات أدناه وجرّب جولة جديدة."
                    : "A great start in seeking knowledge — review the explanations below and try another round."}
            </p>

            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={startRound}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#F4DDA0] px-5 py-2.5 text-sm font-bold text-[#143C2E] hover:opacity-95 transition"
              >
                <RotateCcw className="h-4 w-4" />
                <span>{locale === "ar" ? "جولة جديدة" : "Play Again"}</span>
              </button>
              <button
                type="button"
                onClick={() => setPhase("setup")}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition"
              >
                <Award className="h-4 w-4" />
                <span>
                  {locale === "ar" ? "تغيير المستوى أو المجال" : "Change Settings"}
                </span>
              </button>
            </div>
          </div>

          {/* Answers Review List */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-[var(--wasl-text)]">
              {locale === "ar" ? "مراجعة الأسئلة والمراجع" : "Questions & References Review"}
            </h3>
            {answersLog.map((entry, idx) => (
              <div
                key={entry.question.id}
                className="wasl-surface rounded-2xl p-5 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-bold text-[var(--wasl-text)]">
                    {idx + 1}.{" "}
                    {locale === "ar"
                      ? entry.question.questionAr
                      : entry.question.questionEn}
                  </p>
                  {entry.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                  )}
                </div>
                <p className="text-xs leading-relaxed text-[var(--wasl-text-muted)]">
                  {locale === "ar"
                    ? entry.question.explanationAr
                    : entry.question.explanationEn}
                </p>
                <p className="text-[11px] font-semibold text-[var(--wasl-primary)]">
                  {locale === "ar"
                    ? entry.question.referenceAr
                    : entry.question.referenceEn}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
}
