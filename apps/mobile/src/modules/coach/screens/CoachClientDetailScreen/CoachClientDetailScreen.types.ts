import type { CoachClientDetail } from "../../lib/coach-clients-data";

export type CoachClientDetailScreenProps = {
  client: CoachClientDetail;
  messaging?: boolean;
  onSendMessage?: () => void | Promise<void>;
};
