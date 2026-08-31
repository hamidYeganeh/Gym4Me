"use client";

import { useState } from "react";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import type {
  DisputeCategory,
  DisputeStatus,
} from "../../lib/athlete-dispute-data";
import { athleteDisputeScreenVariants } from "./AthleteDisputeScreen.styles";
import type { AthleteDisputeScreenProps } from "./AthleteDisputeScreen.types";

const CATEGORY_OPTIONS: DisputeCategory[] = [
  "payment",
  "service_quality",
  "no_show",
];

function categoryLabel(
  t: ReturnType<typeof useTranslations<"AthleteDisputes">>,
  category: DisputeCategory,
) {
  switch (category) {
    case "payment":
      return t("categoryPayment");
    case "service_quality":
      return t("categoryServiceQuality");
    case "no_show":
      return t("categoryNoShow");
    default:
      return category;
  }
}

function statusLabel(
  t: ReturnType<typeof useTranslations<"AthleteDisputes">>,
  status: DisputeStatus,
) {
  switch (status) {
    case "open":
      return t("statusOpen");
    case "under_review":
      return t("statusUnderReview");
    case "resolved":
      return t("statusResolved");
    case "closed":
      return t("statusClosed");
    default:
      return status;
  }
}

export function AthleteDisputeScreen({
  disputes,
  pending = false,
  message = null,
  error = null,
  onSubmit,
  className,
}: AthleteDisputeScreenProps) {
  const t = useTranslations("AthleteDisputes");
  const styles = athleteDisputeScreenVariants();
  const router = useRouter();
  const [category, setCategory] = useState<DisputeCategory>("payment");
  const [relatedEntityId, setRelatedEntityId] = useState("");
  const [body, setBody] = useState("");

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
          title={t("title")}
        />
      }
    >
      <div className={styles.content()}>
        <section className={styles.card()}>
          <Typography type="h3" weight="semibold">
            {t("formTitle")}
          </Typography>
          <div className={styles.form()}>
            <label className="flex flex-col gap-1.5">
              <span className={styles.meta()}>{t("categoryLabel")}</span>
              <select
                className={styles.nativeSelect()}
                onChange={(event) =>
                  setCategory(event.target.value as DisputeCategory)
                }
                value={category}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {categoryLabel(t, option)}
                  </option>
                ))}
              </select>
            </label>
            <TextField>
              <Label>{t("relatedEntityLabel")}</Label>
              <Input
                onChange={(event) => setRelatedEntityId(event.target.value)}
                placeholder={t("relatedEntityPlaceholder")}
                value={relatedEntityId}
              />
            </TextField>
            <TextField>
              <Label>{t("bodyLabel")}</Label>
              <Input
                onChange={(event) => setBody(event.target.value)}
                placeholder={t("bodyPlaceholder")}
                value={body}
              />
            </TextField>
            <Button size="lg"
              fullWidth
              isDisabled={pending || !body.trim()}
              onPress={() =>
                void onSubmit({
                  category,
                  relatedEntityId: relatedEntityId.trim() || undefined,
                  body: body.trim(),
                })
              }
              variant="primary"
            >
              {t("submit")}
            </Button>
          </div>
        </section>

        <section>
          <Typography type="h3" weight="semibold">
            {t("listTitle")}
          </Typography>
          {disputes.length === 0 ? (
            <Typography className={styles.meta()} type="body-sm">
              {t("emptyBody")}
            </Typography>
          ) : (
            <div className={styles.list()}>
              {disputes.map((dispute) => (
                <article className={styles.row()} key={dispute.id}>
                  <div className={styles.rowTop()}>
                    <Typography type="body" weight="semibold">
                      {categoryLabel(t, dispute.category)}
                    </Typography>
                    <Chip size="sm" variant="soft">
                      <Chip.Label>{statusLabel(t, dispute.status)}</Chip.Label>
                    </Chip>
                  </div>
                  <Typography type="body-sm">{dispute.body}</Typography>
                  {dispute.relatedEntityId ? (
                    <Typography className={styles.meta()} type="body-sm">
                      {t("relatedEntity")}: {dispute.relatedEntityId}
                    </Typography>
                  ) : null}
                  <Typography className={styles.meta()} type="body-sm">
                    {dispute.createdAtLabel}
                  </Typography>
                </article>
              ))}
            </div>
          )}
        </section>

        {message ? (
          <Typography className={styles.feedback()} type="body-sm">
            {message}
          </Typography>
        ) : null}
        {error ? (
          <Typography className={styles.error()} type="body-sm">
            {error}
          </Typography>
        ) : null}
      </div>
    </AppLayout>
  );
}
