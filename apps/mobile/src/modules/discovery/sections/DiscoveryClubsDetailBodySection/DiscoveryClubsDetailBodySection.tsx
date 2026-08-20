"use client";

import { Accordion } from "@heroui/react/accordion";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Drawer } from "@heroui/react/drawer";
import { Label } from "@heroui/react/label";
import { Radio } from "@heroui/react/radio";
import { RadioGroup } from "@heroui/react/radio-group";
import { ScrollShadow } from "@heroui/react/scroll-shadow";
import { Typography } from "@heroui/react/typography";
import { ArrowUpRight } from "@repo/icons/ArrowUpRight";
import { BarbellHorizontal } from "@repo/icons/BarbellHorizontal";
import { Briefcase1 } from "@repo/icons/Briefcase1";
import { Building2 } from "@repo/icons/Building2";
import { Calendar1 } from "@repo/icons/Calendar1";
import { Car1 } from "@repo/icons/Car1";
import { Check } from "@repo/icons/Check";
import { ChevronDown } from "@repo/icons/ChevronDown";
import { Coffee } from "@repo/icons/Coffee";
import { GenderMale } from "@repo/icons/GenderMale";
import { Lock1 } from "@repo/icons/Lock1";
import { Medal } from "@repo/icons/Medal";
import { PersonWheelchair } from "@repo/icons/PersonWheelchair";
import { Shower1 } from "@repo/icons/Shower1";
import { Snowflake1 } from "@repo/icons/Snowflake1";
import { Sparkle1 } from "@repo/icons/Sparkle1";
import { StarFull } from "@repo/icons/StarFull";
import { Target1 } from "@repo/icons/Target1";
import { Treadmill } from "@repo/icons/Treadmill";
import { UsersThree } from "@repo/icons/UsersThree";
import { Weight } from "@repo/icons/Weight";
import { WifiHigh } from "@repo/icons/WifiHigh";
import { useRouter } from "@/shared/lib/app-router";

import { AchievementTag } from "@repo/ui/cards/AchievementTag";
import { BusyHoursCard } from "@repo/ui/cards/BusyHoursCard";
import { ClubAmenityCard } from "@repo/ui/cards/ClubAmenityCard";
import { ClubBranchCard } from "@repo/ui/cards/ClubBranchCard";
import { ClubCancellationPolicy } from "@repo/ui/cards/ClubCancellationPolicy";
import { ClubClassCard } from "@repo/ui/cards/ClubClassCard";
import { ClubContactSection } from "@repo/ui/cards/ClubContactSection";
import { ClubEquipmentCard } from "@repo/ui/cards/ClubEquipmentCard";
import { ClubLocationCard } from "@repo/ui/cards/ClubLocationCard";
import { ClubOwnerCard } from "@repo/ui/cards/ClubOwnerCard";
import { ClubSubscriptionCard } from "@repo/ui/cards/ClubSubscriptionCard";
import { CoachFeatureCard } from "@repo/ui/cards/CoachFeatureCard";
import { ReviewCard } from "@repo/ui/cards/ReviewCard";
import { SocialMediaCard } from "@repo/ui/cards/SocialMediaCard";
import { SportCard } from "@repo/ui/cards/SportCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { emblaFreeOptions } from "@repo/ui/lib/embla";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { weekdayKey } from "../../lib/club-calendar-data";
import type {
  ClubDetailAmenity,
  ClubDetailAmenityIconKey,
  ClubDetailAudience,
  ClubDetailCoach,
  ClubDetailEquipment,
  ClubDetailFaq,
  ClubDetailLocation,
  ClubDetailOperatingHour,
  ClubDetailOwner,
  ClubDetailPhone,
  ClubDetailRule,
  ClubDetailStat,
  ClubDetailStatKey,
  ClubDetailSubscription,
} from "../../lib/club-detail-data";
import { DiscoveryClubsDetailCalendarSection } from "../DiscoveryClubsDetailCalendarSection";
import { DiscoveryGallerySection } from "../DiscoveryGallerySection";
import { discoveryClubsDetailBodySectionStyles as styles } from "./DiscoveryClubsDetailBodySection.styles";
import type { DiscoveryClubsDetailBodySectionProps } from "./DiscoveryClubsDetailBodySection.types";

