import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const authLayoutVariants = tv({
  slots: {
    /**
     * Form tones use min-height so the page can grow/scroll when the soft
     * keyboard shrinks the visual viewport. Hero locks to one viewport.
     */
    shell:
      "relative flex min-h-dvh flex-col bg-background text-foreground",
    media: "pointer-events-none fixed inset-0 z-0 overflow-hidden",
    mediaImage:
      "absolute inset-0 size-full object-cover object-[center_45%] grayscale",
    mediaFade:
      "pointer-events-none absolute inset-x-0 bottom-0 h-[55%] [contain:paint]",
    mediaBlur: "pointer-events-none absolute inset-0",
    mediaWash: [
      "absolute inset-0",
      "bg-[linear-gradient(to_top,var(--background)_0%,color-mix(in_oklch,var(--background)_72%,transparent)_32%,color-mix(in_oklch,var(--background)_28%,transparent)_58%,transparent_78%)]",
    ].join(" "),
    panel: [
      "relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col",
      "px-6 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))]",
      "sm:max-w-lg sm:px-8",
    ].join(" "),
    topBar: "mb-1 flex min-h-11 shrink-0 items-center",
    brand: "relative flex shrink-0 flex-col items-center gap-3 self-center",
    brandGlow:
      "pointer-events-none absolute top-[42%] left-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/30 blur-3xl dark:bg-accent/25",
    brandMark: "relative text-accent",
    brandName:
      "relative text-center text-[1.85rem] font-bold tracking-tight text-foreground sm:text-[2.125rem]",
    header:
      "mt-1.5 flex max-w-full shrink-0 flex-col items-center gap-2 self-center text-center",
    title:
      "text-balance text-[1.65rem] font-bold tracking-tight text-foreground sm:text-[1.85rem] sm:leading-tight",
    subtitle:
      "max-w-full text-pretty text-[0.95rem] text-center leading-relaxed text-muted sm:max-w-xs sm:text-base",
    figure:
      "mx-auto mt-2 mb-6 flex w-full max-w-[11.5rem] shrink-0 items-center justify-center sm:max-w-[13rem]",
    figureImage: "h-auto w-full object-contain",
    spacer: "min-h-0 flex-1",
    /** Natural height — document scrolls when the keyboard covers the form. */
    body: "flex w-full shrink-0 flex-col gap-6 pb-2",
    formSlot: "flex w-full flex-col gap-5 scroll-mt-6",
    belowForm: "flex w-full flex-col gap-4",
    footer: "shrink-0 pt-2 text-center text-sm sm:text-base",
  },
  variants: {
    tone: {
      plain: {
        shell: "bg-background",
        brand: "mb-2",
        header: "mb-6",
        footer: "text-muted",
      },
      dark: {
        shell: "bg-background text-foreground",
        brand: "mb-2",
        brandName: "text-foreground",
        header: "mb-8",
        title: "text-foreground",
        subtitle: "text-muted",
        footer: "text-muted",
      },
      hero: {
        /** Welcome hero — photo in upper band; shell colors follow theme. */
        shell: "h-dvh max-h-dvh overflow-hidden",
        brand: "mb-1",
        header: "mb-6 max-w-none self-stretch items-center gap-4 text-center",
        brandName: "text-foreground",
        title:
          "max-w-[21.5rem] text-balance text-center text-[2rem] leading-[1.2] font-bold tracking-tight text-foreground",
        subtitle:
          "max-w-[21.5rem] text-pretty text-center text-[0.9375rem] leading-[1.4] text-muted",
        spacer: "min-h-0 flex-1",
        body: "shrink-0 gap-0 overflow-visible bg-transparent p-0 shadow-none backdrop-blur-none",
        formSlot: "gap-0",
        footer: "pt-5 text-center text-[0.875rem] text-muted",
        media: "pointer-events-none absolute inset-x-0 top-0 z-0 h-[58dvh] overflow-hidden",
        mediaFade:
          "pointer-events-none absolute inset-x-0 bottom-0 h-[52%] [contain:paint]",
        mediaImage: "absolute inset-0 size-full object-cover object-top",
        panel: [
          "relative z-10 mx-auto flex h-full min-h-0 w-full max-w-md flex-col overflow-hidden",
          "px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))]",
          "sm:max-w-lg",
        ].join(" "),
      },
    },
    colorScheme: {
      light: {},
      dark: {},
    },
    framed: {
      true: {},
      false: {
        /** Keep a 2px gutter so HeroUI field focus rings are not clipped at the edges. */
        body: "bg-transparent p-0.5 shadow-none backdrop-blur-none",
      },
    },
    figureFirst: {
      true: {
        figure: "mt-4 mb-5 sm:mt-6",
        header: "mb-8",
      },
      false: {},
    },
  },
  compoundVariants: [
    {
      tone: "plain",
      framed: true,
      class: {
        body: [
          "rounded-[1.75rem] bg-surface/92 p-4 sm:p-5",
          "shadow-[0_18px_48px_color-mix(in_oklch,var(--foreground)_8%,transparent)] backdrop-blur-xl",
        ].join(" "),
      },
    },
    {
      tone: "dark",
      framed: true,
      class: {
        body: "rounded-[1.75rem] bg-foreground/6 p-4 shadow-2xl backdrop-blur-xl sm:p-5",
      },
    },
    {
      tone: "hero",
      colorScheme: "dark",
      class: {
        shell: "bg-black text-white",
        brandName: "text-white",
        title: "text-white",
        subtitle: "text-white/70",
        body: "text-white",
        footer: "text-white/70",
        mediaWash: [
          "bg-[linear-gradient(to_top,#000_0%,color-mix(in_oklch,black_72%,transparent)_32%,color-mix(in_oklch,black_28%,transparent)_58%,transparent_78%)]",
        ].join(" "),
      },
    },
    {
      tone: "dark",
      colorScheme: "dark",
      class: {
        shell: "bg-black text-white",
        brandName: "text-white",
        title: "text-white",
        subtitle: "text-white/65",
        footer: "text-white/65",
        mediaWash: [
          "bg-[linear-gradient(to_top,#000_0%,color-mix(in_oklch,black_72%,transparent)_32%,color-mix(in_oklch,black_28%,transparent)_58%,transparent_78%)]",
        ].join(" "),
      },
    },
    {
      tone: "dark",
      framed: true,
      colorScheme: "dark",
      class: {
        body: "rounded-[1.75rem] bg-white/6 p-4 shadow-2xl backdrop-blur-xl sm:p-5",
      },
    },
  ],
  defaultVariants: {
    tone: "plain",
    colorScheme: "light",
    framed: true,
    figureFirst: false,
  },
});

export type AuthLayoutVariants = VariantProps<typeof authLayoutVariants>;
