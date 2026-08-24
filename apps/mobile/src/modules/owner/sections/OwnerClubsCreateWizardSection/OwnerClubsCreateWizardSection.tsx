import { AnimatePresence, motion } from "motion/react";
import {
  AGE_GROUP_OPTIONS,
  applyGenderPolicyToHours,
  applyHoursMode,
  createRuleDraft,
  patchHourInList,
  toggleIdInList,
} from "@/modules/owner/lib/club-create-form";
import {
  mapRefOptions,
  mapSportOptions,
} from "@/modules/owner/lib/build-club-create-review-sections";
import { OwnerClubsCreateCatalogSection } from "@/modules/owner/sections/OwnerClubsCreateCatalogSection";
import { OwnerClubsCreateContactSection } from "@/modules/owner/sections/OwnerClubsCreateContactSection";
import { OwnerClubsCreateHoursSection } from "@/modules/owner/sections/OwnerClubsCreateHoursSection";
import { OwnerClubsCreateIdentitySection } from "@/modules/owner/sections/OwnerClubsCreateIdentitySection";
import { OwnerClubsCreateLocationSection } from "@/modules/owner/sections/OwnerClubsCreateLocationSection";
import { OwnerClubsCreateMediaSection } from "@/modules/owner/sections/OwnerClubsCreateMediaSection";
import { OwnerClubsCreateReviewSection } from "@/modules/owner/sections/OwnerClubsCreateReviewSection";
import { OwnerClubsCreateRulesSection } from "@/modules/owner/sections/OwnerClubsCreateRulesSection";
import { ownerClubsCreateWizardSectionVariants } from "./OwnerClubsCreateWizardSection.styles";
import type { OwnerClubsCreateWizardSectionProps } from "./OwnerClubsCreateWizardSection.types";

export function OwnerClubsCreateWizardSection({
  t,
  control,
  setValue,
  step,
  stepDirection,
  club,
  isCatalogLoading,
  categories,
  amenities,
  equipment,
  sports,
  slideTransition,
  slideVariants,
  reviewSections,
  categorySelections,
  sportSelections,
  amenitySelections,
  equipmentSelections,
  genderPolicy,
  ageGroupKeys,
  hoursMode,
  operatingHours,
  rules,
  isPending,
  isSubmitting,
  handleSaveDraft,
  handleSubmitReview,
  stepPanelClassName,
}: OwnerClubsCreateWizardSectionProps) {
  const styles = ownerClubsCreateWizardSectionVariants();

  return (
    <AnimatePresence custom={stepDirection.current} mode="wait">
      <motion.div
        animate="center"
        className={styles.panel({ className: stepPanelClassName })}
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
            selections={categorySelections}
            title={t("stepCategories")}
            onChange={(items) =>
              setValue("categories", items, { shouldDirty: true })
            }
          />
        ) : null}

        {step === 4 ? (
          <OwnerClubsCreateCatalogSection
            hint={t("stepSportsHint")}
            isLoading={isCatalogLoading}
            options={mapSportOptions(sports)}
            selections={sportSelections}
            title={t("stepSports")}
            onChange={(items) =>
              setValue("sports", items, { shouldDirty: true })
            }
          />
        ) : null}

        {step === 5 ? (
          <OwnerClubsCreateCatalogSection
            hint={t("stepAmenitiesHint")}
            isLoading={isCatalogLoading}
            options={mapRefOptions(amenities)}
            selections={amenitySelections}
            title={t("stepAmenities")}
            onChange={(items) =>
              setValue("amenities", items, { shouldDirty: true })
            }
          />
        ) : null}

        {step === 6 ? (
          <OwnerClubsCreateCatalogSection
            hint={t("stepEquipmentHint")}
            isLoading={isCatalogLoading}
            options={mapRefOptions(equipment)}
            selections={equipmentSelections}
            supportsQuantity
            title={t("stepEquipment")}
            onChange={(items) =>
              setValue("equipment", items, { shouldDirty: true })
            }
          />
        ) : null}

        {step === 7 ? (
          <OwnerClubsCreateMediaSection control={control} setValue={setValue} />
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
                patchHourInList(operatingHours, weekday, audience, { status }),
              )
            }
            onHourTimeChange={(weekday, audience, field, value) =>
              setValue(
                "operatingHours",
                patchHourInList(operatingHours, weekday, audience, {
                  [field]: value,
                }),
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
            onAddRule={() => setValue("rules", [...rules, createRuleDraft()])}
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
  );
}
