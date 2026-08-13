import type { HTMLAttributes } from "react";
import type { PublicFaqItem } from "@repo/api";

export type FaqScreenProps = HTMLAttributes<HTMLDivElement> & {
  roleSegment?: "athlete" | "coach" | "owner";
  items: PublicFaqItem[];
  loading?: boolean;
};
