"use client";

import { Spinner } from "@heroui/react/spinner";
import type { SupportTicket } from "@repo/api";
import { useCallback, useEffect, useState } from "react";
import { accountSupport } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { SupportTicketsScreen } from "../screens/SupportTicketsScreen";

export function SupportTicketsGate({
  roleSegment = "athlete",
}: {
  roleSegment?: "athlete" | "coach" | "owner";
}) {
  const { isAuthenticated, isReady } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const page = await accountSupport.listTickets({ page_size: 50 });
    setTickets(page.result);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setTickets([]);
      return;
    }
    let cancelled = false;
    reload().catch(() => {
      if (!cancelled) setTickets([]);
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady, reload]);

  const handleCreate = async (input: { subject: string; body: string }) => {
    setCreating(true);
    setError(null);
    try {
      await accountSupport.createTicket({
        category: "suggestion",
        subject: input.subject,
        body: input.body,
      });
      await reload();
    } catch {
      setError("ارسال تیکت ناموفق بود. دوباره تلاش کنید.");
    } finally {
      setCreating(false);
    }
  };

  if (!tickets) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <SupportTicketsScreen
      creating={creating}
      error={error}
      onCreate={isAuthenticated ? handleCreate : undefined}
      roleSegment={roleSegment}
      tickets={tickets}
    />
  );
}
