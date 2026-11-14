import type { Metadata } from "next";
import { RadioDirectoryClient } from "@/components/radio/RadioDirectoryClient";
import { getRadioStations } from "@/lib/data/repository";

export const metadata: Metadata = {
  title: "الإذاعات الإسلامية المباشرة",
  description:
    "بث مباشر موثوق لإذاعة القرآن الكريم من السعودية، إذاعة السنة النبوية، قناة القرآن من مكة، الرسالة، اقرأ، ومحطات القراء.",
};

export default async function RadioPage() {
  const { stations } = await getRadioStations();

  return <RadioDirectoryClient stations={stations} />;
}
