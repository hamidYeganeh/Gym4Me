import type { PointRuleEvent } from "@repo/api";

export type PointRulesListHeaderSectionProps = {
  eventFilter: PointRuleEvent | "all";
  onEventChange: (value: PointRuleEvent | "all") => void;
  onCreate: () => void;
  onRefresh: () => void;
  className?: string;
};
