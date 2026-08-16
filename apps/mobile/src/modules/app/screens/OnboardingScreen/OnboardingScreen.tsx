"use client";

import { Button } from "@heroui/react";
import { ArrowRight, CloseX } from "@repo/icons";
import useEmblaCarousel from "embla-carousel-react";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ONBOARDING_ACTIVITIES,
  ONBOARDING_BLOOD_GROUPS,
  ONBOARDING_BODY_TYPES,
  ONBOARDING_CALORIES_RANGE,
  ONBOARDING_CALORIES_STEP,
  ONBOARDING_CALORIE_PRESETS,
  ONBOARDING_DEFAULT_ALLERGIES,
  ONBOARDING_DEFAULT_BIRTH,
  ONBOARDING_DEFAULT_CALORIES,
  ONBOARDING_DEFAULT_DIET,
  ONBOARDING_DEFAULT_HEIGHT_CM,
  ONBOARDING_DEFAULT_MOOD,
  ONBOARDING_DEFAULT_SLEEP,
  ONBOARDING_DEFAULT_WEIGHT_KG,
  ONBOARDING_DIETS,
  ONBOARDING_FALLBACK_PROVINCES,
  ONBOARDING_GENDER_OTHER_MAX,
  ONBOARDING_GENDERS,
  ONBOARDING_GOALS,
  ONBOARDING_MOODS,
  ONBOARDING_PHASES,
  ONBOARDING_SLEEP_LEVELS,
  ONBOARDING_SLIDE_COUNT,
  ONBOARDING_STEPS,
  onboardingPhaseForStep,
  type OnboardingActivityId,
  type OnboardingBloodGroup,
  type OnboardingBodyTypeId,
  type OnboardingDietId,
  type OnboardingExperienceId,
  type OnboardingGenderId,
  type OnboardingGoalId,
  type OnboardingMoodId,
  type OnboardingRhFactor,
  type OnboardingSleepLevel,
  type OnboardingStepId,
} from "@/modules/app/lib/onboarding-data";
import { markOnboardingDone } from "@/modules/app/lib/onboarding-storage";
import type {
  OnboardingHeightUnit,
  OnboardingWeightUnit,
} from "@/modules/app/lib/onboarding-units";
import { OnboardingActivitiesSection } from "@/modules/app/sections/OnboardingActivitiesSection";
import { OnboardingAvatarSection } from "@/modules/app/sections/OnboardingAvatarSection";
import type { OnboardingAvatarValue } from "@/modules/app/sections/OnboardingAvatarSection";
import { OnboardingBirthdateSection } from "@/modules/app/sections/OnboardingBirthdateSection";
import type { OnboardingBirthdateValue } from "@/modules/app/sections/OnboardingBirthdateSection";
import { OnboardingBloodTypeSection } from "@/modules/app/sections/OnboardingBloodTypeSection";
import { OnboardingBodyTypeSection } from "@/modules/app/sections/OnboardingBodyTypeSection";
import { OnboardingCaloriesSection } from "@/modules/app/sections/OnboardingCaloriesSection";
import { OnboardingDietSection } from "@/modules/app/sections/OnboardingDietSection";
import { OnboardingExperienceSection } from "@/modules/app/sections/OnboardingExperienceSection";
import { OnboardingGenderSection } from "@/modules/app/sections/OnboardingGenderSection";
import { OnboardingGoalsSection } from "@/modules/app/sections/OnboardingGoalsSection";
import { OnboardingHeader } from "@/modules/app/sections/OnboardingHeader";
import { OnboardingHeightSection } from "@/modules/app/sections/OnboardingHeightSection";
import { OnboardingIdentitySection } from "@/modules/app/sections/OnboardingIdentitySection";
import type {
  OnboardingIdentityValue,
  OnboardingProvinceOption,
} from "@/modules/app/sections/OnboardingIdentitySection";
import { OnboardingMoodSection } from "@/modules/app/sections/OnboardingMoodSection";
import { OnboardingNameSection } from "@/modules/app/sections/OnboardingNameSection";
import { OnboardingPermissionSheet } from "@/modules/app/sections/OnboardingPermissionSheet";
import { OnboardingPhaseIntroSection } from "@/modules/app/sections/OnboardingPhaseIntroSection";
import { OnboardingReviewSection } from "@/modules/app/sections/OnboardingReviewSection";
import { OnboardingSleepSection } from "@/modules/app/sections/OnboardingSleepSection";
import { OnboardingSlideShell } from "@/modules/app/sections/OnboardingSlideShell";
import { OnboardingWeightSection } from "@/modules/app/sections/OnboardingWeightSection";
import { toGregorian } from "@/shared/lib/jalali";
import {
  accountProfile,
  basicsLocations,
  isDiscoveryApiId,
  mediaApi,
  mediaFileUrl,
} from "@/shared/lib/api";
import { roleHomePath } from "@/shared/lib/role-routes";
import { useAuth } from "@/shared/providers/AuthProvider";
import type {
  UpdateAddressInput,
  UpdateAthleteProfileInput,
  UpdateMeInput,
} from "@repo/api";
import {
  ONBOARDING_PERMISSION_ORDER,
  requestDevicePermission,
  skipDevicePermission,
  type DevicePermissionKind,
} from "@/shared/lib/device-permissions";
import { onboardingScreenVariants } from "./OnboardingScreen.styles";
import type { OnboardingScreenProps } from "./OnboardingScreen.types";

