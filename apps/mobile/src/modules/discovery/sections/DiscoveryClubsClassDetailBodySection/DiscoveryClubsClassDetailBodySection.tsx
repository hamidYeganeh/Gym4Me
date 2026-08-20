"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Drawer } from "@heroui/react/drawer";
import { Link } from "@heroui/react/link";
import { ScrollShadow } from "@heroui/react/scroll-shadow";
import { Typography } from "@heroui/react/typography";
import { ArrowUpRight } from "@repo/icons/ArrowUpRight";
import { BarbellHorizontal } from "@repo/icons/BarbellHorizontal";
import { Calendar1 } from "@repo/icons/Calendar1";
import { CheckCircle } from "@repo/icons/CheckCircle";
import { Clock } from "@repo/icons/Clock";
import { Fire1 } from "@repo/icons/Fire1";
import { Kettlebell } from "@repo/icons/Kettlebell";
import { Lock1 } from "@repo/icons/Lock1";
import { Shower1 } from "@repo/icons/Shower1";
import { Snowflake1 } from "@repo/icons/Snowflake1";
import { Sparkle1 } from "@repo/icons/Sparkle1";
import { Target1 } from "@repo/icons/Target1";
import { ThumbsUp } from "@repo/icons/ThumbsUp";
import { UsersThree } from "@repo/icons/UsersThree";
import { WaterBottle1 } from "@repo/icons/WaterBottle1";
import { Weight } from "@repo/icons/Weight";
import { WifiHigh } from "@repo/icons/WifiHigh";
import { ClubAmenityCard } from "@repo/ui/cards/ClubAmenityCard";
import { ClubEquipmentCard } from "@repo/ui/cards/ClubEquipmentCard";
import { CoachFeatureCard } from "@repo/ui/cards/CoachFeatureCard";
import { SportCard } from "@repo/ui/cards/SportCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { emblaFreeOptions } from "@repo/ui/lib/embla";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "@/shared/lib/app-router";

import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ClassDetailInstruction } from "../../lib/class-detail-data";
import {
  getClubDetail,
  type ClubDetailAmenity,
  type ClubDetailAmenityIconKey,
  type ClubDetailCoach,
  type ClubDetailEquipment,
  type ClubDetailSport,
} from "../../lib/club-detail-data";
import { DiscoveryClubsDetailCalendarSection } from "../DiscoveryClubsDetailCalendarSection";
import { DiscoveryGallerySection } from "../DiscoveryGallerySection";
import { discoveryClubsClassDetailBodySectionStyles as styles } from "./DiscoveryClubsClassDetailBodySection.styles";
import type { DiscoveryClubsClassDetailBodySectionProps } from "./DiscoveryClubsClassDetailBodySection.types";

const SECTION_TITLE_ICON_SIZE = 18;
const EQUIPMENT_PREVIEW_COUNT = 4;

const EQUIPMENT_ICONS: Record<string, ReactNode> = {
  mat: <BarbellHorizontal size={20} />,
  rope: <BarbellHorizontal size={20} />,
  kettlebell: <Kettlebell size={20} />,
  bike: <Weight size={20} />,
  rack: <BarbellHorizontal size={20} />,
  dumbbell: <Weight size={20} />,
  bench: <BarbellHorizontal size={20} />,
  barbell: <BarbellHorizontal size={20} />,
  water: <WaterBottle1 size={20} />,
  towel: <Sparkle1 size={20} />,
};

const AMENITY_ICONS: Record<ClubDetailAmenityIconKey, ReactNode> = {
  wifi: <WifiHigh size={48} />,
  parking: <Sparkle1 size={48} />,
  shower: <Shower1 size={48} />,
  locker: <Lock1 size={48} />,
  ac: <Snowflake1 size={48} />,
  cafe: <Sparkle1 size={48} />,
};

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

