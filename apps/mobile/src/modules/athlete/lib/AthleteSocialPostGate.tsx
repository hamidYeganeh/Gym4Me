"use client";

import { Spinner } from "@heroui/react/spinner";
import { useCallback, useEffect, useState } from "react";
import { accountSocial } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteSocialPostScreen } from "../screens/AthleteSocialPostScreen";
import {
  DEMO_SOCIAL_DETAIL,
  DEMO_SOCIAL_POSTS,
  mapSocialComment,
  mapSocialPost,
  type AthleteSocialPostDetail,
} from "./social-feed-data";

export function AthleteSocialPostGate({ postId }: { postId: string }) {
  const { isAuthenticated, isReady } = useAuth();
  const [detail, setDetail] = useState<AthleteSocialPostDetail | null>(null);
  const [pending, setPending] = useState(false);
  const [commentPending, setCommentPending] = useState(false);

  const loadDemo = useCallback(() => {
    const demo = DEMO_SOCIAL_POSTS.find((post) => post.id === postId);
    setDetail(
      demo
        ? { ...DEMO_SOCIAL_DETAIL, ...demo, comments: DEMO_SOCIAL_DETAIL.comments }
        : { ...DEMO_SOCIAL_DETAIL, id: postId },
    );
  }, [postId]);

  const reload = useCallback(async () => {
    const [post, comments] = await Promise.all([
      accountSocial.getPost(postId),
      accountSocial.listComments(postId, { page_size: 50 }),
    ]);
    setDetail({
      ...mapSocialPost(post),
      comments: comments.result.map(mapSocialComment),
    });
  }, [postId]);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      loadDemo();
      return;
    }

    let cancelled = false;
    reload().catch(() => {
      if (!cancelled) loadDemo();
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady, loadDemo, reload]);

  const handleLike = useCallback(async () => {
    if (!detail) return;
    if (!isAuthenticated) {
      setDetail({
        ...detail,
        liked: !detail.liked,
        likeCount: detail.liked
          ? Math.max(0, detail.likeCount - 1)
          : detail.likeCount + 1,
      });
      return;
    }

    setPending(true);
    try {
      const updated = await accountSocial.toggleLike(postId);
      setDetail((prev) =>
        prev
          ? { ...mapSocialPost(updated, prev.saved), comments: prev.comments }
          : prev,
      );
    } catch {
      // keep
    } finally {
      setPending(false);
    }
  }, [detail, isAuthenticated, postId]);

  const handleSave = useCallback(async () => {
    if (!detail) return;
    if (!isAuthenticated) {
      setDetail({ ...detail, saved: !detail.saved });
      return;
    }

    setPending(true);
    try {
      const result = await accountSocial.toggleSave(postId);
      setDetail((prev) => (prev ? { ...prev, saved: result.saved } : prev));
    } catch {
      // keep
    } finally {
      setPending(false);
    }
  }, [detail, isAuthenticated, postId]);

  const handleComment = useCallback(
    async (body: string) => {
      const trimmed = body.trim();
      if (!trimmed) return;

      if (!isAuthenticated) {
        setDetail((prev) =>
          prev
            ? {
                ...prev,
                commentCount: prev.commentCount + 1,
                comments: [
                  ...prev.comments,
                  {
                    id: `demo-local-${Date.now()}`,
                    authorLabel: "شما",
                    body: trimmed,
                    createdLabel: "همین حالا",
                    mine: true,
                  },
                ],
              }
            : prev,
        );
        return;
      }

      setCommentPending(true);
      try {
        await accountSocial.createComment(postId, { body: trimmed });
        await reload();
      } catch {
        // keep
      } finally {
        setCommentPending(false);
      }
    },
    [isAuthenticated, postId, reload],
  );

  const handleReport = useCallback(async () => {
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
  }, [isAuthenticated, postId]);

  if (!detail) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AthleteSocialPostScreen
      commentPending={commentPending}
      detail={detail}
      onComment={handleComment}
      onLike={handleLike}
      onReport={isAuthenticated ? handleReport : undefined}
      onSave={handleSave}
      pending={pending}
    />
  );
}