function formatLocationAddress(location: ClubDetailLocation) {
  const parts = [
    location.province,
    location.city,
    location.neighborhood,
  ].filter(Boolean);
  if (parts.length > 0) return parts.join("، ");
  return location.address ?? "";
}

function formatPlanPrice(price: number) {
  return price.toLocaleString("fa-IR");
}

const EQUIPMENT_PREVIEW_COUNT = 4;
const CLASS_PREVIEW_COUNT = 5;
const REVIEW_PREVIEW_COUNT = 5;

const STAT_LABEL_KEYS = {
  distance: "statDistance",
  score: "statScore",
  students: "statStudents",
} as const satisfies Record<
  ClubDetailStatKey,
  "statDistance" | "statScore" | "statStudents"
>;

function ClubLocationStats({
  stats,
  isOpen,
  hoursLabel,
}: {
  stats: ClubDetailStat[];
  isOpen: boolean;
  hoursLabel: string;
}) {
  const t = useTranslations("ClubDetail");

  if (stats.length === 0) return null;

  return (
    <ClubLocationCard
      hoursLabel={hoursLabel || undefined}
      status={isOpen ? "open" : "closed"}
      statusLabel={isOpen ? t("openNow") : t("closedNow")}
      stats={stats.map((stat) => ({
        key: stat.labelKey,
        value: stat.value,
        label: t(STAT_LABEL_KEYS[stat.labelKey]),
      }))}
    />
  );
}

const EQUIPMENT_ICONS: Record<string, ReactNode> = {
  treadmill: <Treadmill size={20} />,
  rack: <BarbellHorizontal size={20} />,
  dumbbell: <Weight size={20} />,
  bench: <BarbellHorizontal size={20} />,
};

const AMENITY_ICONS: Record<ClubDetailAmenityIconKey, ReactNode> = {
  wifi: <WifiHigh size={48} />,
  parking: <Car1 size={48} />,
  shower: <Shower1 size={48} />,
  locker: <Lock1 size={48} />,
  ac: <Snowflake1 size={48} />,
  cafe: <Coffee size={48} />,
};

const COACH_PREVIEW_COUNT = 4;

const SECTION_TITLE_ICON_SIZE = 20;

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
  /** Optional header action (e.g. view more). */
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

