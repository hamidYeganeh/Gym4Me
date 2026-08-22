"use client";

import { useEffect, useState } from "react";
import { articlesApi } from "@/shared/lib/api";
import {
  MAX_HOME_ARTICLES,
  mapArticleToEditorialHomeItem,
  type HomeEditorialArticle,
} from "./articles-home";

export type DiscoveryHomeArticlesState = {
  articles: HomeEditorialArticle[];
  isLoading: boolean;
};

export function useDiscoveryHomeArticles(): DiscoveryHomeArticlesState {
  const [state, setState] = useState<DiscoveryHomeArticlesState>({
    articles: [],
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const page = await articlesApi.list({ page_size: MAX_HOME_ARTICLES });
        if (cancelled) return;
        setState({
          articles: page.result.map(mapArticleToEditorialHomeItem),
          isLoading: false,
        });
      } catch {
        if (cancelled) return;
        setState({ articles: [], isLoading: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
