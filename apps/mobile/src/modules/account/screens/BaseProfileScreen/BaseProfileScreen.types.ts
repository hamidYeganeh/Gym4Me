import type { HTMLAttributes } from "react";

export type BaseProfileScreenProps = HTMLAttributes<HTMLDivElement> & {
  /** Back-link role segment used in nested routes. */
  roleSegment?: "athlete" | "coach" | "owner";
};
