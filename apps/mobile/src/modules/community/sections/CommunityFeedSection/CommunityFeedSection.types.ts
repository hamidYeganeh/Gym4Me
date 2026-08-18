import type { CommunityPostView } from "../../lib/community-data";

export type CommunityFeedSectionProps = {
  posts: CommunityPostView[];
  isLoading?: boolean;
  pendingId?: string | null;
  canCreate?: boolean;
  onLike: (postId: string) => void | Promise<void>;
  onSave: (postId: string) => void | Promise<void>;
  onPostPress?: (postId: string) => void;
  onCreatePress?: () => void;
  className?: string;
};
