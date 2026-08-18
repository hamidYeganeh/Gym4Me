import type { PublicUser } from "@repo/api";

export type UsersDetailStatusSectionProps = {
  user: PublicUser;
  canMutateStatus: boolean;
  actionPending: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  className?: string;
};
