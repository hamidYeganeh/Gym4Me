import type {
  SocialComment,
  SocialPost,
  SocialPostStatus,
  SocialPostVisibility,
} from "@repo/api/social";

export type AthleteSocialPostView = {
  id: string;
  authorLabel: string;
  body: string;
  mediaCount: number;
  status: SocialPostStatus;
  visibility: SocialPostVisibility | string;
  likeCount: number;
  commentCount: number;
  liked: boolean;
  saved: boolean;
  mine: boolean;
  createdLabel: string;
};

export type AthleteSocialCommentView = {
  id: string;
  authorLabel: string;
  body: string;
  createdLabel: string;
  mine: boolean;
};

export type AthleteSocialPostDetail = AthleteSocialPostView & {
  comments: AthleteSocialCommentView[];
};

function authorLabelFromId(authorUserId: string): string {
  if (!authorUserId) return "کاربر";
  if (authorUserId.startsWith("demo-")) return "ورزشکار نمونه";
  return `کاربر ${authorUserId.slice(-4)}`;
}

function formatCreatedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fa-IR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function mapSocialPost(
  post: SocialPost,
  saved = false,
): AthleteSocialPostView {
  return {
    id: post.id,
    authorLabel: authorLabelFromId(post.authorUserId),
    body: post.body,
    mediaCount: post.mediaIds.length,
    status: post.status,
    visibility: post.visibility,
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    liked: post.liked,
    saved,
    mine: post.mine,
    createdLabel: formatCreatedAt(post.createdAt),
  };
}

export function mapSocialComment(
  comment: SocialComment,
): AthleteSocialCommentView {
  return {
    id: comment.id,
    authorLabel: authorLabelFromId(comment.authorUserId),
    body: comment.body,
    createdLabel: formatCreatedAt(comment.createdAt),
    mine: false,
  };
}

const now = new Date().toISOString();

export const DEMO_SOCIAL_POSTS: AthleteSocialPostView[] = [
  {
    id: "demo-post-1",
    authorLabel: "سارا محمدی",
    body: "امروز صبح ۵ کیلومتر دویدم. حس فوق‌العاده‌ای دارم — کی همراه می‌آید؟",
    mediaCount: 1,
    status: "published",
    visibility: "public",
    likeCount: 24,
    commentCount: 3,
    liked: false,
    saved: false,
    mine: false,
    createdLabel: "امروز · ۰۸:۱۵",
  },
  {
    id: "demo-post-2",
    authorLabel: "علی رضایی",
    body: "برنامه بالاتنه این هفته تموم شد. رکورد پرس سینه جدید! 💪",
    mediaCount: 0,
    status: "published",
    visibility: "followers",
    likeCount: 18,
    commentCount: 5,
    liked: true,
    saved: true,
    mine: false,
    createdLabel: "دیروز · ۱۹:۴۰",
  },
  {
    id: "demo-post-3",
    authorLabel: "شما",
    body: "اولین پست من در Gym4Me — آماده‌ام برای چالش ۳۰ روزه.",
    mediaCount: 0,
    status: "published",
    visibility: "public",
    likeCount: 7,
    commentCount: 1,
    liked: false,
    saved: false,
    mine: true,
    createdLabel: "۲ روز پیش",
  },
];

export const DEMO_SOCIAL_COMMENTS: AthleteSocialCommentView[] = [
  {
    id: "demo-comment-1",
    authorLabel: "مینا احمدی",
    body: "آفرین! من هم فردا می‌دوم.",
    createdLabel: "امروز · ۰۹:۰۰",
    mine: false,
  },
  {
    id: "demo-comment-2",
    authorLabel: "رضا کریمی",
    body: "مسیر پارک ملت عالیه برای دویدن.",
    createdLabel: "امروز · ۱۰:۲۰",
    mine: false,
  },
];

export const DEMO_SOCIAL_DETAIL: AthleteSocialPostDetail = {
  ...DEMO_SOCIAL_POSTS[0]!,
  comments: DEMO_SOCIAL_COMMENTS,
};

/** Placeholder ISO timestamps for demo create mapping. */
export const DEMO_SOCIAL_NOW = now;
