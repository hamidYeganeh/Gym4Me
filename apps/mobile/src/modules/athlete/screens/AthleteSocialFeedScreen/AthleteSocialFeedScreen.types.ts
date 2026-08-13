import type { AthleteSocialPostView } from "@/modules/athlete/lib/social-feed-data";

export type AthleteSocialFeedScreenProps = {
  posts: AthleteSocialPostView[];
  pendingId?: string | null;
  onLike: (postId: string) => void | Promise<void>;
  onSave: (postId: string) => void | Promise<void>;
  onReport?: (postId: string) => void | Promise<void>;
  className?: string;
};
