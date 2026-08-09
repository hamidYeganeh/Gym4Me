import type { Control, UseFormSetValue } from "react-hook-form";
import type { ClubCreateFormState } from "../../lib/club-create-form";

export type OwnerClubsCreateMediaSectionProps = {
  control: Control<ClubCreateFormState>;
  setValue: UseFormSetValue<ClubCreateFormState>;
  className?: string;
};
