import type { HTMLAttributes } from "react";

export type ProfileGenderScreenProps = HTMLAttributes<HTMLDivElement> & {
  roleSegment?: "athlete" | "coach" | "owner";
};
