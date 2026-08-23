"use client";

import { useEffect, useState } from "react";
import { accountMemberships, accountSocial } from "@/shared/lib/api";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { useAuth } from "@/shared/providers/AuthProvider";
import {
  DEMO_COMMUNITY_MEMBERS,
  mapCommunityPost,
  type CommunityPostView,
} from "./community-data";

export function useCommunityHome() {
  const { isAuthenticated, isReady } = useAuth();
  const members = DEMO_MODE ? DEMO_COMMUNITY_MEMBERS : [];
  const [posts, setPosts] = useState<CommunityPostView[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady || !isAuthenticated) {
      setIsFeedLoading(false);
      return;
    }

    let cancelled = false;
    setIsFeedLoading(true);

    Promise.all([
      accountSocial.listFeed({ page_size: 30 }),
      accountMemberships.listPlatformSubscriptions().catch(() => ({
        result: [] as { status: string }[],
      })),
    ])
      .then(([feedPage, subscriptions]) => {
        if (cancelled) return;
        setPosts(feedPage.result.map((post) => mapCommunityPost(post)));
        setIsPro(
          subscriptions.result.some(
            (item) => item.status === "active" || item.status === "trialing",
          ),
        );
      })
      .catch(() => {
        if (cancelled) return;
        setPosts([]);
      })
      .finally(() => {
        if (!cancelled) setIsFeedLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady]);

  const handleLike = async (postId: string) => {
    setPendingId(postId);
    try {
      const updated = await accountSocial.toggleLike(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? mapCommunityPost(updated, post.saved) : post,
        ),
      );
    } catch {
      // keep current state
    } finally {
      setPendingId(null);
    }
  };

  const handleSave = async (postId: string) => {
    setPendingId(postId);
    try {
      const result = await accountSocial.toggleSave(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, saved: result.saved } : post,
        ),
      );
    } catch {
      // keep current state
    } finally {
      setPendingId(null);
    }
  };

  return {
    members,
    posts,
    isPro,
    isFeedLoading,
    pendingId,
    handleLike,
    handleSave,
  };
}
