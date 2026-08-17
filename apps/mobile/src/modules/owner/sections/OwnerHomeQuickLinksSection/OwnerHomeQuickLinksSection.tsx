"use client";

import { Typography } from "@heroui/react";
import { Building2, UsersThree, UsersTwo, Wallet } from "@repo/icons";
import { QuickActionCard } from "@repo/ui/cards/QuickActionCard";
import { useTranslations } from "next-intl";
import { ownerHomeQuickLinksSectionVariants } from "./OwnerHomeQuickLinksSection.styles";
import type { OwnerHomeQuickLinksSectionProps } from "./OwnerHomeQuickLinksSection.types";

const ACTION_ICON_SIZE = 22;

export function OwnerHomeQuickLinksSection({
  onClubsPress,
  onMembersPress,
  onStaffPress,
  onFinancePress,
}: OwnerHomeQuickLinksSectionProps) {
  const t = useTranslations("OwnerHome");
  const styles = ownerHomeQuickLinksSectionVariants();

  return (
    <section aria-label={t("quickLinksTitle")} className={styles.root()}>
      <div className={styles.header()}>
        <Typography className={styles.title()} type="h4" weight="semibold">
          {t("quickLinksTitle")}
        </Typography>
        <Typography className={styles.description()} type="body-sm">
          {t("quickLinksDescription")}
        </Typography>
      </div>
      <div className={styles.grid()}>
        <QuickActionCard
          icon={<Building2 size={ACTION_ICON_SIZE} />}
          label={t("quickLinkClubs")}
          layout="row"
          onPress={onClubsPress}
        />
        <QuickActionCard
          icon={<UsersThree size={ACTION_ICON_SIZE} />}
          label={t("quickLinkMembers")}
          layout="row"
          onPress={onMembersPress}
        />
        <QuickActionCard
          icon={<UsersTwo size={ACTION_ICON_SIZE} />}
          label={t("quickLinkStaff")}
          layout="row"
          onPress={onStaffPress}
        />
        <QuickActionCard
          icon={<Wallet size={ACTION_ICON_SIZE} />}
          label={t("quickLinkFinance")}
          layout="row"
          onPress={onFinancePress}
        />
      </div>
    </section>
  );
}
