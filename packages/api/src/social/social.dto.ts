import type { Paginated, Privacy } from "../types";

export type SocialPostStatus =
  | "draft"
  | "published"
  | "hidden"
  | "deleted";

export type SocialFolloweeKind = "user" | "club";

export type SocialReportStatus = "open" | "resolved" | "rejected";

export type SocialReportTargetKind = "post" | "comment" | "user";

export type SocialPostVisibility = Extract<Privacy, "public" | "followers">;

export type SocialPost = {
  id: string;
  authorUserId: string;
  body: string;
  mediaIds: string[];
  status: SocialPostStatus;
  visibility: Privacy;
  likeCount: number;
  commentCount: number;
  liked: boolean;
  mine: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SocialComment = {
  id: string;
  postId: string;
  authorUserId: string;
  body: string;
  status: SocialPostStatus;
  createdAt: string;
  updatedAt: string;
};

export type SocialFollow = {
  id: string;
  followerId: string;
  followeeId: string;
  followeeKind: SocialFolloweeKind;
  createdAt: string;
};

export type SocialReport = {
  id: string;
  reporterId: string;
  target: {
    kind: SocialReportTargetKind;
    id: string;
  };
  reason: string;
  status: SocialReportStatus;
  resolution: {
    resolvedBy: string;
    resolvedAt: string;
    note: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type ListSocialPostsQuery = {
  page?: number;
  page_size?: number;
  authorUserId?: string;
};

export type ListSocialCommentsQuery = {
  page?: number;
  page_size?: number;
};

export type ListSocialFollowsQuery = {
  page?: number;
  page_size?: number;
  followeeKind?: SocialFolloweeKind;
};

export type CreateSocialPostInput = {
  idempotencyKey: string;
  body: string;
  mediaIds?: string[];
  status?: SocialPostStatus;
  visibility?: SocialPostVisibility;
};

export type UpdateSocialPostInput = {
  body?: string;
  mediaIds?: string[];
  status?: SocialPostStatus;
  visibility?: SocialPostVisibility;
};

export type CreateSocialCommentInput = {
  body: string;
};

export type FollowInput = {
  followeeId: string;
  followeeKind: SocialFolloweeKind;
};

export type CreateSocialReportInput = {
  targetKind: SocialReportTargetKind;
  targetId: string;
  reason: string;
};

export type ToggleSaveResult = {
  saved: boolean;
};

export type UnfollowResult = {
  unfollowed: true;
};

export type SocialPostsPage = Paginated<SocialPost>;
export type SocialCommentsPage = Paginated<SocialComment>;
export type SocialFollowsPage = Paginated<SocialFollow>;
