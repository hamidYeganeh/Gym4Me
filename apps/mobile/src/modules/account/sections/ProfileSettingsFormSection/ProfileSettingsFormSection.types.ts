import type { FormEvent } from "react";
import type {
  ProfileAthleteFormValues,
  ProfileCoachFormValues,
  ProfileLevelOption,
  ProfileProvinceOption,
  ProfileSettingsFormValues,
} from "@/modules/account/lib/profile-settings";

export type ProfileSettingsFormSectionProps = {
  values: ProfileSettingsFormValues;
  provinces: ProfileProvinceOption[];
  levelOptions: readonly ProfileLevelOption[];
  phoneDisplay: string;
  nationalIdDisplay: string;
  referralCodeDisplay: string;
  roleSegment?: "athlete" | "coach" | "owner";
  error: string | null;
  notice: string | null;
  isPending: boolean;
  onChange: (patch: Partial<ProfileSettingsFormValues>) => void;
  onPatchAthlete: (patch: Partial<ProfileAthleteFormValues>) => void;
  onPatchCoach: (patch: Partial<ProfileCoachFormValues>) => void;
  onSubmit: (event: FormEvent) => void;
  className?: string;
};
