import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ArrowSignOut1 } from "@repo/icons/ArrowSignOut1";
import { Logo } from "@repo/ui/common/Logo";
import { useTranslations } from "next-intl";
import { PROFILE_ROW_ICON_SIZE } from "@/modules/account/lib/use-profile-menu";
import { baseProfileFooterSectionVariants } from "./BaseProfileFooterSection.styles";
import type { BaseProfileFooterSectionProps } from "./BaseProfileFooterSection.types";

export function BaseProfileFooterSection({
  onSignOut,
  className,
}: BaseProfileFooterSectionProps) {
  const t = useTranslations("Mobile.Profile");
  const styles = baseProfileFooterSectionVariants();

  return (
    <footer className={styles.root({ className })}>
      <Button className={styles.signOut()} onPress={onSignOut} variant="ghost" size="lg">
        <ArrowSignOut1 size={PROFILE_ROW_ICON_SIZE} />
        {t("logout")}
      </Button>
      <div className={styles.brand()}>
        <Logo
          color="var(--accent)"
          gradient={false}
          shadow={false}
          size={22}
          title=""
        />
        <Typography className={styles.version()} type="body-sm">
          {t("version")}
        </Typography>
        <Typography className={styles.copyright()} type="body-sm">
          {t("copyright")}
        </Typography>
      </div>
    </footer>
  );
}
