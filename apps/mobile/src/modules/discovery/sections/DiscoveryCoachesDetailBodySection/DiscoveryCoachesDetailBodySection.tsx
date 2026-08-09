"use client";

import {
  Button,
  Label,
  Radio,
  RadioGroup,
  Typography,
} from "@heroui/react";
import { BarbellHorizontal } from "@repo/icons/BarbellHorizontal";
import { Building2 } from "@repo/icons/Building2";
import { Calendar1 } from "@repo/icons/Calendar1";
import { Check } from "@repo/icons/Check";
import { ListTwoCheck } from "@repo/icons/ListTwoCheck";
import { Medal } from "@repo/icons/Medal";
import { Sparkle1 } from "@repo/icons/Sparkle1";
import { StarFull } from "@repo/icons/StarFull";
import { Target1 } from "@repo/icons/Target1";
import { UsersThree } from "@repo/icons/UsersThree";
import { UsersTwo } from "@repo/icons/UsersTwo";
import { Video } from "@repo/icons/Video";
import { Weight } from "@repo/icons/Weight";
import { ClubAmenityCard } from "@repo/ui/cards/ClubAmenityCard";
import { ClubBranchCard } from "@repo/ui/cards/ClubBranchCard";
import { ClubCancellationPolicy } from "@repo/ui/cards/ClubCancellationPolicy";
import { ClubSubscriptionCard } from "@repo/ui/cards/ClubSubscriptionCard";
import { CoachFeatureCard } from "@repo/ui/cards/CoachFeatureCard";
import { ReviewCard } from "@repo/ui/cards/ReviewCard";
import { SportCard } from "@repo/ui/cards/SportCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { CarouselNavigation } from "@repo/ui/kit/CarouselNavigation";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  CoachDetailClub,
  CoachDetailPackage,
  CoachDetailRelated,
  CoachDetailReview,
  CoachDetailService,
  CoachDetailServiceIconKey,
  CoachDetailSpecialty,
  CoachDetailStat,
  CoachDetailStatKey,
} from "../../lib/coach-detail-data";
import { getClubDetail } from "../../lib/club-detail-data";
import { DiscoveryClubsDetailCalendarSection } from "../DiscoveryClubsDetailCalendarSection";
import { DiscoveryGallerySection } from "../DiscoveryGallerySection";
import { discoveryCoachesDetailBodySectionStyles as styles } from "./DiscoveryCoachesDetailBodySection.styles";
import type { DiscoveryCoachesDetailBodySectionProps } from "./DiscoveryCoachesDetailBodySection.types";

const SECTION_TITLE_ICON_SIZE = 18;
const REVIEW_PREVIEW_COUNT = 5;

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
  online: <Video size={36} />,
  inPerson: <BarbellHorizontal size={36} />,
  nutrition: <Weight size={36} />,
  program: <ListTwoCheck size={36} />,
  assessment: <Medal size={36} />,
  group: <UsersTwo size={36} />,
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

function SectionTitle({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className={styles.sectionTitleRow}>
      {icon ? (
        <span aria-hidden className={styles.sectionTitleIcon}>
          {icon}
        </span>
      ) : null}
      <Typography className={styles.sectionTitle} type="h4" weight="semibold">
        {children}
      </Typography>
    </div>
  );
}

