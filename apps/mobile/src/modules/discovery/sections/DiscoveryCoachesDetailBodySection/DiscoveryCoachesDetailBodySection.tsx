"use client";

import { Button } from "@heroui/react/button";
import { Link } from "@heroui/react/link";
import { Typography } from "@heroui/react/typography";
import { BarbellHorizontal } from "@repo/icons/BarbellHorizontal";
import { Building2 } from "@repo/icons/Building2";
import { Calendar1 } from "@repo/icons/Calendar1";
import { Clock } from "@repo/icons/Clock";
import { Handshake } from "@repo/icons/Handshake";
import { ListTwoCheck } from "@repo/icons/ListTwoCheck";
import { Medal } from "@repo/icons/Medal";
import { Sparkle1 } from "@repo/icons/Sparkle1";
import { StarFull } from "@repo/icons/StarFull";
import { Target1 } from "@repo/icons/Target1";
import { ThumbsUp } from "@repo/icons/ThumbsUp";
import { UsersThree } from "@repo/icons/UsersThree";
import { UsersTwo } from "@repo/icons/UsersTwo";
import { Video } from "@repo/icons/Video";
import { Weight } from "@repo/icons/Weight";
import { ClubAmenityCard } from "@repo/ui/cards/ClubAmenityCard";
import { ClubBranchCard } from "@repo/ui/cards/ClubBranchCard";
import { ClubCancellationPolicy } from "@repo/ui/cards/ClubCancellationPolicy";
import { CoachAvailabilitySlots } from "@repo/ui/cards/CoachAvailabilitySlots";
import { CoachConsultationType } from "@repo/ui/cards/CoachConsultationType";
import { CoachFeatureCard } from "@repo/ui/cards/CoachFeatureCard";
import { ReviewCard } from "@repo/ui/cards/ReviewCard";
import { ReviewSummaryCard } from "@repo/ui/cards/ReviewSummaryCard";
import { SocialMediaCard } from "@repo/ui/cards/SocialMediaCard";
import { SportCard } from "@repo/ui/cards/SportCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { swiperFreeOptions } from "@repo/ui/lib/swiper";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import {
  Children,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type {
  CoachDetailClub,
  CoachDetailConsultationType,
  CoachDetailRelated,
  CoachDetailReview,
  CoachDetailService,
  CoachDetailServiceIconKey,
  CoachDetailSpecialty,
  CoachDetailStat,
  CoachDetailStatKey,
} from "../../lib/coach-detail-data";
import { buildCoachReviewSummary } from "../../lib/coach-review-summary";
import { DiscoveryCoachesDetailExperienceSection } from "../DiscoveryCoachesDetailExperienceSection";
import { DiscoveryGallerySection } from "../DiscoveryGallerySection";
import { discoveryCoachesDetailBodySectionStyles as styles } from "./DiscoveryCoachesDetailBodySection.styles";
import type { DiscoveryCoachesDetailBodySectionProps } from "./DiscoveryCoachesDetailBodySection.types";

