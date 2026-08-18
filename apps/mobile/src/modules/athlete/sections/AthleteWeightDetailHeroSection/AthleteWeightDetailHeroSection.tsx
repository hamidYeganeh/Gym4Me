import { Typography } from "@heroui/react/typography";
import { Calendar1 } from "@repo/icons/Calendar1";
import { Clock } from "@repo/icons/Clock";
import { WeightScale } from "@repo/icons/WeightScale";
import { useTranslations } from "next-intl";
import {
  formatTimeFa,
  toPersianDigits,
} from "@/modules/athlete/lib/weight/format";
import { athleteWeightDetailHeroSectionVariants } from "./AthleteWeightDetailHeroSection.styles";
import type { AthleteWeightDetailHeroSectionProps } from "./AthleteWeightDetailHeroSection.types";

function formatRecordedDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("fa-IR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function AthleteWeightDetailHeroSection({
  detail,
  unit,
  className,
}: AthleteWeightDetailHeroSectionProps) {
  const t = useTranslations("WeightDetail");
  const styles = athleteWeightDetailHeroSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <span className={styles.iconWrap()}>
        <WeightScale size={30} />
      </span>

      <div className={styles.weightRow()}>
        <Typography className={styles.weightValue()} weight="bold">
          {toPersianDigits(
            detail.kg.toLocaleString("fa-IR", {
              maximumFractionDigits: 1,
              minimumFractionDigits: 1,
            }),
          )}
        </Typography>
        <Typography className={styles.weightUnit()} weight="medium">
          {unit}
        </Typography>
      </div>

      <Typography className={styles.bmiStatus()} type="body" weight="medium">
        {t("bmiStatus")}
      </Typography>

      <div className={styles.metaRow()}>
        <span className="inline-flex items-center gap-1.5">
          <Calendar1 size={16} />
          <Typography type="body-sm">
            {formatRecordedDate(detail.recordedAt)}
          </Typography>
        </span>
        <span aria-hidden className={styles.metaDot()} />
        <span className="inline-flex items-center gap-1.5">
          <Clock size={16} />
          <Typography className="tabular-nums" type="body-sm">
            {formatTimeFa(detail.hours, detail.minutes)}
          </Typography>
        </span>
      </div>

      <Typography className={styles.tip()} type="body-sm">
        {t("tip")}
      </Typography>
    </section>
  );
}
