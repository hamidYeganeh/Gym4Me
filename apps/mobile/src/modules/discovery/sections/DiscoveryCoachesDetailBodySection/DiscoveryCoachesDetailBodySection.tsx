"use client";

import {
  Button,
  Chip,
  Label,
  Radio,
  RadioGroup,
  Typography,
} from "@heroui/react";
import { BarbellHorizontal } from "@repo/icons/BarbellHorizontal";
import { Check } from "@repo/icons/Check";
import { Headset1 } from "@repo/icons/Headset1";
import { ListTwoCheck } from "@repo/icons/ListTwoCheck";
import { MapPin1 } from "@repo/icons/MapPin1";
import { Medal } from "@repo/icons/Medal";
import { UsersTwo } from "@repo/icons/UsersTwo";
import { Video } from "@repo/icons/Video";
import { Weight } from "@repo/icons/Weight";
import { ClubCancellationPolicy } from "@repo/ui/cards/ClubCancellationPolicy";
import { ClubSubscriptionCard } from "@repo/ui/cards/ClubSubscriptionCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type {
  CoachDetailPackage,
  CoachDetailServiceIconKey,
  CoachDetailStat,
  CoachDetailStatKey,
} from "../../lib/coach-detail-data";
import { discoveryCoachesDetailBodySectionStyles as styles } from "./DiscoveryCoachesDetailBodySection.styles";
import type { DiscoveryCoachesDetailBodySectionProps } from "./DiscoveryCoachesDetailBodySection.types";

function formatPlanPrice(price: number) {
  return price.toLocaleString("fa-IR");
}

const STAT_LABEL_KEYS = {
  years: "statYears",
  students: "statStudents",
  sessions: "statSessions",
} as const satisfies Record<
  CoachDetailStatKey,
  "statYears" | "statStudents" | "statSessions"
>;

const SERVICE_ICONS: Record<CoachDetailServiceIconKey, ReactNode> = {
  online: <Video size={16} />,
  inPerson: <BarbellHorizontal size={16} />,
  nutrition: <Weight size={16} />,
  program: <ListTwoCheck size={16} />,
  assessment: <Medal size={16} />,
  group: <UsersTwo size={16} />,
};

const DEMO_SLOTS = {
  today: [
    { id: "t1", label: "۰۸:۰۰", state: "unavailable" as const },
    { id: "t2", label: "۱۰:۰۰", state: "available" as const },
    { id: "t3", label: "۱۴:۰۰", state: "available" as const },
    { id: "t4", label: "۱۸:۰۰", state: "selected" as const },
  ],
  tomorrow: [
    { id: "m1", label: "۰۹:۰۰", state: "available" as const },
    { id: "m2", label: "۱۱:۳۰", state: "available" as const },
    { id: "m3", label: "۱۶:۰۰", state: "unavailable" as const },
  ],
};

function StatIcon({ labelKey }: { labelKey: CoachDetailStatKey }) {
  if (labelKey === "years") {
    return (
      <Medal
        aria-hidden
        className={[styles.statIcon, styles.statIconMuted].join(" ")}
        size={14}
      />
    );
  }
  if (labelKey === "students") {
    return (
      <UsersTwo
        aria-hidden
        className={[styles.statIcon, styles.statIconScore].join(" ")}
        size={14}
      />
    );
  }
  return (
    <ListTwoCheck
      aria-hidden
      className={[styles.statIcon, styles.statIconAccent].join(" ")}
      size={14}
    />
  );
}

