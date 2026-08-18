"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ClubBranchCard } from "@repo/ui/cards/ClubBranchCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { discoveryClubsBranchesScreenStyles as styles } from "./DiscoveryClubsBranchesScreen.styles";
import type { DiscoveryClubsBranchesScreenProps } from "./DiscoveryClubsBranchesScreen.types";

export function DiscoveryClubsBranchesScreen({
  club,
}: DiscoveryClubsBranchesScreenProps) {
  const t = useTranslations("ClubDetail");
  const router = useRouter();

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Button
          aria-label={t("back")}
          isIconOnly
          onPress={() => router.back()}
          size="lg"
          variant="secondary"
        >
          <ChevronLeft size={20} />
        </Button>
        <Typography className={styles.title} type="h4" weight="semibold">
          {t("branchesPageTitle")}
        </Typography>
      </header>

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
    </div>
  );
}
