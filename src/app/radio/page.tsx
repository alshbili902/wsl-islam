import type { Metadata } from "next";
import { RadioDirectoryClient } from "@/components/radio/RadioDirectoryClient";
import { getRadioStations } from "@/lib/data/repository";
import { buildPageMetadata } from "@/lib/seo/config";

export const metadata: Metadata = buildPageMetadata({
  title: "الإذاعات الإسلامية المباشرة",
  description:
    "بث مباشر موثوق لإذاعة القرآن الكريم من السعودية، إذاعة السنة النبوية، قناة القرآن من مكة، الرسالة، اقرأ، ومحطات القراء.",
  path: "/radio",
});

export default async function RadioPage() {
  const { stations } = await getRadioStations();

  return <RadioDirectoryClient stations={stations} />;
}
