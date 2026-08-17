import type { OwnerTransaction } from "../../lib/owner-finance-data";

export type OwnerFinanceTransactionsSectionProps = {
  transactions: OwnerTransaction[];
  className?: string;
};
