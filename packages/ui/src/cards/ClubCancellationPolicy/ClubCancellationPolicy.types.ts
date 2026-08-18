import type { CardProps } from "@heroui/react/card";
import type { ReactNode } from "react";

export type ClubCancellationPolicyStepStatus =
  | "completed"
  | "current"
  | "pending";

/** Semantic theme color for the step indicator, connector, and title. */
export type ClubCancellationPolicyStepColor =
  | "success"
  | "warning"
  | "danger"
  | "accent";

export type ClubCancellationPolicyStep = {
  /** Unique key for list rendering. Falls back to index when omitted. */
  id?: string;
  /** Bold step title. */
  title: ReactNode;
  /** Supporting copy under the title. */
  description: ReactNode;
  /**
   * Visual state of the timeline node.
   * When omitted, derived from `activeIndex` on the parent.
   */
  status?: ClubCancellationPolicyStepStatus;
  /**
   * Semantic color for the indicator, connector, and title.
   * Defaults by index: success → warning → danger → accent.
   */
  color?: ClubCancellationPolicyStepColor;
};

export type ClubCancellationPolicyProps = Omit<
  CardProps,
  "children" | "variant" | "className" | "title"
> & {
  /** Ordered policy / timeline steps. */
  steps: readonly ClubCancellationPolicyStep[];
  /**
   * Index of the current step (0-based).
   * Steps before are completed; the index is current; later steps are pending.
   * Ignored when every step provides an explicit `status`.
   */
  activeIndex?: number;
  /** Optional section heading above the timeline. */
  title?: ReactNode;
  /** Extra classes for the root card. */
  className?: string;
};
