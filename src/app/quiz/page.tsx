import type { Metadata } from "next";
import { QuizClient } from "@/components/quiz/QuizClient";
import { getQuizQuestions } from "@/lib/data/repository";

export const metadata: Metadata = {
  title: "المسابقة الثقافية الإسلامية",
  description:
    "اختبر معلوماتك الإسلامية في القرآن والحديث والسيرة والفقه والعقيدة عبر مستويات متعددة مع شرح الإجابات ومراجعها الموثقة وحفظ النتيجة محليًا.",
};

export default async function QuizPage() {
  const { questions } = await getQuizQuestions();

  return <QuizClient questions={questions} />;
}
