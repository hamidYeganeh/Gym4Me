import type { OperatingHourAudience } from "@repo/api";
import type {
  AGE_GROUP_OPTIONS,
  ClubCreateHourDraft,
  ClubCreateHoursMode,
  GENDER_POLICY_OPTIONS,
} from "../../lib/club-create-form";

export type OwnerClubsCreateHoursSectionProps = {
  genderPolicy: (typeof GENDER_POLICY_OPTIONS)[number] | string;
  ageGroupKeys: string[];
  hoursMode: ClubCreateHoursMode;
  operatingHours: ClubCreateHourDraft[];
  onGenderPolicyChange: (value: string) => void;
  onHoursModeChange: (mode: ClubCreateHoursMode) => void;
  onToggleAgeGroup: (key: (typeof AGE_GROUP_OPTIONS)[number]) => void;
  onHourStatusChange: (
    weekday: number,
    audience: OperatingHourAudience,
    status: ClubCreateHourDraft["status"],
  ) => void;
  onHourTimeChange: (
    weekday: number,
    audience: OperatingHourAudience,
    field: "open" | "close",
    value: string,
  ) => void;
  className?: string;
};
