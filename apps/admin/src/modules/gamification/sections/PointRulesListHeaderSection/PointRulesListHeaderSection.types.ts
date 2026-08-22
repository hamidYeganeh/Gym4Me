import type { EntityStatus, PointRuleEvent } from "@repo/api";

export type PointRulesListHeaderSectionProps = {
  eventFilter: PointRuleEvent | "all";
  statusFilter: EntityStatus | "all";
  onEventChange: (value: PointRuleEvent | "all") => void;
  onStatusChange: (value: EntityStatus | "all") => void;
  onCreate: () => void;
  onRefresh: () => void;
  className?: string;
};
