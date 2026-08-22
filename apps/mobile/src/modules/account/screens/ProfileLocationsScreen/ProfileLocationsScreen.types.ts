import type { HTMLAttributes } from "react";

export type ProfileLocationsScreenProps = HTMLAttributes<HTMLDivElement> & {
  roleSegment?: "athlete" | "coach" | "owner";
};
