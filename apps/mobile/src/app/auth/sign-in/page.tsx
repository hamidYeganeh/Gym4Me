"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useRouter } from "@/shared/lib/app-router";

/** Legacy path — prefer `/auth/login`. Client redirect keeps static export happy. */
function SignInRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const next = searchParams.get("next");
    router.replace(
      next && next.startsWith("/")
        ? `/auth/login?next=${encodeURIComponent(next)}`
        : "/auth/login",
    );
  }, [router, searchParams]);

  return null;
}

export default function SignInRedirectPage() {
  return (
    <Suspense>
      <SignInRedirect />
    </Suspense>
  );
}
