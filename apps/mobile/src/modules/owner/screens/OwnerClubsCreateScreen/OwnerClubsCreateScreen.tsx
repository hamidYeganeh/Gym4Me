"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button, Typography } from "@heroui/react";
import type { Club, KycStatus, RefItem, SportNode } from "@repo/api";
import { ApiError } from "@repo/api";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { duration, ease } from "@repo/theme";
import { FormStepper, type FormStepperStep } from "@repo/ui/kit/FormStepper";
import { StickyBottomActions } from "@repo/ui/kit/StickyBottomActions";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { useTranslations } from "next-intl";
import {
  AGE_GROUP_OPTIONS,
  applyGenderPolicyToHours,
  applyHoursMode,
  buildCreateClubPayload,
  CLUB_CREATE_STEP_COUNT,
  createEmptyClubCreateForm,
  createRuleDraft,
  hoursForAudience,
  patchHourInList,
  SOCIAL_PLATFORM_OPTIONS,
  toggleIdInList,
  WEEKDAY_KEYS,
  type ClubCreateFormState,
  type ClubCreateWizardStep,
} from "../../lib/club-create-form";
import { OwnerClubsCreateCatalogSection } from "../../sections/OwnerClubsCreateCatalogSection";
import { OwnerClubsCreateContactSection } from "../../sections/OwnerClubsCreateContactSection";
import { OwnerClubsCreateHoursSection } from "../../sections/OwnerClubsCreateHoursSection";
import { OwnerClubsCreateIdentitySection } from "../../sections/OwnerClubsCreateIdentitySection";
import { OwnerClubsCreateLocationSection } from "../../sections/OwnerClubsCreateLocationSection";
import { OwnerClubsCreateMediaSection } from "../../sections/OwnerClubsCreateMediaSection";
import {
  OwnerClubsCreateReviewSection,
  type OwnerClubsCreateReviewSectionBlock,
} from "../../sections/OwnerClubsCreateReviewSection";
import { OwnerClubsCreateRulesSection } from "../../sections/OwnerClubsCreateRulesSection";
import {
  accountClubs,
  accountKyc,
  basicsRefs,
  basicsSports,
  mediaApi,
} from "@/shared/lib/api";
import { ownerClubsCreateScreenVariants } from "./OwnerClubsCreateScreen.styles";
import type { OwnerClubsCreateScreenProps } from "./OwnerClubsCreateScreen.types";

const LAST_STEP = (CLUB_CREATE_STEP_COUNT - 1) as ClubCreateWizardStep;

