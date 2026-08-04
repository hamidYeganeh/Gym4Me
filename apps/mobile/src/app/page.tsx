"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Product entry: splash. Component gallery lives at `/dev`. */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/splash");
  }, [router]);

  return null;
}
