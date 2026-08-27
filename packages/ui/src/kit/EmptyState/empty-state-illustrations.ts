/**
 * Built-in empty / edge-state illustrations.
 * Served from the app `public/` root as `/empty-states/*`.
 * Source assets: `@repo/ui/assets/empty-states/`.
 */
export const EMPTY_STATE_ILLUSTRATIONS = {
  empty: "/empty-states/no-data.png",
  search: "/empty-states/search-empty.png",
  calendar: "/empty-states/calendar-empty.png",
  session: "/empty-states/session-empty.png",
  stopwatch: "/empty-states/session-stopwatch.png",
  warning: "/empty-states/warning.png",
  locked: "/empty-states/locked.png",
  equipment: "/empty-states/equipment.png",
  offline: "/empty-states/offline-wifi.png",
  serverError: "/empty-states/server-error.png",
  locations: "/empty-states/locations-empty.png",
} as const;

export type EmptyStateIllustrationKey = keyof typeof EMPTY_STATE_ILLUSTRATIONS;
