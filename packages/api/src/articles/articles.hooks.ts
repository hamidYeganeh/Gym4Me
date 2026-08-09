import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import type { Paginated } from "../types";
import {
  createArticlesApi,
  type ArticlesApi,
} from "./articles.client";
import type {
  Article,
  ArticleComment,
  ArticleEngagementResponse,
  ArticleSummary,
  ArticleViewerState,
  CreateArticleCommentInput,
  ListArticleCommentsQuery,
  ListArticlesQuery,
} from "./articles.dto";
import { articlesKeys } from "./articles.keys";

function useArticlesApi(): ArticlesApi {
  const client = useApiClient();
  return useMemo(() => createArticlesApi(client), [client]);
}

export function useArticles(
  query: ListArticlesQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<ArticleSummary>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useArticlesApi();
  return useQuery({
    queryKey: articlesKeys.list(query),
    queryFn: () => api.list(query),
    ...options,
  });
}

export function useArticle(
  slug: string,
  options?: Omit<UseQueryOptions<Article, Error>, "queryKey" | "queryFn">,
) {
  const api = useArticlesApi();
  return useQuery({
    queryKey: articlesKeys.detail(slug),
    queryFn: () => api.getBySlug(slug),
    enabled: Boolean(slug),
    ...options,
  });
}

export function useRelatedArticles(
  slug: string,
  options?: Omit<
    UseQueryOptions<ArticleSummary[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useArticlesApi();
  return useQuery({
    queryKey: articlesKeys.related(slug),
    queryFn: () => api.listRelated(slug),
    enabled: Boolean(slug),
    ...options,
  });
}

export function useArticleComments(
  slug: string,
  query: ListArticleCommentsQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<ArticleComment>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useArticlesApi();
  return useQuery({
    queryKey: articlesKeys.comments(slug, query),
    queryFn: () => api.listComments(slug, query),
    enabled: Boolean(slug),
    ...options,
  });
}

export function useArticleViewerState(
  articleId: string,
  options?: Omit<
    UseQueryOptions<ArticleViewerState, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useArticlesApi();
  return useQuery({
    queryKey: articlesKeys.viewerState(articleId),
    queryFn: () => api.getViewerState(articleId),
    enabled: Boolean(articleId),
    ...options,
  });
}

function useInvalidateArticleEngagement() {
  const queryClient = useQueryClient();
  return (articleId: string, slug?: string) => {
    void queryClient.invalidateQueries({
      queryKey: articlesKeys.viewerState(articleId),
    });
    void queryClient.invalidateQueries({ queryKey: articlesKeys.lists() });
    if (slug) {
      void queryClient.invalidateQueries({
        queryKey: articlesKeys.detail(slug),
      });
    }
  };
}

export function useLikeArticle(
  options?: UseMutationOptions<
    ArticleEngagementResponse,
    Error,
    { articleId: string; slug?: string }
  >,
) {
  const api = useArticlesApi();
  const invalidate = useInvalidateArticleEngagement();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ articleId }) => api.like(articleId),
    onSuccess: (data, vars, onMutateResult, context) => {
      invalidate(vars.articleId, vars.slug);
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useUnlikeArticle(
  options?: UseMutationOptions<
    ArticleEngagementResponse,
    Error,
    { articleId: string; slug?: string }
  >,
) {
  const api = useArticlesApi();
  const invalidate = useInvalidateArticleEngagement();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ articleId }) => api.unlike(articleId),
    onSuccess: (data, vars, onMutateResult, context) => {
      invalidate(vars.articleId, vars.slug);
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useSaveArticle(
  options?: UseMutationOptions<
    ArticleEngagementResponse,
    Error,
    { articleId: string; slug?: string }
  >,
) {
  const api = useArticlesApi();
  const invalidate = useInvalidateArticleEngagement();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ articleId }) => api.save(articleId),
    onSuccess: (data, vars, onMutateResult, context) => {
      invalidate(vars.articleId, vars.slug);
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useUnsaveArticle(
  options?: UseMutationOptions<
    ArticleEngagementResponse,
    Error,
    { articleId: string; slug?: string }
  >,
) {
  const api = useArticlesApi();
  const invalidate = useInvalidateArticleEngagement();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ articleId }) => api.unsave(articleId),
    onSuccess: (data, vars, onMutateResult, context) => {
      invalidate(vars.articleId, vars.slug);
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useCreateArticleComment(
  options?: UseMutationOptions<
    ArticleComment,
    Error,
    { articleId: string; slug: string; input: CreateArticleCommentInput }
  >,
) {
  const api = useArticlesApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ articleId, input }) => api.createComment(articleId, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: articlesKeys.comments(vars.slug),
      });
      void queryClient.invalidateQueries({
        queryKey: articlesKeys.detail(vars.slug),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}
