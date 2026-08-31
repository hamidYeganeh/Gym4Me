import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const kycStatusScreenVariants = tv({
  slots: {
    root: "relative flex min-h-dvh flex-col overflow-hidden bg-background text-foreground",
    panel:
      "mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[max(2.25rem,env(safe-area-inset-top))] sm:max-w-lg sm:px-8",
    topBar: "mb-2 flex min-h-11 items-center",
    backButton:
      "text-foreground outline-none data-[hovered=true]:bg-transparent data-[pressed=true]:opacity-70",
    header: "mt-2 flex flex-col items-center gap-2 text-center",
    title:
      "text-balance text-[1.65rem] font-bold tracking-tight text-foreground sm:text-[1.85rem]",
    subtitle: "max-w-xs text-pretty text-[0.95rem] leading-relaxed text-muted",
    figure: "mx-auto my-8 flex w-full max-w-[15rem] items-center justify-center",
    figureImage: "h-auto w-full object-contain drop-shadow-sm",
    tips: "flex w-full flex-col gap-3",
    tip: "flex items-center gap-3 text-start text-sm font-medium text-foreground",
    tipIcon: "shrink-0 text-success",
    spacer: "min-h-6 flex-1",
    actions: "flex w-full flex-col items-center gap-4 pb-2",
    primary: "w-full text-base font-bold text-accent-foreground",
    primaryIcon: "ms-2 size-5",
    skip:
      "font-semibold text-accent underline underline-offset-4 outline-none data-[hovered=true]:opacity-80",
    form: "mt-6 flex w-full flex-col gap-4",
    field: "flex w-full flex-col gap-2",
    label: "text-sm font-bold text-foreground",
    input:
      "min-h-14 rounded-[1.25rem] border border-border/70 bg-transparent px-5 text-base text-foreground shadow-none transition-[border-color,box-shadow] duration-fast ease-app placeholder:text-muted data-[focus-visible=true]:border-accent data-[focus-visible=true]:shadow-[0_0_0_4px_color-mix(in_oklch,var(--accent)_22%,transparent)]",
    error:
      "rounded-2xl border border-danger/40 bg-danger/15 px-4 py-3 text-center text-sm font-semibold text-danger",
    notice: "text-center text-sm text-success",

    // Scan step
    scanRoot:
      "relative flex min-h-dvh flex-col overflow-hidden bg-neutral-800 text-white",
    scanVideo:
      "absolute inset-0 size-full object-cover opacity-90",
    scanFallback: "absolute inset-0 bg-neutral-700",
    scanGrid:
      "pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.12)_1px,transparent_1px)] bg-size-[33.33%_33.33%] [background-position:center] [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]",
    scanFrameWrap:
      "relative z-10 flex flex-1 flex-col items-center justify-center px-8",
    scanTooltip:
      "mb-4 inline-flex items-center gap-2 rounded-full bg-black/80 px-3.5 py-2 text-sm font-medium text-white",
    scanFrame:
      "aspect-square w-full max-w-[18rem] rounded-[2rem] border-[3px] border-dashed border-white/90 shadow-[0_0_0_999px_rgb(0_0_0/0.35)]",
    scanFooter:
      "relative z-10 flex flex-col items-center gap-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4",
    captureButton: "flex items-center justify-center bg-accent text-accent-foreground shadow-[0_0_0_8px_color-mix(in_oklch,var(--accent)_35%,transparent)] outline-none data-[pressed=true]:scale-95",
    scanBack:
      "absolute start-4 top-[max(1.25rem,env(safe-area-inset-top))] z-20 text-white outline-none data-[hovered=true]:bg-white/10",
    scanHint: "text-sm text-white/75",
    fileInput: "sr-only",
    pickFile:
      "text-sm font-semibold text-accent underline underline-offset-4",

    // Processing
    processingRoot:
      "relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-6",
    processingSteps: "flex flex-col items-center gap-3 text-center",
    processingStep: "text-base font-semibold transition-colors duration-300",
    processingStepActive: "text-foreground",
    processingStepIdle: "text-muted",
    processingGlow:
      "pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-[radial-gradient(60%_80%_at_50%_100%,color-mix(in_oklch,var(--accent)_45%,transparent),transparent_70%)]",
    processingMark:
      "relative z-10 mb-[max(3rem,env(safe-area-inset-bottom))] mt-auto text-accent",

    // Success
    successBody:
      "flex flex-1 flex-col items-center justify-center gap-5 text-center",
    successIcon: "text-success",
    successTitle:
      "max-w-[18ch] text-balance text-[1.65rem] font-bold tracking-tight text-foreground",
    successSubtitle:
      "max-w-xs text-pretty text-[0.95rem] leading-relaxed text-muted",
  },
});

export type KycStatusScreenVariants = VariantProps<
  typeof kycStatusScreenVariants
>;
