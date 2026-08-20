"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EMBLA_DURATION, emblaOptions } from "@repo/ui/lib/embla";
import {
  ONBOARDING_BLOOD_GROUPS,
  ONBOARDING_BODY_TYPES,
  ONBOARDING_DEFAULT_ALLERGIES,
  ONBOARDING_DEFAULT_BIRTH,
  ONBOARDING_DEFAULT_CALORIES,
  ONBOARDING_DEFAULT_HEIGHT_CM,
  ONBOARDING_DEFAULT_MOOD,
  ONBOARDING_DEFAULT_SLEEP,
  ONBOARDING_DEFAULT_WEIGHT_KG,
  ONBOARDING_FALLBACK_PROVINCES,
  ONBOARDING_GENDERS,
  ONBOARDING_MOODS,
  ONBOARDING_PHASES,
  ONBOARDING_SLEEP_LEVELS,
  ONBOARDING_SLIDE_COUNT,
  ONBOARDING_STEPS,
  onboardingPhaseForStep,
  type OnboardingBloodGroup,
  type OnboardingBodyTypeId,
  type OnboardingGenderId,
  type OnboardingMoodId,
  type OnboardingRhFactor,
  type OnboardingSleepLevel,
  type OnboardingStepId,
} from "@/modules/app/lib/onboarding-data";
import {
  ageFromJalali,
  birthdateToIso,
  formatJalaliDisplay,
  PREMADE_AVATARS,
  readDocumentDirection,
} from "@/modules/app/lib/onboarding-helpers";
import {
  minStepVisibleMs,
  runOnboardingSaveStep,
  selectOnboardingSaveSteps,
  waitRemaining,
  type OnboardingSaveContext,
  type OnboardingSaveStepId,
  type OnboardingSaveStepStatus,
  type OnboardingSaveStepView,
} from "@/modules/app/lib/onboarding-save";
import { markOnboardingDone } from "@/modules/app/lib/onboarding-storage";
import {
  normalizeHeightUnit,
  normalizeWeightUnit,
  type OnboardingHeightUnit,
  type OnboardingHeightUnitOption,
  type OnboardingWeightUnit,
  type OnboardingWeightUnitOption,
} from "@/modules/app/lib/onboarding-units";
import type { OnboardingAthleteLevelOption } from "@/modules/app/sections/OnboardingAthleteLevelSection";
import type { OnboardingAvatarValue } from "@/modules/app/sections/OnboardingAvatarSection";
import type { OnboardingBirthdateValue } from "@/modules/app/sections/OnboardingBirthdateSection";
import type { OnboardingDietOption } from "@/modules/app/sections/OnboardingDietSection";
import type { OnboardingGoalOption } from "@/modules/app/sections/OnboardingGoalsSection";
import type {
  OnboardingIdentityValue,
  OnboardingProvinceOption,
} from "@/modules/app/sections/OnboardingIdentitySection";
import type { OnboardingSportOption } from "@/modules/app/sections/OnboardingSportsSection";
import {
  basicsLocations,
  basicsSports,
  isDiscoveryApiId,
  mediaApi,
  mediaFileUrl,
} from "@/shared/lib/api";
import { loadChoiceGroups } from "@/shared/lib/choices-cache";
import { roleHomePath } from "@/shared/lib/role-routes";
import { useAuth } from "@/shared/providers/AuthProvider";
import type {
  AthleteDiet,
  UpdateAddressInput,
  UpdateAthleteProfileInput,
  UpdateMeInput,
} from "@repo/api";
import { ONBOARDING_PERMISSION_ORDER } from "@/shared/lib/device-permissions";
import { useDevicePermissions } from "@/shared/providers/DevicePermissionsProvider";
import { useRouter } from "@/shared/lib/app-router";

const ATHLETE_DIETS: readonly AthleteDiet[] = [
  "balanced",
  "vegetarian",
  "protein",
  "gluten_free",
];

function isAthleteDiet(value: string): value is AthleteDiet {
  return (ATHLETE_DIETS as readonly string[]).includes(value);
}

