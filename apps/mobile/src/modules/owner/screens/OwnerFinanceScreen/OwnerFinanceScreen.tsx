"use client";

import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { OwnerFinanceOverviewSection } from "../../sections/OwnerFinanceOverviewSection";
import { OwnerFinanceSettlementsSection } from "../../sections/OwnerFinanceSettlementsSection";
import { OwnerFinanceSplitSection } from "../../sections/OwnerFinanceSplitSection";
import { OwnerFinanceTransactionsSection } from "../../sections/OwnerFinanceTransactionsSection";
import { ownerFinanceScreenVariants } from "./OwnerFinanceScreen.styles";
import type { OwnerFinanceScreenProps } from "./OwnerFinanceScreen.types";

export function OwnerFinanceScreen({
  finance,
  className,
}: OwnerFinanceScreenProps) {
  const t = useTranslations("OwnerFinance");
  const router = useRouter();
  const styles = ownerFinanceScreenVariants();

  return (
    <AppLayout
      className={[styles.root(), className].filter(Boolean).join(" ")}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
          title={t("title")}
        />
      }
    >
      <div className={styles.content()}>
        <OwnerFinanceOverviewSection finance={finance} />
        <OwnerFinanceSplitSection rows={finance.splitRows} />
        <OwnerFinanceSettlementsSection settlements={finance.settlements} />
        <OwnerFinanceTransactionsSection transactions={finance.transactions} />
      </div>
    </AppLayout>
  );
}