function CoachStatsBar({ stats }: { stats: CoachDetailStat[] }) {
  const t = useTranslations("CoachDetail");
  if (stats.length === 0) return null;

  return (
    <div className={styles.statsBar}>
      {stats.map((stat) => (
        <div className={styles.statCell} key={stat.labelKey}>
          <Typography className={styles.statValue} type="h3" weight="bold">
            {stat.value}
          </Typography>
          <div className={styles.statMeta}>
            <StatIcon labelKey={stat.labelKey} />
            <Typography className={styles.statLabel} type="body-xs">
              {t(STAT_LABEL_KEYS[stat.labelKey])}
            </Typography>
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Typography className={styles.sectionTitle} type="h4" weight="semibold">
      {children}
    </Typography>
  );
}

function DescriptionDisclosure({ text }: { text: string }) {
  const t = useTranslations("CoachDetail");
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsClamp, setNeedsClamp] = useState(true);
  const measureRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const lineHeight = Number.parseFloat(getComputedStyle(el).lineHeight);
    if (!Number.isFinite(lineHeight) || lineHeight <= 0) {
      setNeedsClamp(el.scrollHeight > 72);
      return;
    }
    setNeedsClamp(el.scrollHeight > lineHeight * 3 + 1);
  }, [text]);

  if (!needsClamp) {
    return (
      <Typography className={styles.bodyText} type="body-sm">
        {text}
      </Typography>
    );
  }

  return (
    <div className={styles.descriptionWrap}>
      <p
        aria-hidden
        className={[
          styles.bodyText,
          "pointer-events-none invisible absolute inset-x-0 top-0 -z-10",
        ].join(" ")}
        ref={measureRef}
      >
        {text}
      </p>
      <Typography
        className={[
          styles.bodyText,
          !isExpanded ? styles.descriptionClamped : "",
        ]
          .filter(Boolean)
          .join(" ")}
        type="body-sm"
      >
        {text}
      </Typography>
      <div className={isExpanded ? styles.seeLess : styles.seeMoreFade}>
        <Button
          aria-expanded={isExpanded}
          className={styles.seeMoreTrigger}
          onPress={() => setIsExpanded((prev) => !prev)}
          size="sm"
          variant="ghost"
        >
          {isExpanded ? t("seeLess") : t("seeMore")}
        </Button>
      </div>
    </div>
  );
}

function PackagesSection({
  plans,
  selectedId,
  onChange,
}: {
  plans: CoachDetailPackage[];
  selectedId: string;
  onChange: (planId: string) => void;
}) {
  const t = useTranslations("CoachDetail");
  if (plans.length === 0) return null;

  return (
    <div className={styles.section}>
      <SectionTitle>{t("packagesTitle")}</SectionTitle>
      <RadioGroup
        aria-label={t("packagesLabel")}
        className={styles.subscriptionGroup}
        name="coach-package"
        onChange={onChange}
        value={selectedId}
        variant="secondary"
      >
        <Label className="sr-only">{t("packagesLabel")}</Label>
        {plans.map((plan) => (
          <Radio
            className={styles.subscriptionRadio}
            key={plan.id}
            value={plan.id}
          >
            {({ isSelected }) => (
              <Radio.Content className={styles.subscriptionContent}>
                <ClubSubscriptionCard
                  badge={
                    plan.badge
                      ? t("packageBadgeOff", { value: plan.badge })
                      : undefined
                  }
                  control={
                    <Radio.Control className={styles.subscriptionControl}>
                      <Radio.Indicator className={styles.subscriptionIndicator}>
                        {({ isSelected: selected }) =>
                          selected ? <Check size={18} /> : null
                        }
                      </Radio.Indicator>
                    </Radio.Control>
                  }
                  description={t(plan.descriptionKey)}
                  planName={t(plan.planNameKey)}
                  price={formatPlanPrice(plan.price)}
                  priceSuffix={t("packagePriceSuffix")}
                  selected={isSelected}
                />
              </Radio.Content>
            )}
          </Radio>
        ))}
      </RadioGroup>
    </div>
  );
}

