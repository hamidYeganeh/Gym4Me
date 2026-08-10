import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const authLayoutVariants = tv({
  slots: {
    shell:
      "relative flex min-h-dvh flex-col overflow-x-hidden overflow-y-auto bg-background text-foreground",
    media: "pointer-events-none fixed inset-0",
    mediaImage:
      "absolute inset-0 size-full object-cover object-[center_45%] grayscale",
    mediaOverlay: "pointer-events-none absolute inset-0",
    mediaVignette: "pointer-events-none absolute inset-0",
    panel:
      "relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))] sm:max-w-lg sm:px-8",
    topBar: "mb-1 flex min-h-11 items-center",
    brand: "relative flex flex-col items-center gap-3 self-center",
    brandGlow:
      "pointer-events-none absolute top-[42%] left-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/30 blur-3xl dark:bg-accent/25",
    brandMark: "relative text-accent",
    brandName:
      "relative text-center text-[1.85rem] font-bold tracking-tight text-foreground sm:text-[2.125rem]",
    header:
      "mt-1.5 flex max-w-sm flex-col items-center gap-2 self-center text-center",
    title:
      "text-balance text-[1.65rem] font-bold tracking-tight text-foreground sm:text-[1.85rem] sm:leading-tight",
    subtitle:
      "max-w-[17rem] text-pretty text-[0.95rem] leading-relaxed text-muted sm:max-w-xs sm:text-base",
    figure:
      "mx-auto mt-6 mb-2 flex w-full max-w-[16rem] items-center justify-center sm:max-w-[18rem]",
    spacer: "min-h-8 flex-1",
    body: "flex w-full flex-col gap-6 pb-2",
    formSlot: "flex w-full flex-col gap-5",
    belowForm: "flex w-full flex-col gap-4",
    footer: "pt-2 text-center text-sm sm:text-base",
  },
  variants: {
    tone: {
      plain: {
        shell: "bg-background",
        brand: "mb-2",
        header: "mb-8",
        spacer: "min-h-8",
        footer: "text-muted",
        mediaOverlay:
          "bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--background)_92%,transparent)_0%,color-mix(in_oklch,var(--background)_78%,transparent)_45%,color-mix(in_oklch,var(--background)_94%,transparent)_100%)]",
        mediaVignette:
          "bg-[radial-gradient(120%_70%_at_50%_0%,transparent_0%,color-mix(in_oklch,var(--background)_55%,transparent)_100%)]",
      },
      dark: {
        shell: "dark bg-black text-white",
        brand: "mb-2",
        brandName: "text-white",
        header: "mb-8",
        title: "text-white",
        subtitle: "text-white/65",
        spacer: "min-h-10",
        footer: "text-white/65",
        mediaOverlay:
          "bg-[linear-gradient(to_bottom,color-mix(in_oklch,black_88%,transparent)_0%,color-mix(in_oklch,black_72%,transparent)_50%,color-mix(in_oklch,black_92%,transparent)_100%)]",
        mediaVignette:
          "bg-[radial-gradient(140%_50%_at_50%_100%,black_0%,transparent_60%)]",
      },
      hero: {
        shell: "bg-background",
        brand: "mb-1",
        header: "mb-6",
        brandName: "text-foreground",
        title: "text-foreground",
        subtitle: "text-muted",
        spacer: "min-h-16 flex-1",
        body: "text-white",
        footer: "text-white/80",
        mediaOverlay:
          "bg-[linear-gradient(to_bottom,var(--background)_0%,var(--background)_14%,color-mix(in_oklch,var(--background)_72%,transparent)_34%,color-mix(in_oklch,black_45%,transparent)_58%,black_84%)]",
        mediaVignette:
          "bg-[radial-gradient(140%_50%_at_50%_100%,black_0%,transparent_60%)]",
      },
    },
  },
  defaultVariants: {
    tone: "plain",
  },
});

export type AuthLayoutVariants = VariantProps<typeof authLayoutVariants>;
