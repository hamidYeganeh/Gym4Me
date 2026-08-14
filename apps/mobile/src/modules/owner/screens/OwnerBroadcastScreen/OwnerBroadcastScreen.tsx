"use client";

import {
  Button,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { OwnerBroadcastAudience } from "../../lib/owner-broadcast-data";
import { ownerBroadcastScreenVariants } from "./OwnerBroadcastScreen.styles";
import type { OwnerBroadcastScreenProps } from "./OwnerBroadcastScreen.types";

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
  form,
  pending = false,
  onFormChange,
  onSend,
  className,
}: OwnerBroadcastScreenProps) {
  const t = useTranslations("OwnerBroadcast");
  const router = useRouter();
  const styles = ownerBroadcastScreenVariants();

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
        <section className={styles.intro()}>
          <Typography className={styles.introTitle()} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle()} type="body">
            {t("subtitle")}
          </Typography>
        </section>

        <section className={styles.formCard()}>
          <Typography type="body" weight="semibold">
            {t("composeTitle")}
          </Typography>
          <TextField>
            <Label>{t("titleLabel")}</Label>
            <Input
              onChange={(event) => onFormChange({ title: event.target.value })}
              value={form.title}
            />
          </TextField>
          <TextField>
            <Label>{t("bodyLabel")}</Label>
            <Input
              onChange={(event) => onFormChange({ body: event.target.value })}
              value={form.body}
            />
          </TextField>
          <TextField>
            <Label>{t("audienceLabel")}</Label>
            <select
              className={styles.select()}
              onChange={(event) =>
                onFormChange({
                  audience: event.target.value as OwnerBroadcastAudience,
                })
              }
              value={form.audience}
            >
              <option value="all">{t("audienceAll")}</option>
              <option value="active_members">{t("audienceActive")}</option>
              <option value="at_risk">{t("audienceAtRisk")}</option>
            </select>
          </TextField>
          <Button
            isDisabled={
              pending || !onSend || !form.title.trim() || !form.body.trim()
            }
            isPending={pending}
            onPress={onSend}
            size="lg"
            variant="primary"
          >
            {t("send")}
          </Button>
        </section>

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
