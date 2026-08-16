import { tv } from "tailwind-variants";

export const landingDownloadSectionStyles = tv({
  slots: {
    root: [
      "landing-download mt-3 overflow-hidden rounded-(--radius-card-lg)",
      "bg-accent px-6 py-20 text-accent-foreground sm:px-10 sm:py-24",
    ].join(" "),
    inner:
      "mx-auto grid w-full max-w-[1200px] items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16",
    copy: "flex flex-col items-start text-start",
    title:
      "text-5xl font-medium leading-[0.92] tracking-tight text-accent-foreground sm:text-6xl",
    hint: "mt-4 max-w-md text-sm text-accent-foreground/75",
    actions: "mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-center",
    store: [
      "group h-auto w-full justify-center gap-3 rounded-full",
      "bg-foreground px-6 py-3.5 text-background",
      "transition-opacity duration-moderate ease-app hover:opacity-90",
      "sm:w-auto sm:min-w-[11.5rem]",
    ].join(" "),
    storeGhost: [
      "group h-auto w-full justify-center gap-3 rounded-full",
      "border border-accent-foreground/25 bg-transparent px-6 py-3.5",
      "text-accent-foreground transition-opacity duration-moderate ease-app hover:opacity-80",
      "sm:w-auto sm:min-w-[11.5rem]",
    ].join(" "),
    storeIcon: "h-7 w-7 shrink-0",
    storeIconPlay: "h-6 w-6 shrink-0",
    storeKicker: "-mb-0.5 text-start text-[0.65rem] tracking-wider opacity-70",
    storeTitle: "text-start text-base leading-none tracking-tight",
    stage: "relative mx-auto flex w-full max-w-[22rem] items-center justify-center lg:max-w-none",
    bezel:
      "relative z-10 flex h-[34rem] w-[17rem] flex-col rounded-[2.5rem] bg-accent-foreground shadow-[0_28px_60px_-20px_color-mix(in_oklab,var(--color-accent-foreground)_45%,transparent)] sm:h-[36rem] sm:w-[18rem]",
    screen:
      "absolute inset-[6px] z-10 overflow-hidden rounded-[2.15rem] bg-background text-foreground",
    notch:
      "absolute top-[5px] left-1/2 z-50 flex h-6 w-[5.5rem] -translate-x-1/2 items-center justify-start rounded-full bg-accent-foreground px-3",
    notchDot: "h-1.5 w-1.5 rounded-full bg-foreground/80",
    screenInner:
      "relative flex h-full w-full flex-col gap-2.5 overflow-hidden px-3 pt-10 pb-6",
    phoneHeader: "flex items-center justify-between gap-2",
    phoneIdentity: "flex min-w-0 flex-1 items-center gap-2",
    phoneAvatar: "size-9 shrink-0",
    phoneNotify:
      "size-9 min-w-9 rounded-full border border-border bg-surface text-foreground",
    phoneSpotlight: "!min-h-0 shrink-0 !rounded-[1.15rem] !p-3 !shadow-sm",
    phoneCta: "!min-h-0 shrink-0 !rounded-[1.15rem] !p-3",
    phoneTodo: "min-h-0 flex-1 overflow-hidden !gap-2 !rounded-[1.15rem] !p-3",
    homeIndicator:
      "absolute bottom-2 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-foreground/20",
    floatingBadge:
      "absolute z-20 hidden items-center gap-2 rounded-2xl border border-border bg-surface p-2.5 text-surface-foreground shadow-lg sm:flex",
    badgeIcon:
      "flex size-8 shrink-0 items-center justify-center rounded-full",
  },
});
