import type { UseOwnerClubsCreateReturn } from "@/modules/owner/lib/use-owner-clubs-create";

export type OwnerClubsCreateWizardSectionProps = Pick<
  UseOwnerClubsCreateReturn,
  | "t"
  | "control"
  | "setValue"
  | "step"
  | "stepDirection"
  | "club"
  | "isCatalogLoading"
  | "categories"
  | "amenities"
  | "equipment"
  | "sports"
  | "slideTransition"
  | "slideVariants"
  | "reviewSections"
  | "categoryIds"
  | "sportIds"
  | "amenityIds"
  | "equipmentIds"
  | "genderPolicy"
  | "ageGroupKeys"
  | "hoursMode"
  | "operatingHours"
  | "rules"
  | "isPending"
  | "isSubmitting"
  | "handleSaveDraft"
  | "handleSubmitReview"
> & {
  stepPanelClassName?: string;
};
