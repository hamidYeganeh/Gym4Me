import type { FormEvent } from "react";
import type {
  ProfileProvinceOption,
  ProfileSettingsFormValues,
} from "@/modules/account/lib/profile-settings";

export type ProfileSettingsFormSectionProps = {
  values: ProfileSettingsFormValues;
  provinces: ProfileProvinceOption[];
  phoneDisplay: string;
  error: string | null;
  notice: string | null;
  isPending: boolean;
  onChange: (patch: Partial<ProfileSettingsFormValues>) => void;
  onSubmit: (event: FormEvent) => void;
  className?: string;
};
