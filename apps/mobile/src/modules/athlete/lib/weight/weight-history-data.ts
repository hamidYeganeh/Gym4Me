export type WeightHistoryDateKey = "today" | "yesterday" | string;

export type WeightHistoryStatus = "stepsLeft" | "goalCompleted";

export type WeightHistoryEntry = {
  id: string;
  /** Weight in kilograms. */
  kg: number;
  hours: number;
  minutes: number;
  dateKey: WeightHistoryDateKey;
  status: WeightHistoryStatus;
  /** Remaining steps when status is `stepsLeft`. */
  stepsLeft?: number;
  /** Show the “higher than usual” alert. */
  showAlert?: boolean;
};

/** Demo weight log — grouped by `dateKey` on the history screen. */
export const WEIGHT_HISTORY: WeightHistoryEntry[] = [
  {
    id: "1",
    kg: 78,
    hours: 10,
    minutes: 2,
    dateKey: "today",
    status: "stepsLeft",
    stepsLeft: 1512,
  },
  {
    id: "2",
    kg: 77.5,
    hours: 11,
    minutes: 23,
    dateKey: "today",
    status: "goalCompleted",
    showAlert: true,
  },
  {
    id: "3",
    kg: 76.2,
    hours: 12,
    minutes: 11,
    dateKey: "yesterday",
    status: "stepsLeft",
    stepsLeft: 840,
  },
  {
    id: "4",
    kg: 76.8,
    hours: 9,
    minutes: 2,
    dateKey: "2025-06-21",
    status: "goalCompleted",
  },
  {
    id: "5",
    kg: 77.1,
    hours: 8,
    minutes: 40,
    dateKey: "2025-06-20",
    status: "stepsLeft",
    stepsLeft: 2200,
  },
  {
    id: "6",
    kg: 77.4,
    hours: 7,
    minutes: 55,
    dateKey: "2025-06-19",
    status: "goalCompleted",
  },
  {
    id: "7",
    kg: 78,
    hours: 8,
    minutes: 15,
    dateKey: "2025-06-18",
    status: "stepsLeft",
    stepsLeft: 960,
  },
  {
    id: "8",
    kg: 78.3,
    hours: 9,
    minutes: 30,
    dateKey: "2025-06-17",
    status: "goalCompleted",
    showAlert: true,
  },
  {
    id: "9",
    kg: 78.6,
    hours: 10,
    minutes: 5,
    dateKey: "2025-06-16",
    status: "stepsLeft",
    stepsLeft: 1300,
  },
  {
    id: "10",
    kg: 79,
    hours: 8,
    minutes: 20,
    dateKey: "2025-06-15",
    status: "goalCompleted",
  },
];

export function getRecentWeightHistory(limit = 3): WeightHistoryEntry[] {
  return WEIGHT_HISTORY.slice(0, limit);
}

export function groupWeightHistoryByDate(entries: WeightHistoryEntry[]) {
  const groups: {
    dateKey: WeightHistoryDateKey;
    entries: WeightHistoryEntry[];
  }[] = [];

  for (const entry of entries) {
    const last = groups[groups.length - 1];
    if (last && last.dateKey === entry.dateKey) {
      last.entries.push(entry);
      continue;
    }
    groups.push({
      dateKey: entry.dateKey,
      entries: [entry],
    });
  }

  return groups;
}

/** Format a dateKey for display (relative keys resolved by i18n). */
export function formatHistoryDateLabel(
  dateKey: WeightHistoryDateKey,
  labels: { today: string; yesterday: string },
): string {
  if (dateKey === "today") return labels.today;
  if (dateKey === "yesterday") return labels.yesterday;

  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateKey;

  return date.toLocaleDateString("fa-IR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
