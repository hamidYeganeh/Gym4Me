import type {
  AthleteDispute,
  CreateDisputeInput,
  DisputeCategory,
} from "../../lib/athlete-dispute-data";

export type AthleteDisputeScreenProps = {
  disputes: AthleteDispute[];
  pending?: boolean;
  message?: string | null;
  error?: string | null;
  onSubmit: (input: CreateDisputeInput) => void | Promise<void>;
  className?: string;
};

export type { DisputeCategory };
