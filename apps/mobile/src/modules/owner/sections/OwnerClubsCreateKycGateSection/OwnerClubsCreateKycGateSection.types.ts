import type { KycStatus } from "@repo/api";

export type OwnerClubsCreateKycGateSectionProps = {
  kycStatus: KycStatus;
  title: string;
  pendingHint: string;
  requiredHint: string;
  ctaLabel: string;
  onCta: () => void;
  className?: string;
};
