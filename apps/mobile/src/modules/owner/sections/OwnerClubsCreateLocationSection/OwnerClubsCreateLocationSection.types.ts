import type { Control, UseFormGetValues, UseFormSetValue } from "react-hook-form";
import type { ClubCreateFormState } from "../../lib/club-create-form";

export type OwnerClubsCreateLocationSectionProps = {
  control: Control<ClubCreateFormState>;
  setValue: UseFormSetValue<ClubCreateFormState>;
  getValues: UseFormGetValues<ClubCreateFormState>;
  className?: string;
};
