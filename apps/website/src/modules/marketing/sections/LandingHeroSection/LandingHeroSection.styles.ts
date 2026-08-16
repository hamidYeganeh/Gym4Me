import { tv } from "tailwind-variants";

export const landingHeroSectionStyles = tv({
  slots: {
    root: [
      "landing-dark relative isolate flex min-h-[36rem] flex-col overflow-hidden",
      "rounded-(--radius-card-lg) text-(--on-brand)",
      "h-[calc(100svh-1rem)] sm:h-[calc(100svh-1.5rem)]",
    ],
    plate: "absolute inset-0 -z-10",
    plateInner:
      "absolute inset-x-0 top-[-16%] h-[132%] w-full will-change-transform",
    plateImg: "size-full object-cover",
    plateGradient: [
      "absolute inset-0",
      "bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--brand-deep)_65%,transparent),color-mix(in_oklab,var(--brand-deep)_35%,transparent),color-mix(in_oklab,var(--brand-deep)_75%,transparent))]",
    ],
    header:
      "relative z-20 flex items-start px-6 pt-6 text-xs sm:px-10 sm:pt-8",
    navLeft: "hidden flex-1 gap-8 lg:flex",
    navLink:
      "text-(--on-brand) opacity-90 transition-opacity duration-fast ease-app hover:opacity-100",
    brand:
      "flex flex-1 items-center justify-center gap-2 text-base font-medium tracking-[0.2em] uppercase",
    navRight: "flex flex-1 items-center justify-end gap-4 sm:gap-5",
    themeToggle:
      "size-10 min-w-10 rounded-full border-0 bg-(--glass-fill) text-(--on-brand) backdrop-blur transition-opacity duration-moderate ease-app hover:opacity-90",
    bookBtn:
      "hidden font-medium tracking-wide underline-offset-4 transition-opacity duration-fast ease-app hover:underline sm:inline",
    burger:
      "grid size-10 place-items-center gap-[5px] rounded-full bg-(--glass-fill) backdrop-blur transition-opacity duration-moderate ease-app hover:bg-(--glass-border)",
    burgerBar: "block h-px w-4 bg-(--on-brand)",
    titleWrap: "relative z-10 px-6 pt-4 sm:px-10",
    title: [
      "text-[clamp(2.75rem,10vw,8rem)] font-medium leading-[0.85] tracking-[-0.02em]",
    ],
    bottom: [
      "relative z-10 mt-auto flex flex-col gap-6 px-6 pb-8",
      "sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:pb-10",
    ],
    tagline:
      "text-[2.4rem] font-medium leading-[0.95] tracking-tight text-(--on-brand-muted)",
    cluster: "flex items-end gap-4",
    slider: "hidden w-64 shrink-0 flex-col gap-3 md:flex",
    clubCard: "w-full max-w-none shadow-lg shadow-foreground/20",
    memberCard: [
      "flex w-full max-w-80 items-stretch gap-3 rounded-[1.5rem] border border-(--glass-border)",
      "bg-(--glass-fill) p-3 shadow-lg shadow-(--brand-deep)/20 backdrop-blur sm:max-w-60",
    ],
    memberCopy: "flex flex-1 flex-col justify-between",
    memberValue: "text-3xl font-medium leading-none",
    memberDots: "flex",
    memberDot: "size-5 rounded-full border border-(--brand-deep)/40 -ms-2 first:ms-0",
    memberCaption: "text-[0.65rem] opacity-80",
    memberImg:
      "aspect-[3/4] w-16 shrink-0 rounded-xl object-cover",
  },
});
