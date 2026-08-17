import { tv } from "tailwind-variants";

export const kycStatusScanSectionVariants = tv({
  slots: {
    root:
      "relative flex min-h-dvh flex-col overflow-hidden bg-neutral-800 text-white",
    video: "absolute inset-0 size-full object-cover opacity-90",
    fallback: "absolute inset-0 bg-neutral-700",
    grid:
      "pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.12)_1px,transparent_1px)] bg-size-[33.33%_33.33%] [background-position:center] [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]",
    frameWrap:
      "relative z-10 flex flex-1 flex-col items-center justify-center px-8",
    tooltip:
      "mb-4 inline-flex items-center gap-2 rounded-full bg-black/80 px-3.5 py-2 text-sm font-medium text-white",
    frame:
      "aspect-square w-full max-w-[18rem] rounded-[2rem] border-[3px] border-dashed border-white/90 shadow-[0_0_0_999px_rgb(0_0_0/0.35)]",
    footer:
      "relative z-10 flex flex-col items-center gap-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4",
    captureButton:
      "flex size-20 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[0_0_0_8px_color-mix(in_oklch,var(--accent)_35%,transparent)] outline-none data-[pressed=true]:scale-95",
    back:
      "absolute start-4 top-[max(1.25rem,env(safe-area-inset-top))] z-20 text-white outline-none data-[hovered=true]:bg-white/10",
    hint: "text-sm text-white/75",
    fileInput: "sr-only",
    pickFile:
      "text-sm font-semibold text-accent underline underline-offset-4",
  },
});
