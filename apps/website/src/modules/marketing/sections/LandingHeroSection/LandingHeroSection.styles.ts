import { tv } from "tailwind-variants";

export const landingHeroSectionStyles = tv({
  slots: {
    root: [
      "landing-dark relative isolate flex min-h-[36rem] flex-col overflow-hidden",
      "rounded-(--radius-card-lg) text-(--on-brand)",
      "h-[calc(100svh-1rem)] sm:h-[calc(100svh-1.5rem)]",
    ],
    plate: "absolute inset-0 -z-10",
    plateInner: "absolute inset-x-0 top-[-16%] h-[132%] w-full will-change-transform",
    plateImg: "size-full object-cover",
    plateGradient: [
      "absolute inset-0",
      "bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--brand-deep)_70%,transparent),color-mix(in_oklab,var(--brand-deep)_40%,transparent),color-mix(in_oklab,var(--brand-deep)_82%,transparent))]",
    ],
    header:
      "relative z-20 flex items-start px-6 pt-6 text-xs sm:px-10 sm:pt-8",
    navLeft: "hidden flex-1 gap-6 lg:flex xl:gap-8",
    navLink:
      "text-(--on-brand) opacity-90 transition-opacity duration-fast ease-app hover:opacity-100",
    brand:
      "flex flex-1 items-center justify-center gap-2 text-base font-bold tracking-[0.18em] uppercase",
    navRight: "flex flex-1 items-center justify-end gap-3 sm:gap-4",
    themeToggle:
      "size-10 min-w-10 rounded-full border-0 bg-(--glass-fill) text-(--on-brand) backdrop-blur transition-opacity duration-moderate ease-app hover:opacity-90",
    bookBtn:
      "hidden font-bold tracking-wide underline-offset-4 transition-opacity duration-fast ease-app hover:underline sm:inline",
    burger:
      "grid size-10 place-items-center gap-[5px] rounded-full bg-(--glass-fill) backdrop-blur transition-opacity duration-moderate ease-app",
    burgerBar: "block h-px w-4 bg-(--on-brand)",
    titleWrap: [
      "pointer-events-none absolute inset-x-0 top-1/2 z-10 w-full -translate-y-1/2",
      "px-4 text-center sm:px-8",
    ],
    title: [
      "mx-auto w-full max-w-none text-balance text-center",
      "text-[clamp(2.75rem,11vw,8.5rem)] font-bold leading-[0.9] tracking-tight",
    ],
    bottom: [
      "relative z-10 mt-auto flex flex-col gap-6 px-6 pb-8",
      "sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:pb-10",
    ],
    tagline:
      "text-[clamp(1.5rem,2.4rem,2.4rem)] font-bold leading-[0.95] tracking-tight text-(--on-brand-muted)",
    cluster: "flex items-end gap-3 sm:gap-4",
    clubCardWrap: "hidden w-[11.5rem] shrink-0 md:block lg:w-[13rem]",
    clubCardWrapSecondary: "w-[10.5rem] shrink-0 sm:w-[11.5rem] lg:w-[13rem]",
    clubCard: "w-full max-w-none shadow-lg shadow-foreground/20",
  },
});
