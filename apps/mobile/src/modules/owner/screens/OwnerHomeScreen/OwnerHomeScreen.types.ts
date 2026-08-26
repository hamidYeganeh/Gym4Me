import type {
  OwnerHomeClub,
  OwnerHomeStat,
} from "../../lib/owner-home-data";
import type { ActionCenterKind } from "@repo/api/action-center";

export type OwnerHomeScreenProps = {
  stats: OwnerHomeStat[];
  clubs: OwnerHomeClub[];
  tasksNewCount?: number;
  actions?: Array<{
    id: string;
    kind: "create_club" | "debts" | "booking_queue" | "renewal_risk" | "tasks";
    count?: number;
    href: string;
    sourceKind: ActionCenterKind;
  }>;
  actionsError?: boolean;
  actionsLoading?: boolean;
  actionsStale?: boolean;
  onActionsRetry?: () => void;
};
