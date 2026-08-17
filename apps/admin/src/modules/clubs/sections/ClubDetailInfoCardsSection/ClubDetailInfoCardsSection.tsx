import { Chip, Typography } from "@heroui/react";
import { useTranslations } from "next-intl";
import { categoryLabel } from "../../lib/clubs-data";
import { ClubCoachesSection } from "../ClubCoachesSection";
import { ClubSlotsSection } from "../ClubSlotsSection";
import { clubDetailInfoCardsSectionVariants } from "./ClubDetailInfoCardsSection.styles";
import type { ClubDetailInfoCardsSectionProps } from "./ClubDetailInfoCardsSection.types";

export function ClubDetailInfoCardsSection({
  club,
  coaches,
  branches,
  classes,
  slots,
  onChanged,
  className,
}: ClubDetailInfoCardsSectionProps) {
  const t = useTranslations("Admin.Clubs");
  const styles = clubDetailInfoCardsSectionVariants();

  return (
    <div className={`flex flex-col gap-6 ${className ?? ""}`}>
      <section className={styles.card()}>
        <Typography className={styles.cardTitle()}>{t("detail.status")}</Typography>
        <div className={styles.chips()}>
          <Chip size="sm" variant="soft">
            {t(`lifecycle.${club.review.status}`)}
          </Chip>
          <Chip
            color={club.operationalStatus === "active" ? "success" : "danger"}
            size="sm"
            variant="soft"
          >
            {t(`operational.${club.operationalStatus}`)}
          </Chip>
        </div>
      </section>

      <section className={styles.card()}>
        <Typography className={styles.cardTitle()}>{t("detail.identity")}</Typography>
        <dl className={styles.grid()}>
          <div>
            <dt className={styles.label()}>{t("createModal.name")}</dt>
            <dd className={styles.value()}>{club.identity.name}</dd>
          </div>
          <div>
            <dt className={styles.label()}>{t("createModal.description")}</dt>
            <dd className={styles.value()}>{club.identity.description || "—"}</dd>
          </div>
        </dl>
        {club.categories.length ? (
          <div className={`mt-4 ${styles.chips()}`}>
            {club.categories.map((c) => (
              <Chip key={c.id} size="sm" variant="soft">
                {c.name ?? categoryLabel(c.id)}
              </Chip>
            ))}
          </div>
        ) : null}
      </section>

      <section className={styles.card()}>
        <Typography className={styles.cardTitle()}>{t("detail.contact")}</Typography>
        <dl className={styles.grid()}>
          <div>
            <dt className={styles.label()}>{t("createModal.phone")}</dt>
            <dd className={styles.value()} dir="ltr">
              {club.contact.phones
                .map((p) => (p.label ? `${p.number} (${p.label})` : p.number))
                .join(" · ") || "—"}
            </dd>
          </div>
          <div>
            <dt className={styles.label()}>{t("createModal.website")}</dt>
            <dd className={styles.value()} dir="ltr">
              {club.contact.website || "—"}
            </dd>
          </div>
        </dl>
      </section>

      <section className={styles.card()}>
        <Typography className={styles.cardTitle()}>{t("detail.location")}</Typography>
        <dl className={styles.grid()}>
          <div>
            <dt className={styles.label()}>{t("createModal.address")}</dt>
            <dd className={styles.value()}>{club.location?.address || "—"}</dd>
          </div>
          <div>
            <dt className={styles.label()}>{t("createModal.direction")}</dt>
            <dd className={styles.value()}>
              {club.location?.direction
                ? t(`direction.${club.location.direction}`)
                : "—"}
            </dd>
          </div>
        </dl>
      </section>

      <section className={styles.card()}>
        <Typography className={styles.cardTitle()}>{t("detail.reviews")}</Typography>
        <Typography className={styles.value()}>
          {club.reviewsSummary.count
            ? `${club.reviewsSummary.average.toFixed(1)} / 5 · ${club.reviewsSummary.count}`
            : "—"}
        </Typography>
      </section>

      <section className={styles.card()}>
        <ClubCoachesSection
          clubId={club.id}
          coaches={coaches}
          onChanged={onChanged}
        />
      </section>

      <section className={styles.card()}>
        <Typography className={styles.cardTitle()}>{t("detail.branches")}</Typography>
        {branches.length ? (
          <ul className="space-y-1 text-sm">
            {branches.map((b) => (
              <li key={b.id}>{b.identity.name}</li>
            ))}
          </ul>
        ) : (
          <Typography className={styles.muted()}>{t("detail.emptyRefs")}</Typography>
        )}
      </section>

      <section className={styles.card()}>
        <Typography className={styles.cardTitle()}>{t("detail.classes")}</Typography>
        {classes.length ? (
          <ul className="space-y-1 text-sm">
            {classes.map((c) => (
              <li key={c.id}>
                {c.title}
                <span className="ms-2 text-muted tabular-nums" dir="ltr">
                  {c.id}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Typography className={styles.muted()}>{t("detail.emptyRefs")}</Typography>
        )}
      </section>

      <section className={styles.card()}>
        <ClubSlotsSection
          classes={classes}
          clubId={club.id}
          slots={slots}
          onChanged={onChanged}
        />
      </section>
    </div>
  );
}
