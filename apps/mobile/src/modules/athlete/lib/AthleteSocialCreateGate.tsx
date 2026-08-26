"use client";

import { useCallback, useState } from "react";
import { accountSocial, mediaApi } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteSocialCreateScreen } from "../screens/AthleteSocialCreateScreen";
import { useRouter } from "@/shared/lib/app-router";

export function AthleteSocialCreateGate() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = useCallback(
    async (body: string, files: File[]) => {
      const trimmed = body.trim();
      if (!trimmed) return;

      if (!isAuthenticated) {
        router.push("/athlete/social");
        return;
      }

      setPending(true);
      setError(false);
      try {
        const uploaded = await Promise.all(
          files.map((file) =>
            mediaApi.upload(file, file.name, {
              visibility: "private",
              purpose: "social_post",
            }),
          ),
        );
        const post = await accountSocial.createPost({
          idempotencyKey: `social-post:${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
          body: trimmed,
          mediaIds: uploaded.map((asset) => asset.id),
          status: "published",
          visibility: "public",
        });
        router.push(`/athlete/social/${post.id}`);
      } catch {
        setError(true);
      } finally {
        setPending(false);
      }
    },
    [isAuthenticated, router],
  );

  return (
    <AthleteSocialCreateScreen
      error={error}
      onSubmit={handleSubmit}
      pending={pending}
    />
  );
}
