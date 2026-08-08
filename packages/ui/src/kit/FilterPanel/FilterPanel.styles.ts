import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const filterPanelVariants = tv({
  slots: {
    content: "bg-background text-foreground",
    dialog: "flex max-h-[92dvh] flex-col bg-background",
    header: "relative flex flex-col gap-2 border-b border-border px-6 pb-4 pt-5",
    headingRow: "flex items-start justify-between gap-3",
    title: "pr-10 text-xl font-bold tracking-tight text-foreground",
    description: "text-sm text-muted",
    close: "absolute end-4 top-4",
    body: "flex flex-col gap-6 overflow-y-auto px-6 py-5",
    section: "flex flex-col gap-2.5",
    sectionLabel: "text-sm font-semibold text-foreground",
    chipRow: "flex flex-wrap gap-2.5",
    footer: "border-t border-border px-6 py-4",
    submit: [
      "h-14 w-full gap-2 rounded-[var(--field-radius)]",
      "bg-accent text-accent-foreground font-bold",
      "[--button-bg:var(--accent)]",
      "[--button-bg-hover:var(--accent)]",
      "[--button-bg-pressed:var(--accent)]",
      "[--button-fg:var(--accent-foreground)]",
    ].join(" "),
    submitIcon: "shrink-0 text-accent-foreground",
  },
});

export type FilterPanelVariantProps = VariantProps<typeof filterPanelVariants>;
