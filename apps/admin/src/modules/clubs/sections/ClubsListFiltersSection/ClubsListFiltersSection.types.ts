import type { ClubLifecycleStatus, ClubOperationalStatus } from "@repo/api";

export type ClubsListFiltersSectionProps = {
  lifecycleStatus: ClubLifecycleStatus[];
  operationalStatus: ClubOperationalStatus[];
  onLifecycleChange: (value: ClubLifecycleStatus[]) => void;
  onOperationalChange: (value: ClubOperationalStatus[]) => void;
  className?: string;
};
