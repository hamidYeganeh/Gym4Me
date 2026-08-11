/** Coach availability management (`/coach/slots`). */
export const coachSlotsEndpoints = {
  root: "/coach/slots",
  clubs: "/coach/slots/clubs",
  byId: (slotId: string) => `/coach/slots/${slotId}`,
} as const;
