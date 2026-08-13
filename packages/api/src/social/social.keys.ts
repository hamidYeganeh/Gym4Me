import type {
  ListSocialCommentsQuery,
  ListSocialFollowsQuery,
  ListSocialPostsQuery,
} from "./social.dto";

export const socialKeys = {
  all: ["social"] as const,
  feed: (query: ListSocialPostsQuery = {}) =>
    [...socialKeys.all, "feed", query] as const,
  post: (id: string) => [...socialKeys.all, "post", id] as const,
  comments: (id: string, query: ListSocialCommentsQuery = {}) =>
    [...socialKeys.all, "comments", id, query] as const,
};

export const accountSocialKeys = {
  all: ["account", "social"] as const,
  feed: (query: ListSocialPostsQuery = {}) =>
    [...accountSocialKeys.all, "feed", query] as const,
  post: (id: string) => [...accountSocialKeys.all, "post", id] as const,
  comments: (id: string, query: ListSocialCommentsQuery = {}) =>
    [...accountSocialKeys.all, "comments", id, query] as const,
  saves: (query: ListSocialPostsQuery = {}) =>
    [...accountSocialKeys.all, "saves", query] as const,
  following: (query: ListSocialFollowsQuery = {}) =>
    [...accountSocialKeys.all, "following", query] as const,
  followers: (query: ListSocialFollowsQuery = {}) =>
    [...accountSocialKeys.all, "followers", query] as const,
};
