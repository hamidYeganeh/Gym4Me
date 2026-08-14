import type { OwnerDebtEntry } from "../../lib/owner-debts-data";

export type OwnerDebtsScreenProps = {
  debts: OwnerDebtEntry[];
  pendingId?: string | null;
  onRecordPayment?: (debt: OwnerDebtEntry) => void;
  className?: string;
};
