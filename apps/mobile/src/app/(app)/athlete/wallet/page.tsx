import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  WALLET_BALANCE_LABEL,
  WALLET_BALANCE_POINTS,
  WALLET_INCOME_SERIES,
  WALLET_SPEND_SERIES,
  WALLET_TRANSACTION_GROUPS,
} from "@/modules/athlete/lib/wallet-data";
import { AthleteWalletScreen } from "@/modules/athlete/screens/AthleteWalletScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteWallet");
  return { title: t("pageTitle") };
}

export default function AthleteWalletPage() {
  return (
    <AthleteWalletScreen
      balanceLabel={WALLET_BALANCE_LABEL}
      balancePoints={WALLET_BALANCE_POINTS}
      incomeSeries={WALLET_INCOME_SERIES}
      spendSeries={WALLET_SPEND_SERIES}
      transactionGroups={WALLET_TRANSACTION_GROUPS}
    />
  );
}
