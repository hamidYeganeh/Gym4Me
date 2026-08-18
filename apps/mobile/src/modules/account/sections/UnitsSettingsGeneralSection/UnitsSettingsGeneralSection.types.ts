import type { ReactNode } from "react";
import type { PublicChoiceGroup } from "@repo/api";
import type { UnitIconKey } from "@/modules/account/lib/units-settings";

export type UnitsSettingsGeneralSectionProps = {
  groups: PublicChoiceGroup[];
  units: Record<string, string>;
  isLoading?: boolean;
  icons: Partial<Record<UnitIconKey, ReactNode>>;
  fallbackIcon: ReactNode;
  onSelect: (group: PublicChoiceGroup) => void;
  className?: string;
};
