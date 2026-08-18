import type { ReactNode } from "react";

export type UnitsMetricCardProps = {
  label: string;
  value: string | null;
  icon: ReactNode;
  isDisabled?: boolean;
  onPress: () => void;
  className?: string;
};
