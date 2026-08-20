"use client";

import { useCallback, useState } from "react";
import { accountSocial } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteSocialCreateScreen } from "../screens/AthleteSocialCreateScreen";
import { useRouter } from "@/shared/lib/app-router";

export function AthleteSocialCreateGate() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = useCallback(
    async (body: string) => {
      const trimmed = body.trim();
      if (!trimmed) return;

      if (!isAuthenticated) {
        router.push("/athlete/social");
        return;
      }

      setPending(true);
      setError(false);
      try {
        const post = await accountSocial.createPost({
          body: trimmed,
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
