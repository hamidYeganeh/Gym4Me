import type { ApiClient } from "../client";
import type { Paginated } from "../types";
import type {
  Article,
  ArticleComment,
  ArticleEngagementResponse,
  ArticleFacets,
  ArticleSummary,
  ArticleViewerState,
  CreateArticleCommentInput,
  ListArticleCommentsQuery,
  ListArticlesQuery,
} from "./articles.dto";
import {
  accountArticlesEndpoints as accountEp,
  articlesEndpoints as ep,
} from "./articles.endpoint";

/** Public articles + account engagement. */
export function createArticlesApi(client: ApiClient) {
  return {
    list(query: ListArticlesQuery = {}) {
      return client.request<Paginated<ArticleSummary>>(ep.root, {
        query,
        public: true,
      });
    },

    facets() {
      return client.request<ArticleFacets>(ep.facets, { public: true });
    },

    getBySlug(slug: string) {
      return client.request<Article>(ep.bySlug(slug), { public: true });
    },

    listRelated(slug: string) {
      return client.request<ArticleSummary[]>(ep.related(slug), {
        public: true,
      });
    },

    listComments(slug: string, query: ListArticleCommentsQuery = {}) {
      return client.request<Paginated<ArticleComment>>(
        ep.commentsBySlug(slug),
        { query, public: true },
      );
    },

    getViewerState(articleId: string) {
      return client.request<ArticleViewerState>(accountEp.state(articleId));
    },

    like(articleId: string) {
      return client.request<ArticleEngagementResponse>(
        accountEp.like(articleId),
        { method: "POST" },
      );
    },

    unlike(articleId: string) {
      return client.request<ArticleEngagementResponse>(
        accountEp.like(articleId),
        { method: "DELETE" },
      );
    },

    markRead(articleId: string) {
      return client.request<ArticleEngagementResponse>(
        accountEp.read(articleId),
        { method: "POST" },
      );
    },

    save(articleId: string) {
      return client.request<ArticleEngagementResponse>(
        accountEp.save(articleId),
        { method: "POST" },
      );
    },

    unsave(articleId: string) {
      return client.request<ArticleEngagementResponse>(
        accountEp.save(articleId),
        { method: "DELETE" },
      );
    },

    createComment(articleId: string, input: CreateArticleCommentInput) {
      return client.request<ArticleComment>(accountEp.comments(articleId), {
        method: "POST",
        body: input,
      });
    },
  };
}

export type ArticlesApi = ReturnType<typeof createArticlesApi>;
