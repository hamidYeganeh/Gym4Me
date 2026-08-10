import type { HTMLAttributes } from "react";

export type KycStatusScreenProps = HTMLAttributes<HTMLDivElement> & {
  roleSegment?: "athlete" | "coach" | "owner";
};

export type KycFlowStep =
  | "intro"
  | "details"
  | "scan"
  | "processing"
  | "success"
  | "pending"
  | "rejected";
