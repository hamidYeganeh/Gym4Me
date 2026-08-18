"use client";

import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { Chip } from "@heroui/react/chip";
import { Link } from "@heroui/react/link";
import { Surface } from "@heroui/react/surface";
import { BarbellHorizontal } from "@repo/icons/BarbellHorizontal";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Diamond1 } from "@repo/icons/Diamond1";
import { DotThreeHorizontal } from "@repo/icons/DotThreeHorizontal";
import { Calendar1 } from "@repo/icons/Calendar1";
import { Gear1 } from "@repo/icons/Gear1";
import { Heart } from "@repo/icons/Heart";
import { House1 } from "@repo/icons/House1";
import { Kettlebell } from "@repo/icons/Kettlebell";
import { LightningBolt1 } from "@repo/icons/LightningBolt1";
import { Pencil1 } from "@repo/icons/Pencil1";
import { User } from "@repo/icons/User";
import { WifiFull } from "@repo/icons/WifiFull";
import { statsColors } from "@repo/theme";
import {
  AchievementTag,
  type AchievementTagColor,
  type AchievementTagSize,
  type AchievementTagVariant,
} from "@repo/ui/cards/AchievementTag";
import { ArticleCard } from "@repo/ui/cards/ArticleCard";
import { CallToActionCard } from "@repo/ui/cards/CallToActionCard";
import { ClassCard } from "@repo/ui/cards/ClassCard";
import { CityCard } from "@repo/ui/cards/CityCard";
import { ClubAmenityCard } from "@repo/ui/cards/ClubAmenityCard";
import { ClubBranchCard } from "@repo/ui/cards/ClubBranchCard";
import { ClubCancellationPolicy } from "@repo/ui/cards/ClubCancellationPolicy";
import { ClubCard } from "@repo/ui/cards/ClubCard";
import { ClubClassCard } from "@repo/ui/cards/ClubClassCard";
import { ClubEquipmentCard } from "@repo/ui/cards/ClubEquipmentCard";
import { ClubSubscriptionCard } from "@repo/ui/cards/ClubSubscriptionCard";
import { CoachExpertCard } from "@repo/ui/cards/CoachExpertCard";
import { CoachMatchCard } from "@repo/ui/cards/CoachMatchCard";
import { CoachFeatureCard } from "@repo/ui/cards/CoachFeatureCard";
import { CoachMapCard } from "@repo/ui/cards/CoachMapCard";
import { CoachNearbyCard } from "@repo/ui/cards/CoachNearbyCard";
import { CoachPopularItem } from "@repo/ui/cards/CoachPopularItem";
import { DistrictCard } from "@repo/ui/cards/DistrictCard";
import { IbanCard } from "@repo/ui/cards/IbanCard";
import { MetricGoalCard } from "@repo/ui/cards/MetricGoalCard";
import { MetricHistoryItem } from "@repo/ui/cards/MetricHistoryItem";
import { MetricInsightCard } from "@repo/ui/cards/MetricInsightCard";
import { MetricPromoCard } from "@repo/ui/cards/MetricPromoCard";
import { MetricReorderItem } from "@repo/ui/cards/MetricReorderItem";
import { BodyTypeCard, BODY_TYPE_KINDS } from "@repo/ui/cards/BodyTypeCard";
import { MuscleCard, MUSCLE_ART_AREAS } from "@repo/ui/cards/MuscleCard";
import { QuickActionCard } from "@repo/ui/cards/QuickActionCard";
import { ReviewCard } from "@repo/ui/cards/ReviewCard";
import { ScheduleWorkoutCard } from "@repo/ui/cards/ScheduleWorkoutCard";
import { SocialMediaCard } from "@repo/ui/cards/SocialMediaCard";
import { SportCard } from "@repo/ui/cards/SportCard";
import { SportCategoryCard } from "@repo/ui/cards/SportCategoryCard";
import { StatsCard } from "@repo/ui/cards/StatsCard";
import { TicketCard } from "@repo/ui/cards/TicketCard";
import { WorkoutCard } from "@repo/ui/cards/WorkoutCard";
import { LogoMark, PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { AreaLineChart } from "@repo/ui/kit/AreaLineChart";
import { GlyphText } from "@repo/ui/kit/GlyphText";
import { Header } from "@repo/ui/layout/Header";
import type { ReactNode } from "react";
import { AnimatedThemeToggler } from "@/shared/components/animated-theme-toggler";
import { AdaptiveSliderDemo } from "@/shared/components/ui/adaptive-slider-demo";
import { BottomNavDemo } from "@/shared/components/ui/bottom-nav-demo";
import { ClubLocationCardDemo } from "@/shared/components/ui/club-location-card-demo";
import { FractionalPickerDemo } from "@/shared/components/ui/fractional-picker-demo";
import { InputOTPDemo } from "@/shared/components/ui/input-otp-demo";
import { KnobSliderDemo } from "@/shared/components/ui/knob-slider-demo";
import { MetricCardDemo } from "@/shared/components/ui/metric-card-demo";
import { SwipeButtonDemo } from "@/shared/components/ui/swipe-button-demo";
import { UploaderDemo } from "@/shared/components/ui/uploader-demo";
import { WeightSliderDemo } from "@/shared/components/ui/weight-slider-demo";

const ACHIEVEMENT_COLORS: AchievementTagColor[] = [
  "accent",
  "danger",
  "success",
  "warning",
  "red",
  "orange",
  "blue",
  "yellow",
  "purple",
];

const ACHIEVEMENT_VARIANTS: AchievementTagVariant[] = [
  "polygon",
  "circular",
  "wavy",
  "shield1",
  "shield2",
  "octagon",
  "diamond",
  "star1",
  "star2",
];

const ACHIEVEMENT_SIZES: AchievementTagSize[] = ["sm", "md", "lg"];

const AREA_CHART_DATA = [
  { label: "ش", value: 68.1 },
  { label: "ی", value: 67.6 },
  { label: "د", value: 67.9 },
  { label: "س", value: 67.2 },
  { label: "چ", value: 67.5 },
  { label: "پ", value: 67.8 },
  { label: "ج", value: 67.4 },
];

/** Series shaped to match the reference mocks. */
const HYDRATION_SERIES = [40, 62, 30, 76, 48, 82, 96];
const HYDRATION_COMPARISON = [48, 60, 38, 58, 42, 55, 50];
const SCORE_SERIES = [35, 18, 48, 88, 62, 42, 28];

type ThemeDemoLabels = {
  primaryAction: string;
  secondaryAction: string;
  tertiaryAction: string;
  dangerAction: string;
  variantsLabel: string;
  surfacesLabel: string;
  chipsLabel: string;
  iconsLabel: string;
  themeLabel: string;
  chipNew: string;
  chipSuccess: string;
  chipDanger: string;
  surfacePrimary: string;
  surfaceSecondary: string;
  surfaceTertiary: string;
  callToActionLabel: string;
  callToActionSubtitle: string;
  callToActionTitle: string;
  callToActionAction: string;
  callToActionPlus: string;
  callToActionIcon: string;
  callToActionOutlined: string;
  callToActionSoft: string;
  callToActionMeta: string;
  callToActionBadge: string;
  socialMediaCardLabel: string;
  socialMediaCardTitle: string;
  socialMediaCardFacebook: string;
  socialMediaCardInstagram: string;
  socialMediaCardLinkedIn: string;
  ibanCardLabel: string;
  ibanCardHolder: string;
  ibanCardExpiry: string;
  ibanCardNumber: string;
  ticketCardLabel: string;
  ticketCardTitle: string;
  ticketCardSubtitle: string;
  clubSubscriptionCardLabel: string;
  clubSubscriptionPlanName: string;
  clubSubscriptionPrice: string;
  clubSubscriptionPriceSuffix: string;
  clubSubscriptionDescription: string;
  clubSubscriptionBadge: string;
  clubSubscriptionAction: string;
  clubCancellationPolicyLabel: string;
  clubCancellationStep1Title: string;
  clubCancellationStep1Description: string;
  clubCancellationStep2Title: string;
  clubCancellationStep2Description: string;
  clubCancellationStep3Title: string;
  clubCancellationStep3Description: string;
  clubCancellationStep4Title: string;
  clubCancellationStep4Description: string;
  coachName: string;
  coachSpecialty: string;
  coachCertified: string;
  coachYears: string;
  coachMatchCardLabel: string;
  coachMatchCardTitle: string;
  coachMatchCardAction: string;
  coachExpertCardLabel: string;
  coachFeatureCardLabel: string;
  coachFeatureNew: string;
  coachFeatureClose: string;
  coachMapCardLabel: string;
  coachMapAddress: string;
  coachMapGetDirections: string;
  coachMapViewDetails: string;
  coachNearbyCardLabel: string;
  coachNearbyPrice: string;
  coachNearbyDistance: string;
  coachNearbyRemote: string;
  coachPopularItemLabel: string;
  coachVerified: string;
  metricPromoCardLabel: string;
  metricPromoTitle: string;
  metricPromoAction: string;
  metricPromoImageAlt: string;
  metricReorderItemLabel: string;
  metricReorderTitle: string;
  metricReorderRemove: string;
  metricReorderDrag: string;
  muscleCardLabel: string;
  bodyTypeCardLabel: string;
  reviewCardLabel: string;
  reviewCardTitle: string;
  reviewCardContent: string;
  reviewCardDate: string;
  reviewCardVerified: string;
  reviewCardLike: string;
  reviewCardDislike: string;
  reviewCardReport: string;
  scheduleWorkoutCardLabel: string;
  scheduleWorkoutIntensity: string;
  sportCardLabel: string;
  sportCardSubtitle: string;
  sportCardTitle: string;
  sportCardAction: string;
  sportCategoryCardLabel: string;
  sportCategoryCardSubtitle: string;
  sportCategoryCardTitle: string;
  sportCategoryCardAction: string;
  clubCardLabel: string;
  clubCardTitle: string;
  clubCardSubtitle: string;
  clubCardPricePrefix: string;
  clubCardPrice: string;
  clubCardPriceSuffix: string;
  clubCardAction: string;
  clubCardShare: string;
  clubCardFavorite: string;
  clubCardFeatureUpgrade: string;
  clubCardFeatureDining: string;
  clubCardFeatureWifi: string;
  clubBranchCardLabel: string;
  clubBranchCardTitle: string;
  clubBranchCardSubtitle: string;
  clubBranchCardAction: string;
  cityCardLabel: string;
  cityCardCity: string;
  cityCardTitle: string;
  cityCardDiscount: string;
  cityCardAction: string;
  districtCardLabel: string;
  districtCardTitle: string;
  districtCardSubtitle: string;
  districtCardAction: string;
  clubEquipmentCardLabel: string;
  clubEquipmentCardTitle: string;
  clubEquipmentCardSubtitle: string;
  clubEquipmentCardMeta: string;
  achievementCardLabel: string;
  achievementCardAria: string;
  clubAmenityCardLabel: string;
  clubAmenityCardTitle: string;
  clubAmenityCardSubtitle: string;
  clubClassCardLabel: string;
  clubClassCardCategory: string;
  clubClassCardDate: string;
  clubClassCardTitle: string;
  clubClassCardAuthor: string;
  clubClassCardDuration: string;
  clubClassCardAction: string;
  classCardLabel: string;
  classCardBadge: string;
  classCardTitle: string;
  classCardAuthor: string;
  classCardKcal: string;
  classCardKcalLabel: string;
  classCardMinutes: string;
  classCardMinutesLabel: string;
  classCardScore: string;
  classCardScoreLabel: string;
  classCardAction: string;
  workoutCardLabel: string;
  workoutCardCategory: string;
  workoutCardTitle: string;
  workoutCardSets: string;
  workoutCardDuration: string;
  workoutCardPlay: string;
  articleCardLabel: string;
  articleCardTitle: string;
  articleCardExcerpt: string;
  articleCardAuthor: string;
  articleCardReadTime: string;
  articleCardCategory: string;
  articleCardTag: string;
  articleCardMenu: string;
  articleCardAction: string;
  clubLocationCardLabel: string;
  clubLocationCardOpen: string;
  clubLocationCardHours: string;
  clubLocationCardDistanceValue: string;
  clubLocationCardDistance: string;
  clubLocationCardScoreValue: string;
  clubLocationCardScore: string;
  clubLocationCardStudentsValue: string;
  clubLocationCardStudents: string;
  knobSliderLabel: string;
  fractionalPickerLabel: string;
  weightSliderLabel: string;
  inputOTPLabel: string;
  inputOTPFilled: string;
  inputOTPError: string;
  swipeButtonLabel: string;
  swipeButtonAction: string;
  swipeButtonConfirm: string;
  swipeButtonContinue: string;
  swipeButtonSave: string;
  swipeButtonDelete: string;
  uploaderDemoLabel: string;
  uploaderLabel: string;
  fileItemLabel: string;
  fileItemTypeLabel: string;
  uploaderDemoFileName: string;
  uploaderDemoFileSize: string;
  uploaderDemoSuccess: string;
  uploaderDemoError: string;
  uploaderDemoRetry: string;
  statsCardLabel: string;
  statsCardHydrationTitle: string;
  statsCardHydrationUnit: string;
  statsCardScoreTitle: string;
  statsCardScoreUnit: string;
  metricCardLabel: string;
  metricCardPeriod: string;
  metricCardHeartRateTitle: string;
  metricCardHeartRateStatus: string;
  metricCardHeartRateUnit: string;
  metricCardHeartRateValue: string;
  metricCardWeightTitle: string;
  metricCardWeightStatus: string;
  metricCardWeightUnit: string;
  metricCardWeightValue: string;
  metricCardHydrationTitle: string;
  metricCardHydrationStatus: string;
  metricCardHydrationUnit: string;
  metricCardHydrationValue: string;
  metricCardBloodPressureTitle: string;
  metricCardBloodPressureStatus: string;
  metricCardBloodPressureUnit: string;
  metricCardBloodPressureValue: string;
  metricCardSleepTitle: string;
  metricCardSleepStatus: string;
  metricCardSleepUnit: string;
  metricCardSleepValue: string;
  metricCardNutritionTitle: string;
  metricCardNutritionStatus: string;
  metricCardNutritionUnit: string;
  metricCardNutritionValue: string;
  metricCardMoodTitle: string;
  metricCardMoodStatus: string;
  metricCardMoodValue: string;
  metricCardStepsTitle: string;
  metricCardStepsStatus: string;
  metricCardStepsUnit: string;
  metricCardStepsValue: string;
  metricGoalCardLabel: string;
  metricGoalValue: string;
  metricGoalUnit: string;
  metricGoalDescription: string;
  metricGoalProgress: string;
  metricGoalCurrent: string;
  metricGoalEdit: string;
  metricHistoryItemLabel: string;
  metricHistoryValue: string;
  metricHistoryTime: string;
  metricHistorySubtitle: string;
  metricHistoryAlert: string;
  metricInsightCardLabel: string;
  metricInsightLabel: string;
  metricInsightValue: string;
  metricInsightChange: string;
  metricInsightTip: string;
  areaLineChartLabel: string;
  headerLabel: string;
  headerTitle: string;
  headerBack: string;
  headerAction: string;
  logoMarkLabel: string;
  adaptiveSliderLabel: string;
  adaptiveSliderValueLabel: string;
  adaptiveSliderUnit: string;
  screensLabel: string;
  screensAppLabel: string;
  screensDiscoveryLabel: string;
  screensAthleteLabel: string;
  screensCoachLabel: string;
  screensOwnerLabel: string;
  screenSplash: string;
  screenAthleteHome: string;
  screenCoachHome: string;
  screenOwnerHome: string;
  screenOwnerClubsCreate: string;
  screenHome: string;
  screenDiscoveryMap: string;
  screenDiscoveryCoaches: string;
  screenDiscoveryClubs: string;
  screenCoachDetail: string;
  screenClubDetail: string;
  screenClubReviews: string;
  screenClubBranches: string;
  screenClubSports: string;
  screenClubClasses: string;
  screenClubClassDetail: string;
  screenFitnessMetrics: string;
  screenFitnessMetricsReorder: string;
  screenWeightMetrics: string;
  screenWeightHistory: string;
  screenWeightDetail: string;
  screenCoachCalendarDaily: string;
  screenCoachCalendarWeekly: string;
  componentsNavLabel: string;
  profileHeaderLabel: string;
  profileHeaderHint: string;
  quickActionCardLabel: string;
  quickActionCardClasses: string;
  quickActionCardBookings: string;
  quickActionCardEquipment: string;
  quickActionCardMore: string;
  bottomNavLabel: string;
  bottomNavPreview: string;
  bottomNavHome: string;
  bottomNavAnalytics: string;
  bottomNavResources: string;
  bottomNavProfile: string;
  bottomNavCreate: string;
  bottomNavAria: string;
  bottomNavActionsLabel: string;
  bottomNavRoleAthlete: string;
  bottomNavRoleCoach: string;
  bottomNavRoleOwner: string;
  bottomNavHealthMetrics: string;
  bottomNavActivity: string;
  bottomNavSleep: string;
  bottomNavNutrition: string;
  bottomNavWorkouts: string;
  bottomNavCoachBooking: string;
  bottomNavCommunity: string;
  bottomNavClients: string;
  bottomNavSchedule: string;
  bottomNavPrograms: string;
  bottomNavMessages: string;
  bottomNavClubs: string;
  bottomNavStaff: string;
  bottomNavClasses: string;
  bottomNavEquipment: string;
  bottomNavBookings: string;
  bottomNavMarketing: string;
};

type DemoNavLink = {
  href: string;
  label: string;
};

function DemoScreenLink({ href, label }: DemoNavLink) {
  return (
    <Link className="cursor-pointer text-stats-blue no-underline" href={href}>
      {label}
    </Link>
  );
}

function DemoScreenGroup({
  title,
  links,
}: {
  title: string;
  links: DemoNavLink[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-muted">{title}</h3>
      <div className="flex flex-col gap-2">
        {links.map((link) => (
          <DemoScreenLink key={link.href} href={link.href} label={link.label} />
        ))}
      </div>
    </div>
  );
}

function DemoAnchorLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link className="cursor-pointer text-stats-blue no-underline" href={href}>
      {children}
    </Link>
  );
}

