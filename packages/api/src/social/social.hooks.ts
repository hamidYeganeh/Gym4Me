import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import {
  createAccountSocialApi,
  createSocialApi,
  type AccountSocialApi,
  type SocialApi,
} from "./social.client";
import type {
  CreateSocialCommentInput,
  CreateSocialPostInput,
  CreateSocialReportInput,
  FollowInput,
  ListSocialCommentsQuery,
  ListSocialFollowsQuery,
  ListSocialPostsQuery,
  SocialCommentsPage,
  SocialFollowsPage,
  SocialPost,
  SocialPostsPage,
  UpdateSocialPostInput,
} from "./social.dto";
import { accountSocialKeys, socialKeys } from "./social.keys";

function useSocialApi(): SocialApi {
  const client = useApiClient();
  return useMemo(() => createSocialApi(client), [client]);
}

function useAccountSocialApi(): AccountSocialApi {
  const client = useApiClient();
  return useMemo(() => createAccountSocialApi(client), [client]);
}

export function usePublicSocialFeed(
  query: ListSocialPostsQuery = {},
  options?: Omit<
    UseQueryOptions<SocialPostsPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useSocialApi();
  return useQuery({
    queryKey: socialKeys.feed(query),
    queryFn: () => api.listFeed(query),
    ...options,
  });
}

export function usePublicSocialPost(
  id: string,
  options?: Omit<UseQueryOptions<SocialPost, Error>, "queryKey" | "queryFn">,
) {
  const api = useSocialApi();
  return useQuery({
    queryKey: socialKeys.post(id),
    queryFn: () => api.getPost(id),
    ...options,
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}

export function useAccountSocialFeed(
  query: ListSocialPostsQuery = {},
  options?: Omit<
    UseQueryOptions<SocialPostsPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountSocialApi();
  return useQuery({
    queryKey: accountSocialKeys.feed(query),
    queryFn: () => api.listFeed(query),
    ...options,
  });
}

export function useAccountSocialPost(
  id: string,
  options?: Omit<UseQueryOptions<SocialPost, Error>, "queryKey" | "queryFn">,
) {
  const api = useAccountSocialApi();
  return useQuery({
    queryKey: accountSocialKeys.post(id),
    queryFn: () => api.getPost(id),
    ...options,
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}

export function useAccountSocialComments(
  id: string,
  query: ListSocialCommentsQuery = {},
  options?: Omit<
    UseQueryOptions<SocialCommentsPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountSocialApi();
  return useQuery({
    queryKey: accountSocialKeys.comments(id, query),
    queryFn: () => api.listComments(id, query),
    ...options,
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}

export function useAccountSocialSaves(
  query: ListSocialPostsQuery = {},
  options?: Omit<
    UseQueryOptions<SocialPostsPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountSocialApi();
  return useQuery({
    queryKey: accountSocialKeys.saves(query),
    queryFn: () => api.listSaves(query),
    ...options,
  });
}

export function useAccountSocialFollowing(
  query: ListSocialFollowsQuery = {},
  options?: Omit<
    UseQueryOptions<SocialFollowsPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountSocialApi();
  return useQuery({
    queryKey: accountSocialKeys.following(query),
    queryFn: () => api.listFollowing(query),
    ...options,
  });
}

export function useAccountSocialFollowers(
  query: ListSocialFollowsQuery = {},
  options?: Omit<
    UseQueryOptions<SocialFollowsPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountSocialApi();
  return useQuery({
    queryKey: accountSocialKeys.followers(query),
    queryFn: () => api.listFollowers(query),
    ...options,
  });
}

export function useCreateSocialPost() {
  const api = useAccountSocialApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSocialPostInput) => api.createPost(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountSocialKeys.all });
    },
  });
}

export function useUpdateSocialPost() {
  const api = useAccountSocialApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateSocialPostInput;
    }) => api.updatePost(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountSocialKeys.all });
    },
  });
}

export function useDeleteSocialPost() {
  const api = useAccountSocialApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deletePost(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountSocialKeys.all });
    },
  });
}

export function useCreateSocialComment(postId: string) {
  const api = useAccountSocialApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSocialCommentInput) =>
      api.createComment(postId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountSocialKeys.all });
    },
  });
}

export function useToggleSocialLike() {
  const api = useAccountSocialApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.toggleLike(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountSocialKeys.all });
    },
  });
}

export function useToggleSocialSave() {
  const api = useAccountSocialApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.toggleSave(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountSocialKeys.all });
    },
  });
}

export function useFollowSocial() {
  const api = useAccountSocialApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: FollowInput) => api.follow(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountSocialKeys.all });
    },
  });
}

export function useUnfollowSocial() {
  const api = useAccountSocialApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: FollowInput) => api.unfollow(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountSocialKeys.all });
    },
  });
}

export function useCreateSocialReport() {
  const api = useAccountSocialApi();
  return useMutation({
    mutationFn: (input: CreateSocialReportInput) => api.createReport(input),
  });
}
