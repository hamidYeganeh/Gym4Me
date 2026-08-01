"use client";

import { Chip, Link, Tabs, Typography } from "@heroui/react";
import { CheckCircle } from "@repo/icons/CheckCircle";
import { Clock } from "@repo/icons/Clock";
import { Fire1 } from "@repo/icons/Fire1";
import { ThumbsUp } from "@repo/icons/ThumbsUp";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useTranslations } from "next-intl";
import Image from "next/image";
import NextLink from "next/link";
import type { ReactNode } from "react";
import type { ClassDetailInstruction } from "../../lib/class-detail-data";
import { discoveryClubsClassDetailBodySectionStyles as styles } from "./DiscoveryClubsClassDetailBodySection.styles";
import type { DiscoveryClubsClassDetailBodySectionProps } from "./DiscoveryClubsClassDetailBodySection.types";

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Typography className={styles.sectionTitle} type="h4" weight="semibold">
      {children}
    </Typography>
  );
}

function SectionHeader({
  title,
  seeAllLabel,
  onSeeAll,
}: {
  title: string;
  seeAllLabel: string;
  onSeeAll?: () => void;
}) {
  return (
    <div className={styles.sectionHeader}>
      <SectionTitle>{title}</SectionTitle>
      <Link className={styles.seeAll} onPress={onSeeAll}>
        {seeAllLabel}
      </Link>
    </div>
  );
}

function DurationGauge({
  range,
  unit,
  caption,
  progress,
}: {
  range: string;
  unit: string;
  caption: string;
  progress: number;
}) {
  const clamped = Math.min(1, Math.max(0, progress));
  const radius = 88;
  const stroke = 12;
  const cx = 110;
  const cy = 100;
  const startAngle = Math.PI;
  const endAngle = 0;
  const angle = startAngle + (endAngle - startAngle) * clamped;

  const polar = (a: number) => ({
    x: cx + radius * Math.cos(a),
    y: cy - radius * Math.sin(a),
  });

  const start = polar(startAngle);
  const end = polar(angle);
  const largeArc = clamped > 0.5 ? 1 : 0;
  const trackEnd = polar(endAngle);

  return (
    <div className={styles.gaugeWrap}>
      <div className="relative">
        <svg
          aria-hidden
          className={styles.gaugeSvg}
          viewBox="0 0 220 120"
        >
          <path
            d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${trackEnd.x} ${trackEnd.y}`}
            fill="none"
            stroke="var(--default)"
            strokeLinecap="round"
            strokeWidth={stroke}
          />
          {clamped > 0 ? (
            <path
              d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`}
              fill="none"
              stroke="var(--stats-orange)"
              strokeLinecap="round"
              strokeWidth={stroke}
            />
          ) : null}
        </svg>
        <div className={styles.gaugeCenter}>
          <Typography className={styles.gaugeRange} type="h3" weight="bold">
            {range}
          </Typography>
          <Typography className={styles.gaugeUnit} type="body-xs">
            {unit}
          </Typography>
        </div>
      </div>
      <Typography className={styles.gaugeCaption} type="body-sm">
        {caption}
      </Typography>
    </div>
  );
}

