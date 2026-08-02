"use client";

import {
  Button,
  Drawer,
  Label,
  Radio,
  RadioGroup,
  Typography,
} from "@heroui/react";
import { ArrowUpRight } from "@repo/icons/ArrowUpRight";
import { BarbellHorizontal } from "@repo/icons/BarbellHorizontal";
import { Check } from "@repo/icons/Check";
import { Clock } from "@repo/icons/Clock";
import { ListTwoCheck } from "@repo/icons/ListTwoCheck";
import { StarFull } from "@repo/icons/StarFull";
import { Treadmill } from "@repo/icons/Treadmill";
import { Weight } from "@repo/icons/Weight";
import { ClubBranchCard } from "@repo/ui/cards/ClubBranchCard";
import { ClubCancellationPolicy } from "@repo/ui/cards/ClubCancellationPolicy";
import { ClubClassCard } from "@repo/ui/cards/ClubClassCard";
import { ClubEquipmentCard } from "@repo/ui/cards/ClubEquipmentCard";
import { ClubLocationCard } from "@repo/ui/cards/ClubLocationCard";
import { ClubSubscriptionCard } from "@repo/ui/cards/ClubSubscriptionCard";
import { ReviewCard } from "@repo/ui/cards/ReviewCard";
import { SocialMediaCard } from "@repo/ui/cards/SocialMediaCard";
import { SportCard } from "@repo/ui/cards/SportCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { AreaLineChart } from "@repo/ui/kit/AreaLineChart";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  ClubDetailEquipment,
  ClubDetailStat,
  ClubDetailStatKey,
  ClubDetailSubscription,
} from "../../lib/club-detail-data";
import { discoveryClubsDetailBodySectionStyles as styles } from "./DiscoveryClubsDetailBodySection.styles";
import type { DiscoveryClubsDetailBodySectionProps } from "./DiscoveryClubsDetailBodySection.types";

function formatPlanPrice(price: number) {
  return price.toLocaleString("fa-IR");
}

const EQUIPMENT_PREVIEW_COUNT = 5;
const CLASS_PREVIEW_COUNT = 5;
const REVIEW_PREVIEW_COUNT = 5;

const STAT_LABEL_KEYS = {
  minutes: "statMinutes",
  score: "statScore",
  tasks: "statTasks",
} as const satisfies Record<
  ClubDetailStatKey,
  "statMinutes" | "statScore" | "statTasks"
>;

function StatIcon({ labelKey }: { labelKey: ClubDetailStatKey }) {
  if (labelKey === "minutes") {
    return (
      <Clock
        aria-hidden
        className={[styles.statIcon, styles.statIconMuted].join(" ")}
        size={14}
      />
    );
  }
  if (labelKey === "score") {
    return (
      <StarFull
        aria-hidden
        className={[styles.statIcon, styles.statIconScore].join(" ")}
        size={14}
      />
    );
  }
  return (
    <ListTwoCheck
      aria-hidden
      className={[styles.statIcon, styles.statIconTasks].join(" ")}
      size={14}
    />
  );
}

function ClubStatsBar({ stats }: { stats: ClubDetailStat[] }) {
  const t = useTranslations("ClubDetail");

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

const EQUIPMENT_ICONS: Record<string, ReactNode> = {
  treadmill: <Treadmill size={20} />,
  rack: <BarbellHorizontal size={20} />,
  dumbbell: <Weight size={20} />,
  bench: <BarbellHorizontal size={20} />,
};

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Typography className={styles.sectionTitle} type="h4" weight="semibold">
      {children}
    </Typography>
  );
}

function DescriptionDisclosure({ text }: { text: string }) {
  const t = useTranslations("ClubDetail");
  const [isExpanded, setIsExpanded] = useState(false);
  /** Optimistic clamp until measured — avoids flashing full long copy. */
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
          variant={isExpanded ? "tertiary" : "secondary"}
        >
          {isExpanded ? t("seeLess") : t("seeMore")}
        </Button>
      </div>
    </div>
  );
}

