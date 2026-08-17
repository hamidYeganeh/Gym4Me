import type { OwnerMembersStats } from "@/modules/owner/lib/owner-members-data";

export type OwnerMembersStatsSectionProps = {
  stats: OwnerMembersStats;
  activeTitle: string;
  activeUnit: string;
  weekTitle: string;
  weekUnit: string;
  className?: string;
};