import "swiper/css";
import "swiper/css/free-mode";
const SECTION_TITLE_ICON_SIZE = 18;
const REVIEW_HIGHLIGHT_ICON_SIZE = 24;
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
  online: <Video size={48} />,
  inPerson: <BarbellHorizontal size={48} />,
  nutrition: <Weight size={48} />,
  program: <ListTwoCheck size={48} />,
  assessment: <Medal size={48} />,
  group: <UsersTwo size={48} />,
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
  return (
    <>
      <div className={styles.sectionHeader}>
        <SectionTitle icon={icon}>{title}</SectionTitle>
        {action ? (
          <div className={styles.sectionHeaderAside}>{action}</div>
        ) : null}
      </div>
      <Swiper
        {...swiperFreeOptions()} dir="rtl"
        aria-label={ariaLabel}
        aria-roledescription="carousel"
        className={styles.carousel}
        modules={[FreeMode]}
      >
        {Children.toArray(children).map((child, index) => (
          <SwiperSlide className={styles.swiperSlide} key={index}>
            {child}
          </SwiperSlide>
        ))}
      </Swiper>
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

function ConsultationTypesSection({
  options,
  selectedId,
  onChange,
}: {
  options: CoachDetailConsultationType[];
  selectedId?: string;
  onChange: (optionId: string) => void;
}) {
  const t = useTranslations("CoachDetail");
  if (options.length === 0) return null;

  return (
    <div className={styles.section}>
      <CoachConsultationType
        onOptionPress={(option) => onChange(option.id)}
        options={options.map((option) => ({
          id: option.id,
          kind: option.kind,
          title: t(option.titleKey),
          status: option.status,
          statusLabel: t(option.statusKey),
          pricePrefix: t("consultationPricePrefix"),
          price: formatPlanPrice(option.price),
          priceSuffix: t("consultationPriceSuffix"),
        }))}
        selectedId={selectedId}
        title={t("consultationTypeTitle")}
      />
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

function formatAverage(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatCount(value: number) {
  return value.toLocaleString("fa-IR");
}

function ReviewsPreviewSection({
  coachId,
  rating,
  ratingCount,
  reviews,
}: {
  coachId: string;
  rating: number;
  ratingCount: number;
  reviews: CoachDetailReview[];
}) {
  const t = useTranslations("CoachDetail");
  const router = useRouter();
  const preview = reviews.slice(0, REVIEW_PREVIEW_COUNT);
  if (preview.length === 0) return null;

  const summary = buildCoachReviewSummary(reviews, rating, ratingCount);
  const reviewsPath = `/discovery/coaches/${coachId}/reviews`;

  return (
    <div className={styles.section}>
      <ReviewSummaryCard
        average={formatAverage(summary.average)}
        averageLabel={t("avgRatingLabel")}
        buckets={summary.buckets}
        highlights={[
          {
            id: "recommended",
            icon: <ThumbsUp size={REVIEW_HIGHLIGHT_ICON_SIZE} />,
            title: t("reviewHighlightRecommendedTitle"),
            description: t("reviewHighlightRecommendedDescription"),
          },
          {
            id: "wait-time",
            icon: <Clock size={REVIEW_HIGHLIGHT_ICON_SIZE} />,
            title: t("reviewHighlightWaitTimeTitle"),
            description: t("reviewHighlightWaitTimeDescription"),
          },
          {
            id: "manner",
            icon: <Handshake size={REVIEW_HIGHLIGHT_ICON_SIZE} />,
            title: t("reviewHighlightMannerTitle"),
            description: t("reviewHighlightMannerDescription"),
          },
        ]}
        usersLabel={t("reviewUsers", {
          count: formatCount(summary.total || ratingCount),
        })}
      />

      <SectionCarousel
        action={
          <Link
            className={styles.seeAll}
            href={reviewsPath}
            onPress={() => router.push(reviewsPath)}
          >
            {t("seeAllReviews")}
          </Link>
        }
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
}: DiscoveryCoachesDetailBodySectionProps) {
  const t = useTranslations("CoachDetail");
  const router = useRouter();
  const defaultConsultationId =
    coach.consultationTypes.find((option) => option.status === "available")
      ?.id ?? coach.consultationTypes[0]?.id;
  const [selectedConsultationId, setSelectedConsultationId] = useState(
    defaultConsultationId,
  );
  const [selectedAvailabilitySlotId, setSelectedAvailabilitySlotId] = useState<
    string | undefined
  >(
    coach.availabilityDays
      .flatMap((day) => day.slots)
      .find((slot) => slot.status === "available")?.id,
  );

  const availabilityDays = useMemo(
    () =>
      coach.availabilityDays.map((day) => ({
        id: day.id,
        label:
          day.dayKey === "tomorrow" && day.dateLabel
            ? t("slotsTomorrowWithDate", { date: day.dateLabel })
            : day.dayKey === "tomorrow"
              ? t("slotsTomorrow")
              : t("slotsToday"),
        slots: day.slots,
      })),
    [coach.availabilityDays, t],
  );

  return (
    <section className={styles.root}>
      <CoachStatsBar stats={coach.stats} />

      {coach.overview ? (
        <div className={styles.section}>
          <SectionTitle>{t("description")}</SectionTitle>
          <DescriptionDisclosure text={coach.overview} />
        </div>
      ) : null}

      <DiscoveryCoachesDetailExperienceSection experience={coach.experience} />

      <ServicesSection services={coach.services} />
      <SpecialtiesSection specialties={coach.specialties} />

      <ConsultationTypesSection
        onChange={setSelectedConsultationId}
        options={coach.consultationTypes}
        selectedId={selectedConsultationId}
      />

      {availabilityDays.length > 0 ? (
        <div className={styles.section}>
          <CoachAvailabilitySlots
            availableLabel={t("slotAvailable")}
            days={availabilityDays}
            onSeeAll={() => {
              router.push(`/discovery/coaches/${coach.id}/slots`);
            }}
            onSlotPress={(slot) => setSelectedAvailabilitySlotId(slot.id)}
            seeAllLabel={t("seeAllAvailabilitySlots")}
            selectedSlotId={selectedAvailabilitySlotId}
            title={t("availabilitySlotsTitle")}
            unavailableLabel={t("slotUnavailable")}
          />
        </div>
      ) : null}

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

      <ReviewsPreviewSection
        coachId={coach.id}
        rating={coach.rating}
        ratingCount={coach.ratingCount}
        reviews={coach.reviews}
      />
      <RelatedCoachesSection coaches={coach.related} />

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
