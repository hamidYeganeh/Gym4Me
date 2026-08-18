import type { ReactNode } from "react";
import type { PublicChoiceGroup } from "@repo/api";

export type UnitsChoiceSheetProps = {
  group: PublicChoiceGroup | null;
  value: string | null;
  icon: ReactNode;
  isPending: boolean;
  error: string | null;
  onChange: (value: string) => void;
  onApply: () => void;
  onOpenChange: (open: boolean) => void;
};
