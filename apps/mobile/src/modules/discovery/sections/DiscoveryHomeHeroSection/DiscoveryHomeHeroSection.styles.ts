import { tv } from "tailwind-variants";

export const discoveryHomeHeroSectionVariants = tv({
  slots: {
    root: [
      "relative isolate overflow-hidden rounded-[2rem]",
      "min-h-[22rem] bg-foreground text-background",
      "dark:bg-background dark:text-foreground",
    ].join(" "),
    media: "absolute inset-0 size-full object-cover",
    scrim: [
      "pointer-events-none absolute inset-0",
      "bg-[linear-gradient(180deg,transparent_18%,color-mix(in_oklab,var(--foreground)_72%,transparent)_72%,color-mix(in_oklab,var(--foreground)_88%,transparent)_100%)]",
      "dark:bg-[linear-gradient(180deg,transparent_18%,color-mix(in_oklab,var(--background)_72%,transparent)_72%,color-mix(in_oklab,var(--background)_88%,transparent)_100%)]",
    ].join(" "),
    accentRail:
      "pointer-events-none absolute inset-y-5 start-0 w-1 rounded-full bg-accent",
    content: [
      "relative z-10 flex min-h-[22rem] flex-col justify-end gap-4",
      "px-5 pb-6 pt-16",
    ].join(" "),
    copy: "flex max-w-[20rem] flex-col gap-2",
    eyebrow: "text-accent tracking-wide",
    title: [
      "text-balance text-[2rem] leading-[1.08] tracking-tight text-background",
      "dark:text-foreground",
    ].join(" "),
    subtitle: [
      "max-w-[18rem] text-pretty leading-relaxed text-background/80",
      "dark:text-foreground/80",
    ].join(" "),
    cta: [

      "w-fit bg-accent font-bold text-accent-foreground",

      "shadow-none",

    ].join(" "),
  },
});
