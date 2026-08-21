import type { ButtonProps } from "@heroui/react/button";
import type { HTMLAttributes, ReactNode } from "react";

export type ReferralInviteCardProps = Omit<
  HTMLAttributes<HTMLElement>,
  "title" | "children"
> & {
  /** Bold headline (e.g. invite-a-friend pitch). */
  title: ReactNode;
  /** Supporting copy under the title. */
  description: ReactNode;
  /** Label above the referral code value. */
  codeLabel: ReactNode;
  /** Referral / invite code shown to share. */
  referralCode: string;
  /** Label above the successful-invite count. */
  successLabel: ReactNode;
  /** Successful invite count (already formatted for locale). */
  successCount: ReactNode;
  /** Primary CTA label. */
  actionLabel: string;
  /** Called when the CTA is pressed. */
  onAction?: ButtonProps["onPress"];
  /** Optional leading icon in the header badge. Defaults to Ticket. */
  icon?: ReactNode;
  /** Extra classes for the CTA control. */
  actionClassName?: string;
  /** Accessible label for copying the referral code. */
  copyCodeLabel?: string;
  /** Accessible label after the referral code is copied. */
  copiedCodeLabel?: string;
};