function SectionCarousel({
  title,
  icon,
  "aria-label": ariaLabel,
  action,
  children,
}: {
  title: ReactNode;
  icon?: ReactNode;
  "aria-label": string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    direction: "rtl",
  });

  return (
    <>
      <div className={styles.sectionHeader}>
        <SectionTitle icon={icon}>{title}</SectionTitle>
        <div className={styles.sectionHeaderAside}>
          {action}
          <CarouselNavigation emblaApi={emblaApi} size="sm" />
        </div>
      </div>
      <div
        aria-label={ariaLabel}
        aria-roledescription="carousel"
        className={styles.carousel}
        ref={emblaRef}
      >
        <div className={styles.carouselTrack}>{children}</div>
      </div>
    </>
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
          variant={isExpanded ? "tertiary" : "secondary"}
        >
          {isExpanded ? t("seeLess") : t("seeMore")}
        </Button>
      </div>
    </div>
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

function ServicesSection({ services }: { services: CoachDetailService[] }) {
  const t = useTranslations("CoachDetail");
  if (services.length === 0) return null;

  return (
    <div className={styles.section}>
      <SectionCarousel
        aria-label={t("servicesTitle")}
        icon={<Sparkle1 size={SECTION_TITLE_ICON_SIZE} />}
        title={t("servicesTitle")}
      >
        {services.map((service) => (
          <div className={styles.amenitySlide} key={service.id}>
            <ClubAmenityCard
              className={styles.amenityCard}
              icon={SERVICE_ICONS[service.iconKey]}
              subtitle={service.subtitle}
              title={service.title}
            />
          </div>
        ))}
      </SectionCarousel>
    </div>
  );
}

function SpecialtiesSection({
  specialties,
}: {
  specialties: CoachDetailSpecialty[];
}) {
  const t = useTranslations("CoachDetail");
  if (specialties.length === 0) return null;

  return (
    <div className={styles.section}>
      <SectionCarousel
        aria-label={t("specialtiesTitle")}
        icon={<Target1 size={SECTION_TITLE_ICON_SIZE} />}
        title={t("specialtiesTitle")}
      >
        {specialties.map((specialty) => (
          <div className={styles.slide} key={specialty.id}>
            <SportCard
              actionLabel={t("specialtyAction")}
              color={specialty.color}
              size="sm"
              sport={{
                title: specialty.title,
                subtitle: specialty.subtitle,
                backgroundImage: specialty.backgroundImage,
              }}
            />
          </div>
        ))}
      </SectionCarousel>
    </div>
  );
}

function ClubsSection({ clubs }: { clubs: CoachDetailClub[] }) {
  const t = useTranslations("CoachDetail");
  const router = useRouter();
  if (clubs.length === 0) return null;

  return (
    <div className={styles.section}>
      <SectionCarousel
        aria-label={t("clubsTitle")}
        icon={<Building2 size={SECTION_TITLE_ICON_SIZE} />}
        title={t("clubsTitle")}
      >
        {clubs.map((club) => (
          <div className={styles.branchSlide} key={club.id}>
            <ClubBranchCard
              actionLabel={t("clubAction")}
              image={club.image || PLACEHOLDER_IMAGE}
              imageAlt={club.title}
              onAction={() => router.push(`/discovery/clubs/${club.id}`)}
              size="md"
              subtitle={club.subtitle}
              title={club.title}
            />
          </div>
        ))}
      </SectionCarousel>
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
                  priceSuffix={
                    plan.planNameKey === "packageMonthly"
                      ? t("packagePriceSuffixMonthly")
                      : plan.planNameKey === "packageTrial"
                        ? ""
                        : t("packagePriceSuffix")
                  }
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

function ReviewsPreviewSection({ reviews }: { reviews: CoachDetailReview[] }) {
  const t = useTranslations("CoachDetail");
  const preview = reviews.slice(0, REVIEW_PREVIEW_COUNT);
  if (preview.length === 0) return null;

  return (
    <div className={styles.section}>
      <SectionCarousel
        aria-label={t("reviewsPreviewTitle")}
        icon={<StarFull size={SECTION_TITLE_ICON_SIZE} />}
        title={t("reviewsPreviewTitle")}
      >
        {preview.map((review) => (
          <div className={styles.reviewSlide} key={review.id}>
            <ReviewCard
              avatar={review.avatar}
              avatarAlt={review.title}
              avatarFallback={review.avatarFallback}
              className={styles.reviewCard}
              content={review.content}
              date={review.date}
              dislikeLabel={t("reviewDislike")}
              isVerified={review.isVerified}
              likeLabel={t("reviewLike")}
              rating={review.rating}
              reportLabel={t("reviewReport")}
              title={review.title}
              verifiedLabel={t("reviewVerified")}
            />
          </div>
        ))}
      </SectionCarousel>
    </div>
  );
}

function RelatedCoachesSection({
  coaches,
}: {
  coaches: CoachDetailRelated[];
}) {
  const t = useTranslations("CoachDetail");
  const router = useRouter();
  if (coaches.length === 0) return null;

  return (
    <div className={styles.section}>
      <SectionCarousel
        aria-label={t("relatedTitle")}
        icon={<UsersThree size={SECTION_TITLE_ICON_SIZE} />}
        title={t("relatedTitle")}
      >
        {coaches.map((coach) => (
          <div className={styles.coachSlide} key={coach.id}>
            <CoachFeatureCard
              className={styles.coachCard}
              experienceLabel={
                coach.yearsExperience > 0
                  ? t("yearsExperience", { count: coach.yearsExperience })
                  : undefined
              }
              image={coach.image || PLACEHOLDER_IMAGE}
              imageAlt={coach.name}
              onPress={() => router.push(`/discovery/coaches/${coach.id}`)}
              rating={coach.rating}
              specialty={coach.specialty}
              title={coach.name}
            />
          </div>
        ))}
      </SectionCarousel>
    </div>
  );
}

export function DiscoveryCoachesDetailBodySection({
  coach,
  selectedPackageId,
  onPackageChange,
}: DiscoveryCoachesDetailBodySectionProps) {
  const t = useTranslations("CoachDetail");
  const partnerClubId = coach.clubs[0]?.id ?? "heavenly";
  const club = getClubDetail(partnerClubId);

  return (
    <section className={styles.root}>
      <CoachStatsBar stats={coach.stats} />

      {coach.overview ? (
        <div className={styles.section}>
          <SectionTitle>{t("description")}</SectionTitle>
          <DescriptionDisclosure text={coach.overview} />
        </div>
      ) : null}

      <ServicesSection services={coach.services} />
      <SpecialtiesSection specialties={coach.specialties} />

      <DiscoveryGallerySection
        gallery={coach.gallery}
        labels={{
          title: t("galleryTitle"),
          seeAll: t("seeAllGallery"),
          action: t("galleryAction"),
          newBadge: t("galleryNew"),
          close: t("closeGallery"),
          favorite: t("favorite"),
          prev: t("galleryPrev"),
          next: t("galleryNext"),
          selectImage: (index) => t("selectImage", { index }),
        }}
      />

      <ClubsSection clubs={coach.clubs} />

      {club ? (
        <div className={styles.section}>
          <DiscoveryClubsDetailCalendarSection
            club={club}
            coachId={coach.id}
            seeAllHref={`/discovery/clubs/${club.id}/slots`}
            title={t("calendarTitle")}
          />
        </div>
      ) : null}

      <PackagesSection
        onChange={onPackageChange}
        plans={coach.packages}
        selectedId={selectedPackageId}
      />

      <div className={styles.section}>
        <SectionTitle icon={<Calendar1 size={SECTION_TITLE_ICON_SIZE} />}>
          {t("cancellationTitle")}
        </SectionTitle>
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

      <ReviewsPreviewSection reviews={coach.reviews} />
      <RelatedCoachesSection coaches={coach.related} />
    </section>
  );
}
