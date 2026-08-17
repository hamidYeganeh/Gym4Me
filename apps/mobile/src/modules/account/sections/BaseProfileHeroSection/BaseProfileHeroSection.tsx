import { Avatar, Button } from "@heroui/react";
import { ArrowUpload } from "@repo/icons/ArrowUpload";
import { ChartPie1 } from "@repo/icons/ChartPie1";
import { Gear1 } from "@repo/icons/Gear1";
import { Image1 } from "@repo/icons/Image1";
import { User } from "@repo/icons/User";
import { useTranslations } from "next-intl";
import { baseProfileHeroSectionVariants } from "./BaseProfileHeroSection.styles";
import type { BaseProfileHeroSectionProps } from "./BaseProfileHeroSection.types";

const ICON = 20;
const AVATAR_ICON = 40;

export function BaseProfileHeroSection({
  displayName,
  avatarSrc,
  onSettingsPress,
  onAnalyticsPress,
  onEditPress,
  className,
}: BaseProfileHeroSectionProps) {
  const t = useTranslations("Mobile.Profile");
  const styles = baseProfileHeroSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <div aria-hidden className={styles.cover()}>
        <Image1 className={styles.coverIcon()} size={36} />
      </div>

      <div className={styles.avatarRow()}>
        <Button
          aria-label={t("settings")}
          className={styles.sideAction()}
          isIconOnly
          onPress={onSettingsPress}
          size="lg"
          variant="secondary"
        >
          <Gear1 size={ICON} />
        </Button>

        <div className={styles.avatarWrap()}>
          <Avatar className={styles.avatar()} color="accent">
            {avatarSrc ? (
              <Avatar.Image
                alt={displayName}
                className={styles.avatarImage()}
                src={avatarSrc}
              />
            ) : null}
            <Avatar.Fallback className={styles.avatarFallback()}>
              <User size={AVATAR_ICON} />
            </Avatar.Fallback>
          </Avatar>
          <Button
            aria-label={t("uploadAvatar")}
            className={styles.avatarUpload()}
            isIconOnly
            onPress={onEditPress}
            size="lg"
            variant="tertiary"
          >
            <ArrowUpload size={14} />
          </Button>
        </div>

        <Button
          aria-label={t("analytics")}
          className={styles.sideAction()}
          isIconOnly
          onPress={onAnalyticsPress}
          size="lg"
          variant="secondary"
        >
          <ChartPie1 size={ICON} />
        </Button>
      </div>
    </section>
  );
}