function SectionHeader({
  title,
  icon,
  seeAllLabel,
  onSeeAll,
}: {
  title: string;
  icon?: ReactNode;
  seeAllLabel: string;
  onSeeAll?: () => void;
}) {
  return (
    <div className={styles.sectionHeader}>
      <SectionTitle icon={icon}>{title}</SectionTitle>
      <Link className={styles.seeAll} onPress={onSeeAll}>
        {seeAllLabel}
      </Link>
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
  const [emblaRef] = useEmblaCarousel(
    emblaFreeOptions({
      direction: "rtl",
    }),
  );

  return (
    <>
      <div className={styles.sectionHeader}>
        <SectionTitle icon={icon}>{title}</SectionTitle>
        {action ? (
          <div className={styles.sectionHeaderAside}>{action}</div>
        ) : null}
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
  const t = useTranslations("ClubClassDetail");
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

function SessionsKnobChart({
  passed,
  total,
  caption,
  unit,
}: {
  passed: number;
  total: number;
  caption: string;
  unit: string;
}) {
  const safeTotal = Math.max(0, total);
  const safePassed = Math.min(Math.max(0, passed), safeTotal);
  const clamped = safeTotal > 0 ? safePassed / safeTotal : 0;
  const radius = 88;
  const stroke = 14;
  const knobR = 9;
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
  const range = `${safePassed.toLocaleString("fa-IR")} / ${safeTotal.toLocaleString("fa-IR")}`;

  return (
    <div className={styles.gaugeWrap}>
      <div className={styles.gaugeFrame}>
        <svg aria-hidden className={styles.gaugeSvg} viewBox="0 0 220 120">
          <path
            d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${trackEnd.x} ${trackEnd.y}`}
            fill="none"
            stroke="var(--border)"
            strokeLinecap="round"
            strokeWidth={stroke}
          />
          {clamped > 0 ? (
            <>
              <path
                d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`}
                fill="none"
                stroke="var(--accent)"
                strokeLinecap="round"
                strokeWidth={stroke}
              />
              <circle
                cx={start.x}
                cy={start.y}
                fill="var(--accent)"
                r={knobR}
              />
              <circle cx={end.x} cy={end.y} fill="var(--accent)" r={knobR} />
            </>
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
              {!isLast ? (
                <span aria-hidden className={styles.timelineRail} />
              ) : null}
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

function CoachesSection({ coaches }: { coaches: ClubDetailCoach[] }) {
  const t = useTranslations("ClubClassDetail");
  const router = useRouter();

  if (coaches.length === 0) return null;

  return (
    <div className={styles.section}>
      <SectionCarousel
        aria-label={t("coachesTitle")}
        icon={<UsersThree size={SECTION_TITLE_ICON_SIZE} />}
        title={t("coachesTitle")}
      >
        {coaches.map((coach) => (
          <div className={styles.coachSlide} key={coach.id}>
            <CoachFeatureCard
              certifiedLabel={
                coach.isCertified ? t("coachCertified") : undefined
              }
              className={styles.coachCard}
              experienceLabel={
                coach.yearsExperience != null
                  ? t("coachYoe", { years: coach.yearsExperience })
                  : undefined
              }
              image={coach.image || PLACEHOLDER_IMAGE}
              imageAlt={coach.name}
              isNew={coach.isNew}
              newLabel={t("coachNew")}
              onPress={() => router.push(`/discovery/coaches/${coach.id}`)}
              rating={coach.rating}
              ratingCount={coach.ratingCount}
              specialty={coach.specialtyLabel}
              title={coach.name}
            />
          </div>
        ))}
      </SectionCarousel>
    </div>
  );
}

function EquipmentSection({ equipment }: { equipment: ClubDetailEquipment[] }) {
  const t = useTranslations("ClubClassDetail");
  const [isOpen, setIsOpen] = useState(false);
  const hasMore = equipment.length > EQUIPMENT_PREVIEW_COUNT;
  const preview = hasMore
    ? equipment.slice(0, EQUIPMENT_PREVIEW_COUNT)
    : equipment;

  if (equipment.length === 0) return null;

  return (
    <div className={styles.section}>
      <SectionCarousel
        aria-label={t("equipmentTitle")}
        icon={<BarbellHorizontal size={SECTION_TITLE_ICON_SIZE} />}
        title={t("equipmentTitle")}
      >
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
            <span className={styles.seeAllLabel}>{t("seeAllEquipment")}</span>
          </Button>
        ) : null}
      </SectionCarousel>

      <Drawer.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
        <Drawer.Content placement="bottom">
          <Drawer.Dialog>
            <Drawer.Handle />
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading>{t("equipmentTitle")}</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className={styles.equipmentDrawerBody}>
              <ScrollShadow
                className={styles.equipmentDrawerScroll}
                hideScrollBar
                orientation="vertical"
                size={56}
              >
                <div className={styles.equipmentDrawerList}>
                  {equipment.map((item) => (
                    <ClubEquipmentCard
                      icon={EQUIPMENT_ICONS[item.id]}
                      key={item.id}
                      meta={item.meta}
                      orientation="horizontal"
                      subtitle={item.subtitle}
                      title={item.title}
                    />
                  ))}
                </div>
              </ScrollShadow>
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </div>
  );
}

function AmenitiesSection({ amenities }: { amenities: ClubDetailAmenity[] }) {
  const t = useTranslations("ClubClassDetail");

  if (amenities.length === 0) return null;

  return (
    <div className={styles.section}>
      <SectionCarousel
        aria-label={t("amenitiesTitle")}
        icon={<Sparkle1 size={SECTION_TITLE_ICON_SIZE} />}
        title={t("amenitiesTitle")}
      >
        {amenities.map((item) => (
          <div className={styles.amenitySlide} key={item.id}>
            <ClubAmenityCard
              className={styles.amenityCard}
              icon={AMENITY_ICONS[item.iconKey]}
              subtitle={item.subtitle}
              title={item.title}
            />
          </div>
        ))}
      </SectionCarousel>
    </div>
  );
}

function SportsSection({ sports }: { sports: ClubDetailSport[] }) {
  const t = useTranslations("ClubClassDetail");

  if (sports.length === 0) return null;

  return (
    <div className={styles.section}>
      <SectionCarousel
        aria-label={t("sportsTitle")}
        icon={<Target1 size={SECTION_TITLE_ICON_SIZE} />}
        title={t("sportsTitle")}
      >
        {sports.map((sport) => (
          <div className={styles.slide} key={sport.id}>
            <SportCard
              actionLabel={t("sportAction")}
              color={sport.color}
              size="sm"
              sport={{
                title: sport.title,
                subtitle: sport.subtitle,
                backgroundImage: sport.backgroundImage,
              }}
            />
          </div>
        ))}
      </SectionCarousel>
    </div>
  );
}

export function DiscoveryClubsClassDetailBodySection({
  classDetail,
}: DiscoveryClubsClassDetailBodySectionProps) {
  const t = useTranslations("ClubClassDetail");
  const club = getClubDetail(classDetail.clubId);

  return (
    <section className={styles.root}>
      {classDetail.description ? (
        <div className={styles.section}>
          <SectionTitle>{t("description")}</SectionTitle>
          <DescriptionDisclosure text={classDetail.description} />
        </div>
      ) : null}

      {classDetail.benefits.length > 0 ? (
        <div className={styles.section}>
          <SectionTitle icon={<Sparkle1 size={SECTION_TITLE_ICON_SIZE} />}>
            {t("benefits")}
          </SectionTitle>
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
      ) : null}

      {classDetail.tags.length > 0 ? (
        <div className={styles.section}>
          <SectionTitle>{t("tags")}</SectionTitle>
          <div className={styles.tags}>
            {classDetail.tags.map((tag) => (
              <Chip
                className={styles.tag}
                key={tag}
                size="sm"
                variant="secondary"
              >
                <Chip.Label>{tag}</Chip.Label>
              </Chip>
            ))}
          </div>
        </div>
      ) : null}

      <DiscoveryGallerySection
        gallery={classDetail.gallery}
        labels={{
          title: t("galleries"),
          seeAll: t("seeAll"),
          action: t("galleryAction"),
          newBadge: t("galleryNew"),
          close: t("closeGallery"),
          favorite: t("bookmark"),
          prev: t("galleryPrev"),
          next: t("galleryNext"),
          selectImage: (index) => t("selectImage", { index }),
        }}
      />

      <CoachesSection coaches={classDetail.coaches} />
      <EquipmentSection equipment={classDetail.equipment} />
      <AmenitiesSection amenities={classDetail.amenities} />
      <SportsSection sports={classDetail.sports} />

      {club ? (
        <div className={styles.section}>
          <DiscoveryClubsDetailCalendarSection
            classId={classDetail.id}
            club={club}
            seeAllHref={`/discovery/clubs/${classDetail.clubId}/slots`}
            title={t("calendarTitle")}
          />
        </div>
      ) : null}

      {classDetail.sessionProgress.total > 0 ? (
        <div className={styles.section}>
          <SectionTitle icon={<Calendar1 size={SECTION_TITLE_ICON_SIZE} />}>
            {t("sessionProgress")}
          </SectionTitle>
          <div className={styles.card}>
            <SessionsKnobChart
              caption={
                classDetail.sessionProgress.caption ||
                t("sessionsLeft", {
                  count: Math.max(
                    0,
                    classDetail.sessionProgress.total -
                      classDetail.sessionProgress.passed,
                  ).toLocaleString("fa-IR"),
                })
              }
              passed={classDetail.sessionProgress.passed}
              total={classDetail.sessionProgress.total}
              unit={t("sessionsUnit")}
            />
          </div>
        </div>
      ) : null}

      <div className={styles.section}>
        <SectionTitle icon={<ThumbsUp size={SECTION_TITLE_ICON_SIZE} />}>
          {t("intensityLevel")}
        </SectionTitle>
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
                <Typography className={styles.intensityLabel} type="body-sm">
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

      {classDetail.instructions.length > 0 ? (
        <div className={styles.section}>
          <SectionTitle icon={<Target1 size={SECTION_TITLE_ICON_SIZE} />}>
            {t("instructions")}
          </SectionTitle>
          <InstructionList steps={classDetail.instructions} />
        </div>
      ) : null}

      {classDetail.planSteps.length > 0 ? (
        <div className={styles.section}>
          <SectionTitle>{t("planSteps")}</SectionTitle>
          <Typography className={styles.bodyText} type="body-sm">
            {t("planDescription")}
          </Typography>
          <InstructionList steps={classDetail.planSteps} />
        </div>
      ) : null}

      {classDetail.related.length > 0 ? (
        <div className={styles.section}>
          <SectionHeader
            icon={<Calendar1 size={SECTION_TITLE_ICON_SIZE} />}
            seeAllLabel={t("seeAll")}
            title={t("related")}
          />
          <div className={styles.related}>
            <div className={styles.relatedTrack}>
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
                    {item.caloriesLabel ? (
                      <span className={styles.relatedMetaItem}>
                        <Fire1
                          aria-hidden
                          className={styles.relatedMetaIcon}
                          size={14}
                        />
                        <Typography type="body-xs">
                          {item.caloriesLabel}
                        </Typography>
                      </span>
                    ) : null}
                  </div>
                </NextLink>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