const PREMADE_AVATARS = [
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Crect fill='%23FF7A1A' width='120' height='120'/%3E%3Ccircle cx='60' cy='44' r='22' fill='%23fff'/%3E%3Cpath fill='%23fff' d='M24 104c6-24 30-34 36-34s30 10 36 34z'/%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Crect fill='%231A1A1A' width='120' height='120'/%3E%3Ccircle cx='60' cy='44' r='22' fill='%23FF7A1A'/%3E%3Cpath fill='%23FF7A1A' d='M24 104c6-24 30-34 36-34s30 10 36 34z'/%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Crect fill='%23FFE4CC' width='120' height='120'/%3E%3Ccircle cx='60' cy='44' r='22' fill='%23FF7A1A'/%3E%3Cpath fill='%23FF7A1A' d='M24 104c6-24 30-34 36-34s30 10 36 34z'/%3E%3C/svg%3E",
] as const;

function readDocumentDirection(): "rtl" | "ltr" {
  if (typeof document === "undefined") return "rtl";
  return document.documentElement.getAttribute("dir") === "ltr" ? "ltr" : "rtl";
}

function birthdateToIso(value: OnboardingBirthdateValue): string {
  const { gy, gm, gd } = toGregorian(value.year, value.month, value.day);
  return `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
}

function ageFromJalali(value: OnboardingBirthdateValue): number {
  const { gy, gm, gd } = toGregorian(value.year, value.month, value.day);
  const today = new Date();
  let age = today.getFullYear() - gy;
  const monthDelta = today.getMonth() + 1 - gm;
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < gd)) {
    age -= 1;
  }
  return Math.max(0, age);
}

function slideTitleKey(step: OnboardingStepId): string {
  return `${step}.title`;
}

function slideSubtitleKey(step: OnboardingStepId): string | null {
  if (step === "review" || step === "gender") return `${step}.subtitle`;
  return null;
}

function slideOwnsChrome(step: OnboardingStepId): boolean {
  return (
    step === "personalIntro" || step === "identity" || step === "avatar"
  );
}

function formatJalaliDisplay(value: OnboardingBirthdateValue): string {
  return `${value.day} / ${value.month} / ${value.year}`;
}

export function OnboardingScreen({ className }: OnboardingScreenProps) {
  const t = useTranslations("Mobile.Onboarding");
  const styles = onboardingScreenVariants();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, activeRole } = useAuth();
  const reduceMotion = useReducedMotion();
  const [textDirection] = useState<"rtl" | "ltr">(readDocumentDirection);
  const [slide, setSlide] = useState(0);
  const [permissionIndex, setPermissionIndex] = useState<number | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<OnboardingGenderId | null>(null);
  const [genderOther, setGenderOther] = useState("");
  const [birthdate, setBirthdate] = useState<OnboardingBirthdateValue>({
    ...ONBOARDING_DEFAULT_BIRTH,
  });
  const [heightCm, setHeightCm] = useState(ONBOARDING_DEFAULT_HEIGHT_CM);
  const [heightUnit, setHeightUnit] = useState<OnboardingHeightUnit>("cm");
  const [weightKg, setWeightKg] = useState(ONBOARDING_DEFAULT_WEIGHT_KG);
  const [weightUnit, setWeightUnit] = useState<OnboardingWeightUnit>("kg");
  const [bodyType, setBodyType] =
    useState<OnboardingBodyTypeId>("ectomorph");
  const [experience, setExperience] =
    useState<OnboardingExperienceId | null>(null);
  const [sleep, setSleep] = useState<OnboardingSleepLevel>(
    ONBOARDING_DEFAULT_SLEEP,
  );
  const [mood, setMood] = useState<OnboardingMoodId>(ONBOARDING_DEFAULT_MOOD);
  const [activities, setActivities] = useState<OnboardingActivityId[]>([
    "other",
  ]);
  const [diet, setDiet] = useState<OnboardingDietId>(ONBOARDING_DEFAULT_DIET);
  const [calories, setCalories] = useState(ONBOARDING_DEFAULT_CALORIES);
  const [caloriesKnown, setCaloriesKnown] = useState(true);
  const [goals, setGoals] = useState<OnboardingGoalId[]>(["overallHealth"]);
  const [bloodGroup, setBloodGroup] = useState<OnboardingBloodGroup>("A");
  const [bloodRh, setBloodRh] = useState<OnboardingRhFactor>("negative");
  const [nationalId, setNationalId] = useState("");
  const [phone, setPhone] = useState("");
  const [provinceId, setProvinceId] = useState<string | null>(null);
  const [provinceName, setProvinceName] = useState("");
  const [street, setStreet] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [allergies, setAllergies] = useState<string[]>([
    ...ONBOARDING_DEFAULT_ALLERGIES,
  ]);
  const [conditions, setConditions] = useState("");
  const [medications, setMedications] = useState("");
  const [healthNote, setHealthNote] = useState("");
  const [mapPoint, setMapPoint] =
    useState<OnboardingIdentityValue["mapPoint"]>(null);
  const [provinces, setProvinces] = useState<OnboardingProvinceOption[]>(
    ONBOARDING_FALLBACK_PROVINCES.map((item) => ({ ...item })),
  );
  const [avatar, setAvatar] = useState<OnboardingAvatarValue>({
    mode: "setup",
    mediaId: null,
    previewUrl: null,
    fileName: "",
    progress: 0,
  });
  const [premadeIndex, setPremadeIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    direction: textDirection,
    duration: reduceMotion ? 0 : 22,
    watchDrag: (_api, event) => {
      const target = event.target;
      if (!(target instanceof Element)) return true;
      return !(
        target.closest("[data-onboarding-nested-carousel]") ||
        target.closest("[data-onboarding-nested-scroll]") ||
        target.closest("input, textarea, [contenteditable=true]")
      );
    },
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSlide(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    queueMicrotask(onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const countries = await basicsLocations.listCountries();
        const iran =
          countries.result.find((item) => item.slug === "iran") ??
          countries.result[0];
        if (!iran || cancelled) return;
        const page = await basicsLocations.listProvinces(iran.id);
        if (cancelled || page.result.length === 0) return;
        setProvinces(
          page.result.map((item) => ({ id: item.id, name: item.name })),
        );
      } catch {
        // Keep offline fallback provinces.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const step = ONBOARDING_STEPS[slide] as OnboardingStepId;
  const phase = onboardingPhaseForStep(step);
  const progress = (slide + 1) / ONBOARDING_SLIDE_COUNT;
  const age = ageFromJalali(birthdate);
  const isExperienceStep = step === "experience";
  const isCaloriesStep = step === "calories";
  const isAvatarUploading = step === "avatar" && avatar.mode === "uploading";
  const showHeaderProgress = phase === "assessment";

  const phaseSteps = useMemo(
    () =>
      ONBOARDING_PHASES.map((id) => ({
        key: id,
        label: t(`phases.${id}`),
      })),
    [t],
  );

  const identityValue = useMemo<OnboardingIdentityValue>(
    () => ({
      fullName,
      gender,
      nationalId,
      birthdateDisplay: formatJalaliDisplay(birthdate),
      phone,
      provinceId,
      provinceName,
      street,
      apartment,
      city,
      postalCode,
      allergies,
      conditions,
      medications,
      heightCm,
      weightKg,
      note: healthNote,
      mapPoint,
    }),
    [
      allergies,
      apartment,
      birthdate,
      city,
      conditions,
      fullName,
      gender,
      healthNote,
      heightCm,
      mapPoint,
      medications,
      nationalId,
      phone,
      postalCode,
      provinceId,
      provinceName,
      street,
      weightKg,
    ],
  );

  const identityLabels = useMemo(
    () => ({
      title: t("identity.title"),
      general: t("identity.general"),
      address: t("identity.address"),
      health: t("identity.health"),
      fullName: t("identity.fullName"),
      gender: t("identity.gender"),
      nationalId: t("identity.nationalId"),
      birthdate: t("identity.birthdate"),
      phone: t("identity.phone"),
      province: t("identity.province"),
      street: t("identity.street"),
      apartment: t("identity.apartment"),
      city: t("identity.city"),
      postalCode: t("identity.postalCode"),
      allergies: t("identity.allergies"),
      edit: t("identity.edit"),
      conditions: t("identity.conditions"),
      medications: t("identity.medications"),
      height: t("identity.height"),
      weight: t("identity.weight"),
      note: t("identity.note"),
      selectProvinceTitle: t("identity.selectProvinceTitle"),
      selectProvinceAction: t("identity.selectProvinceAction"),
      editAddressTitle: t("identity.editAddressTitle"),
      addressSearch: t("identity.addressSearch"),
      zoomIn: t("identity.zoomIn"),
      zoomOut: t("identity.zoomOut"),
      zoom: t("identity.zoom"),
      securityNote: t("identity.securityNote"),
      genderOptions: {
        male: t("gender.options.male"),
        female: t("gender.options.female"),
        other: t("gender.options.other"),
      },
    }),
    [t],
  );

  const patchIdentity = (patch: Partial<OnboardingIdentityValue>) => {
    if (patch.fullName !== undefined) setFullName(patch.fullName);
    if (patch.gender !== undefined) setGender(patch.gender);
    if (patch.nationalId !== undefined) setNationalId(patch.nationalId);
    if (patch.phone !== undefined) setPhone(patch.phone);
    if (patch.provinceId !== undefined) setProvinceId(patch.provinceId);
    if (patch.provinceName !== undefined) setProvinceName(patch.provinceName);
    if (patch.street !== undefined) setStreet(patch.street);
    if (patch.apartment !== undefined) setApartment(patch.apartment);
    if (patch.city !== undefined) setCity(patch.city);
    if (patch.postalCode !== undefined) setPostalCode(patch.postalCode);
    if (patch.allergies !== undefined) setAllergies(patch.allergies);
    if (patch.conditions !== undefined) setConditions(patch.conditions);
    if (patch.medications !== undefined) setMedications(patch.medications);
    if (patch.heightCm !== undefined) setHeightCm(patch.heightCm);
    if (patch.weightKg !== undefined) setWeightKg(patch.weightKg);
    if (patch.note !== undefined) setHealthNote(patch.note);
    if (patch.mapPoint !== undefined) setMapPoint(patch.mapPoint);
    if (patch.birthdateDisplay !== undefined) {
      const parts = patch.birthdateDisplay
        .split("/")
        .map((part) => Number.parseInt(part.trim(), 10));
      const [day, month, year] = parts;
      if (
        day &&
        month &&
        year &&
        Number.isFinite(day) &&
        Number.isFinite(month) &&
        Number.isFinite(year)
      ) {
        setBirthdate({ day, month, year });
      }
    }
  };

  const uploadAvatar = (file: File) => {
    setAvatar({
      mode: "uploading",
      mediaId: null,
      previewUrl: null,
      fileName: file.name,
      progress: 35,
    });
    void mediaApi
      .upload(file)
      .then((asset) => {
        setAvatar({
          mode: "ready",
          mediaId: asset.id,
          previewUrl: mediaFileUrl(asset.id),
          fileName: file.name,
          progress: 100,
        });
      })
      .catch(() => {
        setAvatar({
          mode: "setup",
          mediaId: null,
          previewUrl: null,
          fileName: "",
          progress: 0,
        });
      });
  };

  const choosePremadeAvatar = () => {
    const next = (premadeIndex + 1) % PREMADE_AVATARS.length;
    setPremadeIndex(next);
    setAvatar({
      mode: "ready",
      mediaId: null,
      previewUrl: PREMADE_AVATARS[next]!,
      fileName: `avatar-${next + 1}.svg`,
      progress: 100,
    });
  };

  const goalOptions = useMemo(
    () =>
      ONBOARDING_GOALS.map((id) => ({
        id,
        label: t(`goals.options.${id}`),
      })),
    [t],
  );

  const genderOptions = useMemo(
    () =>
      ONBOARDING_GENDERS.map((id) => ({
        id,
        label: t(`gender.options.${id}`),
      })),
    [t],
  );

  const bodyTypeOptions = useMemo(
    () =>
      ONBOARDING_BODY_TYPES.map((id) => ({
        id,
        label: t(`bodyType.options.${id}.label`),
        statement: t(`bodyType.options.${id}.statement`),
      })),
    [t],
  );

  const sleepOptions = useMemo(
    () =>
      ONBOARDING_SLEEP_LEVELS.map((level) => ({
        level,
        label: t(`sleep.levels.${level}.label`),
        description: t(`sleep.levels.${level}.description`),
      })),
    [t],
  );

  const activityOptions = useMemo(
    () =>
      ONBOARDING_ACTIVITIES.map((id) => ({
        id,
        label: t(`activities.options.${id}`),
      })),
    [t],
  );

  const moodOptions = useMemo(
    () =>
      ONBOARDING_MOODS.map((id) => ({
        id,
        statement: t(`mood.options.${id}`),
      })),
    [t],
  );

  const dietOptions = useMemo(
    () =>
      ONBOARDING_DIETS.map((id) => ({
        id,
        title: t(`diet.options.${id}.title`),
        description: t(`diet.options.${id}.description`),
      })),
    [t],
  );

  const canContinue =
    !isAvatarUploading &&
    (step === "review" ||
      (step === "name" && fullName.trim().length > 1) ||
      (step === "gender" && gender != null) ||
      step === "birthdate" ||
      step === "height" ||
      step === "weight" ||
      step === "bodyType" ||
      step === "sleep" ||
      step === "mood" ||
      (step === "activities" && activities.length > 0) ||
      step === "diet" ||
      step === "calories" ||
      (step === "goals" && goals.length > 0) ||
      step === "bloodType" ||
      step === "personalIntro" ||
      (step === "identity" && fullName.trim().length > 1) ||
      step === "avatar");

  const buildMeInput = (): UpdateMeInput => {
    const trimmedName = fullName.trim();
    const [first = "", ...rest] = trimmedName.split(/\s+/);
    const last = rest.join(" ");

    const address: UpdateAddressInput = {};
    if (provinceId && isDiscoveryApiId(provinceId)) {
      address.provinceId = provinceId;
    }
    if (city.trim()) address.city = city.trim();
    if (street.trim()) address.street = street.trim();
    if (apartment.trim()) address.apartment = apartment.trim();
    if (/^\d{10}$/.test(postalCode.trim())) {
      address.postalCode = postalCode.trim();
    }
    if (mapPoint) address.point = { lat: mapPoint.lat, lng: mapPoint.lng };

    const input: UpdateMeInput = {};
    if (first) input.name = { first, last };
    if (gender) {
      input.demographics = {
        gender,
        birthDate: birthdateToIso(birthdate),
      };
    }
    if (avatar.mediaId) input.avatar = { mediaId: avatar.mediaId };
    if (Object.keys(address).length > 0) input.address = address;
    return input;
  };

  const buildAthleteInput = (): UpdateAthleteProfileInput => ({
    body: { heightCm, weightKg },
    goalKeys: goals,
    lifestyle: {
      bodyType,
      ...(experience ? { experience } : {}),
      sleepLevel: sleep,
      mood,
      diet: diet === "glutenFree" ? "gluten_free" : diet,
      dailyCalories: caloriesKnown && calories > 0 ? calories : null,
      activityKeys: activities,
    },
    health: {
      bloodType: { group: bloodGroup, rh: bloodRh },
      allergies,
      conditions: conditions.trim(),
      medications: medications.trim(),
      note: healthNote.trim(),
    },
  });

  const completeOnboarding = () => {
    markOnboardingDone();
    // Persist best-effort: onboarding is optional, never block navigation.
    if (isAuthenticated) {
      void Promise.allSettled([
        accountProfile.updateMe(buildMeInput()),
        accountProfile.updateAthlete(buildAthleteInput()),
      ]);
    }
    const next = searchParams.get("next");
    const fallback = isAuthenticated
      ? roleHomePath(activeRole)
      : "/discovery";
    router.replace(next && next.startsWith("/") ? next : fallback);
  };

  const activePermissionKind: DevicePermissionKind | null =
    permissionIndex == null
      ? null
      : (ONBOARDING_PERMISSION_ORDER[permissionIndex] ?? null);

  const advancePermissionQueue = () => {
    if (permissionIndex == null) return;
    if (permissionIndex >= ONBOARDING_PERMISSION_ORDER.length - 1) {
      setPermissionIndex(null);
      completeOnboarding();
      return;
    }
    setPermissionIndex(permissionIndex + 1);
  };

  const requestFinish = () => {
    setPermissionIndex(0);
  };

  const handlePermissionContinue = () => {
    if (isRequestingPermission || activePermissionKind == null) return;
    setIsRequestingPermission(true);
    void requestDevicePermission(activePermissionKind)
      .catch(() => undefined)
      .finally(() => {
        setIsRequestingPermission(false);
        advancePermissionQueue();
      });
  };

  const handlePermissionSkip = () => {
    if (isRequestingPermission || activePermissionKind == null) return;
    skipDevicePermission(activePermissionKind);
    advancePermissionQueue();
  };

  const goPrev = () => {
    if (slide === 0) {
      router.back();
      return;
    }
    emblaApi?.scrollPrev();
  };

  const goNext = () => {
    if (!canContinue) return;
    if (slide >= ONBOARDING_SLIDE_COUNT - 1) {
      requestFinish();
      return;
    }
    emblaApi?.scrollNext();
  };

  const chooseExperience = (value: OnboardingExperienceId) => {
    setExperience(value);
    if (slide >= ONBOARDING_SLIDE_COUNT - 1) {
      requestFinish();
      return;
    }
    emblaApi?.scrollNext();
  };

  const toggleGoal = (id: OnboardingGoalId) => {
    setGoals((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const toggleActivity = (id: OnboardingActivityId) => {
    setActivities((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  return (
    <main className={styles.root({ className })}>
      <div className={styles.content()}>
        <OnboardingHeader
          backLabel={t("back")}
          className={styles.header()}
          progress={progress}
          progressLabel={t("progressLabel")}
          showProgress={showHeaderProgress}
          skipLabel={t("skip")}
          onBack={goPrev}
          onSkip={requestFinish}
        />

        <div
          aria-roledescription="carousel"
          className={styles.carousel()}
          ref={emblaRef}
        >
          <div className={styles.track()}>
            {ONBOARDING_STEPS.map((stepId, index) => {
              const isActive = slide === index;
              const mountStage = Math.abs(slide - index) <= 1;
              const subtitleKey = slideSubtitleKey(stepId);

              return (
                <OnboardingSlideShell
                  isActive={isActive}
                  key={stepId}
                  showChrome={!slideOwnsChrome(stepId)}
                  subtitle={subtitleKey ? t(subtitleKey) : undefined}
                  title={t(slideTitleKey(stepId))}
                >
                  {mountStage && stepId === "review" ? (
                    <OnboardingReviewSection artAlt={t("review.artAlt")} />
                  ) : null}

                  {mountStage && stepId === "name" ? (
                    <OnboardingNameSection
                      hint={t("name.hint")}
                      label={t("name.title")}
                      placeholder={t("name.placeholder")}
                      value={fullName}
                      onChange={setFullName}
                    />
                  ) : null}

                  {mountStage && stepId === "gender" ? (
                    <OnboardingGenderSection
                      options={genderOptions}
                      otherMax={ONBOARDING_GENDER_OTHER_MAX}
                      otherPlaceholder={t("gender.otherPlaceholder")}
                      otherValue={genderOther}
                      value={gender}
                      onChange={setGender}
                      onOtherChange={setGenderOther}
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
                      unitCmLabel={t("height.unitCm")}
                      unitFtLabel={t("height.unitFt")}
                      onHeightCmChange={setHeightCm}
                      onUnitChange={setHeightUnit}
                    />
                  ) : null}

                  {mountStage && stepId === "weight" ? (
                    <OnboardingWeightSection
                      label={t("weight.title")}
                      unit={weightUnit}
                      unitKgLabel={t("weight.unitKg")}
                      unitLbsLabel={t("weight.unitLbs")}
                      weightKg={weightKg}
                      onUnitChange={setWeightUnit}
                      onWeightKgChange={setWeightKg}
                    />
                  ) : null}

                  {mountStage && stepId === "bodyType" ? (
                    <OnboardingBodyTypeSection
                      gender={gender}
                      options={bodyTypeOptions}
                      swipeHint={t("bodyType.swipeHint")}
                      value={bodyType}
                      onChange={setBodyType}
                    />
                  ) : null}

                  {mountStage && stepId === "experience" ? (
                    <OnboardingExperienceSection
                      imageAlt={t("experience.imageAlt")}
                    />
                  ) : null}

                  {mountStage && stepId === "sleep" ? (
                    <OnboardingSleepSection
                      options={sleepOptions}
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

                  {mountStage && stepId === "activities" ? (
                    <OnboardingActivitiesSection
                      label={t("activities.title")}
                      options={activityOptions}
                      selected={activities}
                      onToggle={toggleActivity}
                    />
                  ) : null}

                  {mountStage && stepId === "diet" ? (
                    <OnboardingDietSection
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
                      summaryTemplate={t("calories.summary")}
                      unitLabel={t("calories.unitLabel")}
                      value={calories}
                      onChange={(next) => {
                        setCaloriesKnown(true);
                        setCalories(next);
                      }}
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

        {activePermissionKind ? (
          <OnboardingPermissionSheet
            isOpen
            isRequesting={isRequestingPermission}
            kind={activePermissionKind}
            labels={{
              title: t(`permissions.${activePermissionKind}.title`),
              subtitle: t(`permissions.${activePermissionKind}.subtitle`),
              sampleTitle: t(`permissions.${activePermissionKind}.sampleTitle`),
              sampleBody: t(`permissions.${activePermissionKind}.sampleBody`),
              sampleAction: t(
                `permissions.${activePermissionKind}.sampleAction`,
              ),
              sampleTime: t(`permissions.${activePermissionKind}.sampleTime`),
              info: t("permissions.info"),
              continue: t("permissions.continue"),
              skip: t("permissions.skip"),
            }}
            onContinue={handlePermissionContinue}
            onOpenChange={(open) => {
              if (!open && !isRequestingPermission) {
                handlePermissionSkip();
              }
            }}
            onSkip={handlePermissionSkip}
          />
        ) : null}

        <div className={styles.footer()}>
          {isAvatarUploading ? null : isExperienceStep ? (
            <div className={styles.experienceActions()}>
              <Button
                className={styles.experienceYes()}
                fullWidth
                size="lg"
                variant="primary"
                onPress={() => chooseExperience("experienced")}
              >
                {t("experience.yes")}
                <ArrowRight
                  aria-hidden
                  className={styles.experienceYesIcon()}
                  size={20}
                />
              </Button>
              <Button
                className={styles.experienceNo()}
                fullWidth
                size="lg"
                variant="secondary"
                onPress={() => chooseExperience("beginner")}
              >
                <CloseX
                  aria-hidden
                  className={styles.experienceNoIcon()}
                  size={20}
                />
                {t("experience.no")}
              </Button>
            </div>
          ) : isCaloriesStep ? (
            <div className={styles.caloriesFooter()}>
              <Button
                className={
                  calories > 0 || !caloriesKnown
                    ? styles.continue()
                    : styles.continueSoft()
                }
                fullWidth
                size="lg"
                variant={calories > 0 || !caloriesKnown ? "primary" : "secondary"}
                onPress={goNext}
              >
                {t("continue")}
                <ArrowRight
                  aria-hidden
                  className={styles.continueIcon()}
                  size={20}
                />
              </Button>
              <Button
                className={styles.caloriesUnknown()}
                size="sm"
                variant="ghost"
                onPress={() => {
                  setCaloriesKnown(false);
                  setCalories(0);
                  goNext();
                }}
              >
                {t("calories.unknown")}
              </Button>
            </div>
          ) : (
            <Button
              aria-disabled={!canContinue}
              className={canContinue ? styles.continue() : styles.continueSoft()}
              fullWidth
              size="lg"
              variant={canContinue ? "primary" : "secondary"}
              onPress={goNext}
            >
              {t("continue")}
              <ArrowRight
                aria-hidden
                className={styles.continueIcon()}
                size={20}
              />
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
