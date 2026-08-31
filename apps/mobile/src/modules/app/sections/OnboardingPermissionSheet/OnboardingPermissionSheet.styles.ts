import { tv } from "tailwind-variants";

export const onboardingPermissionSheetVariants = tv({
  slots: {
    dialog:
      "max-h-[min(92dvh,44rem)] gap-0 rounded-t-[2rem] bg-background px-0 pb-[max(1rem,env(safe-area-inset-bottom))]",
    body: "flex flex-col items-center gap-5 px-6 pt-2",
    header: "flex w-full flex-col items-center gap-2 text-center",
    title: "text-[1.65rem] leading-tight text-foreground sm:text-[1.85rem]",
    subtitle: "max-w-[20rem] text-sm leading-relaxed text-muted",
    stage: "relative mt-1 flex h-[14.5rem] w-full max-w-[17rem] items-end justify-center",
    phone:
      "relative h-[13.5rem] w-[10.5rem] overflow-hidden rounded-[1.85rem] border-[3px] border-foreground/12 bg-surface",
    phoneBezel:
      "absolute inset-0 rounded-[1.6rem] bg-gradient-to-b from-default/40 to-transparent",
    phoneIsland:
      "absolute left-1/2 top-3 z-10 h-5 w-16 -translate-x-1/2 rounded-full bg-foreground/90",
    phoneScreen: "absolute inset-0 bg-background",
    banner:
      "absolute left-1/2 top-[3.35rem] z-20 w-[min(100%,17.5rem)] -translate-x-1/2 rounded-2xl border border-border/70 bg-background px-3.5 py-3",
    bannerTop: "flex items-start gap-3",
    bannerIcon:
      "flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground",
    bannerCopy: "min-w-0 flex-1",
    bannerTitleRow: "flex items-start justify-between gap-2",
    bannerTitle: "text-[0.92rem] leading-snug text-foreground",
    bannerMeta: "flex shrink-0 items-center gap-1.5 pt-0.5",
    bannerTime: "text-[0.7rem] text-muted",
    bannerDot: "size-1.5 rounded-full bg-success",
    bannerBody: "mt-0.5 text-[0.78rem] leading-snug text-foreground/70",
    bannerAction: "mt-1.5 text-[0.78rem] font-semibold text-accent",
    infoRow:
      "mt-1 flex w-full items-center justify-center gap-2 border-t border-border/70 pt-4 text-center",
    infoIcon: "size-4 shrink-0 text-muted",
    infoText: "text-xs leading-relaxed text-muted",
    footer: "flex w-full flex-col items-center gap-3 px-6 pt-2",
    continue: "w-full text-base font-bold text-accent-foreground",
    continueIcon: "ms-2",
    skip: "text-sm font-bold text-accent outline-none data-[hovered=true]:bg-transparent data-[hovered=true]:opacity-80",
  },
});