function EquipmentSection({ equipment }: { equipment: ClubDetailEquipment[] }) {
  const t = useTranslations("ClubDetail");
  const [isOpen, setIsOpen] = useState(false);
  const hasMore = equipment.length > EQUIPMENT_PREVIEW_COUNT;
  const preview = hasMore
    ? equipment.slice(0, EQUIPMENT_PREVIEW_COUNT)
    : equipment;

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
  const t = useTranslations("ClubDetail");

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

function CoachesSection({ coaches }: { coaches: ClubDetailCoach[] }) {
  const t = useTranslations("ClubDetail");
  const router = useRouter();
  const preview = coaches.slice(0, COACH_PREVIEW_COUNT);
  const hasMore = coaches.length > COACH_PREVIEW_COUNT;

  if (preview.length === 0) return null;

  return (
    <div className={styles.section}>
      <SectionCarousel
        aria-label={t("coachesTitle")}
        icon={<UsersThree size={SECTION_TITLE_ICON_SIZE} />}
        title={t("coachesTitle")}
      >
        {preview.map((coach) => (
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

        {hasMore ? (
          <Button
            className={styles.coachSeeAll}
            onPress={() => router.push("/discovery/coaches")}
            variant="secondary"
          >
            <ArrowUpRight size={22} />
            <span className={styles.classSeeAllLabel}>
              {t("seeAllCoaches")}
            </span>
          </Button>
        ) : null}
      </SectionCarousel>
    </div>
  );
}

function toTelHref(number: string) {
  const latin = number
    .replace(/[۰-۹]/g, (digit) =>
      String(digit.charCodeAt(0) - "۰".charCodeAt(0)),
    )
    .replace(/[٠-٩]/g, (digit) =>
      String(digit.charCodeAt(0) - "٠".charCodeAt(0)),
    );
  const tel = latin.replace(/[^\d+]/g, "");
  return tel ? `tel:${tel}` : null;
}

function PhonesSection({ phones }: { phones: ClubDetailPhone[] }) {
  const t = useTranslations("ClubDetail");
  if (phones.length === 0) return null;

  return (
    <ClubContactSection
      className={styles.section}
      onCall={(phone) => {
        const href = toTelHref(phone.number);
        if (href) window.location.href = href;
      }}
      phones={phones.map((phone) => ({
        id: phone.id,
        number: phone.number,
        label: phone.label ?? t("phoneItemLabel"),
        callLabel: t("callPhone"),
      }))}
      title={t("phonesTitle")}
    />
  );
}

function formatOperatingHourValue(
  row: ClubDetailOperatingHour,
  t: ReturnType<typeof useTranslations<"ClubDetail">>,
) {
  return row.status === "closed"
    ? t("hoursClosed")
    : `${row.open ?? "—"} – ${row.close ?? "—"}`;
}

function OperatingHoursGroup({
  title,
  hours,
}: {
  title?: string;
  hours: ClubDetailOperatingHour[];
}) {
  const t = useTranslations("ClubDetail");
  const sorted = [...hours].sort((a, b) => a.weekday - b.weekday);

  return (
    <div className={styles.hoursGroup}>
      {title ? (
        <Typography className={styles.hoursGroupTitle} type="body-sm">
          {title}
        </Typography>
      ) : null}
      <div className={styles.infoCard}>
        {sorted.map((row) => (
          <div
            className={styles.infoRow}
            key={`${row.audience ?? "shared"}-${row.weekday}`}
          >
            <Typography className={styles.infoRowLabel} type="body-sm">
              {t(`calendarWeekdayFull.${weekdayKey(row.weekday)}`)}
            </Typography>
            <Typography className={styles.infoRowValue} type="body-sm">
              {formatOperatingHourValue(row, t)}
            </Typography>
          </div>
        ))}
      </div>
    </div>
  );
}

function OperatingHoursSection({
  hours,
}: {
  hours: ClubDetailOperatingHour[];
}) {
  const t = useTranslations("ClubDetail");
  if (hours.length === 0) return null;

  const male = hours.filter((row) => (row.audience ?? "shared") === "male");
  const female = hours.filter((row) => (row.audience ?? "shared") === "female");
  const shared = hours.filter((row) => (row.audience ?? "shared") === "shared");
  const hasSplit = male.length > 0 && female.length > 0;

  return (
    <div className={styles.section}>
      <SectionTitle>{t("operatingHoursTitle")}</SectionTitle>
      {hasSplit ? (
        <div className={styles.hoursGroups}>
          <OperatingHoursGroup hours={male} title={t("hoursAudienceMale")} />
          <OperatingHoursGroup
            hours={female}
            title={t("hoursAudienceFemale")}
          />
        </div>
      ) : (
        <OperatingHoursGroup
          hours={
            shared.length > 0
              ? shared
              : male.length > 0
                ? male
                : female.length > 0
                  ? female
                  : hours
          }
        />
      )}
    </div>
  );
}

function RulesSection({ rules }: { rules: ClubDetailRule[] }) {
  const t = useTranslations("ClubDetail");
  if (rules.length === 0) return null;

  return (
    <div className={styles.section}>
      <SectionTitle>{t("rulesTitle")}</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {rules.map((rule) => (
          <div className={styles.ruleItem} key={rule.id}>
            <div className="flex items-center justify-between gap-2">
              <Typography className={styles.ruleTitle} type="body-sm">
                {rule.title}
              </Typography>
              <Chip size="sm" variant="secondary">
                <Chip.Label
                  className={
                    rule.policy === "required"
                      ? styles.rulePolicyRequired
                      : rule.policy === "recommended"
                        ? styles.rulePolicyRecommended
                        : styles.rulePolicyProhibited
                  }
                >
                  {t(`rulePolicy.${rule.policy}`)}
                </Chip.Label>
              </Chip>
            </div>
            {rule.description ? (
              <Typography className={styles.ruleBody} type="body-sm">
                {rule.description}
              </Typography>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

const GENDER_POLICY_KEYS = ["mixed", "male_only", "female_only"] as const;
const AGE_GROUP_KEYS = ["adults", "teens", "kids", "seniors"] as const;
const LEVEL_KEYS = ["beginner", "intermediate", "advanced"] as const;
const ACCESSIBILITY_KEYS = ["standard", "accessible"] as const;

function translateChoice(
  t: ReturnType<typeof useTranslations<"ClubDetail">>,
  prefix: "genderPolicy" | "ageGroup" | "clubLevel" | "accessibility",
  key: string | undefined,
  allowed: readonly string[],
) {
  if (!key || !allowed.includes(key)) return key || "—";
  return t(`${prefix}.${key}` as Parameters<typeof t>[0]);
}

function AudienceSection({ audience }: { audience: ClubDetailAudience }) {
  const t = useTranslations("ClubDetail");
  const gender = translateChoice(
    t,
    "genderPolicy",
    audience.genderPolicy,
    GENDER_POLICY_KEYS,
  );
  const ages =
    audience.ageGroupKeys.length > 0
      ? audience.ageGroupKeys
          .map((key) => translateChoice(t, "ageGroup", key, AGE_GROUP_KEYS))
          .join("، ")
      : "—";
  const levels =
    audience.levelKeys.length > 0
      ? audience.levelKeys
          .map((key) => translateChoice(t, "clubLevel", key, LEVEL_KEYS))
          .join("، ")
      : "—";
  const accessibility = translateChoice(
    t,
    "accessibility",
    audience.accessibility,
    ACCESSIBILITY_KEYS,
  );

  const cells = [
    {
      key: "gender",
      label: t("audienceGender"),
      value: gender,
      icon: (
        <GenderMale aria-hidden className={styles.audienceIcon} size={20} />
      ),
    },
    {
      key: "age",
      label: t("audienceAge"),
      value: ages,
      icon: (
        <UsersThree aria-hidden className={styles.audienceIcon} size={20} />
      ),
    },
    {
      key: "level",
      label: t("audienceLevel"),
      value: levels,
      icon: <Target1 aria-hidden className={styles.audienceIcon} size={20} />,
    },
    {
      key: "accessibility",
      label: t("audienceAccessibility"),
      value: accessibility,
      icon: (
        <PersonWheelchair
          aria-hidden
          className={styles.audienceIcon}
          size={20}
        />
      ),
    },
  ] as const;

  return (
    <div className={styles.section}>
      <SectionTitle>{t("audienceTitle")}</SectionTitle>
      <div className={styles.audienceGrid}>
        {cells.map((cell) => (
          <div className={styles.audienceCell} key={cell.key}>
            <span className={styles.audienceIconWrap}>{cell.icon}</span>
            <div className={styles.audienceText}>
              <Typography className={styles.audienceLabel} type="body-xs">
                {cell.label}
              </Typography>
              <Typography className={styles.audienceValue} type="body-sm">
                {cell.value}
              </Typography>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqSection({ items }: { items: ClubDetailFaq[] }) {
  const t = useTranslations("ClubDetail");
  if (items.length === 0) return null;

  return (
    <div className={styles.section}>
      <SectionTitle>{t("faqTitle")}</SectionTitle>
      <Accordion className={styles.faqRoot}>
        {items.map((item) => (
          <Accordion.Item className={styles.faqItem} key={item.id}>
            <Accordion.Heading>
              <Accordion.Trigger>
                {item.title}
                <Accordion.Indicator>
                  <ChevronDown size={18} />
                </Accordion.Indicator>
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body>{item.description}</Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
}

function OwnerSection({ owner }: { owner?: ClubDetailOwner }) {
  const t = useTranslations("ClubDetail");
  const [isOpen, setIsOpen] = useState(false);

  if (!owner) return null;

  const experienceLabel =
    owner.yearsExperience != null
      ? t("ownerYoe", { years: owner.yearsExperience })
      : undefined;

  return (
    <div className={styles.section}>
      <SectionTitle>{t("ownerTitle")}</SectionTitle>
      <ClubOwnerCard
        actionLabel={t("ownerAction")}
        experienceLabel={experienceLabel}
        image={owner.avatar ?? PLACEHOLDER_IMAGE}
        imageAlt={owner.name}
        onPress={() => setIsOpen(true)}
        rank={owner.rank}
        rating={owner.rating}
        ratingCount={owner.ratingCount}
        title={owner.name}
      />

      <Drawer.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
        <Drawer.Content placement="bottom">
          <Drawer.Dialog>
            <Drawer.Handle />
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading>{t("ownerDetailsTitle")}</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className={styles.ownerDrawerBody}>
              <ScrollShadow
                className={styles.ownerDrawerScroll}
                hideScrollBar
                orientation="vertical"
                size={56}
              >
                <div className={styles.ownerSheet}>
                  <div className={styles.ownerSheetAvatar}>
                    <Image
                      alt={owner.name}
                      className="size-full object-cover"
                      height={96}
                      src={owner.avatar ?? PLACEHOLDER_IMAGE}
                      width={96}
                    />
                  </div>

                  <div className={styles.ownerSheetIdentity}>
                    <Typography className={styles.ownerSheetName} type="body">
                      {owner.name}
                    </Typography>
                    {owner.headline ? (
                      <Typography
                        className={styles.ownerSheetHeadline}
                        type="body-sm"
                      >
                        {owner.headline}
                      </Typography>
                    ) : null}
                  </div>

                  {experienceLabel != null || owner.rating != null ? (
                    <div className={styles.ownerSheetMeta}>
                      {experienceLabel != null ? (
                        <span className={styles.ownerSheetMetaItem}>
                          <Briefcase1 aria-hidden size={14} />
                          {experienceLabel}
                        </span>
                      ) : null}
                      {experienceLabel != null && owner.rating != null ? (
                        <span aria-hidden>•</span>
                      ) : null}
                      {owner.rating != null ? (
                        <span className={styles.ownerSheetMetaItem}>
                          <StarFull
                            aria-hidden
                            className={styles.ownerSheetStar}
                            size={14}
                          />
                          {Number.isInteger(owner.rating)
                            ? String(owner.rating)
                            : owner.rating.toFixed(1)}
                          {owner.ratingCount != null
                            ? ` (${owner.ratingCount.toLocaleString("en-US")})`
                            : null}
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  {owner.bio ? (
                    <Typography className={styles.ownerSheetBio} type="body-sm">
                      {owner.bio}
                    </Typography>
                  ) : null}
                </div>
              </ScrollShadow>
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
                  description={
                    plan.description ??
                    (plan.descriptionKey ? t(plan.descriptionKey) : "")
                  }
                  planName={
                    plan.planName ??
                    (plan.planNameKey ? t(plan.planNameKey) : plan.id)
                  }
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

  const locationAddress = formatLocationAddress(club.locationCard);

  return (
    <section className={styles.root}>
      <div className={styles.section}>
        <SectionTitle>{t("description")}</SectionTitle>
        <DescriptionDisclosure text={club.overview} />
      </div>

      <DiscoveryGallerySection
        gallery={club.gallery}
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

      <AmenitiesSection amenities={club.amenities} />

      {club.categories.length > 0 ? (
        <div className={styles.section}>
          <SectionTitle>{t("categoriesTitle")}</SectionTitle>
          <div className={styles.chipRow}>
            {club.categories.map((category) => (
              <Chip key={category.id} size="sm" variant="secondary">
                <Chip.Label>{category.title}</Chip.Label>
              </Chip>
            ))}
          </div>
        </div>
      ) : null}

      {club.achievements.length > 0 ? (
        <div className={styles.section}>
          <SectionCarousel
            aria-label={t("achievementsTitle")}
            icon={<Medal size={SECTION_TITLE_ICON_SIZE} />}
            title={t("achievementsTitle")}
          >
            {club.achievements.map((item) => (
              <div className={styles.achievementSlide} key={item.id}>
                <AchievementTag
                  color={item.color ?? "accent"}
                  icon={<Medal size={20} />}
                />
                <Typography className={styles.achievementLabel} type="body-xs">
                  {item.title}
                </Typography>
              </div>
            ))}
          </SectionCarousel>
        </div>
      ) : null}

      <OperatingHoursSection hours={club.operatingHours} />
      <PhonesSection phones={club.phones} />
      <AudienceSection audience={club.audience} />
      <OwnerSection owner={club.owner} />

      <SubscriptionsSection
        onChange={onSubscriptionChange}
        plans={club.subscriptions}
        selectedId={selectedSubscriptionId}
      />

      <RulesSection rules={club.rules} />

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
              color: "danger",
              title: t("cancellationStep4Title"),
              description: t("cancellationStep4Description"),
            },
          ]}
        />
      </div>

      {club.sports.length > 0 ? (
        <div className={styles.section}>
          <SectionCarousel
            aria-label={t("sportsTitle")}
            icon={<Target1 size={SECTION_TITLE_ICON_SIZE} />}
            title={t("sportsTitle")}
          >
            {club.sports.map((sport) => (
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
            <Button
              className={styles.sportSeeAll}
              onPress={() => router.push(sportsPath)}
              variant="secondary"
            >
              <ArrowUpRight size={22} />
              <span className={styles.classSeeAllLabel}>
                {t("seeAllSports")}
              </span>
            </Button>
          </SectionCarousel>
        </div>
      ) : null}

      {club.equipment.length > 0 ? (
        <EquipmentSection equipment={club.equipment} />
      ) : null}

      <CoachesSection coaches={club.coaches} />

      {club.busyHours.length > 0 ? (
        <div className={styles.section}>
          <BusyHoursCard
            aria-label={t("busyHoursChartLabel")}
            data={club.busyHours}
            title={t("busyHoursTitle")}
            unit={t("busyHoursUnit")}
          />
        </div>
      ) : null}

      <div className={styles.section}>
        <SectionTitle>{t("locationTitle")}</SectionTitle>
        <ClubLocationStats
          hoursLabel={club.openHoursLabel}
          isOpen={club.isOpen}
          stats={club.stats}
        />
        {locationAddress ? (
          <Typography className={styles.bodyText} type="body-sm">
            {locationAddress}
          </Typography>
        ) : null}
      </div>

      {club.branches.length > 0 ? (
        <div className={styles.section}>
          <SectionCarousel
            aria-label={t("branchesTitle")}
            icon={<Building2 size={SECTION_TITLE_ICON_SIZE} />}
            title={t("branchesTitle")}
          >
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
              <span className={styles.classSeeAllLabel}>
                {t("seeAllBranches")}
              </span>
            </Button>
          </SectionCarousel>
        </div>
      ) : null}

      <div className={styles.section}>
        <DiscoveryClubsDetailCalendarSection club={club} />
      </div>

      {visibleClasses.length > 0 ? (
        <div className={styles.section}>
          <SectionCarousel
            aria-label={t("classesTitle")}
            icon={<Calendar1 size={SECTION_TITLE_ICON_SIZE} />}
            title={t("classesTitle")}
          >
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
              <span className={styles.classSeeAllLabel}>
                {t("seeAllClasses")}
              </span>
            </Button>
          </SectionCarousel>
        </div>
      ) : null}

      {visibleReviews.length > 0 ? (
        <div className={styles.section}>
          <SectionCarousel
            aria-label={t("reviewsTitle")}
            icon={<StarFull size={SECTION_TITLE_ICON_SIZE} />}
            title={t("reviewsTitle")}
          >
            {visibleReviews.map((review) => (
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

            <Button
              className={styles.reviewSeeAll}
              onPress={() => router.push(reviewsPath)}
              variant="secondary"
            >
              <ArrowUpRight size={22} />
              <span className={styles.classSeeAllLabel}>
                {t("seeAllReviews")}
              </span>
            </Button>
          </SectionCarousel>
        </div>
      ) : null}

      <FaqSection items={club.faq} />

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
