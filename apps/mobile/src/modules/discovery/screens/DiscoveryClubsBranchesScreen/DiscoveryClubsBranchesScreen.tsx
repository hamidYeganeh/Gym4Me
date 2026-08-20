"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ClubBranchCard } from "@repo/ui/cards/ClubBranchCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { discoveryClubsBranchesScreenStyles as styles } from "./DiscoveryClubsBranchesScreen.styles";
import type { DiscoveryClubsBranchesScreenProps } from "./DiscoveryClubsBranchesScreen.types";

export function DiscoveryClubsBranchesScreen({
  club,
}: DiscoveryClubsBranchesScreenProps) {
  const t = useTranslations("ClubDetail");
  const router = useRouter();

  return (
    <AppLayout
      className={styles.root}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
          title={t("branchesPageTitle")}
        />
      }
    >
      {club.branches.length === 0 ? (
        <Typography className={styles.empty} type="body-sm">
          {t("notFound")}
        </Typography>
      ) : (
        <div className={styles.list}>
          {club.branches.map((branch) => (
            <ClubBranchCard
              actionLabel={t("branchAction")}
              image={branch.image || PLACEHOLDER_IMAGE}
              imageAlt={branch.title}
              key={branch.id}
              size="md"
              subtitle={branch.subtitle}
              title={branch.title}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
