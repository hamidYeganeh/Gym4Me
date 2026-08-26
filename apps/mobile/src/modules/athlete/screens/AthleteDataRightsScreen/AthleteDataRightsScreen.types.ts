import type { AccountDeletionRequest, ConsentHistoryEvent } from "@repo/api";

export type AthleteDataRightsScreenProps = {
  consentEvents: ConsentHistoryEvent[];
  pending?: boolean;
  lastExportSummary?: string | null;
  onExport: () => Promise<void>;
  onDeleteMetrics: () => Promise<{ deletedCount: number }>;
  deletionRequest: AccountDeletionRequest | null;
  onRequestAccountDeletion: (reason?: string) => Promise<void>;
  onCancelAccountDeletion: () => Promise<void>;
};
