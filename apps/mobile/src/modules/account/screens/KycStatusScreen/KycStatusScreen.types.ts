import type { HTMLAttributes } from "react";

export type KycStatusScreenProps = HTMLAttributes<HTMLDivElement> & {
  roleSegment?: "athlete" | "coach" | "owner";
};
