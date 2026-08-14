import type {
  AthleteChatMessage,
  AthleteMessageThread,
} from "../../lib/athlete-messages-data";

export type AthleteThreadScreenProps = {
  thread: AthleteMessageThread;
  messages: AthleteChatMessage[];
  sending?: boolean;
  error?: string | null;
  onSend?: (body: string) => void | Promise<void>;
  className?: string;
};
