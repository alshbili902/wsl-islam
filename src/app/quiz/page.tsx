import type { Metadata } from "next";
import { QuizClient } from "@/components/quiz/QuizClient";
import { getQuizQuestions } from "@/lib/data/repository";
import { buildPageMetadata } from "@/lib/seo/config";

export const metadata: Metadata = buildPageMetadata({
  title: "المسابقة الثقافية الإسلامية",
  description:
    "اختبر معلوماتك الإسلامية في القرآن والحديث والسيرة والفقه والعقيدة عبر مستويات متعددة مع شرح الإجابات ومراجعها الموثقة وحفظ النتيجة محليًا.",
  path: "/quiz",
});

export default async function QuizPage() {
  const { questions } = await getQuizQuestions();

  return <QuizClient questions={questions} />;
}
