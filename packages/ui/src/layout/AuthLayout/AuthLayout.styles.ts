import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const authLayoutVariants = tv({
  slots: {
    shell:
      "dark flex min-h-dvh items-stretch bg-background text-foreground",
    panel:
      "relative flex w-full flex-col justify-center px-6 py-10 sm:px-10 lg:w-[min(448px,44%)] lg:shrink-0 lg:px-14 xl:ms-[clamp(2rem,8vw,8.875rem)] xl:px-0",
    brandMark:
      "mb-8 flex size-16 items-center justify-center self-center rounded-[1.3rem] bg-surface-secondary text-foreground",
    header: "mb-8 flex max-w-md flex-col items-center gap-3 text-center",
    title:
      "text-[1.75rem] font-bold tracking-tight text-foreground sm:text-[2.25rem] sm:leading-[2.75rem]",
    subtitle: "max-w-sm text-base leading-relaxed text-muted sm:text-lg",
    body: "flex w-full max-w-md flex-col gap-8",
    formSlot: "flex w-full flex-col gap-5",
    belowForm: "flex w-full flex-col gap-4",
    footer: "text-center text-base text-muted",
    media:
      "relative hidden min-h-dvh flex-1 p-6 lg:flex",
    mediaFrame:
      "relative h-full w-full overflow-hidden rounded-[2rem] border border-border/60 bg-surface-secondary shadow-[0_28px_80px_-40px_rgba(0,0,0,0.65)]",
    mediaImage:
      "absolute inset-0 size-full object-cover object-center",
    mediaOverlay:
      "pointer-events-none absolute inset-0 bg-gradient-to-t from-background/55 via-transparent to-background/10",
  },
});

export type AuthLayoutVariants = VariantProps<typeof authLayoutVariants>;
