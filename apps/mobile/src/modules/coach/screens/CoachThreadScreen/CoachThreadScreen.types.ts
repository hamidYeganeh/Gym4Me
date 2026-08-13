import type {
  CoachChatMessage,
  CoachMessageThread,
} from "../../lib/coach-messages-data";

export type CoachThreadScreenProps = {
  thread: CoachMessageThread;
  messages: CoachChatMessage[];
  sending?: boolean;
  error?: string | null;
  onSend?: (body: string) => void | Promise<void>;
  className?: string;
};
