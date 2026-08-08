import type { ClubLifecycleStatus, ClubOperationalStatus } from "@repo/api";

export type SelectChangeValue = string | number | null;

export type ClubsListFiltersSectionProps = {
  lifecycleStatus: ClubLifecycleStatus | "all";
  operationalStatus: ClubOperationalStatus | "all";
  onLifecycleChange: (value: ClubLifecycleStatus | "all") => void;
  onOperationalChange: (value: ClubOperationalStatus | "all") => void;
  className?: string;
};
