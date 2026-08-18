"use client";

import { Spinner } from "@heroui/react/spinner";
import type { FaqAudience, PublicFaqItem } from "@repo/api";
import { useEffect, useState } from "react";
import { accountSupport } from "@/shared/lib/api";
import { FaqScreen } from "../screens/FaqScreen";

const AUDIENCE_BY_ROLE: Record<
  "athlete" | "coach" | "owner",
  FaqAudience | undefined
> = {
  athlete: "athlete",
  coach: "coach",
  owner: "club_owner",
};

export function FaqGate({
  roleSegment = "athlete",
}: {
  roleSegment?: "athlete" | "coach" | "owner";
}) {
  const [items, setItems] = useState<PublicFaqItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    accountSupport
      .listFaq({ audience: AUDIENCE_BY_ROLE[roleSegment] })
      .then((result) => {
        if (!cancelled) setItems(result);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [roleSegment]);

  if (!items) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <FaqScreen items={items} roleSegment={roleSegment} />;
}
