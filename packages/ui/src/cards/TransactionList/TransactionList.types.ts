import type { HTMLAttributes, ReactNode } from "react";

export type TransactionListItem = {
  id: string;
  icon: ReactNode;
  name: string;
  category: string;
  amount: string;
  date: string;
  time: string;
  transactionId: string;
  paymentMethod: string;
  cardNumber: string;
  cardType: string;
};

export type TransactionListProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  transactions: TransactionListItem[];
  /** Collapsed list heading. */
  title?: string;
  /** Footer CTA label under the list. */
  allTransactionsLabel?: string;
  /** Accessible label for the expanded close control. */
  closeLabel?: string;
  /** Prefix shown before payment method, e.g. "Paid Via". */
  paidViaLabel?: string;
  onAllTransactionsPress?: () => void;
};
