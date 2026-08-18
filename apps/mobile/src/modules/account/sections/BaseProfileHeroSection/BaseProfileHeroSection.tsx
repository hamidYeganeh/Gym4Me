import { Avatar } from "@heroui/react/avatar";
import { Button } from "@heroui/react/button";
import { Gear1 } from "@repo/icons/Gear1";
import { Moon } from "@repo/icons/Moon";
import { Pencil1 } from "@repo/icons/Pencil1";
import { User } from "@repo/icons/User";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { baseProfileHeroSectionVariants } from "./BaseProfileHeroSection.styles";
import type { BaseProfileHeroSectionProps } from "./BaseProfileHeroSection.types";

const ICON = 20;
const AVATAR_ICON = 40;
const COVER_SRC = "/welcome/hero-athletes.png";

export function BaseProfileHeroSection({
  displayName,
  avatarSrc,
  onSettingsPress,
  onThemePress,
  onEditPress,
  className,
}: BaseProfileHeroSectionProps) {
  const t = useTranslations("Mobile.Profile");
  const styles = baseProfileHeroSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <div aria-hidden className={styles.cover()}>
        <Image
          alt=""
          className={styles.coverImage()}
          fill
          priority
          sizes="100vw"
          src={COVER_SRC}
        />
        <div className={styles.coverOverlay()} />
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
            <Pencil1 size={14} />
          </Button>
        </div>

        <Button
          aria-label={t("theme")}
          className={styles.sideAction()}
          isIconOnly
          onPress={onThemePress}
          size="lg"
          variant="secondary"
        >
          <Moon size={ICON} />
        </Button>
      </div>
    </section>
  );
}