function EquipmentSection({
  equipment,
}: {
  equipment: ClubDetailEquipment[];
}) {
  const t = useTranslations("ClubDetail");
  const [isOpen, setIsOpen] = useState(false);
  const hasMore = equipment.length > EQUIPMENT_PREVIEW_COUNT;
  const preview = hasMore
    ? equipment.slice(0, EQUIPMENT_PREVIEW_COUNT)
    : equipment;

  return (
    <div className={styles.section}>
      <SectionTitle>{t("equipmentTitle")}</SectionTitle>
      <div className={[styles.carousel, styles.carouselBleed].join(" ")}>
        {preview.map((item) => (
          <div className={styles.slide} key={item.id}>
            <ClubEquipmentCard
              icon={EQUIPMENT_ICONS[item.id]}
              meta={item.meta}
              subtitle={item.subtitle}
              title={item.title}
            />
          </div>
        ))}

        {hasMore ? (
          <Button
            className={styles.equipmentSeeAll}
            onPress={() => setIsOpen(true)}
            variant="secondary"
          >
            <ArrowUpRight size={20} />
            <span className={styles.seeAllLabel}>{t("seeMore")}</span>
          </Button>
        ) : null}
      </div>

      <Drawer.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
        <Drawer.Content placement="bottom">
          <Drawer.Dialog>
            <Drawer.Handle />
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading>{t("equipmentTitle")}</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body>
              <div className={styles.equipmentDrawerList}>
                <div className={styles.equipmentGrid}>
                  {equipment.map((item) => (
                    <ClubEquipmentCard
                      icon={EQUIPMENT_ICONS[item.id]}
                      key={item.id}
                      meta={item.meta}
                      subtitle={item.subtitle}
                      title={item.title}
                    />
                  ))}
                </div>
              </div>
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </div>
  );
}