export function DiscoveryCoachesDetailBodySection({
  coach,
  selectedPackageId,
  onPackageChange,
}: DiscoveryCoachesDetailBodySectionProps) {
  const t = useTranslations("CoachDetail");
  const router = useRouter();
  const [selectedSlotId, setSelectedSlotId] = useState("t4");
  const gallery =
    coach.images.length > 0 ? coach.images : [PLACEHOLDER_IMAGE];
  const primaryClub = coach.clubs[0];

  return (
    <section className={styles.root}>
      <CoachStatsBar stats={coach.stats} />

      {coach.overview ? (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <SectionTitle>{t("description")}</SectionTitle>
            <Button className={styles.seeAll} size="sm" variant="ghost">
              {t("seeMore")}
            </Button>
          </div>
          <DescriptionDisclosure text={coach.overview} />
        </div>
      ) : null}

      {coach.services.length > 0 ? (
        <div className={styles.section}>
          <SectionTitle>{t("coachingTypeTitle")}</SectionTitle>
          <div className={styles.chips}>
            {coach.services.slice(0, 3).map((service) => (
              <Chip className={styles.chip} key={service.id}>
                <span aria-hidden className={styles.chipIcon}>
                  {SERVICE_ICONS[service.iconKey] ?? (
                    <Headset1 size={16} />
                  )}
                </span>
                <Chip.Label>{service.title}</Chip.Label>
              </Chip>
            ))}
          </div>
        </div>
      ) : null}

      {coach.specialties.length > 0 ? (
        <div className={styles.section}>
          <SectionTitle>{t("specialtiesTitle")}</SectionTitle>
          <div className={styles.chips}>
            {coach.specialties.map((specialty) => (
              <Chip className={styles.chip} key={specialty.id}>
                <span aria-hidden className={styles.chipIcon}>
                  <BarbellHorizontal size={16} />
                </span>
                <Chip.Label>{specialty.title}</Chip.Label>
              </Chip>
            ))}
          </div>
        </div>
      ) : null}

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <SectionTitle>{t("galleryTitle")}</SectionTitle>
          <Button className={styles.seeAll} size="sm" variant="ghost">
            {t("seeAllGallery")}
          </Button>
        </div>
        <div className={styles.gallery}>
          {gallery.map((image, index) => (
            <div className={styles.galleryItem} key={`${image}-${index}`}>
              <Image
                alt=""
                className={styles.galleryImage}
                fill
                sizes="112px"
                src={image || PLACEHOLDER_IMAGE}
              />
            </div>
          ))}
        </div>
      </div>

      <PackagesSection
        onChange={onPackageChange}
        plans={coach.packages}
        selectedId={selectedPackageId}
      />

      <div className={styles.section}>
        <SectionTitle>{t("upcomingSlotsTitle")}</SectionTitle>
        <div className={styles.slotGroup}>
          {(
            [
              ["today", DEMO_SLOTS.today],
              ["tomorrow", DEMO_SLOTS.tomorrow],
            ] as const
          ).map(([dayKey, slots]) => (
            <div className={styles.slotDay} key={dayKey}>
              <Typography className={styles.slotDayLabel} type="body-sm">
                {t(dayKey === "today" ? "slotsToday" : "slotsTomorrow")}
              </Typography>
              <div className={styles.slotRow}>
                {slots.map((slot) => {
                  const state =
                    slot.id === selectedSlotId ? "selected" : slot.state;
                  return (
                    <Button
                      className={[
                        styles.slotChip,
                        state === "available" ? styles.slotAvailable : "",
                        state === "selected" ? styles.slotSelected : "",
                        state === "unavailable" ? styles.slotUnavailable : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      isDisabled={slot.state === "unavailable"}
                      key={slot.id}
                      size="sm"
                      variant="ghost"
                      onPress={() => setSelectedSlotId(slot.id)}
                    >
                      {slot.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <SectionTitle>{t("experienceTitle")}</SectionTitle>
        <Typography className={styles.bodyText} type="body-sm">
          {coach.tagline}
        </Typography>
        <div className={styles.timeline}>
          {coach.clubs.slice(0, 3).map((club, index) => (
            <div className={styles.timelineItem} key={club.id}>
              {index < Math.min(coach.clubs.length, 3) - 1 ? (
                <span aria-hidden className={styles.timelineRail} />
              ) : null}
              <span aria-hidden className={styles.timelineDot} />
              <div className={styles.timelineBody}>
                <Typography
                  className={styles.timelineTitle}
                  type="body-sm"
                  weight="semibold"
                >
                  {club.title}
                </Typography>
                {club.subtitle ? (
                  <Typography className={styles.timelineText} type="body-sm">
                    {club.subtitle}
                  </Typography>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {primaryClub ? (
        <div className={styles.section}>
          <SectionTitle>{t("preferredLocationTitle")}</SectionTitle>
          <div className={styles.locationCard}>
            <div className="flex items-start gap-2">
              <MapPin1 aria-hidden className="mt-0.5 shrink-0 text-accent" size={18} />
              <div className="min-w-0 flex-1">
                <Typography type="body" weight="semibold">
                  {primaryClub.title}
                </Typography>
                <Typography className={styles.bodyText} type="body-sm">
                  {primaryClub.subtitle ?? coach.location}
                </Typography>
                <Button
                  className={styles.locationLink}
                  size="sm"
                  variant="ghost"
                  onPress={() =>
                    router.push(`/discovery/clubs/${primaryClub.id}`)
                  }
                >
                  {t("getDirections")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className={styles.section}>
        <SectionTitle>{t("cancellationTitle")}</SectionTitle>
        <ClubCancellationPolicy
          activeIndex={1}
          steps={[
            {
              id: "free",
              color: "success",
              title: t("cancellationStep1Title"),
              description: t("cancellationStep1Description"),
            },
            {
              id: "partial",
              color: "warning",
              title: t("cancellationStep2Title"),
              description: t("cancellationStep2Description"),
            },
            {
              id: "late",
              color: "danger",
              title: t("cancellationStep3Title"),
              description: t("cancellationStep3Description"),
            },
            {
              id: "no-show",
              color: "accent",
              title: t("cancellationStep4Title"),
              description: t("cancellationStep4Description"),
            },
          ]}
        />
      </div>
    </section>
  );
}
