import type { ApiClient } from "../client";
import {
  accountSocialEndpoints as accountEp,
  socialEndpoints as ep,
} from "./social.endpoint";
import type {
  CreateSocialCommentInput,
  CreateSocialPostInput,
  CreateSocialReportInput,
  FollowInput,
  ListSocialCommentsQuery,
  ListSocialFollowsQuery,
  ListSocialPostsQuery,
  SocialComment,
  SocialCommentsPage,
  SocialFollow,
  SocialFollowsPage,
  SocialPost,
  SocialPostsPage,
  SocialReport,
  ToggleSaveResult,
  UnfollowResult,
  UpdateSocialPostInput,
} from "./social.dto";

/** Public social feed (no auth). */
export function createSocialApi(client: ApiClient) {
  return {
    listFeed(query: ListSocialPostsQuery = {}) {
      return client.request<SocialPostsPage>(ep.feed, {
        query,
        public: true,
      });
    },

    getPost(id: string) {
      return client.request<SocialPost>(ep.post(id), { public: true });
    },

    listComments(id: string, query: ListSocialCommentsQuery = {}) {
      return client.request<SocialCommentsPage>(ep.comments(id), {
        query,
        public: true,
      });
    },
  };
}

/** Authenticated account social APIs. */
export function createAccountSocialApi(client: ApiClient) {
  return {
    listFeed(query: ListSocialPostsQuery = {}) {
      return client.request<SocialPostsPage>(accountEp.feed, { query });
    },

    getPost(id: string) {
      return client.request<SocialPost>(accountEp.post(id));
    },

    createPost(input: CreateSocialPostInput) {
      return client.request<SocialPost>(accountEp.posts, {
        method: "POST",
        body: input,
      });
    },

    updatePost(id: string, input: UpdateSocialPostInput) {
      return client.request<SocialPost>(accountEp.post(id), {
        method: "PATCH",
        body: input,
      });
    },

    deletePost(id: string) {
      return client.request<SocialPost>(accountEp.post(id), {
        method: "DELETE",
      });
    },

    listComments(id: string, query: ListSocialCommentsQuery = {}) {
      return client.request<SocialCommentsPage>(accountEp.comments(id), {
        query,
      });
    },

    createComment(id: string, input: CreateSocialCommentInput) {
      return client.request<SocialComment>(accountEp.comments(id), {
        method: "POST",
        body: input,
      });
    },

    deleteComment(postId: string, commentId: string) {
      return client.request<SocialComment>(
        accountEp.comment(postId, commentId),
        { method: "DELETE" },
      );
    },

    toggleLike(id: string) {
      return client.request<SocialPost>(accountEp.like(id), {
        method: "POST",
      });
    },

    toggleSave(id: string) {
      return client.request<ToggleSaveResult>(accountEp.save(id), {
        method: "POST",
      });
    },

    listSaves(query: ListSocialPostsQuery = {}) {
      return client.request<SocialPostsPage>(accountEp.saves, { query });
    },

    follow(input: FollowInput) {
      return client.request<SocialFollow | null>(accountEp.follow, {
        method: "POST",
        body: input,
      });
    },

    unfollow(input: FollowInput) {
      return client.request<UnfollowResult>(accountEp.unfollow, {
        method: "POST",
        body: input,
      });
    },

    listFollowing(query: ListSocialFollowsQuery = {}) {
      return client.request<SocialFollowsPage>(accountEp.following, {
        query,
      });
    },

    listFollowers(query: ListSocialFollowsQuery = {}) {
      return client.request<SocialFollowsPage>(accountEp.followers, {
        query,
      });
    },

    createReport(input: CreateSocialReportInput) {
      return client.request<SocialReport>(accountEp.reports, {
        method: "POST",
        body: input,
      });
    },
  };
}

export type SocialApi = ReturnType<typeof createSocialApi>;
export type AccountSocialApi = ReturnType<typeof createAccountSocialApi>;
