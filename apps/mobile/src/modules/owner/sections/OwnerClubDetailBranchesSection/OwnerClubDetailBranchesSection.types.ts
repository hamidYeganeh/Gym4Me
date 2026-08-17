import type { OwnerClubDetailBranch } from "@/modules/owner/lib/owner-club-detail-data";

export type OwnerClubDetailBranchesSectionProps = {
  title: string;
  addBranchLabel: string;
  branches: OwnerClubDetailBranch[];
  activeStateLabel: string;
  maintenanceStateLabel: string;
  className?: string;
};
