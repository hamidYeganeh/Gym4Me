import {
  ONBOARDING_BLOOD_GROUPS,
  ONBOARDING_CALORIES_RANGE,
  ONBOARDING_CALORIES_STEP,
  ONBOARDING_CALORIE_PRESETS,
  ONBOARDING_STEPS,
} from "@/modules/app/lib/onboarding-data";
import {
  slideIsBleed,
  slideOwnsChrome,
  slideSubtitleKey,
  slideTitleKey,
} from "@/modules/app/lib/onboarding-helpers";
import { OnboardingAthleteLevelSection } from "@/modules/app/sections/OnboardingAthleteLevelSection";
import { OnboardingAvatarSection } from "@/modules/app/sections/OnboardingAvatarSection";
import { OnboardingBirthdateSection } from "@/modules/app/sections/OnboardingBirthdateSection";
import { OnboardingBloodTypeSection } from "@/modules/app/sections/OnboardingBloodTypeSection";
import { OnboardingBodyTypeSection } from "@/modules/app/sections/OnboardingBodyTypeSection";
import { OnboardingCaloriesSection } from "@/modules/app/sections/OnboardingCaloriesSection";
import { OnboardingDietSection } from "@/modules/app/sections/OnboardingDietSection";
import { OnboardingGenderSection } from "@/modules/app/sections/OnboardingGenderSection";
import { OnboardingGoalsSection } from "@/modules/app/sections/OnboardingGoalsSection";
import { OnboardingHeightSection } from "@/modules/app/sections/OnboardingHeightSection";
import { OnboardingIdentitySection } from "@/modules/app/sections/OnboardingIdentitySection";
import { OnboardingMoodSection } from "@/modules/app/sections/OnboardingMoodSection";
import { OnboardingNameSection } from "@/modules/app/sections/OnboardingNameSection";
import { OnboardingPhaseIntroSection } from "@/modules/app/sections/OnboardingPhaseIntroSection";
import { OnboardingReviewSection } from "@/modules/app/sections/OnboardingReviewSection";
import { OnboardingSleepSection } from "@/modules/app/sections/OnboardingSleepSection";
import { OnboardingSlideShell } from "@/modules/app/sections/OnboardingSlideShell";
import { OnboardingSportsSection } from "@/modules/app/sections/OnboardingSportsSection";
import { OnboardingWeightSection } from "@/modules/app/sections/OnboardingWeightSection";
import { onboardingCarouselSectionVariants } from "./OnboardingCarouselSection.styles";
import type { OnboardingCarouselSectionProps } from "./OnboardingCarouselSection.types";

