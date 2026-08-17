import type { SettingsNavRow } from "@/modules/account/lib/use-settings-nav";
import type { ReactNode } from "react";

export type SettingsSupportSectionProps = {
  title: string;
  aboutLabel: string;
  versionValue: string;
  supportRows: SettingsNavRow[];
  infoIcon: ReactNode;
  className?: string;
};
