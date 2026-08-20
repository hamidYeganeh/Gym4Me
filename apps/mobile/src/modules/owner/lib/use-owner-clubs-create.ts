"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "@/shared/lib/app-router";

import { useTranslations } from "next-intl";
import { duration, ease } from "@repo/theme";
import type { Club, KycStatus, RefItem, SportNode } from "@repo/api";
import { ApiError } from "@repo/api";
import type { FormStepperStep } from "@repo/ui/kit/FormStepper";
import type { Variants } from "motion/react";
import { useReducedMotion } from "motion/react";
import {
  buildCreateClubPayload,
  CLUB_CREATE_STEP_COUNT,
  createEmptyClubCreateForm,
  type ClubCreateFormState,
  type ClubCreateWizardStep,
} from "@/modules/owner/lib/club-create-form";
import {
  buildClubCreateReviewSections,
} from "@/modules/owner/lib/build-club-create-review-sections";
import {
  accountClubs,
  accountKyc,
  basicsRefs,
  basicsSports,
  mediaApi,
} from "@/shared/lib/api";

export const LAST_CLUB_CREATE_STEP = (CLUB_CREATE_STEP_COUNT -
  1) as ClubCreateWizardStep;

export const clubCreateStepSlideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 32 : -32,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -32 : 32,
    opacity: 0,
  }),
};

export function useOwnerClubsCreate() {
  const t = useTranslations("Mobile.ClubCreate");
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const stepDirection = useRef(1);

  const form = useForm<ClubCreateFormState>({
    defaultValues: createEmptyClubCreateForm(),
    mode: "onChange",
  });
  const { control, getValues, setValue, watch } = form;
  const formValues = useWatch({ control });

  const [step, setStep] = useState<ClubCreateWizardStep>(0);
  const [club, setClub] = useState<Club | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [categories, setCategories] = useState<RefItem[]>([]);
  const [amenities, setAmenities] = useState<RefItem[]>([]);
  const [equipment, setEquipment] = useState<RefItem[]>([]);
  const [sports, setSports] = useState<SportNode[]>([]);

  useEffect(() => {
    let cancelled = false;
    accountKyc
      .status()
      .then((status) => {
        if (!cancelled) setKycStatus(status.kycStatus);
      })
      .catch(() => {
        // Leave gating to the API.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsCatalogLoading(true);
    Promise.all([
      basicsRefs.list("club_category"),
      basicsRefs.list("amenity"),
      basicsRefs.list("equipment"),
      basicsSports.listSports(),
    ])
      .then(([categoryRes, amenityRes, equipmentRes, sportsRes]) => {
        if (cancelled) return;
        setCategories(categoryRes.result);
        setAmenities(amenityRes.result);
        setEquipment(equipmentRes.result);
        setSports(sportsRes.result);
      })
      .catch(() => {
        if (!cancelled) {
          setCategories([]);
          setAmenities([]);
          setEquipment([]);
          setSports([]);
        }
      })
      .finally(() => {
        if (!cancelled) setIsCatalogLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const steps: FormStepperStep[] = useMemo(
    () => [
      { key: "identity", label: t("stepIdentity") },
      { key: "contact", label: t("stepContact") },
      { key: "location", label: t("stepLocation") },
      { key: "categories", label: t("stepCategories") },
      { key: "sports", label: t("stepSports") },
      { key: "amenities", label: t("stepAmenities") },
      { key: "equipment", label: t("stepEquipment") },
      { key: "media", label: t("stepMedia") },
      { key: "hours", label: t("stepHours") },
      { key: "rules", label: t("stepRules") },
      { key: "review", label: t("stepReview") },
    ],
    [t],
  );

  const validateStep = (current: ClubCreateWizardStep): string | null => {
    const values = getValues();
    if (current === 0 && !values.name.trim()) {
      return t("errorNameRequired");
    }
    if (current === 1) {
      const incompleteSocial = values.socials.some(
        (social) =>
          (social.platform.trim() && !social.url.trim()) ||
          (!social.platform.trim() && social.url.trim()),
      );
      if (incompleteSocial) return t("errorSocialIncomplete");
    }
    if (current === 9) {
      const incomplete = values.rules.some((rule) => !rule.title.trim());
      if (incomplete) return t("errorRuleTitleRequired");
    }
    return null;
  };

  const goNext = () => {
    setError(null);
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    stepDirection.current = 1;
    setStep((prev) =>
      prev < LAST_CLUB_CREATE_STEP
        ? ((prev + 1) as ClubCreateWizardStep)
        : prev,
    );
  };

  const goBack = () => {
    setError(null);
    if (step === 0) {
      router.back();
      return;
    }
    stepDirection.current = -1;
    setStep((prev) =>
      prev > 0 ? ((prev - 1) as ClubCreateWizardStep) : prev,
    );
  };

  const slideTransition = reduceMotion
    ? { duration: 0 }
    : { duration: duration.moderate, ease: ease.outFluid };

  const slideVariants = reduceMotion
    ? ({
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      } satisfies Variants)
    : clubCreateStepSlideVariants;

  const handleSaveDraft = async () => {
    setError(null);
    setNotice(null);
    const values = getValues();
    if (!values.name.trim()) {
      setError(t("errorNameRequired"));
      setStep(0);
      return;
    }
    const rulesError = validateStep(9);
    if (rulesError) {
      setError(rulesError);
      setStep(9);
      return;
    }

    setIsPending(true);
    try {
      const payload = buildCreateClubPayload(values);
      const next = club
        ? await accountClubs.update(club.id, payload)
        : await accountClubs.create(payload);
      setClub(next);
      setNotice(t("saved"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("error"));
    } finally {
      setIsPending(false);
    }
  };

  const handleSubmitReview = async (file: File | null) => {
    if (!file || !club) return;
    setError(null);
    setNotice(null);
    setIsSubmitting(true);
    try {
      const uploaded = await mediaApi.upload(file);
      const next = await accountClubs.submit(club.id, {
        documentMediaIds: [uploaded.id],
      });
      setClub(next);
      setNotice(t("submitted"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const kycGateVisible = kycStatus !== null && kycStatus !== "approved";

  const reviewSections = useMemo(
    () =>
      buildClubCreateReviewSections({
        values: formValues as ClubCreateFormState,
        categories,
        amenities,
        equipment,
        sports,
        t,
      }),
    [amenities, categories, equipment, formValues, sports, t],
  );

  const categoryIds = watch("categoryIds");
  const sportIds = watch("sportIds");
  const amenityIds = watch("amenityIds");
  const equipmentIds = watch("equipmentIds");
  const genderPolicy = watch("genderPolicy");
  const ageGroupKeys = watch("ageGroupKeys");
  const hoursMode = watch("hoursMode");
  const operatingHours = watch("operatingHours");
  const rules = watch("rules");

  return {
    t,
    router,
    form,
    control,
    setValue,
    step,
    stepDirection,
    club,
    error,
    notice,
    isPending,
    isSubmitting,
    kycStatus,
    kycGateVisible,
    isCatalogLoading,
    categories,
    amenities,
    equipment,
    sports,
    steps,
    slideTransition,
    slideVariants,
    reviewSections,
    categoryIds,
    sportIds,
    amenityIds,
    equipmentIds,
    genderPolicy,
    ageGroupKeys,
    hoursMode,
    operatingHours,
    rules,
    goNext,
    goBack,
    handleSaveDraft,
    handleSubmitReview,
  };
}

export type UseOwnerClubsCreateReturn = ReturnType<typeof useOwnerClubsCreate>;
