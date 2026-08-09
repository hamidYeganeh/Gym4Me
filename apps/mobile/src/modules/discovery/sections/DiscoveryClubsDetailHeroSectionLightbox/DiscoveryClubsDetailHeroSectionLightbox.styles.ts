import { tv } from "tailwind-variants";

export const discoveryClubsDetailHeroSectionLightboxVariants = tv({
  slots: {
    dialog: [
      "rounded-none border-0 shadow-none",
      "bg-background text-foreground",
    ].join(" "),
    root: "flex h-dvh w-full flex-col",
    header: [
      "relative z-20 grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2",
      "bg-linear-to-t from-transparent via-background/80 to-background",
      "px-screen pb-4 pt-[max(0.75rem,env(safe-area-inset-top))]",
    ].join(" "),
    headerTitle: "text-center text-foreground",
    headerSide: "flex items-center justify-center",
    stageWrap: [
      "relative flex min-h-0 flex-1 flex-col items-stretch justify-center",
      "overflow-hidden",
    ].join(" "),
    viewport: "w-full overflow-hidden",
    track: "flex touch-pan-y",
    slide: "min-w-0 shrink-0 grow-0 basis-full",
    slideInner: "relative w-full",
    image: [
      "pointer-events-none block h-auto w-full aspect-[4/3] object-cover select-none rounded-xl",
      "bg-surface-secondary",
    ].join(" "),
    favorite: "text-foreground data-[pressed=true]:scale-[0.96]",
    caption: [
      "pointer-events-none absolute inset-x-0 bottom-0 z-10",
      "bg-linear-to-t from-background via-background/80 to-transparent",
      "px-5 pb-16 pt-16",
    ].join(" "),
    captionTitle: "text-foreground",
    captionBody: "mt-1 text-muted leading-relaxed",
    controls: [
      "pointer-events-none absolute inset-x-0 bottom-4 z-20",
      "flex items-center justify-center gap-4 px-4",
    ].join(" "),
    navButton: [
      "pointer-events-auto size-11 min-w-11 rounded-full",
      "bg-accent text-accent-foreground shadow-md",
      "hover:opacity-90 data-[hovered=true]:opacity-90",
      "data-[pressed=true]:scale-[0.96]",
    ].join(" "),
    dots: "pointer-events-none flex items-center gap-1.5",
    dot: "size-1.5 rounded-full bg-muted transition-colors",
    dotActive: "bg-foreground",
    thumbsViewport: [
      "w-full overflow-hidden",
      "px-screen pb-[max(1.25rem,env(safe-area-inset-bottom))]",
    ].join(" "),
    thumbsTrack: "flex touch-pan-x gap-2.5",
    thumbButton: [
      "relative !size-auto aspect-square h-auto w-[4.5rem] min-h-0 min-w-0 shrink-0",
      "overflow-hidden rounded-2xl border-2 bg-transparent p-0",
    ].join(" "),
    thumbActive: "border-accent",
    thumbIdle: "border-transparent opacity-80",
    thumbImage: [
      "pointer-events-none block h-auto w-full aspect-square object-cover select-none",
    ].join(" "),
  },
});

export const discoveryClubsDetailHeroSectionLightboxStyles =
  discoveryClubsDetailHeroSectionLightboxVariants();