export function ThemeDemo({ labels }: { labels: ThemeDemoLabels }) {
  const componentNav = [
    { href: "#demo-screens", label: labels.screensLabel },
    { href: "#demo-quick-action-card", label: labels.quickActionCardLabel },
    { href: "#demo-profile-header", label: labels.profileHeaderLabel },
    { href: "#demo-uploader", label: labels.uploaderDemoLabel },
    { href: "#demo-logo-mark", label: labels.logoMarkLabel },
    { href: "#demo-header", label: labels.headerLabel },
    { href: "#demo-bottom-nav", label: labels.bottomNavLabel },
    { href: "#demo-stats-card", label: labels.statsCardLabel },
    { href: "#demo-metric-card", label: labels.metricCardLabel },
    { href: "#demo-club-card", label: labels.clubCardLabel },
    { href: "#demo-article-card", label: labels.articleCardLabel },
    { href: "#demo-coach-cards", label: labels.coachFeatureCardLabel },
    { href: "#demo-call-to-action", label: labels.callToActionLabel },
    { href: "#demo-muscle-card", label: labels.muscleCardLabel },
    { href: "#demo-body-type-card", label: labels.bodyTypeCardLabel },
    { href: "#demo-kit", label: labels.adaptiveSliderLabel },
  ] as const;

  const appScreens: DemoNavLink[] = [
    { href: "/splash", label: labels.screenSplash },
    { href: "/athlete", label: labels.screenAthleteHome },
    { href: "/coach", label: labels.screenCoachHome },
    { href: "/owner", label: labels.screenOwnerHome },
  ];

  const discoveryScreens: DemoNavLink[] = [
    { href: "/discovery", label: labels.screenHome },
    { href: "/discovery/clubs", label: labels.screenDiscoveryClubs },
    { href: "/discovery/map", label: labels.screenDiscoveryMap },
    { href: "/discovery/coaches", label: labels.screenDiscoveryCoaches },
    { href: "/discovery/coaches/zuckmann", label: labels.screenCoachDetail },
    { href: "/discovery/clubs/heavenly", label: labels.screenClubDetail },
    {
      href: "/discovery/clubs/heavenly/reviews",
      label: labels.screenClubReviews,
    },
    {
      href: "/discovery/clubs/heavenly/branches",
      label: labels.screenClubBranches,
    },
    {
      href: "/discovery/clubs/heavenly/sports",
      label: labels.screenClubSports,
    },
    {
      href: "/discovery/clubs/heavenly/classes",
      label: labels.screenClubClasses,
    },
    {
      href: "/discovery/clubs/heavenly/classes/power-hiit",
      label: labels.screenClubClassDetail,
    },
  ];

  const athleteScreens: DemoNavLink[] = [
    { href: "/athlete/metrics", label: labels.screenFitnessMetrics },
    {
      href: "/athlete/metrics/reorder",
      label: labels.screenFitnessMetricsReorder,
    },
    { href: "/athlete/metrics/weight", label: labels.screenWeightMetrics },
    {
      href: "/athlete/metrics/weight/history",
      label: labels.screenWeightHistory,
    },
    { href: "/athlete/metrics/weight/1", label: labels.screenWeightDetail },
  ];

  const coachScreens: DemoNavLink[] = [
    { href: "/coach/calendar/daily", label: labels.screenCoachCalendarDaily },
    {
      href: "/coach/calendar/weekly",
      label: labels.screenCoachCalendarWeekly,
    },
  ];

  const ownerScreens: DemoNavLink[] = [
    { href: "/owner/clubs/create", label: labels.screenOwnerClubsCreate },
  ];

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex items-center gap-3">
        <AnimatedThemeToggler aria-label={labels.themeLabel} />
        <p className="text-sm text-muted">{labels.themeLabel}</p>
      </div>

      <GlyphText text={["تمرین کن", "بازیابی کن"]} repeat fixedWidth />
      <h1 className="font-satisfy flex items-center justify-center text-5xl font-normal tracking-normal text-foreground sm:text-6xl">
        Gym4Me
      </h1>

      <section className="flex w-full flex-col gap-3" id="demo-components-nav">
        <h2 className="text-lg font-medium text-foreground">
          {labels.componentsNavLabel}
        </h2>
        <div className="flex flex-col gap-2">
          {componentNav.map((item) => (
            <DemoAnchorLink key={item.href} href={item.href}>
              {item.label}
            </DemoAnchorLink>
          ))}
        </div>
      </section>

      <section className="flex w-full flex-col gap-4" id="demo-screens">
        <h2 className="text-lg font-medium text-foreground">
          {labels.screensLabel}
        </h2>
        <DemoScreenGroup links={appScreens} title={labels.screensAppLabel} />
        <DemoScreenGroup
          links={discoveryScreens}
          title={labels.screensDiscoveryLabel}
        />
        <DemoScreenGroup
          links={athleteScreens}
          title={labels.screensAthleteLabel}
        />
        <DemoScreenGroup
          links={coachScreens}
          title={labels.screensCoachLabel}
        />
        <DemoScreenGroup
          links={ownerScreens}
          title={labels.screensOwnerLabel}
        />
      </section>

      <section className="flex w-full flex-col gap-3" id="demo-profile-header">
        <h2 className="text-lg font-medium text-foreground">
          {labels.profileHeaderLabel}
        </h2>
        <p className="text-sm text-muted">{labels.profileHeaderHint}</p>
        <div className="flex flex-col gap-2">
          <DemoScreenLink href="/athlete" label={labels.screenAthleteHome} />
          <DemoScreenLink href="/coach" label={labels.screenCoachHome} />
          <DemoScreenLink href="/owner" label={labels.screenOwnerHome} />
        </div>
      </section>

      <section
        className="flex w-full flex-col gap-3"
        id="demo-quick-action-card"
      >
        <h2 className="text-lg font-medium text-foreground">
          {labels.quickActionCardLabel}
        </h2>
        <div className="grid grid-cols-4 gap-3">
          <QuickActionCard
            icon={<Kettlebell size={28} />}
            label={labels.quickActionCardClasses}
          />
          <QuickActionCard
            icon={<Calendar1 size={28} />}
            label={labels.quickActionCardBookings}
          />
          <QuickActionCard
            icon={<BarbellHorizontal size={28} />}
            label={labels.quickActionCardEquipment}
          />
          <QuickActionCard
            icon={<DotThreeHorizontal size={28} />}
            label={labels.quickActionCardMore}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <QuickActionCard
            icon={<Kettlebell size={22} />}
            label={labels.quickActionCardClasses}
            layout="row"
          />
          <QuickActionCard
            icon={<Calendar1 size={22} />}
            label={labels.quickActionCardBookings}
            layout="row"
          />
          <QuickActionCard
            icon={<BarbellHorizontal size={22} />}
            label={labels.quickActionCardEquipment}
            layout="row"
          />
          <QuickActionCard
            icon={<DotThreeHorizontal size={22} />}
            label={labels.quickActionCardMore}
            layout="row"
          />
        </div>
      </section>

      <section className="flex w-full flex-col gap-3" id="demo-uploader">
        <h2 className="text-lg font-medium text-foreground">
          {labels.uploaderDemoLabel}
        </h2>
        <UploaderDemo
          labels={{
            uploaderLabel: labels.uploaderLabel,
            fileItemLabel: labels.fileItemLabel,
            fileItemTypeLabel: labels.fileItemTypeLabel,
            fileName: labels.uploaderDemoFileName,
            fileSize: labels.uploaderDemoFileSize,
            successMessage: labels.uploaderDemoSuccess,
            errorMessage: labels.uploaderDemoError,
            retryLabel: labels.uploaderDemoRetry,
          }}
        />
      </section>

      <section className="flex w-full flex-col gap-3" id="demo-logo-mark">
        <h2 className="text-lg font-medium text-foreground">
          {labels.logoMarkLabel}
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <LogoMark instanceId="demo-sm" size="sm" />
          <LogoMark instanceId="demo-md" size="md" />
          <LogoMark instanceId="demo-lg" size="lg" />
          <LogoMark instanceId="demo-xl" size="xl" />
        </div>
      </section>

      <section className="flex w-full flex-col gap-3" id="demo-header">
        <h2 className="text-lg font-medium text-foreground">
          {labels.headerLabel}
        </h2>
        <Header
          endContent={
            <Button
              aria-label={labels.headerAction}
              isIconOnly
              size="lg"
              variant="tertiary"
            >
              <Pencil1 size={18} />
            </Button>
          }
          startContent={
            <Button
              aria-label={labels.headerBack}
              isIconOnly
              size="lg"
              variant="tertiary"
            >
              <ChevronLeft size={18} />
            </Button>
          }
          title={labels.headerTitle}
        />
      </section>

      <section className="flex w-full flex-col gap-3" id="demo-bottom-nav">
        <h2 className="text-lg font-medium text-foreground">
          {labels.bottomNavLabel}
        </h2>
        <div className="flex justify-center py-2 w-full">
          <BottomNavDemo
            labels={{
              navLabel: labels.bottomNavAria,
              preview: labels.bottomNavPreview,
              home: labels.bottomNavHome,
              analytics: labels.bottomNavAnalytics,
              resources: labels.bottomNavResources,
              profile: labels.bottomNavProfile,
              create: labels.bottomNavCreate,
              actionsLabel: labels.bottomNavActionsLabel,
              roleAthlete: labels.bottomNavRoleAthlete,
              roleCoach: labels.bottomNavRoleCoach,
              roleOwner: labels.bottomNavRoleOwner,
              healthMetrics: labels.bottomNavHealthMetrics,
              activity: labels.bottomNavActivity,
              sleep: labels.bottomNavSleep,
              nutrition: labels.bottomNavNutrition,
              workouts: labels.bottomNavWorkouts,
              coachBooking: labels.bottomNavCoachBooking,
              community: labels.bottomNavCommunity,
              clients: labels.bottomNavClients,
              schedule: labels.bottomNavSchedule,
              programs: labels.bottomNavPrograms,
              messages: labels.bottomNavMessages,
              clubs: labels.bottomNavClubs,
              staff: labels.bottomNavStaff,
              classes: labels.bottomNavClasses,
              equipment: labels.bottomNavEquipment,
              bookings: labels.bottomNavBookings,
              marketing: labels.bottomNavMarketing,
            }}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3 w-full" id="demo-stats-card">
        <h2 className="text-lg font-medium text-foreground">
          {labels.statsCardLabel}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="size-6 rounded-full bg-stats-red"
            title="stats-red"
          />
          <span
            className="size-6 rounded-full bg-stats-blue"
            title="stats-blue"
          />
          <span
            className="size-6 rounded-full bg-stats-yellow"
            title="stats-yellow"
          />
          <span
            className="size-6 rounded-full bg-stats-purple"
            title="stats-purple"
          />
          <span
            className="size-6 rounded-full bg-stats-orange"
            title="stats-orange"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-4 py-2 w-full">
          <StatsCard
            chart="bar"
            color={statsColors.red}
            series={SCORE_SERIES}
            title={labels.statsCardScoreTitle}
            unit={labels.statsCardScoreUnit}
            value={72}
          />
          <StatsCard
            chart="line"
            color={statsColors.blue}
            comparisonSeries={HYDRATION_COMPARISON}
            series={HYDRATION_SERIES}
            title={labels.statsCardHydrationTitle}
            unit={labels.statsCardHydrationUnit}
            value={781}
          />
          <StatsCard
            chart="bar"
            color={statsColors.yellow}
            series={[28, 42, 35, 78, 55, 40, 22]}
            title={labels.statsCardScoreTitle}
            unit={labels.statsCardScoreUnit}
            value={64}
          />
          <StatsCard
            chart="line"
            color={statsColors.purple}
            comparisonSeries={[45, 50, 35, 55, 40, 50, 48]}
            series={[30, 55, 40, 70, 45, 85, 60]}
            title={labels.statsCardHydrationTitle}
            unit={labels.statsCardHydrationUnit}
            value={540}
          />
          <StatsCard
            chart="bar"
            color={statsColors.orange}
            series={SCORE_SERIES}
            title={labels.statsCardScoreTitle}
            unit={labels.statsCardScoreUnit}
            value={88}
          />
        </div>
      </section>

      <section className="flex w-full flex-col gap-3" id="demo-metric-card">
        <h2 className="text-lg font-medium text-foreground">
          {labels.metricCardLabel}
        </h2>
        <div className="flex w-full justify-center py-2">
          <MetricCardDemo
            labels={{
              periodLabel: labels.metricCardPeriod,
              heartRateTitle: labels.metricCardHeartRateTitle,
              heartRateStatus: labels.metricCardHeartRateStatus,
              heartRateUnit: labels.metricCardHeartRateUnit,
              heartRateValue: labels.metricCardHeartRateValue,
              weightTitle: labels.metricCardWeightTitle,
              weightStatus: labels.metricCardWeightStatus,
              weightUnit: labels.metricCardWeightUnit,
              weightValue: labels.metricCardWeightValue,
              hydrationTitle: labels.metricCardHydrationTitle,
              hydrationStatus: labels.metricCardHydrationStatus,
              hydrationUnit: labels.metricCardHydrationUnit,
              hydrationValue: labels.metricCardHydrationValue,
              bloodPressureTitle: labels.metricCardBloodPressureTitle,
              bloodPressureStatus: labels.metricCardBloodPressureStatus,
              bloodPressureUnit: labels.metricCardBloodPressureUnit,
              bloodPressureValue: labels.metricCardBloodPressureValue,
              sleepTitle: labels.metricCardSleepTitle,
              sleepStatus: labels.metricCardSleepStatus,
              sleepUnit: labels.metricCardSleepUnit,
              sleepValue: labels.metricCardSleepValue,
              nutritionTitle: labels.metricCardNutritionTitle,
              nutritionStatus: labels.metricCardNutritionStatus,
              nutritionUnit: labels.metricCardNutritionUnit,
              nutritionValue: labels.metricCardNutritionValue,
              moodTitle: labels.metricCardMoodTitle,
              moodStatus: labels.metricCardMoodStatus,
              moodValue: labels.metricCardMoodValue,
              stepsTitle: labels.metricCardStepsTitle,
              stepsStatus: labels.metricCardStepsStatus,
              stepsUnit: labels.metricCardStepsUnit,
              stepsValue: labels.metricCardStepsValue,
            }}
          />
        </div>
      </section>

      <section className="flex w-full flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.metricInsightCardLabel}
        </h2>
        <MetricInsightCard
          changeLabel={labels.metricInsightChange}
          label={labels.metricInsightLabel}
          series={[42, 40, 38, 36, 35, 33, 32.8]}
          tip={labels.metricInsightTip}
          trendColor="var(--stats-red)"
          value={labels.metricInsightValue}
        />
      </section>

      <section className="flex w-full flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.metricHistoryItemLabel}
        </h2>
        <div className="flex flex-col gap-2.5">
          <MetricHistoryItem
            subtitle={labels.metricHistorySubtitle}
            time={labels.metricHistoryTime}
            value={labels.metricHistoryValue}
          />
          <MetricHistoryItem
            alert={labels.metricHistoryAlert}
            time={labels.metricHistoryTime}
            value={labels.metricHistoryValue}
          />
        </div>
      </section>

      <section className="flex w-full flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.metricGoalCardLabel}
        </h2>
        <MetricGoalCard
          currentLabel={labels.metricGoalCurrent}
          description={labels.metricGoalDescription}
          editLabel={labels.metricGoalEdit}
          goalLabel={labels.metricGoalUnit}
          goalValue={labels.metricGoalValue}
          progress={30}
          progressLabel={labels.metricGoalProgress}
        />
      </section>

      <section className="flex w-full flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.areaLineChartLabel}
        </h2>
        <AreaLineChart
          aria-label={labels.areaLineChartLabel}
          color="var(--success)"
          data={AREA_CHART_DATA}
        />
      </section>

      <section className="flex w-full flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.swipeButtonLabel}
        </h2>
        <div className="flex justify-center py-2 w-full">
          <SwipeButtonDemo
            labels={{
              finish: labels.swipeButtonAction,
              confirm: labels.swipeButtonConfirm,
              save: labels.swipeButtonSave,
              delete: labels.swipeButtonDelete,
            }}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3 w-full">
        <h2 className="text-lg font-medium text-foreground">
          {labels.weightSliderLabel}
        </h2>
        <div className="flex justify-center py-2 w-full">
          <WeightSliderDemo label={labels.weightSliderLabel} />
        </div>
      </section>

      <section className="flex flex-col gap-3 w-full">
        <h2 className="text-lg font-medium text-foreground">
          {labels.inputOTPLabel}
        </h2>
        <div className="flex justify-center py-2 w-full">
          <InputOTPDemo
            labels={{
              label: labels.inputOTPLabel,
              filled: labels.inputOTPFilled,
              error: labels.inputOTPError,
            }}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.fractionalPickerLabel}
        </h2>
        <div className="flex justify-center py-2">
          <FractionalPickerDemo label={labels.fractionalPickerLabel} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.knobSliderLabel}
        </h2>
        <div className="flex justify-center py-2">
          <KnobSliderDemo label={labels.knobSliderLabel} size={280} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.clubLocationCardLabel}
        </h2>
        <ClubLocationCardDemo
          distanceLabel={labels.clubLocationCardDistance}
          distanceValue={labels.clubLocationCardDistanceValue}
          hoursLabel={labels.clubLocationCardHours}
          openLabel={labels.clubLocationCardOpen}
          scoreLabel={labels.clubLocationCardScore}
          scoreValue={labels.clubLocationCardScoreValue}
          studentsLabel={labels.clubLocationCardStudents}
          studentsValue={labels.clubLocationCardStudentsValue}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.workoutCardLabel}
        </h2>
        <WorkoutCard
          category={labels.workoutCardCategory}
          duration={labels.workoutCardDuration}
          image={PLACEHOLDER_IMAGE}
          imageAlt={labels.workoutCardTitle}
          playLabel={labels.workoutCardPlay}
          sets={labels.workoutCardSets}
          title={labels.workoutCardTitle}
        />
      </section>

      <section className="flex flex-col gap-3" id="demo-article-card">
        <h2 className="text-lg font-medium text-foreground">
          {labels.articleCardLabel}
        </h2>
        <div className="flex flex-col gap-6">
          <div className="w-full max-w-sm">
            <ArticleCard
              actionLabel={labels.articleCardAction}
              author={{ name: labels.articleCardAuthor }}
              category={labels.articleCardCategory}
              coverSrc={PLACEHOLDER_IMAGE}
              excerpt={labels.articleCardExcerpt}
              menuLabel={labels.articleCardMenu}
              orientation="vertical"
              readingTimeLabel={labels.articleCardReadTime}
              tags={[
                { key: "1", label: labels.articleCardTag },
                { key: "2", label: labels.articleCardTag },
                { key: "3", label: labels.articleCardTag },
              ]}
              title={labels.articleCardTitle}
              type="cover"
              onMenuPress={() => undefined}
            />
          </div>
          <ArticleCard
            actionLabel={labels.articleCardAction}
            author={{ name: labels.articleCardAuthor }}
            category={labels.articleCardCategory}
            coverSrc={PLACEHOLDER_IMAGE}
            excerpt={labels.articleCardExcerpt}
            menuLabel={labels.articleCardMenu}
            orientation="horizontal"
            readingTimeLabel={labels.articleCardReadTime}
            tags={[
              { key: "1", label: labels.articleCardTag },
              { key: "2", label: labels.articleCardTag },
              { key: "3", label: labels.articleCardTag },
            ]}
            title={labels.articleCardTitle}
            type="cover"
            onMenuPress={() => undefined}
          />
          <ArticleCard
            actionLabel={labels.articleCardAction}
            author={{ name: labels.articleCardAuthor }}
            category={labels.articleCardCategory}
            excerpt={labels.articleCardExcerpt}
            menuLabel={labels.articleCardMenu}
            readingTimeLabel={labels.articleCardReadTime}
            tags={[
              { key: "1", label: labels.articleCardTag },
              { key: "2", label: labels.articleCardTag },
              { key: "3", label: labels.articleCardTag },
            ]}
            title={labels.articleCardTitle}
            type="text"
            onMenuPress={() => undefined}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.classCardLabel}
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <ClassCard
            actionLabel={labels.classCardAction}
            author={{ name: labels.classCardAuthor }}
            badge={labels.classCardBadge}
            image={PLACEHOLDER_IMAGE}
            imageAlt={labels.classCardTitle}
            kcal={labels.classCardKcal}
            kcalLabel={labels.classCardKcalLabel}
            minutes={labels.classCardMinutes}
            minutesLabel={labels.classCardMinutesLabel}
            score={labels.classCardScore}
            scoreLabel={labels.classCardScoreLabel}
            title={labels.classCardTitle}
            variant="dark"
          />
          <ClassCard
            actionLabel={labels.classCardAction}
            author={{ name: labels.classCardAuthor }}
            badge={labels.classCardBadge}
            image={PLACEHOLDER_IMAGE}
            imageAlt={labels.classCardTitle}
            kcal={labels.classCardKcal}
            kcalLabel={labels.classCardKcalLabel}
            minutes={labels.classCardMinutes}
            minutesLabel={labels.classCardMinutesLabel}
            score={labels.classCardScore}
            scoreLabel={labels.classCardScoreLabel}
            title={labels.classCardTitle}
            variant="light"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.clubClassCardLabel}
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <ClubClassCard
            actionLabel={labels.clubClassCardAction}
            author={labels.clubClassCardAuthor}
            category={labels.clubClassCardCategory}
            date={labels.clubClassCardDate}
            duration={labels.clubClassCardDuration}
            size="sm"
            title={labels.clubClassCardTitle}
          />
          <ClubClassCard
            actionLabel={labels.clubClassCardAction}
            author={labels.clubClassCardAuthor}
            category={labels.clubClassCardCategory}
            date={labels.clubClassCardDate}
            duration={labels.clubClassCardDuration}
            size="md"
            title={labels.clubClassCardTitle}
          />
          <ClubClassCard
            actionLabel={labels.clubClassCardAction}
            author={labels.clubClassCardAuthor}
            backgroundImage={PLACEHOLDER_IMAGE}
            category={labels.clubClassCardCategory}
            date={labels.clubClassCardDate}
            duration={labels.clubClassCardDuration}
            size="lg"
            title={labels.clubClassCardTitle}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.clubAmenityCardLabel}
        </h2>
        <div className="flex flex-wrap gap-4">
          <ClubAmenityCard title={labels.clubAmenityCardTitle} />
          <ClubAmenityCard
            subtitle={labels.clubAmenityCardSubtitle}
            title={labels.clubAmenityCardTitle}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.clubEquipmentCardLabel}
        </h2>
        <ClubEquipmentCard
          meta={labels.clubEquipmentCardMeta}
          subtitle={labels.clubEquipmentCardSubtitle}
          title={labels.clubEquipmentCardTitle}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.achievementCardLabel}
        </h2>
        <div className="flex flex-wrap items-end gap-4 pb-2">
          {ACHIEVEMENT_SIZES.map((size) => (
            <AchievementTag
              key={size}
              aria-label={`${labels.achievementCardAria} ${size}`}
              size={size}
            />
          ))}
        </div>
        <div className="flex flex-col gap-3 pb-2">
          {ACHIEVEMENT_VARIANTS.map((variant) => (
            <div className="flex flex-wrap items-end gap-4" key={variant}>
              {ACHIEVEMENT_COLORS.map((color) => (
                <AchievementTag
                  key={`${variant}-${color}`}
                  aria-label={`${labels.achievementCardAria} ${variant} (${color})`}
                  color={color}
                  variant={variant}
                />
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3" id="demo-club-card">
        <h2 className="text-lg font-medium text-foreground">
          {labels.clubCardLabel}
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <ClubCard
            actionLabel={labels.clubCardAction}
            features={[
              {
                icon: <LightningBolt1 size={12} />,
                label: labels.clubCardFeatureUpgrade,
              },
              {
                icon: <Diamond1 size={12} />,
                label: labels.clubCardFeatureDining,
              },
              {
                icon: <WifiFull size={12} />,
                label: labels.clubCardFeatureWifi,
              },
            ]}
            image={PLACEHOLDER_IMAGE}
            imageAlt={labels.clubCardTitle}
            orientation="vertical"
            price={labels.clubCardPrice}
            pricePrefix={labels.clubCardPricePrefix}
            priceSuffix={labels.clubCardPriceSuffix}
            rating={5}
            subtitle={labels.clubCardSubtitle}
            title={labels.clubCardTitle}
          />
          <ClubCard
            actionLabel={labels.clubCardAction}
            favoriteLabel={labels.clubCardFavorite}
            image={PLACEHOLDER_IMAGE}
            imageAlt={labels.clubCardTitle}
            orientation="horizontal"
            price={labels.clubCardPrice}
            pricePrefix={labels.clubCardPricePrefix}
            priceSuffix={labels.clubCardPriceSuffix}
            rating={4.8}
            ratingCount={146}
            shareLabel={labels.clubCardShare}
            subtitle={labels.clubCardSubtitle}
            title={labels.clubCardTitle}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.clubBranchCardLabel}
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <ClubBranchCard
            actionLabel={labels.clubBranchCardAction}
            image={PLACEHOLDER_IMAGE}
            imageAlt={labels.clubBranchCardTitle}
            size="sm"
            subtitle={labels.clubBranchCardSubtitle}
            title={labels.clubBranchCardTitle}
          />
          <ClubBranchCard
            actionLabel={labels.clubBranchCardAction}
            image={PLACEHOLDER_IMAGE}
            imageAlt={labels.clubBranchCardTitle}
            subtitle={labels.clubBranchCardSubtitle}
            title={labels.clubBranchCardTitle}
          />
          <ClubBranchCard
            actionLabel={labels.clubBranchCardAction}
            image={PLACEHOLDER_IMAGE}
            imageAlt={labels.clubBranchCardTitle}
            size="lg"
            subtitle={labels.clubBranchCardSubtitle}
            title={labels.clubBranchCardTitle}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.cityCardLabel}
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <CityCard
            actionLabel={labels.cityCardAction}
            city={labels.cityCardCity}
            image={PLACEHOLDER_IMAGE}
            imageAlt={labels.cityCardCity}
            size="sm"
          />
          <CityCard
            actionLabel={labels.cityCardAction}
            city={labels.cityCardCity}
            image={PLACEHOLDER_IMAGE}
            imageAlt={labels.cityCardCity}
          />
          <CityCard
            actionLabel={labels.cityCardAction}
            city={labels.cityCardCity}
            image={PLACEHOLDER_IMAGE}
            imageAlt={labels.cityCardCity}
            size="lg"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.districtCardLabel}
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <DistrictCard
            actionLabel={labels.districtCardAction}
            image={PLACEHOLDER_IMAGE}
            imageAlt={labels.districtCardTitle}
            onPress={() => {}}
            size="sm"
            subtitle={labels.districtCardSubtitle}
            title={labels.districtCardTitle}
          />
          <DistrictCard
            actionLabel={labels.districtCardAction}
            image={PLACEHOLDER_IMAGE}
            imageAlt={labels.districtCardTitle}
            onPress={() => {}}
            subtitle={labels.districtCardSubtitle}
            title={labels.districtCardTitle}
          />
          <DistrictCard
            actionLabel={labels.districtCardAction}
            image={PLACEHOLDER_IMAGE}
            imageAlt={labels.districtCardTitle}
            onPress={() => {}}
            size="lg"
            subtitle={labels.districtCardSubtitle}
            title={labels.districtCardTitle}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.sportCardLabel}
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <SportCard
            actionLabel={labels.sportCardAction}
            size="sm"
            sport={{
              subtitle: labels.sportCardSubtitle,
              title: labels.sportCardTitle,
            }}
          />
          <SportCard
            actionLabel={labels.sportCardAction}
            color={statsColors.red}
            sport={{
              subtitle: labels.sportCardSubtitle,
              title: labels.sportCardTitle,
            }}
          />
          <SportCard
            actionLabel={labels.sportCardAction}
            color="var(--foreground)"
            foregroundColor="var(--background)"
            actionColor="var(--background)"
            actionForegroundColor="var(--foreground)"
            overlayOpacity={0.45}
            size="lg"
            sport={{
              backgroundImage: PLACEHOLDER_IMAGE,
              subtitle: labels.sportCardSubtitle,
              title: labels.sportCardTitle,
            }}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.sportCategoryCardLabel}
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <SportCategoryCard
            actionLabel={labels.sportCategoryCardAction}
            size="sm"
            category={{
              subtitle: labels.sportCategoryCardSubtitle,
              title: labels.sportCategoryCardTitle,
            }}
          />
          <SportCategoryCard
            actionLabel={labels.sportCategoryCardAction}
            category={{
              subtitle: labels.sportCategoryCardSubtitle,
              title: labels.sportCategoryCardTitle,
            }}
          />
          <SportCategoryCard
            actionLabel={labels.sportCategoryCardAction}
            color="var(--foreground)"
            foregroundColor="var(--background)"
            actionColor="var(--background)"
            actionForegroundColor="var(--foreground)"
            overlayOpacity={0.45}
            size="lg"
            category={{
              backgroundImage: PLACEHOLDER_IMAGE,
              subtitle: labels.sportCategoryCardSubtitle,
              title: labels.sportCategoryCardTitle,
            }}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3" id="demo-call-to-action">
        <h2 className="text-lg font-medium text-foreground">
          {labels.callToActionLabel}
        </h2>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">{labels.callToActionIcon}</p>
          <CallToActionCard
            actionLabel={labels.callToActionAction}
            actionType="icon"
            subtitle={labels.callToActionSubtitle}
            title={labels.callToActionTitle}
            variant="primary"
          />
          <p className="text-sm text-muted">{labels.callToActionPlus}</p>
          <CallToActionCard
            actionLabel={labels.callToActionAction}
            actionType="plus"
            subtitle={labels.callToActionSubtitle}
            title={labels.callToActionTitle}
            variant="primary"
          />
          <p className="text-sm text-muted">{labels.callToActionOutlined}</p>
          <CallToActionCard
            actionLabel={labels.callToActionAction}
            actionType="plus"
            subtitle={labels.callToActionSubtitle}
            title={labels.callToActionTitle}
            variant="outlined"
          />
          <p className="text-sm text-muted">{labels.callToActionSoft}</p>
          <CallToActionCard
            actionLabel={labels.callToActionAction}
            actionType="plus"
            badge={labels.callToActionBadge}
            meta={labels.callToActionMeta}
            subtitle={labels.callToActionSubtitle}
            title={labels.callToActionTitle}
            variant="soft"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.socialMediaCardLabel}
        </h2>
        <SocialMediaCard
          facebookLabel={labels.socialMediaCardFacebook}
          instagramLabel={labels.socialMediaCardInstagram}
          linkedinLabel={labels.socialMediaCardLinkedIn}
          title={labels.socialMediaCardTitle}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.ibanCardLabel}
        </h2>
        <IbanCard
          expiry={labels.ibanCardExpiry}
          holderName={labels.ibanCardHolder}
          number={labels.ibanCardNumber}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.ticketCardLabel}
        </h2>
        <div className="flex flex-wrap gap-4">
          <TicketCard
            subtitle={labels.ticketCardSubtitle}
            title={labels.ticketCardTitle}
          />
          <TicketCard />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.clubSubscriptionCardLabel}
        </h2>
        <div className="flex flex-col gap-4">
          <ClubSubscriptionCard
            actionLabel={labels.clubSubscriptionAction}
            badge={labels.clubSubscriptionBadge}
            description={labels.clubSubscriptionDescription}
            planName={labels.clubSubscriptionPlanName}
            price={labels.clubSubscriptionPrice}
            priceSuffix={labels.clubSubscriptionPriceSuffix}
            selected
          />
          <ClubSubscriptionCard
            actionLabel={labels.clubSubscriptionAction}
            description={labels.clubSubscriptionDescription}
            planName={labels.clubSubscriptionPlanName}
            price={labels.clubSubscriptionPrice}
            priceSuffix={labels.clubSubscriptionPriceSuffix}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.clubCancellationPolicyLabel}
        </h2>
        <ClubCancellationPolicy
          activeIndex={2}
          steps={[
            {
              title: labels.clubCancellationStep1Title,
              description: labels.clubCancellationStep1Description,
            },
            {
              title: labels.clubCancellationStep2Title,
              description: labels.clubCancellationStep2Description,
            },
            {
              title: labels.clubCancellationStep3Title,
              description: labels.clubCancellationStep3Description,
            },
            {
              title: labels.clubCancellationStep4Title,
              description: labels.clubCancellationStep4Description,
            },
          ]}
          title={labels.clubCancellationPolicyLabel}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.coachMatchCardLabel}
        </h2>
        <CoachMatchCard
          actionLabel={labels.coachMatchCardAction}
          title={labels.coachMatchCardTitle}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.coachExpertCardLabel}
        </h2>
        <div className="flex flex-wrap gap-4">
          <CoachExpertCard
            image={PLACEHOLDER_IMAGE}
            isVerified
            title={labels.coachName}
            verifiedLabel={labels.coachVerified}
          />
          <CoachExpertCard image={PLACEHOLDER_IMAGE} title={labels.coachName} />
        </div>
      </section>

      <section className="flex flex-col gap-3" id="demo-coach-cards">
        <h2 className="text-lg font-medium text-foreground">
          {labels.coachFeatureCardLabel}
        </h2>
        <CoachFeatureCard
          certifiedLabel={labels.coachCertified}
          closeLabel={labels.coachFeatureClose}
          experienceLabel={labels.coachYears}
          image={PLACEHOLDER_IMAGE}
          isNew
          newLabel={labels.coachFeatureNew}
          rating={4.5}
          ratingCount={128}
          specialty={labels.coachSpecialty}
          title={labels.coachName}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.coachMapCardLabel}
        </h2>
        <CoachMapCard
          address={labels.coachMapAddress}
          distanceLabel={labels.coachNearbyDistance}
          getDirectionsLabel={labels.coachMapGetDirections}
          image={PLACEHOLDER_IMAGE}
          rating={4.8}
          ratingCount={96}
          specialtyLabel={labels.coachSpecialty}
          title={labels.coachName}
          verified
          viewDetailsLabel={labels.coachMapViewDetails}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.coachNearbyCardLabel}
        </h2>
        <CoachNearbyCard
          availability="remote"
          distanceLabel={labels.coachNearbyDistance}
          image={PLACEHOLDER_IMAGE}
          priceLabel={labels.coachNearbyPrice}
          rating={4.6}
          ratingCount={54}
          remoteLabel={labels.coachNearbyRemote}
          specialtyLabel={labels.coachSpecialty}
          title={labels.coachName}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.coachPopularItemLabel}
        </h2>
        <div className="flex flex-col gap-2">
          <CoachPopularItem
            experienceLabel={labels.coachYears}
            image={PLACEHOLDER_IMAGE}
            rank={1}
            rating={4.9}
            ratingCount={210}
            title={labels.coachName}
          />
          <CoachPopularItem
            experienceLabel={labels.coachYears}
            image={PLACEHOLDER_IMAGE}
            rank={2}
            rating={4.7}
            ratingCount={180}
            title={labels.coachName}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.metricPromoCardLabel}
        </h2>
        <MetricPromoCard
          actionLabel={labels.metricPromoAction}
          image={PLACEHOLDER_IMAGE}
          imageAlt={labels.metricPromoImageAlt}
          title={labels.metricPromoTitle}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.metricReorderItemLabel}
        </h2>
        <MetricReorderItem
          dragLabel={labels.metricReorderDrag}
          icon={<Heart size={20} />}
          removeLabel={labels.metricReorderRemove}
          title={labels.metricReorderTitle}
        />
      </section>

      <section className="flex flex-col gap-3" id="demo-muscle-card">
        <h2 className="text-lg font-medium text-foreground">
          {labels.muscleCardLabel}
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted">male · tap to toggle accent</p>
            <div className="flex flex-wrap gap-3">
              {MUSCLE_ART_AREAS.map((area, index) => (
                <MuscleCard
                  key={`male-${area}`}
                  actionLabel={area}
                  bodyArea={area}
                  defaultSelected={index % 3 === 0}
                  gender="male"
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted">female · tap to toggle accent</p>
            <div className="flex flex-wrap gap-3">
              {MUSCLE_ART_AREAS.map((area, index) => (
                <MuscleCard
                  key={`female-${area}`}
                  actionLabel={area}
                  bodyArea={area}
                  defaultSelected={index % 3 === 1}
                  gender="female"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3" id="demo-body-type-card">
        <h2 className="text-lg font-medium text-foreground">
          {labels.bodyTypeCardLabel}
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted">male · tap to toggle accent</p>
            <div className="flex flex-wrap gap-4">
              {BODY_TYPE_KINDS.map((kind, index) => (
                <BodyTypeCard
                  key={`male-${kind}`}
                  actionLabel={kind}
                  bodyType={kind}
                  defaultSelected={index === 1}
                  gender="male"
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted">female · tap to toggle accent</p>
            <div className="flex flex-wrap gap-4">
              {BODY_TYPE_KINDS.map((kind, index) => (
                <BodyTypeCard
                  key={`female-${kind}`}
                  actionLabel={kind}
                  bodyType={kind}
                  defaultSelected={index === 0}
                  gender="female"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.reviewCardLabel}
        </h2>
        <ReviewCard
          avatar={PLACEHOLDER_IMAGE}
          avatarFallback="AR"
          content={labels.reviewCardContent}
          date={labels.reviewCardDate}
          dislikeLabel={labels.reviewCardDislike}
          isVerified
          likeLabel={labels.reviewCardLike}
          rating={4.5}
          reportLabel={labels.reviewCardReport}
          title={labels.reviewCardTitle}
          verifiedLabel={labels.reviewCardVerified}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.scheduleWorkoutCardLabel}
        </h2>
        <ScheduleWorkoutCard
          category={labels.workoutCardCategory}
          duration={labels.workoutCardDuration}
          image={PLACEHOLDER_IMAGE}
          intensity="intense"
          intensityLabel={labels.scheduleWorkoutIntensity}
          title={labels.workoutCardTitle}
          trailing="chevron"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.iconsLabel}
        </h2>
        <div className="flex flex-wrap items-center gap-4 text-foreground">
          <House1 size={28} />
          <BarbellHorizontal size={28} />
          <Kettlebell size={28} />
          <Heart size={28} />
          <User size={28} />
          <Gear1 size={28} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.variantsLabel}
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" className="gap-2">
            <BarbellHorizontal size={18} />
            {labels.primaryAction}
          </Button>
          <Button variant="secondary">{labels.secondaryAction}</Button>
          <Button variant="tertiary">{labels.tertiaryAction}</Button>
          <Button variant="ghost">{labels.secondaryAction}</Button>
          <Button variant="danger">{labels.dangerAction}</Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.chipsLabel}
        </h2>
        <div className="flex flex-wrap gap-3">
          <Chip color="accent" variant="soft">
            <Chip.Label>{labels.chipNew}</Chip.Label>
          </Chip>
          <Chip color="success" variant="soft">
            <Chip.Label>{labels.chipSuccess}</Chip.Label>
          </Chip>
          <Chip color="danger" variant="soft">
            <Chip.Label>{labels.chipDanger}</Chip.Label>
          </Chip>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.surfacesLabel}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Surface variant="default" className="rounded-xl p-4">
            <p className="text-sm text-foreground">{labels.surfacePrimary}</p>
          </Surface>
          <Surface variant="secondary" className="rounded-xl p-4">
            <p className="text-sm text-foreground">{labels.surfaceSecondary}</p>
          </Surface>
          <Surface variant="tertiary" className="rounded-xl p-4">
            <p className="text-sm text-foreground">{labels.surfaceTertiary}</p>
          </Surface>
        </div>
      </section>

      <Card>
        <Card.Header>
          <Card.Title>{labels.primaryAction}</Card.Title>
          <Card.Description>{labels.secondaryAction}</Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="flex flex-wrap gap-3">
            <Button size="sm" variant="primary">
              {labels.primaryAction}
            </Button>
            <Button size="sm" variant="secondary">
              {labels.secondaryAction}
            </Button>
            <Button size="sm" variant="tertiary">
              {labels.tertiaryAction}
            </Button>
          </div>
        </Card.Content>
      </Card>

      <section className="flex flex-col gap-3" id="demo-kit">
        <h2 className="text-lg font-medium text-foreground">
          {labels.adaptiveSliderLabel}
        </h2>
        <AdaptiveSliderDemo
          labels={{
            label: labels.adaptiveSliderValueLabel,
            unit: labels.adaptiveSliderUnit,
          }}
        />
      </section>
    </div>
  );
}
