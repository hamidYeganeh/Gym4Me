import { tv } from "tailwind-variants";

export const imageCropperSheetVariants = tv({
  slots: {
    dialog: "max-h-[92dvh]",
    body: "flex flex-col gap-5 px-4",
    canvasWrap:
      "relative mx-auto w-full max-w-md touch-none overflow-hidden rounded-2xl bg-black",
    canvas: "block h-auto w-full touch-none",
    grid: "pointer-events-none absolute inset-0 border border-white/60 bg-[linear-gradient(to_right,transparent_33.1%,rgba(255,255,255,.35)_33.3%,rgba(255,255,255,.35)_33.6%,transparent_33.8%,transparent_66.2%,rgba(255,255,255,.35)_66.4%,rgba(255,255,255,.35)_66.7%,transparent_66.9%),linear-gradient(to_bottom,transparent_33.1%,rgba(255,255,255,.35)_33.3%,rgba(255,255,255,.35)_33.6%,transparent_33.8%,transparent_66.2%,rgba(255,255,255,.35)_66.4%,rgba(255,255,255,.35)_66.7%,transparent_66.9%)]",
    zoomRow: "flex items-center gap-3",
    range: "h-2 w-full accent-accent",
    hint: "text-center text-muted",
    footer:
      "grid grid-cols-2 gap-3 border-t border-border/70 bg-surface px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3",
  },
});
