import type { PublicUser } from "@repo/api";

export type UsersDetailHeaderSectionProps = {
  user: PublicUser | null;
  canMutateStatus: boolean;
  actionPending: boolean;
  onEdit: () => void;
  onShare: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
  className?: string;
};
