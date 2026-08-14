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
  form: OwnerBroadcastForm;
  pending?: boolean;
  onFormChange: (patch: Partial<OwnerBroadcastForm>) => void;
  onSend?: () => void;
  className?: string;
};
