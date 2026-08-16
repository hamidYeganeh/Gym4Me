import { tv } from "tailwind-variants";

export const marketingHeroSectionStyles = tv({
  slots: {
    root: "landing-hero-section relative flex min-h-screen w-full flex-col overflow-hidden bg-accent font-sans text-foreground selection:bg-foreground selection:text-accent-foreground",
    grid: "hero-grid pointer-events-none absolute inset-0 z-0",
    nav: "relative z-20 mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 px-4 py-5 sm:px-6 md:px-10 md:py-8",
    logoRow: "flex items-center gap-1",
    logoPrimary:
      "relative rounded-2xl rounded-bl-sm bg-foreground px-2.5 py-1 text-[11px] font-black tracking-tight text-accent-foreground shadow-sm sm:px-3 sm:py-1.5 sm:text-xs md:text-sm",
    logoNotch: "absolute -bottom-1.5 left-0 h-3 w-3 bg-foreground",
    logoSecondary:
      "rounded-full border-[1.5px] border-foreground bg-foreground px-2.5 py-1 text-[11px] font-black text-accent-foreground shadow-sm sm:px-3 sm:py-1.5 sm:text-xs md:text-sm",
    navLinks: "hidden items-center space-x-2 md:flex",
    navLink:
      "rounded-full border border-foreground/30 px-4 py-1.5 text-xs font-semibold text-foreground transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-foreground/10",
    navActions: "flex items-center gap-2 sm:gap-3",
    themeToggle:
      "size-9 shrink-0 rounded-full border-foreground/40 bg-transparent text-foreground transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-foreground/10 sm:size-10",
    cta: "rounded-full border-foreground bg-transparent px-4 py-1.5 text-[11px] font-semibold text-foreground transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-foreground hover:text-accent-foreground sm:px-6 sm:py-2 sm:text-xs md:text-sm",
    stage:
      "relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col items-center justify-center px-4 pt-6 pb-28 sm:pt-8 sm:pb-32 md:pt-12 md:pb-48",
    headlineWrap:
      "relative z-10 mx-auto mt-2 mb-10 flex w-full max-w-5xl flex-col items-center justify-center text-center sm:mt-4 sm:mb-16",
    headlineStack:
      "relative z-10 flex w-full flex-col items-center space-y-1.5 sm:space-y-2 md:space-y-4",
    display:
      "hero-display-shadow m-0 p-0 text-[clamp(3.25rem,11vw,160px)] leading-[0.85] font-black tracking-tighter uppercase sm:text-[clamp(4.5rem,12vw,160px)]",
    displayMuted: "text-foreground/70",
    displaySolid: "text-foreground",
    displayLarge: "text-[clamp(3.75rem,14vw,220px)] sm:text-[clamp(5rem,15vw,220px)]",
    overlays: "pointer-events-none absolute inset-0 h-full w-full",
    features:
      "relative z-20 mt-auto w-full rounded-t-[2.5rem] bg-surface px-4 py-10 text-surface-foreground shadow-[0_-20px_50px_color-mix(in_oklab,var(--color-accent-foreground)_30%,transparent)] sm:px-6 md:rounded-t-[3.5rem] md:px-10 md:py-16",
    featuresGrid:
      "mx-auto grid w-full max-w-[1440px] grid-cols-1 items-stretch gap-8 md:grid-cols-3 md:gap-8",
    featureCard:
      "relative flex flex-col items-center rounded-[2rem] border border-border bg-surface-secondary px-5 pt-8 pb-6 text-center text-surface-secondary-foreground",
    featureTitle: "mb-2 text-xl leading-tight font-black md:text-2xl",
    featureDescription: "mb-6 text-[10px] font-bold text-muted md:text-xs",
    featureMedia: "mt-auto flex w-full flex-1 items-end justify-center",
    metricCard:
      "relative mt-6 flex w-full max-w-[200px] flex-col items-center rounded-[2rem] bg-foreground px-6 py-4 text-accent-foreground shadow-lg",
    metricLabel: "mb-1 text-[9px] font-bold tracking-wider",
    metricValue: "text-xl font-black",
    metricTail: "absolute -bottom-2 start-8 h-5 w-5 rotate-45 bg-foreground",
    badge:
      "relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-full border-[3px] border-accent-foreground/5 bg-foreground text-accent-foreground shadow-xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105 rotate-12 sm:h-28 sm:w-28 md:h-36 md:w-36",
  },
});
