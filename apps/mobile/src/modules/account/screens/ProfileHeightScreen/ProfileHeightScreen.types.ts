import type { HTMLAttributes } from "react";

export type ProfileHeightScreenProps = HTMLAttributes<HTMLDivElement> & {
  roleSegment?: "athlete" | "coach" | "owner";
};
