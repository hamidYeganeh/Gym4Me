export const discoveryCoachesDetailProgramsSectionStyles = {
  root: "flex flex-col gap-4 px-5 pb-6 pt-6",
  header: "flex items-center justify-between gap-3",
  titleRow: "flex items-baseline gap-1.5",
  title: "text-xl",
  count: "align-super",
  addButton: "size-9 min-w-0",
  list: "flex flex-col gap-2.5",
  card: [
    "flex items-center gap-3 rounded-[1.35rem] px-3 py-3",
  ].join(" "),
  thumbWrap: [
    "relative size-12 shrink-0 overflow-hidden rounded-2xl bg-default",
  ].join(" "),
  thumb: "object-cover",
  body: "min-w-0 flex-1",
  cardTitle: "truncate",
  cardSubtitle: "mt-0.5 truncate",
  trailing: "flex shrink-0 items-center gap-2",
  statusChip: "h-7",
  checkButton: "size-9 min-w-0 rounded-full",
} as const;
