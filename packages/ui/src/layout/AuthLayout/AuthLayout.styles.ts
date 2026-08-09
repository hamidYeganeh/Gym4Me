import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const authLayoutVariants = tv({
  slots: {
    shell:
      "dark relative flex min-h-dvh flex-col overflow-x-hidden overflow-y-auto bg-background text-foreground",
    media: "pointer-events-none fixed inset-0",
    mediaImage:
      "absolute inset-0 size-full object-cover object-[center_30%]",
    mediaOverlay:
      "pointer-events-none absolute inset-0 bg-gradient-to-t from-background from-[12%] via-background/88 via-45% to-background/35",
    mediaVignette:
      "pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_0%,transparent_35%,color-mix(in_oklch,var(--background)_55%,transparent)_100%)]",
    panel:
      "relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(2.75rem,env(safe-area-inset-top))] sm:max-w-lg sm:px-8",
    brand:
      "relative mb-5 flex flex-col items-center gap-3 self-center",
    brandGlow:
      "pointer-events-none absolute top-1/2 left-1/2 size-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/30 blur-3xl",
    brandMark: "relative text-accent",
    brandName: "relative h-10 w-auto text-foreground sm:h-11",
    header:
      "mb-8 flex max-w-sm flex-col items-center gap-2 self-center text-center",
    title:
      "text-balance text-[1.5rem] font-bold tracking-tight text-foreground sm:text-[1.75rem] sm:leading-tight",
    subtitle:
      "max-w-xs text-pretty text-[0.95rem] leading-relaxed text-foreground/90 sm:text-base",
    spacer: "min-h-6 flex-1",
    body: "flex w-full flex-col gap-6 pb-2",
    formSlot: "flex w-full flex-col gap-5",
    belowForm: "flex w-full flex-col gap-4",
    footer: "pt-1 text-center text-sm text-muted sm:text-base",
  },
});

export type AuthLayoutVariants = VariantProps<typeof authLayoutVariants>;
