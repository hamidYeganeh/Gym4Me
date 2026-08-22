import type { FormEvent } from "react";
import type {
  ProfileAthleteFormValues,
  ProfileCoachFormValues,
  ProfileProvinceOption,
  ProfileSettingsFormValues,
} from "@/modules/account/lib/profile-settings";

export type ProfileSettingsFormSectionProps = {
  values: ProfileSettingsFormValues;
  provinces: ProfileProvinceOption[];
  phoneDisplay: string;
  nationalIdDisplay: string;
  referralCodeDisplay: string;
  error: string | null;
  notice: string | null;
  isPending: boolean;
  onChange: (patch: Partial<ProfileSettingsFormValues>) => void;
  onPatchAthlete: (patch: Partial<ProfileAthleteFormValues>) => void;
  onPatchCoach: (patch: Partial<ProfileCoachFormValues>) => void;
  onSubmit: (event: FormEvent) => void;
  className?: string;
};
