import type { HTMLAttributes } from "react";

export type HelpCenterScreenProps = HTMLAttributes<HTMLDivElement> & {
  roleSegment?: "athlete" | "coach" | "owner";
};
