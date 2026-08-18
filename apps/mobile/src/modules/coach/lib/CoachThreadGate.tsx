"use client";

import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import type { CoachMessage } from "@repo/api";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { accountCoaching, isDiscoveryApiId } from "@/shared/lib/api";
import { formatTimeFa } from "@/shared/lib/booking-view";
import { useAuth } from "@/shared/providers/AuthProvider";
import { CoachThreadScreen } from "../screens/CoachThreadScreen";
import {
  getCoachThread,
  getCoachThreadMessages,
  type CoachChatMessage,
  type CoachMessageThread,
} from "./coach-messages-data";

function mapMessage(
  message: CoachMessage,
  coachUserId: string | null,
): CoachChatMessage {
  return {
    id: message.id,
    body: message.body,
    sentAtLabel: formatTimeFa(message.sentAt),
    fromCoach:
      message.senderRole === "coach" ||
      (coachUserId != null && message.senderUserId === coachUserId),
  };
}

export function CoachThreadGate({ threadId }: { threadId: string }) {
  const t = useTranslations("CoachMessages");
  const { isAuthenticated, isReady, user } = useAuth();
  const [thread, setThread] = useState<CoachMessageThread | null | undefined>(
    undefined,
  );
  const [messages, setMessages] = useState<CoachChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    const page = await accountCoaching.listCoachThreadMessages(threadId, {
      page_size: 100,
    });
    setMessages(
      page.result.map((message) => mapMessage(message, user?.id ?? null)),
    );
  }, [threadId, user?.id]);

  useEffect(() => {
    if (!isReady) return;

    const demoThread = getCoachThread(threadId);
    if (!isAuthenticated || !isDiscoveryApiId(threadId)) {
      setThread(demoThread ?? null);
      setMessages(getCoachThreadMessages(threadId));
      return;
    }

    let cancelled = false;
    accountCoaching
      .listCoachThreads({ page_size: 50 })
      .then(async (page) => {
        if (cancelled) return;
        const match = page.result.find((entry) => entry.id === threadId);
        if (!match) {
          setThread(demoThread ?? null);
          setMessages(getCoachThreadMessages(threadId));
          return;
        }
        setThread({
          id: match.id,
          athleteUserId: match.athleteUserId,
          title: `شاگرد · ${match.athleteUserId.slice(-6)}`,
          preview: "",
          updatedLabel: "",
        });
        await loadMessages();
      })
      .catch(() => {
        if (!cancelled) {
          setThread(demoThread ?? null);
          setMessages(getCoachThreadMessages(threadId));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady, loadMessages, threadId]);

  const onSend = useCallback(
    async (body: string) => {
      if (!isAuthenticated || !isDiscoveryApiId(threadId)) {
        setMessages((current) => [
          ...current,
          {
            id: `local-${Date.now()}`,
            body,
            sentAtLabel: formatTimeFa(new Date().toISOString()),
            fromCoach: true,
          },
        ]);
        return;
      }
      setSending(true);
      setError(null);
      try {
        await accountCoaching.sendCoachThreadMessage(threadId, { body });
        await loadMessages();
      } catch {
        setError("sendError");
      } finally {
        setSending(false);
      }
    },
    [isAuthenticated, loadMessages, threadId],
  );

  if (thread === undefined) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6 text-center">
        <Typography className="text-muted" type="body">
          {t("threadNotFound")}
        </Typography>
      </div>
    );
  }

  return (
    <CoachThreadScreen
      error={error}
      messages={messages}
      onSend={onSend}
      sending={sending}
      thread={thread}
    />
  );
}
