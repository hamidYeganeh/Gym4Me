import type { PayoutStatus } from "@repo/api";

export type PayoutsListFiltersSectionProps = {
  statusFilter: PayoutStatus | "all";
  onStatusChange: (status: PayoutStatus | "all") => void;
  className?: string;
};