export function OnboardingCarouselSection({
  t,
  emblaRef,
  slide,
  age,
  firstName,
  lastName,
  gender,
  birthdate,
  heightCm,
  heightUnit,
  weightKg,
  weightUnit,
  bodyType,
  athleteLevel,
  sleep,
  mood,
  sportIds,
  diet,
  calories,
  goals,
  bloodGroup,
  bloodRh,
  avatar,
  identityValue,
  identityLabels,
  provinces,
  phaseSteps,
  goalOptions,
  genderOptions,
  bodyTypeOptions,
  weightUnitOptions,
  heightUnitOptions,
  sleepOptions,
  athleteLevelOptions,
  athleteLevelStatus,
  sportOptions,
  sportsStatus,
  moodOptions,
  dietOptions,
  dietStatus,
  setFirstName,
  setLastName,
  setGender,
  setBirthdate,
  setHeightCm,
  setHeightUnit,
  setWeightKg,
  setWeightUnit,
  setBodyType,
  setAthleteLevel,
  setSleep,
  setMood,
  setDiet,
  setBloodGroup,
  setBloodRh,
  patchIdentity,
  uploadAvatar,
  choosePremadeAvatar,
  toggleGoal,
  toggleSport,
  handleCaloriesChange,
  requestFinish,
  carouselClassName,
  trackClassName,
}: OnboardingCarouselSectionProps) {
  const styles = onboardingCarouselSectionVariants();

  return (
    <div
      aria-roledescription="carousel"
      className={styles.carousel({ className: carouselClassName })}
      ref={emblaRef}
    >
      <div className={styles.track({ className: trackClassName })}>
        {ONBOARDING_STEPS.map((stepId, index) => {
          const isActive = slide === index;
          const mountStage = Math.abs(slide - index) <= 1;
          const subtitleKey = slideSubtitleKey(stepId);

          return (
            <OnboardingSlideShell
              bleed={slideIsBleed(stepId)}
              isActive={isActive}
              key={stepId}
              showChrome={!slideOwnsChrome(stepId)}
              subtitle={subtitleKey ? t(subtitleKey) : undefined}
              title={t(slideTitleKey(stepId))}
            >
              {mountStage && stepId === "review" ? (
                <OnboardingReviewSection
                  artAlt={t("review.artAlt")}
                  subtitle={t("review.subtitle")}
                  title={t("review.title")}
                />
              ) : null}

              {mountStage && stepId === "name" ? (
                <OnboardingNameSection
                  firstName={firstName}
                  firstNameLabel={t("name.firstName")}
                  firstNamePlaceholder={t("name.firstPlaceholder")}
                  hint={t("name.hint")}
                  lastName={lastName}
                  lastNameLabel={t("name.lastName")}
                  lastNamePlaceholder={t("name.lastPlaceholder")}
                  onFirstNameChange={setFirstName}
                  onLastNameChange={setLastName}
                />
              ) : null}

              {mountStage && stepId === "gender" ? (
                <OnboardingGenderSection
                  options={genderOptions}
                  value={gender}
                  onChange={setGender}
                />
              ) : null}

              {mountStage && stepId === "birthdate" ? (
                <OnboardingBirthdateSection
                  ageLabel={t("birthdate.ageLabel", { age })}
                  calendarAria={t("birthdate.calendarAria")}
                  value={birthdate}
                  onChange={setBirthdate}
                />
              ) : null}

              {mountStage && stepId === "height" ? (
                <OnboardingHeightSection
                  heightCm={heightCm}
                  label={t("height.title")}
                  unit={heightUnit}
                  unitOptions={heightUnitOptions}
                  onHeightCmChange={setHeightCm}
                  onUnitChange={setHeightUnit}
                />
              ) : null}

              {mountStage && stepId === "weight" ? (
                <OnboardingWeightSection
                  label={t("weight.title")}
                  unit={weightUnit}
                  unitOptions={weightUnitOptions}
                  weightKg={weightKg}
                  onUnitChange={setWeightUnit}
                  onWeightKgChange={setWeightKg}
                />
              ) : null}

              {mountStage && stepId === "bodyType" ? (
                <OnboardingBodyTypeSection
                  gender={gender}
                  options={bodyTypeOptions}
                  value={bodyType}
                  onChange={setBodyType}
                />
              ) : null}

              {mountStage && stepId === "athleteLevel" ? (
                <OnboardingAthleteLevelSection
                  dragHint={t("athleteLevel.dragHint")}
                  emptyLabel={t("athleteLevel.empty")}
                  errorLabel={t("athleteLevel.error")}
                  isError={athleteLevelStatus === "error"}
                  isLoading={athleteLevelStatus === "loading"}
                  label={t("athleteLevel.title")}
                  levelLabel={(level) =>
                    t("athleteLevel.level", { level })
                  }
                  options={athleteLevelOptions}
                  value={athleteLevel}
                  onChange={setAthleteLevel}
                />
              ) : null}

              {mountStage && stepId === "sleep" ? (
                <OnboardingSleepSection
                  options={sleepOptions}
                  tabsLabel={t("sleep.title")}
                  value={sleep}
                  onChange={setSleep}
                />
              ) : null}

              {mountStage && stepId === "mood" ? (
                <OnboardingMoodSection
                  options={moodOptions}
                  value={mood}
                  onChange={setMood}
                />
              ) : null}

              {mountStage && stepId === "sports" ? (
                <OnboardingSportsSection
                  emptyLabel={t("sports.empty")}
                  errorLabel={t("sports.error")}
                  isError={sportsStatus === "error"}
                  isLoading={sportsStatus === "loading"}
                  label={t("sports.title")}
                  options={sportOptions}
                  selected={sportIds}
                  onToggle={toggleSport}
                />
              ) : null}

              {mountStage && stepId === "diet" ? (
                <OnboardingDietSection
                  emptyLabel={t("diet.empty")}
                  errorLabel={t("diet.error")}
                  isError={dietStatus === "error"}
                  isLoading={dietStatus === "loading"}
                  label={t("diet.title")}
                  options={dietOptions}
                  value={diet}
                  onChange={setDiet}
                />
              ) : null}

              {mountStage && stepId === "calories" ? (
                <OnboardingCaloriesSection
                  label={t("calories.title")}
                  max={ONBOARDING_CALORIES_RANGE.max}
                  min={ONBOARDING_CALORIES_RANGE.min}
                  presets={ONBOARDING_CALORIE_PRESETS}
                  step={ONBOARDING_CALORIES_STEP}
                  unitLabel={t("calories.unitLabel")}
                  value={calories}
                  onChange={handleCaloriesChange}
                />
              ) : null}

              {mountStage && stepId === "goals" ? (
                <OnboardingGoalsSection
                  label={t("goals.title")}
                  options={goalOptions}
                  selected={goals}
                  onToggle={toggleGoal}
                />
              ) : null}

              {mountStage && stepId === "bloodType" ? (
                <OnboardingBloodTypeSection
                  group={bloodGroup}
                  groupAria={t("bloodType.groupAria")}
                  groups={ONBOARDING_BLOOD_GROUPS}
                  rh={bloodRh}
                  rhAria={t("bloodType.rhAria")}
                  onGroupChange={setBloodGroup}
                  onRhChange={setBloodRh}
                />
              ) : null}

              {mountStage && stepId === "personalIntro" ? (
                <OnboardingPhaseIntroSection
                  activePhaseIndex={1}
                  imageAlt={t("personalIntro.imageAlt")}
                  phaseAria={t("phases.aria")}
                  steps={phaseSteps}
                  subtitle={t("personalIntro.subtitle")}
                  title={t("personalIntro.title")}
                />
              ) : null}

              {mountStage && stepId === "identity" ? (
                <OnboardingIdentitySection
                  labels={identityLabels}
                  provinces={provinces}
                  value={identityValue}
                  onChange={patchIdentity}
                />
              ) : null}

              {mountStage && stepId === "avatar" ? (
                <OnboardingAvatarSection
                  labels={{
                    title: t("avatar.title"),
                    upload: t("avatar.upload"),
                    premade: t("avatar.premade"),
                    skip: t("avatar.skip"),
                    uploading: t("avatar.uploading"),
                  }}
                  value={avatar}
                  onPremade={choosePremadeAvatar}
                  onSkip={requestFinish}
                  onUpload={uploadAvatar}
                />
              ) : null}
            </OnboardingSlideShell>
          );
        })}
      </div>
    </div>
  );
}
