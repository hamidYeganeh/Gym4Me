import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { KycStatusScreen } from "@/modules/account/screens/KycStatusScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.Kyc");
  return { title: t("title") };
}

export default function Page() {
  return <KycStatusScreen roleSegment="owner" />;
}
