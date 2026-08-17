import {
  WELCOME_INTRODUCE_SLIDE_COUNT,
  WELCOME_INTRODUCE_WORKOUT_CARDS,
} from "@/modules/app/lib/welcome-introduce-data";
import { WelcomeIntroduceAchievementsSection } from "@/modules/app/sections/WelcomeIntroduceAchievementsSection";
import { WelcomeIntroduceActivitiesSection } from "@/modules/app/sections/WelcomeIntroduceActivitiesSection";
import { WelcomeIntroduceChatSection } from "@/modules/app/sections/WelcomeIntroduceChatSection";
import { WelcomeIntroduceCoachSection } from "@/modules/app/sections/WelcomeIntroduceCoachSection";
import { WelcomeIntroduceCommunitySection } from "@/modules/app/sections/WelcomeIntroduceCommunitySection";
import { WelcomeIntroduceMealsSection } from "@/modules/app/sections/WelcomeIntroduceMealsSection";
import { WelcomeIntroduceMetricsSection } from "@/modules/app/sections/WelcomeIntroduceMetricsSection";
import { WelcomeIntroduceNutritionSection } from "@/modules/app/sections/WelcomeIntroduceNutritionSection";
import { WelcomeIntroduceScoreSection } from "@/modules/app/sections/WelcomeIntroduceScoreSection";
import { WelcomeIntroduceSleepSection } from "@/modules/app/sections/WelcomeIntroduceSleepSection";
import { WelcomeIntroduceSlideShell } from "@/modules/app/sections/WelcomeIntroduceSlideShell";
import { WelcomeIntroduceWorkoutsSection } from "@/modules/app/sections/WelcomeIntroduceWorkoutsSection";
import { welcomeIntroduceCarouselSectionVariants } from "./WelcomeIntroduceCarouselSection.styles";
import type { WelcomeIntroduceCarouselSectionProps } from "./WelcomeIntroduceCarouselSection.types";

