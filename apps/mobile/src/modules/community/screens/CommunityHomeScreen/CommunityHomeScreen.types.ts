import type {
  CommunityMemberView,
  CommunityPostView,
} from "../../lib/community-data";

export type CommunityHomeScreenProps = {
  members: CommunityMemberView[];
  posts: CommunityPostView[];
  isPro?: boolean;
  isFeedLoading?: boolean;
  pendingId?: string | null;
  onLike: (postId: string) => void | Promise<void>;
  onSave: (postId: string) => void | Promise<void>;
  className?: string;
};
