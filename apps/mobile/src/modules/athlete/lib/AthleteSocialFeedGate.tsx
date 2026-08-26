"use client";

import { Spinner } from "@heroui/react/spinner";
import { useCallback, useEffect, useRef, useState } from "react";
import { accountSocial } from "@/shared/lib/api";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteSocialFeedScreen } from "../screens/AthleteSocialFeedScreen";
import {
  DEMO_SOCIAL_POSTS,
  mapSocialPost,
  type AthleteSocialPostView,
} from "./social-feed-data";

export function AthleteSocialFeedGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [posts, setPosts] = useState<AthleteSocialPostView[] | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const objectUrls = useRef(new Set<string>());

  const clearObjectUrls = useCallback(() => {
    for (const url of objectUrls.current) URL.revokeObjectURL(url);
    objectUrls.current.clear();
  }, []);

  const reload = useCallback(async () => {
    const page = await accountSocial.listFeed({ page_size: 50 });
    clearObjectUrls();
    const mapped = await Promise.all(
      page.result.map(async (post) => {
        const view = mapSocialPost(post);
        view.mediaUrls = (
          await Promise.all(
            post.mediaIds.map(async (mediaId) => {
              try {
                const blob = await accountSocial.downloadPostMedia(
                  post.id,
                  mediaId,
                );
                const url = URL.createObjectURL(blob);
                objectUrls.current.add(url);
                return url;
              } catch {
                return null;
              }
            }),
          )
        ).filter((url): url is string => url !== null);
        return view;
      }),
    );
    setPosts(mapped);
  }, [clearObjectUrls]);

  useEffect(() => clearObjectUrls, [clearObjectUrls]);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setPosts(DEMO_MODE ? DEMO_SOCIAL_POSTS : []);
      return;
    }

    let cancelled = false;
    reload()
      .then(() => undefined)
      .catch(() => {
        if (!cancelled) setPosts(DEMO_MODE ? DEMO_SOCIAL_POSTS : []);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady, reload]);

  const handleLike = useCallback(
    async (postId: string) => {
      if (!isAuthenticated) {
        if (!DEMO_MODE) return;
        setPosts((prev) =>
          (prev ?? []).map((post) =>
            post.id === postId
              ? {
                  ...post,
                  liked: !post.liked,
                  likeCount: post.liked
                    ? Math.max(0, post.likeCount - 1)
                    : post.likeCount + 1,
                }
              : post,
          ),
        );
        return;
      }

      setPendingId(postId);
      try {
        const updated = await accountSocial.toggleLike(postId);
        setPosts((prev) =>
          (prev ?? []).map((post) =>
            post.id === postId
              ? {
                  ...mapSocialPost(updated, post.saved),
                  mediaUrls: post.mediaUrls,
                }
              : post,
          ),
        );
      } catch {
        // keep current state
      } finally {
        setPendingId(null);
      }
    },
    [isAuthenticated],
  );

  const handleSave = useCallback(
    async (postId: string) => {
      if (!isAuthenticated) {
        if (!DEMO_MODE) return;
        setPosts((prev) =>
          (prev ?? []).map((post) =>
            post.id === postId ? { ...post, saved: !post.saved } : post,
          ),
        );
        return;
      }

      setPendingId(postId);
      try {
        const result = await accountSocial.toggleSave(postId);
        setPosts((prev) =>
          (prev ?? []).map((post) =>
            post.id === postId ? { ...post, saved: result.saved } : post,
          ),
        );
      } catch {
        // keep current state
      } finally {
        setPendingId(null);
      }
    },
    [isAuthenticated],
  );

  const handleReport = useCallback(
    async (postId: string) => {
      if (!isAuthenticated) return;
      try {
        await accountSocial.createReport({
          targetKind: "post",
          targetId: postId,
          reason: "inappropriate",
        });
      } catch {
        // ignore
      }
    },
    [isAuthenticated],
  );

  if (!posts) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AthleteSocialFeedScreen
      onLike={handleLike}
      onReport={isAuthenticated ? handleReport : undefined}
      onSave={handleSave}
      pendingId={pendingId}
      posts={posts}
    />
  );
}
