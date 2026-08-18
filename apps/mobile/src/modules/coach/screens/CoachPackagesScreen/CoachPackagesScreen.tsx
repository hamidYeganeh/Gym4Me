"use client";

import { useState } from "react";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import type { CoachPackageStatus } from "../../lib/coach-packages-data";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { coachPackagesScreenStyles as styles } from "./CoachPackagesScreen.styles";
import type { CoachPackagesScreenProps } from "./CoachPackagesScreen.types";

const STATUS_CHIP_COLOR: Record<CoachPackageStatus, "success" | "default"> = {
  active: "success",
  archived: "default",
};

const STATUS_LABEL_KEY: Record<CoachPackageStatus, string> = {
  active: "statusActive",
  archived: "statusArchived",
};

export function CoachPackagesScreen({
  packages,
  soldPackages,
  creating = false,
  onCreatePackage,
}: CoachPackagesScreenProps) {
  const t = useTranslations("CoachPackages");
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [sessionCount, setSessionCount] = useState("");
  const [priceLabel, setPriceLabel] = useState("");

  return (
    <AppLayout
      className={styles.root}
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
          title={t("title")}
        />
      }
    >
      <div className={styles.content}>
        <section className={styles.intro}>
          <Typography className={styles.introTitle} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle} type="body">
            {t("subtitle")}
          </Typography>
        </section>

        {onCreatePackage ? (
          <>
            {!showForm ? (
              <Button onPress={() => setShowForm(true)} variant="primary">
                {t("createAction")}
              </Button>
            ) : (
              <form
                className={styles.form}
                onSubmit={(event) => {
                  event.preventDefault();
                  const count = Number(sessionCount);
                  if (!title.trim() || !count || !priceLabel.trim()) return;
                  void Promise.resolve(
                    onCreatePackage({
                      title: title.trim(),
                      sessionCount: count,
                      priceLabel: priceLabel.trim(),
                    }),
                  ).then(() => {
                    setTitle("");
                    setSessionCount("");
                    setPriceLabel("");
                    setShowForm(false);
                  });
                }}
              >
                <TextField>
                  <Label>{t("titleLabel")}</Label>
                  <Input
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder={t("titlePlaceholder")}
                    value={title}
                  />
                </TextField>
                <TextField>
                  <Label>{t("sessionCountLabel")}</Label>
                  <Input
                    inputMode="numeric"
                    onChange={(event) => setSessionCount(event.target.value)}
                    placeholder={t("sessionCountPlaceholder")}
                    value={sessionCount}
                  />
                </TextField>
                <TextField>
                  <Label>{t("priceLabel")}</Label>
                  <Input
                    onChange={(event) => setPriceLabel(event.target.value)}
                    placeholder={t("pricePlaceholder")}
                    value={priceLabel}
                  />
                </TextField>
                <div className={styles.formActions}>
                  <Button
                    isDisabled={creating}
                    onPress={() => setShowForm(false)}
                    variant="ghost"
                  >
                    {t("createCancel")}
                  </Button>
                  <Button
                    isDisabled={
                      creating ||
                      !title.trim() ||
                      !sessionCount.trim() ||
                      !priceLabel.trim()
                    }
                    type="submit"
                    variant="primary"
                  >
                    {creating ? t("creating") : t("createSubmit")}
                  </Button>
                </div>
              </form>
            )}
          </>
        ) : null}

        <Typography className={styles.sectionTitle} type="h4" weight="semibold">
          {t("packagesTitle")}
        </Typography>
        <div className={styles.list}>
          {packages.map((pkg) => (
            <article className={styles.card} key={pkg.id}>
              <div className={styles.cardTop}>
                <Typography type="body" weight="semibold">
                  {pkg.title}
                </Typography>
                <Chip
                  color={STATUS_CHIP_COLOR[pkg.status]}
                  size="sm"
                  variant="soft"
                >
                  <Chip.Label>{t(STATUS_LABEL_KEY[pkg.status])}</Chip.Label>
                </Chip>
              </div>
              <Typography className={styles.cardMeta} type="body-sm">
                {t("sessionCountMeta", { count: pkg.sessionCount })}
              </Typography>
              <Typography className={styles.cardMeta} type="body-sm">
                {pkg.priceLabel}
              </Typography>
              <Typography className={styles.cardMeta} type="body-sm">
                {t("soldMeta", { count: pkg.soldCount })}
              </Typography>
            </article>
          ))}
        </div>

        <Typography className={styles.sectionTitle} type="h4" weight="semibold">
          {t("soldTitle")}
        </Typography>
        <div className={styles.list}>
          {soldPackages.map((sold) => (
            <div className={styles.soldRow} key={sold.id}>
              <div>
                <Typography type="body-sm" weight="semibold">
                  {sold.clientName}
                </Typography>
                <Typography className={styles.cardMeta} type="body-sm">
                  {sold.packageTitle}
                </Typography>
              </div>
              <div className="text-end">
                <Typography type="body-sm" weight="medium">
                  {t("remainingMeta", { count: sold.sessionsRemaining })}
                </Typography>
                <Typography className={styles.cardMeta} type="body-sm">
                  {sold.purchasedLabel}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
