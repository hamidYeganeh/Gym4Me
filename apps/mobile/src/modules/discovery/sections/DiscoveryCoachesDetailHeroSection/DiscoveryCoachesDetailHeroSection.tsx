"use client";

import { Avatar, Button, Chip, Surface, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Plus } from "@repo/icons/Plus";
import { Sun } from "@repo/icons/Sun";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { Logo } from "@repo/ui/common/Logo";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { discoveryCoachesDetailHeroSectionStyles as styles } from "./DiscoveryCoachesDetailHeroSection.styles";
import type { DiscoveryCoachesDetailHeroSectionProps } from "./DiscoveryCoachesDetailHeroSection.types";

export function DiscoveryCoachesDetailHeroSection({
  coach,
  children,
}: DiscoveryCoachesDetailHeroSectionProps) {
  const t = useTranslations("CoachDetail");
  const router = useRouter();
  const heroImage = coach.image || PLACEHOLDER_IMAGE;
  const avatarImage = coach.avatar || heroImage;

  return (
    <>
      <section aria-label={coach.name} className={styles.root}>
        <div className={styles.media}>
          <Image
            alt=""
            className={styles.image}
            fill
            priority
            sizes="100vw"
            src={heroImage}
          />
          <div aria-hidden className={styles.scrim} />

          <div className={styles.topBar}>
            <Button
              aria-label={t("back")}
              className={styles.backButton}
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="secondary"
            >
              <ChevronLeft size={20} />
            </Button>

            <Surface className={styles.island} variant="default">
              <Logo
                className={styles.islandLogo}
                color="currentColor"
                gradient={false}
                shadow={false}
                size={28}
                title={t("home")}
              />
              <Avatar className={styles.islandAvatar} size="sm">
                <Avatar.Image alt={coach.name} src={avatarImage} />
                <Avatar.Fallback>
                  {coach.name.slice(0, 1).toUpperCase()}
                </Avatar.Fallback>
              </Avatar>
            </Surface>

            <span aria-hidden />
          </div>

          <div className={styles.inspo}>
            <Button
              aria-label={t("addInspo")}
              className={styles.inspoAdd}
              isIconOnly
              size="lg"
              variant="secondary"
            >
              <Plus size={16} />
            </Button>
            <Typography
              aria-hidden
              className={styles.inspoLabel}
              color="muted"
              type="body-xs"
            >
              {t("inspo")}
            </Typography>
            <div className={styles.inspoStack}>
              {coach.inspo.map((item, index) => (
                <Button
                  aria-label={t("selectInspo", { index: index + 1 })}
                  className={styles.inspoThumb}
                  isIconOnly
                  key={item.id}
                  size="lg"
                  variant="secondary"
                >
                  <Image
                    alt=""
                    className={styles.inspoImage}
                    fill
                    sizes="40px"
                    src={item.image || PLACEHOLDER_IMAGE}
                  />
                </Button>
              ))}
            </div>
          </div>

          <div className={styles.content}>
            <div className={styles.pills}>
              <Chip className={styles.pill} color="default" size="sm" variant="soft">
                <Chip.Label>{coach.availabilityLabel}</Chip.Label>
              </Chip>
              <Chip className={styles.pill} color="warning" size="sm" variant="soft">
                <Sun aria-hidden size={14} />
                <Chip.Label>{coach.nextSessionLabel}</Chip.Label>
              </Chip>
            </div>

            <div className={styles.titleBlock}>
              <Typography className={styles.title} type="h1" weight="bold">
                {coach.name}
              </Typography>
              <Typography className={styles.specialty} color="muted" type="body">
                {coach.tagline}
              </Typography>
              <Typography className={styles.stats} color="muted" type="body-sm">
                {t("statsLine", {
                  progress: coach.progressPercent,
                  newCount: coach.newAddedCount,
                  members: coach.membersCount,
                })}
              </Typography>
            </div>
          </div>
        </div>
      </section>

      <Surface aria-hidden={!children} className={styles.sheet} variant="default">
        {children}
      </Surface>
    </>
  );
}
