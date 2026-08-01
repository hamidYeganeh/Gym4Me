"use client";

import { Button, Card, Chip, Link, Surface } from "@heroui/react";
import {
  BarbellHorizontal,
  ChevronLeft,
  Diamond1,
  Gear1,
  Heart,
  House1,
  Kettlebell,
  LightningBolt1,
  Pencil1,
  User,
  WifiFull,
} from "@repo/icons";
import { statsColors } from "@repo/theme";
import { CallToActionCard } from "@repo/ui/cards/CallToActionCard";
import { CityCard } from "@repo/ui/cards/CityCard";
import { ClubAmenityCard } from "@repo/ui/cards/ClubAmenityCard";
import { ClubBranchCard } from "@repo/ui/cards/ClubBranchCard";
import { ClubCard } from "@repo/ui/cards/ClubCard";
import { ClubClassCard } from "@repo/ui/cards/ClubClassCard";
import { ClubEquipmentCard } from "@repo/ui/cards/ClubEquipmentCard";
import { MetricGoalCard } from "@repo/ui/cards/MetricGoalCard";
import { MetricHistoryItem } from "@repo/ui/cards/MetricHistoryItem";
import { MetricInsightCard } from "@repo/ui/cards/MetricInsightCard";
import { SocialMediaCard } from "@repo/ui/cards/SocialMediaCard";
import { SportCard } from "@repo/ui/cards/SportCard";
import { SportCategoryCard } from "@repo/ui/cards/SportCategoryCard";
import { StatsCard } from "@repo/ui/cards/StatsCard";
import { WorkoutCard } from "@repo/ui/cards/WorkoutCard";
import { LogoMark, PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { AreaLineChart } from "@repo/ui/kit/AreaLineChart";
import { Header } from "@repo/ui/layout/Header";
import { useRouter } from "next/navigation";
import { AnimatedThemeToggler } from "@/components/animated-theme-toggler";
import { AdaptiveSliderDemo } from "@/components/ui/adaptive-slider-demo";
import { BottomNavDemo } from "@/components/ui/bottom-nav-demo";
import { ClubLocationCardDemo } from "@/components/ui/club-location-card-demo";
import { FractionalPickerDemo } from "@/components/ui/fractional-picker-demo";
import { InputOTPDemo } from "@/components/ui/input-otp-demo";
import { KnobSliderDemo } from "@/components/ui/knob-slider-demo";
import { MetricCardDemo } from "@/components/ui/metric-card-demo";
import { SwipeButtonDemo } from "@/components/ui/swipe-button-demo";
import { WeightSliderDemo } from "@/components/ui/weight-slider-demo";

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
  chipWarning: string;
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
  socialMediaCardLabel: string;
  socialMediaCardTitle: string;
  socialMediaCardFacebook: string;
  socialMediaCardInstagram: string;
  socialMediaCardLinkedIn: string;
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
  clubEquipmentCardLabel: string;
  clubEquipmentCardTitle: string;
  clubEquipmentCardSubtitle: string;
  clubEquipmentCardMeta: string;
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
  workoutCardLabel: string;
  workoutCardCategory: string;
  workoutCardTitle: string;
  workoutCardSets: string;
  workoutCardDuration: string;
  workoutCardPlay: string;
  clubLocationCardLabel: string;
  clubLocationCardTitle: string;
  clubLocationCardDuration: string;
  clubLocationCardCalories: string;
  clubLocationCardDistance: string;
  clubLocationCardStart: string;
  clubLocationCardEnd: string;
  clubLocationCardAction: string;
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
  screenClubDetail: string;
  screenFitnessMetrics: string;
  screenFitnessMetricsReorder: string;
  screenWeightMetrics: string;
  screenCoachCalendarDaily: string;
  screenCoachCalendarWeekly: string;
  bottomNavLabel: string;
  bottomNavPreview: string;
  bottomNavHome: string;
  bottomNavAi: string;
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
  bottomNavAnalytics: string;
  bottomNavClubs: string;
  bottomNavStaff: string;
  bottomNavClasses: string;
  bottomNavEquipment: string;
  bottomNavBookings: string;
  bottomNavMarketing: string;
};

export function ThemeDemo({ labels }: { labels: ThemeDemoLabels }) {
  const router = useRouter();

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex items-center gap-3">
        <AnimatedThemeToggler aria-label={labels.themeLabel} />
        <p className="text-sm text-muted">{labels.themeLabel}</p>
      </div>

      <section className="flex w-full flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.screensLabel}
        </h2>
        <div className="flex flex-col gap-2">
          <Link
            className="cursor-pointer text-stats-blue no-underline"
            onPress={() => router.push("/discovery/clubs/heavenly")}
          >
            {labels.screenClubDetail}
          </Link>
          <Link
            className="cursor-pointer text-stats-blue no-underline"
            onPress={() => router.push("/athlete/metrics")}
          >
            {labels.screenFitnessMetrics}
          </Link>
          <Link
            className="cursor-pointer text-stats-blue no-underline"
            onPress={() => router.push("/athlete/metrics/reorder")}
          >
            {labels.screenFitnessMetricsReorder}
          </Link>
          <Link
            className="cursor-pointer text-stats-blue no-underline"
            onPress={() => router.push("/athlete/metrics/weight")}
          >
            {labels.screenWeightMetrics}
          </Link>
          <Link
            className="cursor-pointer text-stats-blue no-underline"
            onPress={() => router.push("/coach/calendar/daily")}
          >
            {labels.screenCoachCalendarDaily}
          </Link>
          <Link
            className="cursor-pointer text-stats-blue no-underline"
            onPress={() => router.push("/coach/calendar/weekly")}
          >
            {labels.screenCoachCalendarWeekly}
          </Link>
        </div>
      </section>

      <section className="flex w-full flex-col gap-3">
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

      <section className="flex w-full flex-col gap-3">
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

      <section className="flex w-full flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.bottomNavLabel}
        </h2>
        <div className="flex justify-center py-2 w-full">
          <BottomNavDemo
            labels={{
              navLabel: labels.bottomNavAria,
              preview: labels.bottomNavPreview,
              home: labels.bottomNavHome,
              ai: labels.bottomNavAi,
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
              analytics: labels.bottomNavAnalytics,
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

      <section className="flex flex-col gap-3 w-full">
        <h2 className="text-lg font-medium text-foreground">
          {labels.statsCardLabel}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <span className="size-6 rounded-full bg-stats-red" title="stats-red" />
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

      <section className="flex w-full flex-col gap-3">
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
              continue: labels.swipeButtonContinue,
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
          actionLabel={labels.clubLocationCardAction}
          calories={labels.clubLocationCardCalories}
          distanceLabel={labels.clubLocationCardDistance}
          duration={labels.clubLocationCardDuration}
          endLabel={labels.clubLocationCardEnd}
          startLabel={labels.clubLocationCardStart}
          title={labels.clubLocationCardTitle}
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
            color="#DC2626"
            sport={{
              subtitle: labels.sportCardSubtitle,
              title: labels.sportCardTitle,
            }}
          />
          <SportCard
            actionLabel={labels.sportCardAction}
            color="#0F172A"
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
            color="#0F172A"
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

      <section className="flex flex-col gap-3">
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
          <Chip color="warning" variant="soft">
            <Chip.Label>{labels.chipWarning}</Chip.Label>
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

      <section className="flex flex-col gap-3">
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
