"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { UserPlus } from "@repo/icons/UserPlus";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { OwnerCoachAffiliationStatus } from "../../lib/owner-coaches-data";
import { ownerCoachesScreenVariants } from "./OwnerCoachesScreen.styles";
import type { OwnerCoachesScreenProps } from "./OwnerCoachesScreen.types";

const STATUS_COLOR: Record<
  OwnerCoachAffiliationStatus,
  "success" | "warning" | "danger"
> = {
  invited: "warning",
  active: "success",
  suspended: "danger",
};

const STATUS_KEY = {
  invited: "statusInvited",
  active: "statusActive",
  suspended: "statusSuspended",
} as const;

export function OwnerCoachesScreen({
  coaches,
  form,
  pending = false,
  onFormChange,
  onInvite,
  className,
}: OwnerCoachesScreenProps) {
  const t = useTranslations("OwnerCoaches");
  const router = useRouter();
  const styles = ownerCoachesScreenVariants();

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

        <section className={styles.formCard()}>
          <Typography type="body" weight="semibold">
            {t("inviteTitle")}
          </Typography>
          <TextField>
            <Label>{t("nameLabel")}</Label>
            <Input
              onChange={(event) => onFormChange({ name: event.target.value })}
              value={form.name}
            />
          </TextField>
          <TextField>
            <Label>{t("branchLabel")}</Label>
            <Input
              onChange={(event) =>
                onFormChange({ branchLabel: event.target.value })
              }
              value={form.branchLabel}
            />
          </TextField>
          <TextField>
            <Label>{t("commissionLabel")}</Label>
            <Input
              inputMode="numeric"
              onChange={(event) =>
                onFormChange({ commissionPercent: event.target.value })
              }
              value={form.commissionPercent}
            />
          </TextField>
          <Button
            isDisabled={
              pending ||
              !onInvite ||
              !form.name.trim() ||
              !form.branchLabel.trim() ||
              !form.commissionPercent.trim()
            }
            isPending={pending}
            onPress={onInvite}
            size="lg"
            variant="primary"
          >
            <UserPlus aria-hidden size={20} />
            {t("inviteSubmit")}
          </Button>
        </section>

        <section className={styles.section()}>
          <Typography className={styles.sectionTitle()} type="h4" weight="semibold">
            {t("listTitle")}
          </Typography>
          {coaches.length === 0 ? (
            <div className={styles.empty()}>{t("empty")}</div>
          ) : (
            <div className={styles.card()}>
              {coaches.map((coach, index) => (
                <div key={coach.id}>
                  <div className={styles.row()}>
                    <span className={styles.rowBody()}>
                      <Typography className={styles.rowLabel()} type="body" weight="semibold">
                        {coach.name}
                      </Typography>
                      <Typography className={styles.rowHint()} type="body-sm">
                        {coach.branchLabel} · {t("commission", { value: coach.commissionPercent })}
                      </Typography>
                      <span className={styles.specialties()}>
                        {coach.specialties.map((specialty) => (
                          <Chip key={specialty} size="sm">
                            <Chip.Label>{specialty}</Chip.Label>
                          </Chip>
                        ))}
                      </span>
                    </span>
                    <Chip color={STATUS_COLOR[coach.status]} size="sm" variant="soft">
                      <Chip.Label>{t(STATUS_KEY[coach.status])}</Chip.Label>
                    </Chip>
                  </div>
                  {index < coaches.length - 1 ? (
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
