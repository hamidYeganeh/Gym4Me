"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import type {
  GamificationSummary,
  MyAchievement,
  PointTransactionItem,
} from "@repo/api";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AchievementsGridSection } from "../../sections/AchievementsGridSection";
import { AchievementsHistorySection } from "../../sections/AchievementsHistorySection";
import { AchievementsSummarySection } from "../../sections/AchievementsSummarySection";
import { accountGamification } from "@/shared/lib/api";
import { achievementsScreenVariants } from "./AchievementsScreen.styles";
import type { AchievementsScreenProps } from "./AchievementsScreen.types";

const HISTORY_PAGE_SIZE = 20;

export function AchievementsScreen({ className }: AchievementsScreenProps) {
  const t = useTranslations("Mobile.Achievements");
  const styles = achievementsScreenVariants();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [summary, setSummary] = useState<GamificationSummary | null>(null);
  const [achievements, setAchievements] = useState<MyAchievement[]>([]);
  const [transactions, setTransactions] = useState<PointTransactionItem[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const [nextSummary, nextAchievements, nextTransactions] =
        await Promise.all([
          accountGamification.summary(),
          accountGamification.achievements(),
          accountGamification.transactions({
            page: 1,
            page_size: HISTORY_PAGE_SIZE,
          }),
        ]);
      setSummary(nextSummary);
      setAchievements(nextAchievements);
      setTransactions(nextTransactions.result);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AppLayout
      className={styles.root({ className })}
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
        <section className={styles.intro()}>
          <Typography className={styles.introTitle()} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle()} type="body">
            {t("subtitle")}
          </Typography>
        </section>

        {loading ? (
          <Typography className={styles.state()} type="body-sm">
            {t("loading")}
          </Typography>
        ) : failed ? (
          <div className={styles.state()}>
            <Typography type="body-sm">{t("error")}</Typography>
            <Button
              className="mt-4"
              size="sm"
              variant="secondary"
              onPress={() => void load()}
            >
              {t("retry")}
            </Button>
          </div>
        ) : (
          <>
            <AchievementsSummarySection summary={summary} />
            <AchievementsGridSection achievements={achievements} />
            <AchievementsHistorySection transactions={transactions} />
          </>
        )}
      </div>
    </AppLayout>
  );
}
