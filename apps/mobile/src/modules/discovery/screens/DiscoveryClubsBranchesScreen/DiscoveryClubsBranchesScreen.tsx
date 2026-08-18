"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ClubBranchCard } from "@repo/ui/cards/ClubBranchCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
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
    <AppLayout
      className={styles.root}
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
