import type { AreaLineChartPoint } from "@repo/ui/kit/AreaLineChart";
import type { WalletTransactionGroup } from "../../lib/wallet-data";

export type AthleteWalletScreenProps = {
  balanceLabel: string;
  balancePoints: AreaLineChartPoint[];
  incomeSeries: number[];
  spendSeries: number[];
  transactionGroups: WalletTransactionGroup[];
};
