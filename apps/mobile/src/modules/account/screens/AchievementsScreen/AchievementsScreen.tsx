"use client";

import { Button, Typography } from "@heroui/react";
import type {
  GamificationSummary,
  MyAchievement,
  PointTransactionItem,
} from "@repo/api";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AchievementTag } from "@repo/ui/cards/AchievementTag";
import type {
  AchievementTagColor,
  AchievementTagVariant,
} from "@repo/ui/cards/AchievementTag";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { accountGamification } from "@/shared/lib/api";
import { achievementsScreenVariants } from "./AchievementsScreen.styles";
import type { AchievementsScreenProps } from "./AchievementsScreen.types";

const TAG_VARIANTS: AchievementTagVariant[] = [
  "polygon",
  "shield1",
  "star1",
  "circular",
  "octagon",
  "diamond",
];

const TAG_COLORS: AchievementTagColor[] = [
  "warning",
  "accent",
  "success",
  "purple",
  "blue",
  "orange",
];

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

  const unlocked = achievements.filter((item) => item.state === "unlocked");
  const locked = achievements.filter((item) => item.state === "locked");

  const renderAchievement = (item: MyAchievement, index: number) => {
    const isUnlocked = item.state === "unlocked";
    return (
      <div
        key={item.id}
        className={styles.gridItem({
          className: isUnlocked ? undefined : styles.gridItemLocked(),
        })}
      >
        <AchievementTag
          color={isUnlocked ? TAG_COLORS[index % TAG_COLORS.length] : "accent"}
          size="md"
          variant={TAG_VARIANTS[index % TAG_VARIANTS.length]}
        />
        <Typography className={styles.gridItemTitle()} type="body-sm">
          {item.title}
        </Typography>
        {isUnlocked ? (
          item.bonusPoints > 0 ? (
            <span className={styles.gridItemMeta()}>
              {t("bonusPoints", { points: item.bonusPoints })}
            </span>
          ) : null
        ) : item.progress ? (
          <span className={styles.gridItemMeta()}>
            {t("progress", {
              current: Math.min(item.progress.current, item.progress.threshold),
              threshold: item.progress.threshold,
            })}
          </span>
        ) : (
          <span className={styles.gridItemMeta()}>{t("locked")}</span>
        )}
      </div>
    );
  };

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
          <p className={styles.state()}>{t("loading")}</p>
        ) : failed ? (
          <div className={styles.state()}>
            <p>{t("error")}</p>
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
            <section className={styles.summaryCard()}>
              <div className={styles.summaryBalance()}>
                <span className={styles.summaryBalanceValue()}>
                  {(summary?.points.balance ?? 0).toLocaleString("fa-IR")}
                </span>
                <Typography
                  className={styles.summaryBalanceLabel()}
                  type="body-sm"
                >
                  {t("balance")}
                </Typography>
              </div>
              <div className={styles.summaryStats()}>
                <div className={styles.summaryStat()}>
                  <span className={styles.summaryStatValue()}>
                    {(summary?.points.lifetime ?? 0).toLocaleString("fa-IR")}
                  </span>
                  <span className={styles.summaryStatLabel()}>
                    {t("lifetime")}
                  </span>
                </div>
                <div className={styles.summaryStat()}>
                  <span className={styles.summaryStatValue()}>
                    {(summary?.achievements.unlocked ?? 0).toLocaleString(
                      "fa-IR",
                    )}
                    {" / "}
                    {(summary?.achievements.total ?? 0).toLocaleString(
                      "fa-IR",
                    )}
                  </span>
                  <span className={styles.summaryStatLabel()}>
                    {t("unlockedCount")}
                  </span>
                </div>
              </div>
            </section>

            {achievements.length === 0 ? (
              <p className={styles.state()}>{t("empty")}</p>
            ) : (
              <>
                {unlocked.length > 0 ? (
                  <section className={styles.section()}>
                    <Typography
                      className={styles.sectionTitle()}
                      type="body-sm"
                    >
                      {t("unlockedSection")}
                    </Typography>
                    <div className={styles.grid()}>
                      {unlocked.map(renderAchievement)}
                    </div>
                  </section>
                ) : null}

                {locked.length > 0 ? (
                  <section className={styles.section()}>
                    <Typography
                      className={styles.sectionTitle()}
                      type="body-sm"
                    >
                      {t("lockedSection")}
                    </Typography>
                    <div className={styles.grid()}>
                      {locked.map((item, index) =>
                        renderAchievement(item, unlocked.length + index),
                      )}
                    </div>
                  </section>
                ) : null}
              </>
            )}

            <section className={styles.section()}>
              <Typography className={styles.sectionTitle()} type="body-sm">
                {t("historySection")}
              </Typography>
              {transactions.length === 0 ? (
                <p className={styles.state()}>{t("historyEmpty")}</p>
              ) : (
                <div className={styles.historyCard()}>
                  {transactions.map((tx, index) => (
                    <div key={tx.id}>
                      <div className={styles.historyRow()}>
                        <span className={styles.historyBody()}>
                          <span className={styles.historyLabel()}>
                            {tx.note ?? t(`reasons.${tx.reason}`)}
                          </span>
                          <span className={styles.historyDate()} dir="ltr">
                            {new Date(tx.occurredAt).toLocaleDateString(
                              "fa-IR",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </span>
                        <span
                          className={
                            tx.amount >= 0
                              ? styles.historyAmountPositive()
                              : styles.historyAmountNegative()
                          }
                        >
                          {tx.amount > 0
                            ? `${tx.amount.toLocaleString("fa-IR")}+`
                            : tx.amount.toLocaleString("fa-IR")}
                        </span>
                      </div>
                      {index < transactions.length - 1 ? (
                        <div aria-hidden className={styles.divider()} />
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
}