const stepSlideVariants: Variants = {
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

function mapRefOptions(items: RefItem[]) {
  return items.map((item) => ({ id: item.id, name: item.name }));
}

function mapSportOptions(items: SportNode[]) {
  return items.map((item) => ({ id: item.id, name: item.name }));
}

export function OwnerClubsCreateScreen({
  className,
}: OwnerClubsCreateScreenProps) {
  const t = useTranslations("Mobile.ClubCreate");
  const styles = ownerClubsCreateScreenVariants();
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
        // Leave gating to the API: KYC_REQUIRED responses redirect to /owner/kyc.
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
      prev < LAST_STEP ? ((prev + 1) as ClubCreateWizardStep) : prev,
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
    : stepSlideVariants;

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

  const reviewSections = useMemo((): OwnerClubsCreateReviewSectionBlock[] => {
    const values = formValues as ClubCreateFormState;
    const categoryMap = new Map(categories.map((item) => [item.id, item.name]));
    const amenityMap = new Map(amenities.map((item) => [item.id, item.name]));
    const equipmentMap = new Map(equipment.map((item) => [item.id, item.name]));
    const sportMap = new Map(sports.map((item) => [item.id, item.name]));

    const resolveNames = (ids: string[], map: Map<string, string>) =>
      ids.map((id) => map.get(id) ?? id).filter(Boolean);

    const genderLabel =
      values.genderPolicy === "male_only"
        ? t("genderMaleOnly")
        : values.genderPolicy === "female_only"
          ? t("genderFemaleOnly")
          : t("genderMixed");

    const ageChips = (values.ageGroupKeys ?? []).map((key) => {
      if (key === "kids") return t("ageKids");
      if (key === "teens") return t("ageTeens");
      if (key === "adults") return t("ageAdults");
      if (key === "seniors") return t("ageSeniors");
      return key;
    });

    const hoursModeLabel =
      values.hoursMode === "gender_split"
        ? t("hoursModeGenderSplit")
        : t("hoursModeUnified");

    const formatHourRows = (
      audience: "shared" | "male" | "female",
    ) =>
      hoursForAudience(values.operatingHours ?? [], audience).map((hour) => {
        const dayKey = WEEKDAY_KEYS[hour.weekday] ?? "sat";
        return {
          key: `${audience}-${hour.weekday}`,
          day: t(`weekdays.${dayKey}`),
          value:
            hour.status === "closed"
              ? t("dayClosed")
              : `${hour.open} – ${hour.close}`,
        };
      });

    const isSplit =
      values.genderPolicy === "mixed" && values.hoursMode === "gender_split";
    const hourGroups = isSplit
      ? [
          {
            key: "male",
            title: t("hoursAudienceMale"),
            rows: formatHourRows("male"),
          },
          {
            key: "female",
            title: t("hoursAudienceFemale"),
            rows: formatHourRows("female"),
          },
        ]
      : [
          {
            key: "shared",
            title: t("operatingHours"),
            rows: formatHourRows("shared"),
          },
        ];

    const phones = (values.phones ?? []).filter((phone) =>
      phone.number.trim(),
    );
    const socials = (values.socials ?? []).filter(
      (social) => social.platform.trim() && social.url.trim(),
    );
    const rules = (values.rules ?? []).filter((rule) => rule.title.trim());
    const mediaItems = [
      ...(values.coverMediaId
        ? [
            {
              key: "cover",
              mediaId: values.coverMediaId,
              fileName: values.coverFileName || "cover.jpg",
              label: t("cover"),
            },
          ]
        : []),
      ...(values.gallery ?? []).map((item) => ({
        key: item.id,
        mediaId: item.mediaId,
        fileName: item.fileName || "gallery.jpg",
        label: t("gallery"),
      })),
    ];

    const socialPlatformLabel = (platform: string) => {
      if (
        (SOCIAL_PLATFORM_OPTIONS as readonly string[]).includes(platform)
      ) {
        return t(
          `socialPlatforms.${platform as (typeof SOCIAL_PLATFORM_OPTIONS)[number]}`,
        );
      }
      return platform;
    };

    return [
      {
        key: "identity",
        title: t("stepIdentity"),
        fields: [
          {
            key: "name",
            label: t("name"),
            value: (values.name ?? "").trim(),
          },
          {
            key: "description",
            label: t("description"),
            value: (values.description ?? "").trim(),
          },
        ],
      },
      {
        key: "contact",
        title: t("stepContact"),
        fields: [
          {
            key: "website",
            label: t("website"),
            value: (values.website ?? "").trim(),
          },
        ],
        list: [
          ...phones.map((phone, index) => ({
            key: phone.id || `phone-${index}`,
            primary: phone.number.trim(),
            secondary: phone.label.trim() || undefined,
            meta: t("phone"),
          })),
          ...socials.map((social, index) => ({
            key: social.id || `social-${index}`,
            primary: socialPlatformLabel(social.platform),
            secondary: social.url.trim(),
            meta: t("socials"),
          })),
        ],
        emptyLabel:
          phones.length || socials.length || (values.website ?? "").trim()
            ? undefined
            : t("reviewEmptyPhones"),
      },
      {
        key: "location",
        title: t("stepLocation"),
        fields: [
          {
            key: "address",
            label: t("address"),
            value: (values.address ?? "").trim(),
          },
          {
            key: "lat",
            label: t("latitude"),
            value: values.point ? values.point.lat.toFixed(6) : "",
          },
          {
            key: "lng",
            label: t("longitude"),
            value: values.point ? values.point.lng.toFixed(6) : "",
          },
        ],
      },
      {
        key: "categories",
        title: t("stepCategories"),
        chips: resolveNames(values.categoryIds ?? [], categoryMap),
        emptyLabel: t("reviewEmptyCatalog"),
      },
      {
        key: "sports",
        title: t("stepSports"),
        chips: resolveNames(values.sportIds ?? [], sportMap),
        emptyLabel: t("reviewEmptyCatalog"),
      },
      {
        key: "amenities",
        title: t("stepAmenities"),
        chips: resolveNames(values.amenityIds ?? [], amenityMap),
        emptyLabel: t("reviewEmptyCatalog"),
      },
      {
        key: "equipment",
        title: t("stepEquipment"),
        chips: resolveNames(values.equipmentIds ?? [], equipmentMap),
        emptyLabel: t("reviewEmptyCatalog"),
      },
      {
        key: "media",
        title: t("stepMedia"),
        media: mediaItems,
        emptyLabel: t("reviewEmptyMedia"),
      },
      {
        key: "hours",
        title: t("stepHours"),
        fields: [
          {
            key: "gender",
            label: t("genderPolicy"),
            value: genderLabel,
          },
          {
            key: "hoursMode",
            label: t("hoursMode"),
            value: hoursModeLabel,
          },
          {
            key: "ages",
            label: t("ageGroups"),
            value: ageChips.join("، "),
          },
        ],
        hourGroups,
        emptyLabel: t("reviewEmptyHours"),
      },
      {
        key: "rules",
        title: t("stepRules"),
        list: rules.map((rule) => ({
          key: rule.id,
          primary: rule.title.trim(),
          secondary: rule.description.trim() || undefined,
          meta:
            rule.policy === "allowed" ? t("ruleAllowed") : t("ruleForbidden"),
        })),
        emptyLabel: t("reviewEmptyRules"),
      },
    ];
  }, [amenities, categories, equipment, formValues, sports, t]);

  const categoryIds = watch("categoryIds");
  const sportIds = watch("sportIds");
  const amenityIds = watch("amenityIds");
  const equipmentIds = watch("equipmentIds");
  const genderPolicy = watch("genderPolicy");
  const ageGroupKeys = watch("ageGroupKeys");
  const hoursMode = watch("hoursMode");
  const operatingHours = watch("operatingHours");
  const rules = watch("rules");

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <Header
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
          title={t("title")}
        />
      }
    >
      <div className={styles.content()}>
        <div className={styles.intro()}>
          <Typography type="h3" weight="semibold">
            {t("title")}
          </Typography>
          <Typography color="muted" type="body">
            {t("subtitle")}
          </Typography>
        </div>

        {kycGateVisible ? (
          <section className={styles.stepCard()}>
            <div>
              <Typography
                className={styles.stepTitle()}
                type="h4"
                weight="bold"
              >
                {t("kycRequiredTitle")}
              </Typography>
              <Typography className={styles.stepHint()} type="body-sm">
                {kycStatus === "pending"
                  ? t("kycPendingHint")
                  : t("kycRequiredHint")}
              </Typography>
            </div>
            {kycStatus !== "pending" ? (
              <Button
                fullWidth
                size="lg"
                variant="primary"
                onPress={() => router.push("/owner/kyc")}
              >
                {t("kycRequiredCta")}
              </Button>
            ) : null}
          </section>
        ) : (
          <>
            <FormStepper
              activeIndex={step}
              aria-label={t("stepperLabel")}
              className={styles.stepper()}
              steps={steps}
            />

            <AnimatePresence custom={stepDirection.current} mode="wait">
              <motion.div
                animate="center"
                className={styles.stepPanel()}
                custom={stepDirection.current}
                exit="exit"
                initial="enter"
                key={step}
                transition={slideTransition}
                variants={slideVariants}
              >
                {step === 0 ? (
                  <OwnerClubsCreateIdentitySection control={control} />
                ) : null}

                {step === 1 ? (
                  <OwnerClubsCreateContactSection control={control} />
                ) : null}

                {step === 2 ? (
                  <OwnerClubsCreateLocationSection control={control} />
                ) : null}

                {step === 3 ? (
                  <OwnerClubsCreateCatalogSection
                    hint={t("stepCategoriesHint")}
                    isLoading={isCatalogLoading}
                    options={mapRefOptions(categories)}
                    selectedIds={categoryIds}
                    title={t("stepCategories")}
                    onToggle={(id) =>
                      setValue(
                        "categoryIds",
                        toggleIdInList(categoryIds, id),
                        { shouldDirty: true },
                      )
                    }
                  />
                ) : null}

                {step === 4 ? (
                  <OwnerClubsCreateCatalogSection
                    hint={t("stepSportsHint")}
                    isLoading={isCatalogLoading}
                    options={mapSportOptions(sports)}
                    selectedIds={sportIds}
                    title={t("stepSports")}
                    onToggle={(id) =>
                      setValue("sportIds", toggleIdInList(sportIds, id), {
                        shouldDirty: true,
                      })
                    }
                  />
                ) : null}

                {step === 5 ? (
                  <OwnerClubsCreateCatalogSection
                    hint={t("stepAmenitiesHint")}
                    isLoading={isCatalogLoading}
                    options={mapRefOptions(amenities)}
                    selectedIds={amenityIds}
                    title={t("stepAmenities")}
                    onToggle={(id) =>
                      setValue(
                        "amenityIds",
                        toggleIdInList(amenityIds, id),
                        { shouldDirty: true },
                      )
                    }
                  />
                ) : null}

                {step === 6 ? (
                  <OwnerClubsCreateCatalogSection
                    hint={t("stepEquipmentHint")}
                    isLoading={isCatalogLoading}
                    options={mapRefOptions(equipment)}
                    selectedIds={equipmentIds}
                    title={t("stepEquipment")}
                    onToggle={(id) =>
                      setValue(
                        "equipmentIds",
                        toggleIdInList(equipmentIds, id),
                        { shouldDirty: true },
                      )
                    }
                  />
                ) : null}

                {step === 7 ? (
                  <OwnerClubsCreateMediaSection
                    control={control}
                    setValue={setValue}
                  />
                ) : null}

                {step === 8 ? (
                  <OwnerClubsCreateHoursSection
                    ageGroupKeys={ageGroupKeys}
                    genderPolicy={genderPolicy}
                    hoursMode={hoursMode}
                    operatingHours={operatingHours}
                    onGenderPolicyChange={(nextGenderPolicy) => {
                      const next = applyGenderPolicyToHours(
                        nextGenderPolicy,
                        operatingHours,
                      );
                      setValue("genderPolicy", nextGenderPolicy);
                      setValue("hoursMode", next.hoursMode);
                      setValue("operatingHours", next.operatingHours);
                    }}
                    onHoursModeChange={(nextHoursMode) => {
                      setValue("hoursMode", nextHoursMode);
                      setValue(
                        "operatingHours",
                        applyHoursMode(operatingHours, nextHoursMode),
                      );
                    }}
                    onHourStatusChange={(weekday, audience, status) =>
                      setValue(
                        "operatingHours",
                        patchHourInList(
                          operatingHours,
                          weekday,
                          audience,
                          { status },
                        ),
                      )
                    }
                    onHourTimeChange={(weekday, audience, field, value) =>
                      setValue(
                        "operatingHours",
                        patchHourInList(
                          operatingHours,
                          weekday,
                          audience,
                          { [field]: value },
                        ),
                      )
                    }
                    onToggleAgeGroup={(key) => {
                      const next = toggleIdInList(ageGroupKeys, key);
                      const resolved =
                        next.length > 0
                          ? next
                          : [...AGE_GROUP_OPTIONS].includes(key)
                            ? [key]
                            : ageGroupKeys;
                      setValue("ageGroupKeys", resolved);
                    }}
                  />
                ) : null}

                {step === 9 ? (
                  <OwnerClubsCreateRulesSection
                    rules={rules}
                    onAddRule={() =>
                      setValue("rules", [...rules, createRuleDraft()])
                    }
                    onRemoveRule={(id) =>
                      setValue(
                        "rules",
                        rules.filter((rule) => rule.id !== id),
                      )
                    }
                    onRuleChange={(id, patch) =>
                      setValue(
                        "rules",
                        rules.map((rule) =>
                          rule.id === id ? { ...rule, ...patch } : rule,
                        ),
                      )
                    }
                  />
                ) : null}

                {step === 10 ? (
                  <OwnerClubsCreateReviewSection
                    canSubmitDocuments={Boolean(club)}
                    clubStatus={club?.review.status ?? null}
                    isPending={isPending}
                    isSubmitting={isSubmitting}
                    sections={reviewSections}
                    onSaveDraft={() => {
                      void handleSaveDraft();
                    }}
                    onSubmitDocument={(file) => {
                      void handleSubmitReview(file);
                    }}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>

            {error ? (
              <p className={styles.error()} role="alert">
                {error}
              </p>
            ) : null}
            {notice ? (
              <p className={styles.notice()} role="status">
                {notice}
              </p>
            ) : null}
          </>
        )}
      </div>

      {!kycGateVisible ? (
        <StickyBottomActions contentClassName={styles.navRow()}>
          <Button
            className={styles.navBack()}
            size="lg"
            variant="outline"
            onPress={goBack}
          >
            {t("prevStep")}
          </Button>
          {step < LAST_STEP ? (
            <Button
              className={styles.navNext()}
              size="lg"
              variant="primary"
              onPress={goNext}
            >
              {t("nextStep")}
              <ArrowRight size={20} />
            </Button>
          ) : null}
        </StickyBottomActions>
      ) : null}
    </AppLayout>
  );
}
