import type { OwnerCashShiftData } from "../../lib/owner-cash-shift-data";

export type OwnerCashShiftScreenProps = {
  shift: OwnerCashShiftData;
  countedByChannel: Record<string, string>;
  discrepancyReason: string;
  pending?: boolean;
  onCountedChange: (channel: string, value: string) => void;
  onDiscrepancyChange: (value: string) => void;
  onClose?: () => void;
  onOpen?: () => void;
  className?: string;
};
