"use client";

import { useCallback, useEffect, useState } from "react";
import { CloseButton } from "@heroui/react/close-button";
import { Typography } from "@heroui/react/typography";
import { Building2 } from "@repo/icons/Building2";
import { Whistle } from "@repo/icons/Whistle";
import { CallToActionCard } from "@repo/ui/cards/CallToActionCard";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";
import {
  hydratePersistedFlag,
  readFlag,
  roleUpgradeDismissedKey,
  writeFlag,
} from "@/shared/lib/flag-storage";
import { useAuth } from "@/shared/providers/AuthProvider";
import {
  missingAthleteUpgradeRoles,
  type AthleteUpgradeRole,
} from "../../lib/athlete-home-setup";
import { athleteRoleUpgradeSectionVariants } from "./AthleteRoleUpgradeSection.styles";
import type { AthleteRoleUpgradeSectionProps } from "./AthleteRoleUpgradeSection.types";

const ICON_SIZE = 22;

const CARD_COPY: Record<
  AthleteUpgradeRole,
  {
    actionKey: "roleUpgradeCoachAction" | "roleUpgradeOwnerAction";
    href: string;
    subtitleKey: "roleUpgradeCoachSubtitle" | "roleUpgradeOwnerSubtitle";
    titleKey: "roleUpgradeCoachTitle" | "roleUpgradeOwnerTitle";
    variant: "primary" | "outlined";
  }
> = {
  coach: {
    actionKey: "roleUpgradeCoachAction",
    href: "/athlete/profile/roles/coach",
    subtitleKey: "roleUpgradeCoachSubtitle",
    titleKey: "roleUpgradeCoachTitle",
    variant: "primary",
  },
  club_owner: {
    actionKey: "roleUpgradeOwnerAction",
    href: "/athlete/profile/roles/owner",
    subtitleKey: "roleUpgradeOwnerSubtitle",
    titleKey: "roleUpgradeOwnerTitle",
    variant: "outlined",
  },
};

export function AthleteRoleUpgradeSection({
  className,
  missingRoles: missingRolesProp,
}: AthleteRoleUpgradeSectionProps) {
  const t = useTranslations("AthleteHome");
  const styles = athleteRoleUpgradeSectionVariants();
  const router = useRouter();
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  const missingRoles =
    missingRolesProp ?? missingAthleteUpgradeRoles(user?.roles);

  useEffect(() => {
    if (!user?.id) {
      setDismissed(true);
      return;
    }

    const key = roleUpgradeDismissedKey(user.id);
    let cancelled = false;
    void hydratePersistedFlag(key).then(() => {
      if (!cancelled) {
        setDismissed(readFlag(key) === "1");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handleDismiss = useCallback(() => {
    if (!user?.id) return;
    writeFlag(roleUpgradeDismissedKey(user.id), "1");
    setDismissed(true);
  }, [user?.id]);

  if (dismissed !== false || missingRoles.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="athlete-role-upgrade-title"
      className={styles.root({ className })}
    >
      <div className={styles.header()}>
        <div className={styles.heading()}>
          <Typography
            className={styles.title()}
            id="athlete-role-upgrade-title"
            type="h4"
            weight="bold"
          >
            {t("roleUpgradeTitle")}
          </Typography>
          <Typography className={styles.description()} type="body-sm">
            {t("roleUpgradeDescription")}
          </Typography>
        </div>
        <CloseButton
          aria-label={t("roleUpgradeDismiss")}
          className={styles.close()}
          onPress={handleDismiss}
        />
      </div>

      <div className={styles.list()}>
        {missingRoles.map((role) => {
          const card = CARD_COPY[role];
          return (
            <div className={styles.card()} key={role}>
              <CallToActionCard
                actionLabel={t(card.actionKey)}
                actionType="icon"
                icon={
                  role === "coach" ? (
                    <Whistle size={ICON_SIZE} />
                  ) : (
                    <Building2 size={ICON_SIZE} />
                  )
                }
                onAction={() => router.push(card.href)}
                subtitle={t(card.subtitleKey)}
                title={t(card.titleKey)}
                variant={card.variant}
              />
              <CloseButton
                aria-label={t("roleUpgradeDismiss")}
                className={styles.cardClose()}
                onClick={(event) => event.stopPropagation()}
                onPress={handleDismiss}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
