import type { SocialPost } from "@repo/api/social";

export type GreetingPeriod = "morning" | "afternoon" | "evening" | "night";

export type CommunityMemberView = {
  id: string;
  username: string;
  avatarSrc: string | null;
};

export type CommunityPostView = {
  id: string;
  authorUserId: string;
  authorLabel: string;
  body: string;
  mediaCount: number;
  likeCount: number;
  commentCount: number;
  liked: boolean;
  saved: boolean;
  createdLabel: string;
};

const GREETING_HOUR_FORMAT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Tehran",
  hour: "numeric",
  hourCycle: "h23",
});

export function greetingPeriod(now = new Date()): GreetingPeriod {
  const hour = Number.parseInt(GREETING_HOUR_FORMAT.format(now), 10);
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export function initialsFromLabel(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`.toUpperCase();
}

function authorLabelFromId(authorUserId: string): string {
  if (!authorUserId) return "کاربر";
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

export function mapCommunityPost(
  post: SocialPost,
  saved = false,
): CommunityPostView {
  return {
    id: post.id,
    authorUserId: post.authorUserId,
    authorLabel: authorLabelFromId(post.authorUserId),
    body: post.body,
    mediaCount: post.mediaIds.length,
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    liked: post.liked,
    saved,
    createdLabel: formatCreatedAt(post.createdAt),
  };
}

/**
 * Replaceable story-rail fixtures until followee public profiles
 * are returned on the following list.
 */
export const DEMO_COMMUNITY_MEMBERS: CommunityMemberView[] = [
  { id: "demo-carmelita7", username: "carmelita7", avatarSrc: null },
  { id: "demo-azunyan0", username: "azunyan0", avatarSrc: null },
  { id: "demo-jm187", username: "jm187", avatarSrc: null },
  { id: "demo-uname881", username: "uname881", avatarSrc: null },
  { id: "demo-dsnote", username: "dsnote", avatarSrc: null },
];
