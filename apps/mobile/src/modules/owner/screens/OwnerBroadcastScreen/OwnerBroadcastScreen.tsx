"use client";

import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "@/shared/lib/app-router";

import type { OwnerBroadcastAudience } from "../../lib/owner-broadcast-data";
import { ownerBroadcastScreenVariants } from "./OwnerBroadcastScreen.styles";
import type {
  OwnerBroadcastForm,
  OwnerBroadcastScreenProps,
} from "./OwnerBroadcastScreen.types";

const broadcastSchema = z.object({
  title: z.string().trim().min(2).max(100),
  body: z.string().trim().min(2).max(500),
  audience: z.enum(["all", "active_members", "at_risk"]),
});

const AUDIENCE_KEY: Record<
  OwnerBroadcastAudience,
  "audienceAll" | "audienceActive" | "audienceAtRisk"
> = {
  all: "audienceAll",
  active_members: "audienceActive",
  at_risk: "audienceAtRisk",
};

export function OwnerBroadcastScreen({
  broadcasts,
  pending = false,
  onSend,
  className,
}: OwnerBroadcastScreenProps) {
  const t = useTranslations("OwnerBroadcast");
  const router = useRouter();
  const styles = ownerBroadcastScreenVariants();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
  } = useForm<OwnerBroadcastForm>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: { title: "", body: "", audience: "all" },
  });
  const submit = handleSubmit(async (form) => {
    if (!onSend) return;
    await onSend(form);
    reset();
  });

  return (
    <AppLayout
      className={[styles.root(), className].filter(Boolean).join(" ")}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
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

        <form
          className={styles.formCard()}
          onSubmit={(event) => void submit(event)}
        >
          <Typography type="body" weight="semibold">
            {t("composeTitle")}
          </Typography>
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <TextField isInvalid={Boolean(errors.title)}>
                <Label>{t("titleLabel")}</Label>
                <Input {...field} />
                {errors.title ? (
                  <span className="text-danger" role="alert">
                    {t("titleError")}
                  </span>
                ) : null}
              </TextField>
            )}
          />
          <Controller
            control={control}
            name="body"
            render={({ field }) => (
              <TextField isInvalid={Boolean(errors.body)}>
                <Label>{t("bodyLabel")}</Label>
                <Input {...field} />
                {errors.body ? (
                  <span className="text-danger" role="alert">
                    {t("bodyError")}
                  </span>
                ) : null}
              </TextField>
            )}
          />
          <Controller
            control={control}
            name="audience"
            render={({ field }) => (
              <TextField>
                <Label>{t("audienceLabel")}</Label>
                <select className={styles.select()} {...field}>
                  <option value="all">{t("audienceAll")}</option>
                  <option value="active_members">{t("audienceActive")}</option>
                  <option value="at_risk">{t("audienceAtRisk")}</option>
                </select>
              </TextField>
            )}
          />
          <Button
            isDisabled={pending || isSubmitting || !onSend}
            isPending={pending || isSubmitting}
            size="lg"
            type="submit"
            variant="primary"
          >
            {t("send")}
          </Button>
        </form>

        <section className={styles.section()}>
          <Typography className={styles.sectionTitle()} type="h4" weight="semibold">
            {t("pastTitle")}
          </Typography>
          {broadcasts.length === 0 ? (
            <div className={styles.empty()}>{t("empty")}</div>
          ) : (
            <div className={styles.card()}>
              {broadcasts.map((entry, index) => (
                <div key={entry.id}>
                  <div className={styles.row()}>
                    <Typography className={styles.rowLabel()} type="body" weight="semibold">
                      {entry.title}
                    </Typography>
                    <Typography className={styles.rowHint()} type="body-sm">
                      {entry.body}
                    </Typography>
                    <Typography className={styles.rowHint()} type="body-sm">
                      {t(AUDIENCE_KEY[entry.audience])} · {t("recipients", { count: entry.recipientCount })} · {entry.sentAtLabel}
                    </Typography>
                  </div>
                  {index < broadcasts.length - 1 ? (
                    <div aria-hidden className={styles.divider()} />
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
