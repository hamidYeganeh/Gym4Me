import { tv } from "tailwind-variants";

export const marketingSportsSectionStyles = tv({
  slots: {
    root: "landing-sports-section relative flex min-h-[560px] w-full items-center justify-center overflow-hidden bg-accent py-16 font-sans text-foreground selection:bg-foreground selection:text-accent-foreground sm:min-h-[640px] sm:py-20 md:min-h-[720px] md:py-24",
    grid: "hero-grid pointer-events-none absolute inset-0 z-0",
    icons: "pointer-events-none absolute inset-0 z-0 w-full",
    copy: "relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 text-center",
    title:
      "hero-display-shadow m-0 max-w-4xl p-0 text-[clamp(2rem,8vw,5.5rem)] leading-[1.05] font-black tracking-tighter text-foreground sm:text-[clamp(2.75rem,7vw,5.5rem)]",
    subtitle:
      "mx-auto mt-4 max-w-xl text-sm font-semibold text-foreground/80 sm:mt-6 sm:text-base md:text-lg",
    ctaWrap: "mt-8 w-full max-w-xs sm:mt-10 sm:w-auto sm:max-w-none",
    cta: "w-full rounded-full border border-foreground bg-foreground px-8 py-3 text-sm font-semibold text-accent transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-foreground/90 hover:text-accent-foreground sm:w-auto md:text-base",
    iconSolid:
      "flex h-12 w-12 items-center justify-center rounded-[1.25rem] border-[3px] border-accent-foreground/5 bg-foreground p-2.5 text-accent-foreground shadow-xl sm:h-16 sm:w-16 sm:rounded-[1.5rem] sm:p-3 md:h-20 md:w-20 md:rounded-[2rem]",
    iconGlass:
      "flex h-12 w-12 items-center justify-center rounded-[1.25rem] border border-foreground/40 bg-foreground/20 p-2.5 text-foreground shadow-xl backdrop-blur-md sm:h-16 sm:w-16 sm:rounded-[1.5rem] sm:p-3 md:h-20 md:w-20 md:rounded-[2rem]",
  },
});
