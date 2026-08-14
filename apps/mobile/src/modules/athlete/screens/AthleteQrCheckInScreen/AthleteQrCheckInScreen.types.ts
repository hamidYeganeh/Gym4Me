import type { QrCheckInEntry } from "../../lib/athlete-qr-checkin-data";

export type AthleteQrCheckInScreenProps = {
  code: string;
  expiresAtLabel: string;
  recentCheckIns: QrCheckInEntry[];
  pending?: boolean;
  onRefresh?: () => void | Promise<void>;
  className?: string;
};