function InstructionList({ steps }: { steps: ClassDetailInstruction[] }) {
  return (
    <div className={styles.card}>
      <ol className={styles.timeline}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <li className={styles.timelineItem} key={`${step.title}-${index}`}>
              {!isLast ? <span aria-hidden className={styles.timelineRail} /> : null}
              <span aria-hidden className={styles.timelineDot} />
              <div className={styles.timelineBody}>
                <Typography
                  className={styles.timelineTitle}
                  type="body"
                  weight="semibold"
                >
                  {step.title}
                </Typography>
                <Typography className={styles.timelineText} type="body-sm">
                  {step.body}
                </Typography>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function DiscoveryClubsClassDetailBodySection({
  classDetail,
}: DiscoveryClubsClassDetailBodySectionProps) {
  const t = useTranslations("ClubClassDetail");
  const gallery =
    classDetail.gallery.length > 0
      ? classDetail.gallery
      : [PLACEHOLDER_IMAGE];

  return (
    <section className={styles.root}>
      <Tabs className={styles.tabs} defaultSelectedKey="overview">
        <Tabs.ListContainer className={styles.tabsListContainer}>
          <Tabs.List aria-label={t("tabsLabel")} className={styles.tabsList}>
            <Tabs.Tab id="overview">
              {t("tabOverview")}
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="plan">
              {t("tabPlan")}
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel className={styles.panel} id="overview">
          <div className={styles.section}>
            <SectionTitle>{t("description")}</SectionTitle>
            <Typography className={styles.bodyText} type="body-sm">
              {classDetail.description}
            </Typography>
          </div>

          <div className={styles.section}>
            <SectionTitle>{t("benefits")}</SectionTitle>
            <ul className={styles.benefits}>
              {classDetail.benefits.map((benefit) => (
                <li className={styles.benefitRow} key={benefit}>
                  <CheckCircle
                    aria-hidden
                    className={styles.benefitIcon}
                    size={18}
                  />
                  <Typography className={styles.benefitText} type="body-sm">
                    {benefit}
                  </Typography>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.section}>
            <SectionTitle>{t("tags")}</SectionTitle>
            <div className={styles.tags}>
              {classDetail.tags.map((tag) => (
                <Chip className={styles.tag} key={tag} size="sm">
                  <Chip.Label>{`# ${tag}`}</Chip.Label>
                </Chip>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <SectionHeader seeAllLabel={t("seeAll")} title={t("galleries")} />
            <div className={styles.gallery}>
              {gallery.map((image, index) => (
                <div
                  className={styles.galleryItem}
                  key={`${image}-${index}`}
                >
                  <Image
                    alt=""
                    className={styles.galleryImage}
                    fill
                    sizes="96px"
                    src={image || PLACEHOLDER_IMAGE}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <SectionTitle>{t("sessionDuration")}</SectionTitle>
            <div className={styles.card}>
              <DurationGauge
                caption={classDetail.sessionDuration.caption}
                progress={classDetail.sessionDuration.progress}
                range={classDetail.sessionDuration.range}
                unit={classDetail.sessionDuration.unit}
              />
            </div>
          </div>

          <div className={styles.section}>
            <SectionTitle>{t("intensityLevel")}</SectionTitle>
            <div className={styles.card}>
              <div className={styles.intensityRow}>
                <span aria-hidden className={styles.intensityIconWrap}>
                  <ThumbsUp size={22} />
                </span>
                <div className={styles.intensityCopy}>
                  <div className={styles.intensityScoreRow}>
                    <Typography
                      className={styles.intensityScore}
                      type="h3"
                      weight="bold"
                    >
                      {classDetail.intensity.score}
                    </Typography>
                    <Typography
                      className={styles.intensityLabel}
                      type="body-sm"
                    >
                      {classDetail.intensity.label}
                    </Typography>
                  </div>
                  <Typography
                    className={styles.intensityDescription}
                    type="body-sm"
                  >
                    {classDetail.intensity.description}
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <SectionTitle>{t("instructions")}</SectionTitle>
            <InstructionList steps={classDetail.instructions} />
          </div>

          <div className={styles.section}>
            <SectionHeader seeAllLabel={t("seeAll")} title={t("related")} />
            <div className={styles.related}>
              {classDetail.related.map((item) => (
                <NextLink
                  className={styles.relatedCard}
                  href={`/discovery/clubs/${classDetail.clubId}/classes/${item.id}`}
                  key={item.id}
                >
                  <div className={styles.relatedMedia}>
                    <Image
                      alt=""
                      className={styles.relatedImage}
                      fill
                      sizes="260px"
                      src={item.image || PLACEHOLDER_IMAGE}
                    />
                  </div>
                  <Chip className={styles.relatedCategory} size="sm">
                    <Chip.Label>{item.category}</Chip.Label>
                  </Chip>
                  <Typography
                    className={styles.relatedTitle}
                    type="body"
                    weight="semibold"
                  >
                    {item.title}
                  </Typography>
                  <div className={styles.relatedMeta}>
                    <span className={styles.relatedMetaItem}>
                      <Clock
                        aria-hidden
                        className={styles.relatedMetaIcon}
                        size={14}
                      />
                      <Typography type="body-xs">{item.durationLabel}</Typography>
                    </span>
                    <span className={styles.relatedMetaItem}>
                      <Fire1
                        aria-hidden
                        className={styles.relatedMetaIcon}
                        size={14}
                      />
                      <Typography type="body-xs">{item.caloriesLabel}</Typography>
                    </span>
                  </div>
                </NextLink>
              ))}
            </div>
          </div>
        </Tabs.Panel>

        <Tabs.Panel className={styles.panel} id="plan">
          <div className={styles.section}>
            <SectionTitle>{t("planTitle")}</SectionTitle>
            <Typography className={styles.bodyText} type="body-sm">
              {t("planDescription")}
            </Typography>
          </div>
          <div className={styles.section}>
            <SectionTitle>{t("planSteps")}</SectionTitle>
            <InstructionList steps={classDetail.planSteps} />
          </div>
        </Tabs.Panel>
      </Tabs>
    </section>
  );
}
