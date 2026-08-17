import type { OwnerClubDetailClass } from "@/modules/owner/lib/owner-club-detail-data";

export type OwnerClubDetailClassesSectionProps = {
  title: string;
  enrolledLabel: string;
  classes: OwnerClubDetailClass[];
  activeStateLabel: string;
  pausedStateLabel: string;
  className?: string;
};
