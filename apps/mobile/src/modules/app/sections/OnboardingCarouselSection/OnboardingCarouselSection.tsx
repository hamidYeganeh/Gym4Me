import {
  ONBOARDING_BLOOD_GROUPS,
  ONBOARDING_CALORIES_RANGE,
  ONBOARDING_CALORIES_STEP,
  ONBOARDING_CALORIE_PRESETS,
  ONBOARDING_STEPS,
} from "@/modules/app/lib/onboarding-data";
import {
  slideHasInnerScroll,
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
import { OnboardingMoodSection } from "@/modules/app/sections/OnboardingMoodSection";
import { OnboardingNameSection } from "@/modules/app/sections/OnboardingNameSection";
import { OnboardingSleepSection } from "@/modules/app/sections/OnboardingSleepSection";
import { OnboardingSlideShell } from "@/modules/app/sections/OnboardingSlideShell";
import { OnboardingSportsSection } from "@/modules/app/sections/OnboardingSportsSection";
import { OnboardingWeightSection } from "@/modules/app/sections/OnboardingWeightSection";
import { swiperOptions } from "@repo/ui/lib/swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { onboardingCarouselSectionVariants } from "./OnboardingCarouselSection.styles";
import type { OnboardingCarouselSectionProps } from "./OnboardingCarouselSection.types";

import "swiper/css";

export function OnboardingCarouselSection({
  t,
  onSwiper,
  onSlideChange,
  carouselSpeed,
  textDirection,
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
  goalsStatus,
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
  uploadAvatar,
  toggleGoal,
  toggleSport,
  handleCaloriesChange,
  carouselClassName,
}: OnboardingCarouselSectionProps) {
  const styles = onboardingCarouselSectionVariants();
  const options = swiperOptions({
    speed: carouselSpeed,
    allowTouchMove: false,
    observer: true,
    observeParents: true,
  });

  return (
    <Swiper
      {...options}
      aria-roledescription="carousel"
      className={styles.carousel({ className: carouselClassName })}
      dir={textDirection}
      key={textDirection}
      onSlideChange={onSlideChange}
      onSwiper={onSwiper}
    >
      {ONBOARDING_STEPS.map((stepId, index) => {
          const isActive = slide === index;
          const mountStage = Math.abs(slide - index) <= 1;
          const subtitleKey = slideSubtitleKey(stepId);

          return (
            <SwiperSlide className={styles.slide()} key={stepId}>
            <OnboardingSlideShell
              bleed={slideIsBleed(stepId)}
              innerScroll={slideHasInnerScroll(stepId)}
              isActive={isActive}
              showChrome={!slideOwnsChrome(stepId)}
              subtitle={subtitleKey ? t(subtitleKey) : undefined}
              title={t(slideTitleKey(stepId))}
            >
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
                  levelLabel={(level) => t("athleteLevel.level", { level })}
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
                  emptyLabel={t("goals.empty")}
                  errorLabel={t("goals.error")}
                  isError={goalsStatus === "error"}
                  isLoading={goalsStatus === "loading"}
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

              {mountStage && stepId === "avatar" ? (
                <OnboardingAvatarSection
                  labels={{
                    title: t("avatar.title"),
                    upload: t("avatar.upload"),
                    uploading: t("avatar.uploading"),
                  }}
                  value={avatar}
                  onUpload={uploadAvatar}
                />
              ) : null}
            </OnboardingSlideShell>
            </SwiperSlide>
          );
        })}
    </Swiper>
  );
}
