"use client";

import { Button } from "@heroui/react/button";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
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
        <Header
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
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