export function useOnboarding() {
  const t = useTranslations("Mobile.Onboarding");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, activeRole } = useAuth();
  const { ensurePermission } = useDevicePermissions();
  const reduceMotion = useReducedMotion();
  const [textDirection] = useState<"rtl" | "ltr">(readDocumentDirection);
  const [slide, setSlide] = useState(0);
  const permissionFlowInFlightRef = useRef(false);
  const [savePhase, setSavePhase] = useState<"idle" | "running">("idle");
  const [saveSteps, setSaveSteps] = useState<OnboardingSaveStepView[]>([]);
  const saveMutationIdsRef = useRef<
    Partial<Record<OnboardingSaveStepId, string>>
  >({});
  const saveContextRef = useRef<OnboardingSaveContext | null>(null);
  const saveStepsRef = useRef<OnboardingSaveStepView[]>([]);
  const persistInFlightRef = useRef(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<OnboardingGenderId | null>(null);
  const [apiGenderOptions, setApiGenderOptions] = useState<Array<{
    id: OnboardingGenderId;
    label: string;
  }> | null>(null);
  const [apiBodyTypeOptions, setApiBodyTypeOptions] = useState<Array<{
    id: OnboardingBodyTypeId;
    label: string;
  }> | null>(null);
  const [apiWeightUnitOptions, setApiWeightUnitOptions] = useState<
    OnboardingWeightUnitOption[] | null
  >(null);
  const [apiHeightUnitOptions, setApiHeightUnitOptions] = useState<
    OnboardingHeightUnitOption[] | null
  >(null);
  const [birthdate, setBirthdate] = useState<OnboardingBirthdateValue>({
    ...ONBOARDING_DEFAULT_BIRTH,
  });
  const [heightCm, setHeightCm] = useState(ONBOARDING_DEFAULT_HEIGHT_CM);
  const [heightUnit, setHeightUnit] = useState<OnboardingHeightUnit>("cm");
  const [heightProvided, setHeightProvided] = useState(false);
  const [weightKg, setWeightKg] = useState(ONBOARDING_DEFAULT_WEIGHT_KG);
  const [weightUnit, setWeightUnit] = useState<OnboardingWeightUnit>("kg");
  const [weightProvided, setWeightProvided] = useState(false);
  const [bodyType, setBodyType] = useState<OnboardingBodyTypeId | null>(null);
  const [athleteLevel, setAthleteLevel] = useState<string | null>(null);
  const [athleteLevelOptions, setAthleteLevelOptions] = useState<
    OnboardingAthleteLevelOption[]
  >([]);
  const [athleteLevelStatus, setAthleteLevelStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [sleep, setSleep] = useState<OnboardingSleepLevel>(
    ONBOARDING_DEFAULT_SLEEP,
  );
  const [mood, setMood] = useState<OnboardingMoodId>(ONBOARDING_DEFAULT_MOOD);
  const [sportIds, setSportIds] = useState<string[]>([]);
  const [sportOptions, setSportOptions] = useState<OnboardingSportOption[]>([]);
  const [sportsStatus, setSportsStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [diet, setDiet] = useState<string | null>(null);
  const [dietOptions, setDietOptions] = useState<OnboardingDietOption[]>([]);
  const [dietStatus, setDietStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [calories, setCalories] = useState(ONBOARDING_DEFAULT_CALORIES);
  const [caloriesKnown, setCaloriesKnown] = useState(true);
  const [goals, setGoals] = useState<string[]>([]);
  const [goalOptions, setGoalOptions] = useState<OnboardingGoalOption[]>([]);
  const [goalsStatus, setGoalsStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
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

  const [emblaRef, emblaApi] = useEmblaCarousel(
    emblaOptions({
      align: "center",
      containScroll: "trimSnaps",
      direction: textDirection,
      duration: reduceMotion ? EMBLA_DURATION.instant : EMBLA_DURATION.smooth,
      // Advance only via continue / back controls — no pan swipe.
      watchDrag: false,
    }),
  );

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

  useEffect(() => {
    let cancelled = false;
    setGoalsStatus("loading");
    setAthleteLevelStatus("loading");
    setDietStatus("loading");
    void (async () => {
      try {
        const groups = await loadChoiceGroups();
        if (cancelled) return;
        const byKey = new Map(groups.map((group) => [group.value, group]));

        const gender = byKey.get("gender");
        if (gender) {
          const nextGender = gender.options
            .filter((option) => option.isActive !== false)
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((option) => ({
              id: option.value as OnboardingGenderId,
              label: option.name,
            }))
            .filter((option) => ONBOARDING_GENDERS.includes(option.id));
          if (nextGender.length > 0) setApiGenderOptions(nextGender);
        }

        const goals = byKey.get("athlete_goal");
        if (goals) {
          const nextGoals = goals.options
            .filter((option) => option.isActive !== false)
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((option) => ({
              id: option.value,
              label: option.name,
            }));
          setGoalOptions(nextGoals);
          setGoals((current) =>
            current.filter((id) => nextGoals.some((option) => option.id === id)),
          );
          setGoalsStatus("ready");
        } else {
          setGoalOptions([]);
          setGoalsStatus("error");
        }

        const bodyType = byKey.get("body_type");
        if (bodyType) {
          const nextBody = bodyType.options
            .filter((option) => option.isActive !== false)
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((option) => ({
              id: option.value as OnboardingBodyTypeId,
              label: option.name,
            }))
            .filter((option) => ONBOARDING_BODY_TYPES.includes(option.id));
          if (nextBody.length > 0) setApiBodyTypeOptions(nextBody);
        }

        const weightUnit = byKey.get("weight_unit");
        if (weightUnit) {
          const nextWeight = weightUnit.options
            .filter((option) => option.isActive !== false)
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .flatMap((option) => {
              const id = normalizeWeightUnit(option.value);
              if (!id) return [];
              return [{ id, label: option.name }];
            });
          if (nextWeight.length > 0) {
            setApiWeightUnitOptions(nextWeight);
            setWeightUnit((current) =>
              nextWeight.some((option) => option.id === current)
                ? current
                : (nextWeight[0]?.id ?? current),
            );
          }
        }

        const heightUnit = byKey.get("height_unit");
        if (heightUnit) {
          const nextHeight = heightUnit.options
            .filter((option) => option.isActive !== false)
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .flatMap((option) => {
              const id = normalizeHeightUnit(option.value);
              if (!id) return [];
              return [{ id, label: option.name }];
            });
          if (nextHeight.length > 0) {
            setApiHeightUnitOptions(nextHeight);
            setHeightUnit((current) =>
              nextHeight.some((option) => option.id === current)
                ? current
                : (nextHeight[0]?.id ?? current),
            );
          }
        }

        const level = byKey.get("athlete_level");
        if (level) {
          const nextLevel = level.options
            .filter((option) => option.isActive !== false)
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((option) => ({
              value: option.value,
              name: option.name,
              description: option.description?.trim() ?? "",
            }));
          setAthleteLevelOptions(nextLevel);
          setAthleteLevel((current) => {
            if (current && nextLevel.some((option) => option.value === current)) {
              return current;
            }
            return (
              nextLevel[Math.min(3, nextLevel.length - 1)]?.value ??
              nextLevel[0]?.value ??
              null
            );
          });
          setAthleteLevelStatus("ready");
        } else {
          setAthleteLevelOptions([]);
          setAthleteLevelStatus("error");
        }

        const diet = byKey.get("athlete_diet");
        if (diet) {
          const nextDiet = diet.options
            .filter((option) => option.isActive !== false)
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((option) => ({
              id: option.value,
              title: option.name,
              description: option.description?.trim() ?? "",
              icon: option.value,
            }));
          setDietOptions(nextDiet);
          setDiet((current) => {
            if (current && nextDiet.some((option) => option.id === current)) {
              return current;
            }
            return nextDiet[0]?.id ?? null;
          });
          setDietStatus("ready");
        } else {
          setDietOptions([]);
          setDietStatus("error");
        }
      } catch {
        if (cancelled) return;
        setGoalsStatus("error");
        setAthleteLevelStatus("error");
        setDietStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setSportsStatus("loading");
    void (async () => {
      try {
        const page = await basicsSports.listSports();
        if (cancelled) return;
        const next = page.result
          .filter((item) => item.isActive !== false)
          .slice()
          .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
          .map((item) => ({
            id: item.id,
            label: item.name,
            slug: item.slug,
            icon: item.icon,
          }));
        setSportOptions(next);
        setSportsStatus("ready");
      } catch {
        if (cancelled) return;
        setSportOptions([]);
        setSportsStatus("error");
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
  const isCaloriesStep = step === "calories";
  const isAvatarUploading = step === "avatar" && avatar.mode === "uploading";
  const showHeaderProgress = phase === "assessment";

  const fullName = useMemo(
    () =>
      [firstName, lastName]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(" "),
    [firstName, lastName],
  );

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

  const genderOptions = useMemo(() => {
    if (apiGenderOptions && apiGenderOptions.length > 0) {
      return apiGenderOptions;
    }
    return ONBOARDING_GENDERS.map((id) => ({
      id,
      label: t(`gender.options.${id}`),
    }));
  }, [apiGenderOptions, t]);

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
      genderOptions: Object.fromEntries(
        genderOptions.map((option) => [option.id, option.label]),
      ) as Record<OnboardingGenderId, string>,
    }),
    [genderOptions, t],
  );

  const patchIdentity = (patch: Partial<OnboardingIdentityValue>) => {
    if (patch.fullName !== undefined) {
      const parts = patch.fullName.trim().split(/\s+/).filter(Boolean);
      setFirstName(parts[0] ?? "");
      setLastName(parts.slice(1).join(" "));
    }
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
    if (patch.heightCm !== undefined) {
      setHeightCm(patch.heightCm);
      setHeightProvided(true);
    }
    if (patch.weightKg !== undefined) {
      setWeightKg(patch.weightKg);
      setWeightProvided(true);
    }
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

  const bodyTypeOptions = useMemo(() => {
    const source =
      apiBodyTypeOptions && apiBodyTypeOptions.length > 0
        ? apiBodyTypeOptions
        : ONBOARDING_BODY_TYPES.map((id) => ({
            id,
            label: t(`bodyType.options.${id}.label`),
          }));

    return source.map((option) => ({
      id: option.id,
      label: option.label,
      statement: t(`bodyType.options.${option.id}.statement`),
    }));
  }, [apiBodyTypeOptions, t]);

  const weightUnitOptions = useMemo<OnboardingWeightUnitOption[]>(() => {
    if (apiWeightUnitOptions && apiWeightUnitOptions.length > 0) {
      return apiWeightUnitOptions;
    }
    return [
      { id: "lbs", label: t("weight.unitLbs") },
      { id: "kg", label: t("weight.unitKg") },
    ];
  }, [apiWeightUnitOptions, t]);

  const heightUnitOptions = useMemo<OnboardingHeightUnitOption[]>(() => {
    if (apiHeightUnitOptions && apiHeightUnitOptions.length > 0) {
      return apiHeightUnitOptions;
    }
    return [
      { id: "ft", label: t("height.unitFt") },
      { id: "cm", label: t("height.unitCm") },
    ];
  }, [apiHeightUnitOptions, t]);

  const sleepOptions = useMemo(
    () =>
      ONBOARDING_SLEEP_LEVELS.map((level) => ({
        level,
        label: t(`sleep.levels.${level}.label`),
        description: t(`sleep.levels.${level}.description`),
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

  const canContinue =
    !isAvatarUploading &&
    (step === "review" ||
      (step === "name" && firstName.trim().length > 1) ||
      (step === "gender" && gender != null) ||
      step === "birthdate" ||
      step === "height" ||
      step === "weight" ||
      step === "bodyType" ||
      step === "athleteLevel" ||
      step === "sleep" ||
      step === "mood" ||
      step === "sports" ||
      (step === "diet" && diet != null) ||
      step === "calories" ||
      (step === "goals" && goals.length > 0) ||
      step === "bloodType" ||
      step === "personalIntro" ||
      (step === "identity" && firstName.trim().length > 1) ||
      step === "avatar");

  const commitHeightCm = (value: number) => {
    setHeightCm(value);
    setHeightProvided(true);
  };

  const commitWeightKg = (value: number) => {
    setWeightKg(value);
    setWeightProvided(true);
  };

  const buildMeInput = (): UpdateMeInput => {
    const first = firstName.trim();
    const last = lastName.trim();

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

  const buildAthleteCoreInput = (): UpdateAthleteProfileInput => ({
    ...(heightProvided || weightProvided
      ? {
          body: {
            ...(heightProvided ? { heightCm } : {}),
            ...(weightProvided ? { weightKg } : {}),
          },
        }
      : {}),
    ...(athleteLevel ? { levelKey: athleteLevel } : {}),
    lifestyle: {
      ...(bodyType ? { bodyType } : {}),
      sleepLevel: sleep,
      mood,
      ...(diet && isAthleteDiet(diet) ? { diet } : {}),
      dailyCalories: caloriesKnown && calories > 0 ? calories : null,
    },
    health: {
      bloodType: { group: bloodGroup, rh: bloodRh },
      allergies,
      conditions: conditions.trim(),
      medications: medications.trim(),
      note: healthNote.trim(),
    },
  });

  const snapshotSaveContext = (): OnboardingSaveContext => ({
    weightKg,
    heightCm,
    weightProvided,
    heightProvided,
    sleep,
    mood,
    calories,
    caloriesKnown,
    goals,
    sportIds,
    meInput: buildMeInput(),
    athleteInput: buildAthleteCoreInput(),
  });

  const replaceSaveSteps = (next: OnboardingSaveStepView[]) => {
    saveStepsRef.current = next;
    setSaveSteps(next);
  };

  const patchSaveStep = (
    id: OnboardingSaveStepId,
    status: OnboardingSaveStepStatus,
  ) => {
    replaceSaveSteps(
      saveStepsRef.current.map((step) =>
        step.id === id ? { ...step, status } : step,
      ),
    );
  };

  const persistOnboarding = async () => {
    if (persistInFlightRef.current) return;
    persistInFlightRef.current = true;

    if (!saveContextRef.current) {
      saveContextRef.current = snapshotSaveContext();
    }
    const ctx = saveContextRef.current;

    if (saveStepsRef.current.length === 0) {
      replaceSaveSteps(
        selectOnboardingSaveSteps(ctx).map((id) => ({
          id,
          status: "pending",
        })),
      );
    }
    setSavePhase("running");

    const minVisible = minStepVisibleMs(reduceMotion);
    try {
      const stepIds = saveStepsRef.current.map((step) => step.id);
      for (const id of stepIds) {
        if (
          saveStepsRef.current.find((step) => step.id === id)?.status === "done"
        ) {
          continue;
        }
        patchSaveStep(id, "active");
        const startedAt = Date.now();
        await runOnboardingSaveStep(id, ctx, saveMutationIdsRef.current);
        await waitRemaining(startedAt, minVisible);
        patchSaveStep(id, "done");
      }
      await waitRemaining(Date.now(), reduceMotion ? 0 : 280);
      persistInFlightRef.current = false;
      void runPermissionFlow();
    } catch {
      const active = saveStepsRef.current.find(
        (step) => step.status === "active",
      );
      if (active) patchSaveStep(active.id, "error");
      persistInFlightRef.current = false;
    }
  };

  const completeOnboarding = () => {
    markOnboardingDone();
    const next = searchParams.get("next");
    const fallback = isAuthenticated
      ? roleHomePath(activeRole)
      : "/discovery";
    router.replace(next && next.startsWith("/") ? next : fallback);
  };

  const runPermissionFlow = async () => {
    if (permissionFlowInFlightRef.current) return;
    permissionFlowInFlightRef.current = true;
    try {
      for (const kind of ONBOARDING_PERMISSION_ORDER) {
        // Already-granted permissions are skipped inside ensurePermission.
        await ensurePermission(kind);
      }
    } finally {
      permissionFlowInFlightRef.current = false;
      completeOnboarding();
    }
  };

  const requestFinish = () => {
    if (persistInFlightRef.current || permissionFlowInFlightRef.current) return;
    if (
      saveStepsRef.current.length > 0 &&
      saveStepsRef.current.every((step) => step.status === "done")
    ) {
      void runPermissionFlow();
      return;
    }
    if (!isAuthenticated) {
      void runPermissionFlow();
      return;
    }
    void persistOnboarding();
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
    if (step === "height") setHeightProvided(true);
    if (step === "weight") setWeightProvided(true);
    if (slide >= ONBOARDING_SLIDE_COUNT - 1) {
      requestFinish();
      return;
    }
    emblaApi?.scrollNext();
  };

  const toggleGoal = (id: string) => {
    setGoals((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const toggleSport = (id: string) => {
    setSportIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const handleCaloriesUnknown = () => {
    setCaloriesKnown(false);
    setCalories(0);
    goNext();
  };

  const handleCaloriesChange = (next: number) => {
    setCaloriesKnown(true);
    setCalories(next);
  };

  return {
    t,
    emblaRef,
    slide,
    step,
    progress,
    age,
    showHeaderProgress,
    isCaloriesStep,
    isAvatarUploading,
    canContinue,
    calories,
    caloriesKnown,
    firstName,
    lastName,
    fullName,
    gender,
    birthdate,
    heightCm,
    heightUnit,
    weightKg,
    weightUnit,
    bodyType,
    athleteLevel,
    athleteLevelOptions,
    athleteLevelStatus,
    sleep,
    mood,
    sportIds,
    sportOptions,
    sportsStatus,
    diet,
    dietOptions,
    dietStatus,
    goals,
    goalOptions,
    goalsStatus,
    bloodGroup,
    bloodRh,
    avatar,
    identityValue,
    identityLabels,
    provinces,
    phaseSteps,
    genderOptions,
    bodyTypeOptions,
    weightUnitOptions,
    heightUnitOptions,
    sleepOptions,
    moodOptions,
    isSavingView: savePhase !== "idle",
    saveSteps: saveSteps.map((step) => ({
      ...step,
      label: t(`saving.steps.${step.id}`),
    })),
    retrySave: persistOnboarding,
    setFirstName,
    setLastName,
    setGender,
    setBirthdate,
    setHeightCm: commitHeightCm,
    setHeightUnit,
    setWeightKg: commitWeightKg,
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
    goPrev,
    goNext,
    handleCaloriesUnknown,
    handleCaloriesChange,
    requestFinish,
  };
}

export type UseOnboardingReturn = ReturnType<typeof useOnboarding>;