export function WelcomeIntroduceCarouselSection({
  emblaRef,
  slide,
  textDirection,
  t,
  className,
}: WelcomeIntroduceCarouselSectionProps) {
  const styles = welcomeIntroduceCarouselSectionVariants();

  return (
    <div
      aria-roledescription="carousel"
      className={styles.carousel({ className })}
      ref={emblaRef}
    >
      <div className={styles.track()}>
        {Array.from({ length: WELCOME_INTRODUCE_SLIDE_COUNT }, (_, index) => {
          const isActive = slide === index;
          const mountStage = Math.abs(slide - index) <= 1;

          return (
            <WelcomeIntroduceSlideShell
              isActive={isActive}
              key={index}
              subtitle={t(`slides.${index}.subtitle`)}
              title={t(`slides.${index}.title`)}
            >
              {mountStage && index === 0 ? (
                <WelcomeIntroduceScoreSection
                  delta={t("score.delta")}
                  isActive={isActive}
                  label={t("score.label")}
                  previousLabel={t("score.previous")}
                  score={t("score.value")}
                  statusLabel={t("score.statusOptimal")}
                  thisMonthLabel={t("score.thisMonth")}
                />
              ) : null}

              {mountStage && index === 1 ? (
                <WelcomeIntroduceActivitiesSection
                  isActive={isActive}
                  labels={{
                    cycling: t("activities.cycling"),
                    kickboxing: t("activities.kickboxing"),
                    swimming: t("activities.swimming"),
                    toneLight: t("activities.toneLight"),
                    toneCalm: t("activities.toneCalm"),
                    toneIntense: t("activities.toneIntense"),
                  }}
                />
              ) : null}

              {mountStage && index === 2 ? (
                <WelcomeIntroduceMetricsSection
                  cards={{
                    weight: {
                      title: t("metrics.weight.title"),
                      value: t("metrics.weight.value"),
                      unit: t("metrics.weight.unit"),
                      status: t("metrics.weight.status"),
                    },
                    pressure: {
                      title: t("metrics.pressure.title"),
                      value: t("metrics.pressure.value"),
                      unit: t("metrics.pressure.unit"),
                      status: t("metrics.pressure.status"),
                    },
                    heart: {
                      title: t("metrics.heart.title"),
                      value: t("metrics.heart.value"),
                      unit: t("metrics.heart.unit"),
                      status: t("metrics.heart.status"),
                    },
                  }}
                  isActive={isActive}
                  periodToday={t("metrics.periodToday")}
                />
              ) : null}

              {mountStage && index === 3 ? (
                <WelcomeIntroduceChatSection
                  aiMessage={t("chat.aiMessage")}
                  aiTime={t("chat.aiTime")}
                  isActive={isActive}
                  userMessage={t("chat.userMessage")}
                  userTime={t("chat.userTime")}
                  widgetCta={t("chat.widgetCta")}
                  widgetSubtitle={t("chat.widgetSubtitle")}
                  widgetTitle={t("chat.widgetTitle")}
                />
              ) : null}

              {mountStage && index === 4 ? (
                <WelcomeIntroduceCoachSection
                  availability={t("coach.availability")}
                  distance={t("coach.distance")}
                  isActive={isActive}
                  name={t("coach.name")}
                  price={t("coach.price")}
                  rating={t("coach.rating")}
                  reviews={t("coach.reviews")}
                  specialty={t("coach.specialty")}
                />
              ) : null}

              {mountStage && index === 5 ? (
                <WelcomeIntroduceWorkoutsSection
                  bookmarkLabel={t("workouts.bookmark")}
                  caloriesUnit={t("workouts.caloriesUnit")}
                  cards={WELCOME_INTRODUCE_WORKOUT_CARDS.map((card) => ({
                    category: t(card.categoryKey),
                    title: t(card.titleKey),
                    coach: t(card.coachKey),
                    durationValue: card.duration,
                    ratingValue: card.rating,
                    caloriesValue: card.calories,
                  }))}
                  direction={textDirection}
                  durationUnit={t("workouts.durationUnit")}
                  isActive={isActive}
                  ratingUnit={t("workouts.ratingUnit")}
                />
              ) : null}

              {mountStage && index === 6 ? (
                <WelcomeIntroduceNutritionSection
                  badge={t("nutrition.badge")}
                  carbsLabel={t("nutrition.carbsLabel")}
                  carbsValue={t("nutrition.carbsValue")}
                  cta={t("nutrition.cta")}
                  fatLabel={t("nutrition.fatLabel")}
                  fatValue={t("nutrition.fatValue")}
                  isActive={isActive}
                  proteinLabel={t("nutrition.proteinLabel")}
                  proteinValue={t("nutrition.proteinValue")}
                  tipBody={t("nutrition.tipBody")}
                  tipTitle={t("nutrition.tipTitle")}
                  title={t("nutrition.title")}
                />
              ) : null}

              {mountStage && index === 7 ? (
                <WelcomeIntroduceMealsSection isActive={isActive} />
              ) : null}

              {mountStage && index === 8 ? (
                <WelcomeIntroduceSleepSection
                  awakeDuration={t("sleep.awakeDuration")}
                  awakeLabel={t("sleep.awake")}
                  awakePercent={t("sleep.awakePercent")}
                  breakdownTitle={t("sleep.breakdownTitle")}
                  deepDuration={t("sleep.deepDuration")}
                  deepLabel={t("sleep.deep")}
                  deepPercent={t("sleep.deepPercent")}
                  insight={t("sleep.insight")}
                  isActive={isActive}
                  lightDuration={t("sleep.lightDuration")}
                  lightLabel={t("sleep.light")}
                  lightPercent={t("sleep.lightPercent")}
                  qualityScore={t("sleep.qualityScore")}
                  qualityStatus={t("sleep.qualityStatus")}
                  qualityTitle={t("sleep.qualityTitle")}
                  remDuration={t("sleep.remDuration")}
                  remLabel={t("sleep.rem")}
                  remPercent={t("sleep.remPercent")}
                  streakTitle={t("sleep.streakTitle")}
                  streakValue={t("sleep.streakValue")}
                />
              ) : null}

              {mountStage && index === 9 ? (
                <WelcomeIntroduceCommunitySection
                  author={t("community.author")}
                  body={t("community.body")}
                  comments={t("community.comments")}
                  hashtags={t("community.hashtags")
                    .split(/\s+/)
                    .filter(Boolean)}
                  isActive={isActive}
                  likes={t("community.likes")}
                  menuLabel={t("community.menu")}
                  postedAt={t("community.postedAt")}
                  saveLabel={t("community.save")}
                  views={t("community.views")}
                />
              ) : null}

              {mountStage && index === 10 ? (
                <WelcomeIntroduceAchievementsSection
                  isActive={isActive}
                  titles={{
                    fitness: t("achievements.fitness.title"),
                    hydration: t("achievements.hydration.title"),
                    steps: t("achievements.steps.title"),
                  }}
                  unlockedLabel={t("achievements.unlocked")}
                />
              ) : null}
            </WelcomeIntroduceSlideShell>
          );
        })}
      </div>
    </div>
  );
}
