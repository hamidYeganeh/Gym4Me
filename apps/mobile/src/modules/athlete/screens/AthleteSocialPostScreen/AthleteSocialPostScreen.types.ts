import type { AthleteSocialPostDetail } from "@/modules/athlete/lib/social-feed-data";

export type AthleteSocialPostScreenProps = {
  detail: AthleteSocialPostDetail;
  pending?: boolean;
  commentPending?: boolean;
  onLike: () => void | Promise<void>;
  onSave: () => void | Promise<void>;
  onComment: (body: string) => void | Promise<void>;
  onReport?: () => void | Promise<void>;
  className?: string;
};
