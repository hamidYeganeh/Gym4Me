import type { HTMLAttributes } from "react";

export type RoleApplyScreenProps = HTMLAttributes<HTMLDivElement> & {
  roleSegment?: "athlete" | "coach" | "owner";
};
