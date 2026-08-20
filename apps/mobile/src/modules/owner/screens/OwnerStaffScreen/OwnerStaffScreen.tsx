"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { UserPlus } from "@repo/icons/UserPlus";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "@/shared/lib/app-router";

import { useState } from "react";
import type { OwnerStaffState } from "../../lib/owner-staff-data";
import { ownerStaffScreenStyles as styles } from "./OwnerStaffScreen.styles";
import type { OwnerStaffScreenProps } from "./OwnerStaffScreen.types";

const VISIBLE_GRANTS = 4;

const STATE_CHIP_COLOR: Record<
  OwnerStaffState,
  "success" | "warning" | "danger"
> = {
  active: "success",
  invited: "warning",
  suspended: "danger",
};

const STATE_LABEL_KEY = {
  active: "stateActive",
  invited: "stateInvited",
  suspended: "stateSuspended",
} as const;

export function OwnerStaffScreen({
  staff,
  grantLabels,
  className,
}: OwnerStaffScreenProps) {
  const t = useTranslations("OwnerStaff");
  const router = useRouter();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  const toggleExpanded = (staffId: string) => {
    setExpandedIds((previous) => {
      const next = new Set(previous);
      if (next.has(staffId)) {
        next.delete(staffId);
      } else {
        next.add(staffId);
      }
      return next;
    });
  };

  return (
    <AppLayout
      className={[styles.root, className].filter(Boolean).join(" ")}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
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

        <div className={styles.inviteRow}>
          <Button size="lg" variant="primary">
            <UserPlus aria-hidden size={20} />
            {t("invite")}
          </Button>
        </div>

        {staff.length > 0 ? (
          <div aria-label={t("listLabel")} className={styles.list} role="list">
            {staff.map((member) => {
              const isExpanded = expandedIds.has(member.id);
              const visibleGrants = isExpanded
                ? member.grants
                : member.grants.slice(0, VISIBLE_GRANTS);
              const hiddenCount = member.grants.length - visibleGrants.length;

              return (
                <Button
                  key={member.id}
                  aria-expanded={isExpanded}
                  aria-label={t("toggleGrants", { name: member.name })}
                  className={styles.staffCard}
                  onPress={() => toggleExpanded(member.id)}
                  variant="ghost"
                >
                  <span className={styles.staffBody}>
                    <span className={styles.staffTop}>
                      <Image
                        alt={member.name}
                        className={styles.avatar}
                        height={44}
                        src={member.avatar}
                        width={44}
                      />
                      <span className={styles.staffHeading}>
                        <Typography
                          className={styles.staffName}
                          type="body"
                          weight="semibold"
                        >
                          {member.name}
                        </Typography>
                        <Typography className={styles.staffMeta} type="body-sm">
                          {member.presetLabel} · {member.branchLabel}
                        </Typography>
                      </span>
                      <Chip
                        color={STATE_CHIP_COLOR[member.state]}
                        size="sm"
                        variant="soft"
                      >
                        <Chip.Label>
                          {t(STATE_LABEL_KEY[member.state])}
                        </Chip.Label>
                      </Chip>
                    </span>

                    <span
                      aria-label={t("grantsLabel")}
                      className={styles.grants}
                    >
                      {visibleGrants.map((grant) => (
                        <Chip key={grant} size="sm">
                          <Chip.Label>
                            {grantLabels[grant] ?? grant}
                          </Chip.Label>
                        </Chip>
                      ))}
                      {hiddenCount > 0 ? (
                        <Chip color="accent" size="sm" variant="soft">
                          <Chip.Label>
                            {t("grantsMore", { count: hiddenCount })}
                          </Chip.Label>
                        </Chip>
                      ) : null}
                    </span>
                  </span>
                </Button>
              );
            })}
          </div>
        ) : (
          <div className={styles.empty}>
            <Typography
              className={styles.emptyTitle}
              type="h4"
              weight="semibold"
            >
              {t("emptyTitle")}
            </Typography>
            <Typography className={styles.emptyBody} type="body-sm">
              {t("emptyBody")}
            </Typography>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
