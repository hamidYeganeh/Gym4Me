import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { Calendar1 } from "@repo/icons/Calendar1";
import { Clock } from "@repo/icons/Clock";
import { UsersTwo } from "@repo/icons/UsersTwo";
import { useTranslations } from "next-intl";
import {
  STATE_CHIP_COLOR,
  STATE_LABEL_KEY,
} from "./CoachProgramsListSection.types";
import { coachProgramsListSectionVariants } from "./CoachProgramsListSection.styles";
import type { CoachProgramsListSectionProps } from "./CoachProgramsListSection.types";

export function CoachProgramsListSection({
  programs,
  publishingId,
  onProgramPress,
  onPublishProgram,
  className,
}: CoachProgramsListSectionProps) {
  const t = useTranslations("CoachPrograms");
  const styles = coachProgramsListSectionVariants();

  if (programs.length === 0) {
    return (
      <div className={styles.empty({ className })}>
        <Typography className={styles.emptyTitle()} type="h4" weight="semibold">
          {t("emptyTitle")}
        </Typography>
        <Typography className={styles.emptyBody()} type="body-sm">
          {t("emptyBody")}
        </Typography>
      </div>
    );
  }

  return (
    <div className={styles.list({ className })}>
      {programs.map((program) => (
        <article
          className={`${styles.card()} cursor-pointer`}
          key={program.id}
          onClick={() => onProgramPress(program.id)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onProgramPress(program.id);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <div className={styles.cardTop()}>
            <Typography
              className={styles.cardTitle()}
              type="body"
              weight="semibold"
            >
              {program.title}
            </Typography>
            <Chip
              color={STATE_CHIP_COLOR[program.state]}
              size="sm"
              variant="soft"
            >
              <Chip.Label>{t(STATE_LABEL_KEY[program.state])}</Chip.Label>
            </Chip>
          </div>
          <Typography className={styles.cardFocus()} type="body-sm">
            {program.focusLabel}
          </Typography>
          <div className={styles.metaRow()}>
            <span className={styles.metaItem()}>
              <Calendar1 aria-hidden className={styles.metaIcon()} size={16} />
              <Typography type="body-sm">
                {t("metaWeeks", { weeks: program.weeks })}
              </Typography>
            </span>
            <span className={styles.metaItem()}>
              <Clock aria-hidden className={styles.metaIcon()} size={16} />
              <Typography type="body-sm">
                {t("metaSessions", { sessions: program.sessionsPerWeek })}
              </Typography>
            </span>
            <span className={styles.metaItem()}>
              <UsersTwo aria-hidden className={styles.metaIcon()} size={16} />
              <Typography type="body-sm">
                {t("metaAssigned", { count: program.assignedCount })}
              </Typography>
            </span>
          </div>
          <Typography className={styles.updated()} type="body-sm">
            {program.updatedLabel}
          </Typography>
          {program.state === "draft" && onPublishProgram ? (
            <div
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
              role="presentation"
            >
              <Button
                fullWidth
                isDisabled={publishingId === program.id}
                onPress={() => void onPublishProgram(program.id)}
                variant="secondary"
              >
                {publishingId === program.id
                  ? t("publishing")
                  : t("publishAction")}
              </Button>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