function SubscriptionsSection({
  plans,
  selectedId,
  onChange,
}: {
  plans: ClubDetailSubscription[];
  selectedId: string;
  onChange: (planId: string) => void;
}) {
  const t = useTranslations("ClubDetail");

  if (plans.length === 0) return null;

  return (
    <div className={styles.section}>
      <SectionTitle>{t("subscriptionsTitle")}</SectionTitle>
      <RadioGroup
        aria-label={t("subscriptionsLabel")}
        className={styles.subscriptionGroup}
        name="club-subscription"
        onChange={onChange}
        value={selectedId}
        variant="secondary"
      >
        <Label className="sr-only">{t("subscriptionsLabel")}</Label>
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
                      ? t("planBadgeOff", { value: plan.badge })
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
                  priceSuffix={t("planPriceSuffix")}
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

export function DiscoveryClubsDetailBodySection({
  club,
  selectedSubscriptionId,
  onSubscriptionChange,
}: DiscoveryClubsDetailBodySectionProps) {
  const t = useTranslations("ClubDetail");
  const router = useRouter();

  const classes = club.classes;
  const visibleClasses = classes.slice(0, CLASS_PREVIEW_COUNT);
  const visibleReviews = club.reviews.slice(0, REVIEW_PREVIEW_COUNT);
  const sportsPath = `/discovery/clubs/${club.id}/sports`;
  const branchesPath = `/discovery/clubs/${club.id}/branches`;
  const classesPath = `/discovery/clubs/${club.id}/classes`;
  const reviewsPath = `/discovery/clubs/${club.id}/reviews`;

  return (
    <section className={styles.root}>
      <ClubStatsBar stats={club.stats} />

      <div className={styles.section}>
        <SectionTitle>{t("description")}</SectionTitle>
        <DescriptionDisclosure text={club.overview} />
      </div>

      <SubscriptionsSection
        onChange={onSubscriptionChange}
        plans={club.subscriptions}
        selectedId={selectedSubscriptionId}
      />

      <div className={styles.section}>
        <SectionTitle>{t("cancellationTitle")}</SectionTitle>
        <ClubCancellationPolicy
          activeIndex={2}
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

      {club.sports.length > 0 ? (
        <div className={styles.section}>
          <SectionTitle>{t("sportsTitle")}</SectionTitle>
          <div className={[styles.carousel, styles.carouselBleed].join(" ")}>
            {club.sports.map((sport) => (
              <div className={styles.slide} key={sport.id}>
                <SportCard
                  actionLabel={t("sportAction")}
                  color={sport.color}
                  size="md"
                  sport={{
                    title: sport.title,
                    subtitle: sport.subtitle,
                    backgroundImage: sport.backgroundImage,
                  }}
                />
              </div>
            ))}
            <Button
              className={styles.sportSeeAll}
              onPress={() => router.push(sportsPath)}
              variant="secondary"
            >
              <ArrowUpRight size={22} />
              <span className={styles.classSeeAllLabel}>{t("seeAllSports")}</span>
            </Button>
          </div>
        </div>
      ) : null}

      {club.equipment.length > 0 ? (
        <EquipmentSection equipment={club.equipment} />
      ) : null}

      {club.busyHours.length > 0 ? (
        <div className={styles.section}>
          <SectionTitle>{t("busyHoursTitle")}</SectionTitle>
          <div className={styles.busyHoursChart}>
            <AreaLineChart
              aria-label={t("busyHoursChartLabel")}
              color="var(--success)"
              data={club.busyHours}
            />
          </div>
        </div>
      ) : null}

      <div className={styles.section}>
        <SectionTitle>{t("locationTitle")}</SectionTitle>
        <ClubLocationCard
          actionLabel={t("locationAction")}
          calories={club.locationCard.calories}
          distanceLabel={club.locationCard.distanceLabel}
          duration={club.locationCard.duration}
          endLabel={club.locationCard.endLabel}
          route={club.locationCard.route}
          startLabel={club.locationCard.startLabel}
          title={club.locationCard.title}
        />
      </div>

      {club.branches.length > 0 ? (
        <div className={styles.section}>
          <SectionTitle>{t("branchesTitle")}</SectionTitle>
          <div className={[styles.carousel, styles.carouselBleed].join(" ")}>
            {club.branches.map((branch) => (
              <div className={styles.slide} key={branch.id}>
                <ClubBranchCard
                  actionLabel={t("branchAction")}
                  image={branch.image || PLACEHOLDER_IMAGE}
                  imageAlt={branch.title}
                  size="md"
                  subtitle={branch.subtitle}
                  title={branch.title}
                />
              </div>
            ))}
            <Button
              className={styles.branchSeeAll}
              onPress={() => router.push(branchesPath)}
              variant="secondary"
            >
              <ArrowUpRight size={22} />
              <span className={styles.classSeeAllLabel}>{t("seeAllBranches")}</span>
            </Button>
          </div>
        </div>
      ) : null}

      {visibleClasses.length > 0 ? (
        <div className={styles.section}>
          <SectionTitle>{t("classesTitle")}</SectionTitle>
          <div className={[styles.carousel, styles.carouselBleed].join(" ")}>
            {visibleClasses.map((item) => {
              const href = `/discovery/clubs/${club.id}/classes/${item.id}`;
              return (
                <div
                  className={[styles.slide, "cursor-pointer"].join(" ")}
                  key={item.id}
                  onClick={() => router.push(href)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(href);
                    }
                  }}
                  role="link"
                  tabIndex={0}
                >
                  <ClubClassCard
                    actionLabel={t("classAction")}
                    author={item.author}
                    backgroundImage={item.backgroundImage}
                    category={item.category}
                    date={item.date}
                    duration={item.duration}
                    onAction={() => router.push(href)}
                    size="md"
                    title={item.title}
                  />
                </div>
              );
            })}

            <Button
              className={styles.classSeeAll}
              onPress={() => router.push(classesPath)}
              variant="secondary"
            >
              <ArrowUpRight size={22} />
              <span className={styles.classSeeAllLabel}>{t("seeAllClasses")}</span>
            </Button>
          </div>
        </div>
      ) : null}

      {visibleReviews.length > 0 ? (
        <div className={styles.section}>
          <SectionTitle>{t("reviewsTitle")}</SectionTitle>
          <div className={styles.reviewsList}>
            {visibleReviews.map((review) => (
              <ReviewCard
                avatar={review.avatar}
                avatarAlt={review.title}
                avatarFallback={review.avatarFallback}
                className={styles.reviewCard}
                content={review.content}
                date={review.date}
                dislikeLabel={t("reviewDislike")}
                isVerified={review.isVerified}
                key={review.id}
                likeLabel={t("reviewLike")}
                rating={review.rating}
                reportLabel={t("reviewReport")}
                title={review.title}
                verifiedLabel={t("reviewVerified")}
              />
            ))}

            <div className={styles.reviewsSeeAllFade}>
              <Button
                className={styles.reviewsSeeAllTrigger}
                onPress={() => router.push(reviewsPath)}
                size="sm"
                variant="secondary"
              >
                {t("seeAllReviews")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className={styles.section}>
        <SocialMediaCard
          facebookLabel={t("socialFacebook")}
          instagramLabel={t("socialInstagram")}
          linkedinLabel={t("socialLinkedIn")}
          title={t("socialTitle")}
        />
      </div>
    </section>
  );
}
