"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { Building2 } from "@repo/icons/Building2";
import { UsersThree } from "@repo/icons/UsersThree";
import { CallToActionCard } from "@repo/ui/cards/CallToActionCard";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "@/shared/lib/app-router";

import type { OwnerClubState } from "../../lib/owner-clubs-data";
import { ownerClubsScreenStyles as styles } from "./OwnerClubsScreen.styles";
import type { OwnerClubsScreenProps } from "./OwnerClubsScreen.types";

const META_ICON_SIZE = 16;

const STATE_CHIP_COLOR: Record<
  OwnerClubState,
  "success" | "warning" | "danger"
> = {
  active: "success",
  "pending-review": "warning",
  suspended: "danger",
};

const STATE_LABEL_KEY = {
  active: "stateActive",
  "pending-review": "statePendingReview",
  suspended: "stateSuspended",
} as const;

export function OwnerClubsScreen({ clubs, className }: OwnerClubsScreenProps) {
  const t = useTranslations("OwnerClubs");
  const router = useRouter();

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

        <CallToActionCard
          actionLabel={t("createAction")}
          badge={t("createSubtitle")}
          meta={t("createMeta")}
          onAction={() => router.push("/owner/clubs/create")}
          subtitle={t("createSubtitle")}
          title={t("createTitle")}
          variant="soft"
        />

        {clubs.length > 0 ? (
          <div aria-label={t("listLabel")} className={styles.list} role="list">
            {clubs.map((club) => (
              <Button size="lg"
                key={club.id}
                aria-label={`${t("viewClub")}: ${club.name}`}
                className={styles.clubCard}
                onPress={() => router.push(`/owner/clubs/${club.id}`)}
                variant="ghost"
              >
                <span className={styles.clubBody}>
                  <span className={styles.clubTop}>
                    <Image
                      alt={club.name}
                      className={styles.clubThumb}
                      height={56}
                      src={club.image}
                      width={56}
                    />
                    <span className={styles.clubHeading}>
                      <Typography
                        className={styles.clubName}
                        type="body"
                        weight="semibold"
                      >
                        {club.name}
                      </Typography>
                      <Typography className={styles.clubCity} type="body-sm">
                        {club.city}
                      </Typography>
                    </span>
                    <Chip
                      color={STATE_CHIP_COLOR[club.state]}
                      size="sm"
                      variant="soft"
                    >
                      <Chip.Label>{t(STATE_LABEL_KEY[club.state])}</Chip.Label>
                    </Chip>
                  </span>

                  <span className={styles.metaRow}>
                    <span className={styles.metaItem}>
                      <Building2
                        aria-hidden
                        className={styles.metaIcon}
                        size={META_ICON_SIZE}
                      />
                      {club.branchCount} {t("branchesLabel")}
                    </span>
                    <span className={styles.metaItem}>
                      <UsersThree
                        aria-hidden
                        className={styles.metaIcon}
                        size={META_ICON_SIZE}
                      />
                      {club.memberCount} {t("membersLabel")}
                    </span>
                  </span>

                  <span className={styles.occupancy}>
                    <span className={styles.occupancyRow}>
                      <Typography
                        className={styles.occupancyLabel}
                        type="body-sm"
                      >
                        {t("occupancyLabel")}
                      </Typography>
                      <span className={styles.occupancyValue}>
                        ٪{club.occupancyPercent}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={styles.occupancyTrack}
                    >
                      <span
                        className={styles.occupancyFill}
                        style={{ width: `${club.occupancyPercent}%` }}
                      />
                    </span>
                  </span>

                  <Typography className={styles.revenue} type="body-sm">
                    {club.revenueMonthLabel}
                  </Typography>
                </span>
              </Button>
            ))}
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
