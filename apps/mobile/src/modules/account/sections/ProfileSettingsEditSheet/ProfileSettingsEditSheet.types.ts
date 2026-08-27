import type {
  ProfileAthleteFormValues,
  ProfileCoachFormValues,
  ProfileLevelOption,
  ProfileProvinceOption,
  ProfileSettingsFormValues,
} from "@/modules/account/lib/profile-settings";

export type ProfileSettingsSheetKind =
  | "name"
  | "gender"
  | "birthDate"
  | "code"
  | "province"
  | "address"
  | "athleteBio"
  | "athleteLevel"
  | "athleteBody"
  | "coachBio"
  | "coachLevel"
  | "coachExperience"
  | null;

export type ProfileSettingsEditSheetProps = {
  kind: ProfileSettingsSheetKind;
  values: ProfileSettingsFormValues;
  provinces: ProfileProvinceOption[];
  levelOptions: readonly ProfileLevelOption[];
  onClose: () => void;
  onChange: (patch: Partial<ProfileSettingsFormValues>) => void;
  onPatchAthlete: (patch: Partial<ProfileAthleteFormValues>) => void;
  onPatchCoach: (patch: Partial<ProfileCoachFormValues>) => void;
};
