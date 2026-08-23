"use client";

import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import type { CoachMessage } from "@repo/api";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import {
  accountCoaching,
  isDiscoveryApiId,
  isDiscoveryDemoId,
} from "@/shared/lib/api";
import { formatTimeFa } from "@/shared/lib/booking-view";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteThreadScreen } from "../screens/AthleteThreadScreen";
import {
  getAthleteThread,
  getAthleteThreadMessages,
  type AthleteChatMessage,
  type AthleteMessageThread,
} from "./athlete-messages-data";

function mapMessage(
  message: CoachMessage,
  athleteUserId: string | null,
): AthleteChatMessage {
  return {
    id: message.id,
    body: message.body,
    sentAtLabel: formatTimeFa(message.sentAt),
    fromAthlete:
      message.senderRole === "athlete" ||
      (athleteUserId != null && message.senderUserId === athleteUserId),
  };
}

export function AthleteThreadGate({ threadId }: { threadId: string }) {
  const t = useTranslations("AthleteMessages");
  const { isAuthenticated, isReady, user } = useAuth();
  const [thread, setThread] = useState<AthleteMessageThread | null | undefined>(
    undefined,
  );
  const [messages, setMessages] = useState<AthleteChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    const page = await accountCoaching.listAthleteThreadMessages(threadId, {
      page_size: 100,
    });
    setMessages(
      page.result.map((message) => mapMessage(message, user?.id ?? null)),
    );
  }, [threadId, user?.id]);

  useEffect(() => {
    if (!isReady) return;

    const isDemo = isDiscoveryDemoId(threadId);
    const demoThread = isDemo ? getAthleteThread(threadId) : null;
    if (!isAuthenticated || !isDiscoveryApiId(threadId)) {
      setThread(demoThread ?? null);
      setMessages(isDemo ? getAthleteThreadMessages(threadId) : []);
      return;
    }

    let cancelled = false;
    accountCoaching
      .listAthleteThreads({ page_size: 50 })
      .then(async (page) => {
        if (cancelled) return;
        const match = page.result.find((entry) => entry.id === threadId);
        if (!match) {
          setThread(null);
          setMessages([]);
          return;
        }
        setThread({
          id: match.id,
          coachUserId: match.coachUserId,
          title: `مربی · ${match.coachUserId.slice(-6)}`,
          preview: "",
          updatedLabel: "",
        });
        await loadMessages();
      })
      .catch(() => {
        if (!cancelled) {
          setThread(null);
          setMessages([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady, loadMessages, threadId]);

  const onSend = useCallback(
    async (body: string) => {
      if (!isAuthenticated || !isDiscoveryApiId(threadId)) {
        if (!isDiscoveryDemoId(threadId)) {
          setError("sendError");
          return;
        }
        setMessages((current) => [
          ...current,
          {
            id: `local-${Date.now()}`,
            body,
            sentAtLabel: formatTimeFa(new Date().toISOString()),
            fromAthlete: true,
          },
        ]);
        return;
      }
      setSending(true);
      setError(null);
      try {
        await accountCoaching.sendAthleteThreadMessage(threadId, { body });
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
    <AthleteThreadScreen
      error={error}
      messages={messages}
      onSend={onSend}
      sending={sending}
      thread={thread}
    />
  );
}
