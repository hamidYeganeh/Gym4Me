import type { NotificationItem } from "@repo/api";

export type NotificationKind = "booking" | "payment" | "membership" | "promo";

export type NotificationGroupId = "today" | "week" | "earlier";

export type InboxNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  timestamp: string;
  unread: boolean;
};

export type InboxGroup = {
  id: NotificationGroupId;
  items: InboxNotification[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Map API template keys onto the inbox visual categories. */
export function notificationKind(templateKey: string): NotificationKind {
  if (templateKey.startsWith("booking.") || templateKey.startsWith("waitlist.")) {
    return "booking";
  }
  if (templateKey.startsWith("payment.") || templateKey.startsWith("payout.")) {
    return "payment";
  }
  if (templateKey.startsWith("membership.")) {
    return "membership";
  }
  return "promo";
}

const relativeFormat = new Intl.RelativeTimeFormat("fa", { numeric: "auto" });

export function relativeTime(iso: string, now = Date.now()): string {
  const diffMs = new Date(iso).getTime() - now;
  const diffMinutes = Math.round(diffMs / 60_000);
  if (Math.abs(diffMinutes) < 60) {
    return relativeFormat.format(diffMinutes, "minute");
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return relativeFormat.format(diffHours, "hour");
  }
  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 30) {
    return relativeFormat.format(diffDays, "day");
  }
  return relativeFormat.format(Math.round(diffDays / 30), "month");
}

/** Bucket inbox items into today / this week / earlier sections. */
export function groupNotifications(items: NotificationItem[]): InboxGroup[] {
  const now = Date.now();
  const buckets: Record<NotificationGroupId, InboxNotification[]> = {
    today: [],
    week: [],
    earlier: [],
  };

  for (const item of items) {
    const age = now - new Date(item.createdAt).getTime();
    const bucket: NotificationGroupId =
      age < DAY_MS ? "today" : age < 7 * DAY_MS ? "week" : "earlier";
    buckets[bucket].push({
      id: item.id,
      kind: notificationKind(item.templateKey),
      title: item.title,
      description: item.body,
      timestamp: relativeTime(item.createdAt, now),
      unread: item.readStatus === "unread",
    });
  }

  return (Object.keys(buckets) as NotificationGroupId[])
    .map((id) => ({ id, items: buckets[id] }))
    .filter((group) => group.items.length > 0);
}
