import type { SettingsNavRow } from "@/modules/account/lib/use-settings-nav";

export type SettingsNavGroupSectionProps = {
  title: string;
  rows: SettingsNavRow[];
  className?: string;
};
