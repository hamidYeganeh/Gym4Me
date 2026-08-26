export const socialEndpoints = {
  feed: "/social/feed",
  post: (id: string) => `/social/posts/${id}`,
  comments: (id: string) => `/social/posts/${id}/comments`,
} as const;

export const accountSocialEndpoints = {
  feed: "/account/social/feed",
  posts: "/account/social/posts",
  post: (id: string) => `/account/social/posts/${id}`,
  postMedia: (postId: string, mediaId: string) =>
    `/account/social/posts/${postId}/media/${mediaId}`,
  comments: (id: string) => `/account/social/posts/${id}/comments`,
  comment: (postId: string, commentId: string) =>
    `/account/social/posts/${postId}/comments/${commentId}`,
  like: (id: string) => `/account/social/posts/${id}/like`,
  save: (id: string) => `/account/social/posts/${id}/save`,
  saves: "/account/social/saves",
  follow: "/account/social/follow",
  unfollow: "/account/social/unfollow",
  following: "/account/social/following",
  followers: "/account/social/followers",
  reports: "/account/social/reports",
} as const;
