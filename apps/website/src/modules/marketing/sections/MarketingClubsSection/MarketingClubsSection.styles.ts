import { tv } from "tailwind-variants";

export const marketingClubsSectionStyles = tv({
  slots: {
    root: "landing-clubs-section relative h-svh w-full overflow-hidden bg-background font-sans text-foreground selection:bg-accent selection:text-accent-foreground",
    grid: "hero-grid pointer-events-none absolute inset-0 z-0",
    stage: "relative z-10 flex h-full w-full flex-col items-center justify-center",
    intro:
      "pointer-events-none absolute top-1/2 z-20 flex -translate-y-1/2 flex-col items-center justify-center text-center",
    introTitle:
      "clubs-intro-title hero-display-shadow m-0 max-w-xl p-0 px-4 text-2xl font-black tracking-tighter text-accent sm:text-3xl md:text-5xl",
    introHint:
      "clubs-intro-hint mt-3 text-[10px] font-bold tracking-[0.2em] text-accent/70 sm:mt-4 sm:text-xs",
    content:
      "clubs-arc-content pointer-events-none absolute top-[8%] z-30 flex flex-col items-center justify-center px-4 text-center opacity-0 sm:top-[10%]",
    title:
      "hero-display-shadow mb-3 text-2xl font-black tracking-tighter text-accent sm:mb-4 sm:text-3xl md:text-5xl",
    description:
      "max-w-lg text-xs leading-relaxed font-semibold text-accent/80 sm:text-sm md:text-base",
    gallery: "relative z-10 h-full w-full",
    card: "club-card absolute overflow-hidden rounded-xl",
    cardScale: "club-card-scale absolute top-0 left-0",
  },
});
