/** Resource calendar blocks — club scope + coach personal calendar. */
export const accountCalendarEndpoints = {
  clubBlocks: (clubId: string) => `/account/clubs/${clubId}/calendar/blocks`,
  clubBlock: (clubId: string, blockId: string) =>
    `/account/clubs/${clubId}/calendar/blocks/${blockId}`,
  coachBlocks: "/account/coach/calendar/blocks",
  coachBlock: (blockId: string) => `/account/coach/calendar/blocks/${blockId}`,
} as const;
