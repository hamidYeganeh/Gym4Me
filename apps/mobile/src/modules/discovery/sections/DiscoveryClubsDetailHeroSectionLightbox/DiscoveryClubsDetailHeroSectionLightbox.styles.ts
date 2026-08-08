import { tv } from "tailwind-variants";

export const discoveryClubsDetailHeroSectionLightboxVariants = tv({
  slots: {
    dialog: [
      "rounded-none border-0 shadow-none",
      "bg-background text-foreground",
    ].join(" "),
    root: "flex h-dvh w-full flex-col gap-4",
    header: [
      "grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2",
      "px-screen pt-[max(0.75rem,env(safe-area-inset-top))]",
    ].join(" "),
    headerTitle: "text-center text-foreground",
    headerSide: "flex items-center justify-center",
    stageWrap: "flex min-h-0 flex-1 flex-col px-screen",
    stage: [
      "relative flex min-h-0 flex-1 overflow-hidden rounded-[2rem]",
      "border border-border/40 bg-surface-secondary",
    ].join(" "),
    image: "object-cover",
    favorite: [
      "absolute end-3 top-3 z-20",
      "bg-overlay/45 text-overlay-foreground backdrop-blur-md",
      "hover:bg-overlay/60 data-[hovered=true]:bg-overlay/60",
    ].join(" "),
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
    thumbs: [
      "flex gap-2.5 overflow-x-auto px-screen",
      "pb-[max(1.25rem,env(safe-area-inset-bottom))]",
      "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    ].join(" "),
    thumbButton: [
      "relative size-[4.5rem] min-w-0 shrink-0 overflow-hidden rounded-2xl",
      "border-2 bg-transparent p-0",
    ].join(" "),
    thumbActive: "border-accent",
    thumbIdle: "border-transparent opacity-80",
    thumbImage: "object-cover",
  },
});

export const discoveryClubsDetailHeroSectionLightboxStyles =
  discoveryClubsDetailHeroSectionLightboxVariants();
