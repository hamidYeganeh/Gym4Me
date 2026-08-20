"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import type {
  OwnerConsentPolicyKind,
  OwnerConsentStatus,
} from "../../lib/owner-consents-data";
import { ownerConsentsScreenVariants } from "./OwnerConsentsScreen.styles";
import type { OwnerConsentsScreenProps } from "./OwnerConsentsScreen.types";

const KIND_KEY: Record<
  OwnerConsentPolicyKind,
  "kindRules" | "kindHealth" | "kindPrivacy"
> = {
  rules: "kindRules",
  health_declaration: "kindHealth",
  privacy: "kindPrivacy",
};

const STATUS_COLOR: Record<OwnerConsentStatus, "success" | "default"> = {
  published: "success",
  draft: "default",
};

const STATUS_KEY = {
  published: "statusPublished",
  draft: "statusDraft",
} as const;

export function OwnerConsentsScreen({
  policies,
  className,
}: OwnerConsentsScreenProps) {
  const t = useTranslations("OwnerConsents");
  const router = useRouter();
  const styles = ownerConsentsScreenVariants();

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

        <section className={styles.section()}>
          {policies.length === 0 ? (
            <div className={styles.empty()}>{t("empty")}</div>
          ) : (
            <div className={styles.card()}>
              {policies.map((policy, index) => (
                <div key={policy.id}>
                  <div className={styles.row()}>
                    <span className={styles.rowBody()}>
                      <Typography className={styles.rowLabel()} type="body" weight="semibold">
                        {t(KIND_KEY[policy.kind])}
                      </Typography>
                      <Typography className={styles.rowHint()} type="body-sm">
                        {t("version")}: {policy.version}
                      </Typography>
                      <Typography className={styles.rowHint()} type="body-sm">
                        {t("acceptances", { count: policy.acceptanceCount })} · {policy.updatedAtLabel}
                      </Typography>
                    </span>
                    <Chip color={STATUS_COLOR[policy.status]} size="sm" variant="soft">
                      <Chip.Label>{t(STATUS_KEY[policy.status])}</Chip.Label>
                    </Chip>
                  </div>
                  {index < policies.length - 1 ? (
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
