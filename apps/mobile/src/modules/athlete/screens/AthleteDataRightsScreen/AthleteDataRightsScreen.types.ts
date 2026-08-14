import type { ConsentHistoryEvent } from "@repo/api";

export type AthleteDataRightsScreenProps = {
  consentEvents: ConsentHistoryEvent[];
  pending?: boolean;
  lastExportSummary?: string | null;
  onExport: () => Promise<void>;
  onDeleteMetrics: () => Promise<{ deletedCount: number }>;
};
