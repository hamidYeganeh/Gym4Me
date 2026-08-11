import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteWalletGate } from "@/modules/athlete/lib/AthleteWalletGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteWallet");
  return { title: t("pageTitle") };
}

export default function AthleteWalletPage() {
  return <AthleteWalletGate />;
}
