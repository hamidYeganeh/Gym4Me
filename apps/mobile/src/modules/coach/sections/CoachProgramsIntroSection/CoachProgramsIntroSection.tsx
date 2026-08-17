import { Typography } from "@heroui/react";
import { CallToActionCard } from "@repo/ui/cards/CallToActionCard";
import { useTranslations } from "next-intl";
import { coachProgramsIntroSectionVariants } from "./CoachProgramsIntroSection.styles";
import type { CoachProgramsIntroSectionProps } from "./CoachProgramsIntroSection.types";

export function CoachProgramsIntroSection({
  onCreatePress,
  canCreate,
  className,
}: CoachProgramsIntroSectionProps) {
  const t = useTranslations("CoachPrograms");
  const styles = coachProgramsIntroSectionVariants();

  return (
    <div className={styles.root({ className })}>
      <section className={styles.intro()}>
        <Typography className={styles.introTitle()} type="h1" weight="bold">
          {t("title")}
        </Typography>
        <Typography className={styles.introSubtitle()} type="body">
          {t("subtitle")}
        </Typography>
      </section>

      <CallToActionCard
        actionLabel={t("createAction")}
        actionType="plus"
        onAction={() => {
          if (!canCreate) return;
          onCreatePress();
        }}
        subtitle={t("createSubtitle")}
        title={t("createTitle")}
        variant="primary"
      />
    </div>
  );
}
