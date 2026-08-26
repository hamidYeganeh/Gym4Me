import type {
  OwnerBroadcastAudience,
  OwnerBroadcastEntry,
} from "../../lib/owner-broadcast-data";

export type OwnerBroadcastForm = {
  title: string;
  body: string;
  audience: OwnerBroadcastAudience;
};

export type OwnerBroadcastScreenProps = {
  broadcasts: OwnerBroadcastEntry[];
  pending?: boolean;
  onSend?: (form: OwnerBroadcastForm) => Promise<void>;
  className?: string;
};
