import type { HTMLAttributes, ReactNode } from "react";

export type ProfileMenuRowProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  icon: ReactNode;
  label: string;
  hint?: string;
  badge?: string | number;
  trailing?: ReactNode;
  showChevron?: boolean;
  tone?: "default" | "danger";
  onPress?: () => void;
};
