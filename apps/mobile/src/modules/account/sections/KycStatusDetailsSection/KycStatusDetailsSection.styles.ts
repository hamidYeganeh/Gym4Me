import { tv } from "tailwind-variants";

export const kycStatusDetailsSectionVariants = tv({
  slots: {
    topBar: "mb-2 flex min-h-11 items-center",
    backButton:
      "text-foreground outline-none data-[hovered=true]:bg-transparent data-[pressed=true]:opacity-70",
    header: "mt-2 flex flex-col items-center gap-2 text-center",
    title:
      "text-balance text-[1.65rem] font-bold tracking-tight text-foreground sm:text-[1.85rem]",
    subtitle: "max-w-xs text-pretty text-[0.95rem] leading-relaxed text-muted",
    form: "mt-6 flex w-full flex-col gap-4",
    field: "flex w-full flex-col gap-2",
    label: "text-sm font-bold text-foreground",
    input:
      "min-h-14 rounded-[1.25rem] border border-border/70 bg-transparent px-5 text-base text-foreground shadow-none transition-[border-color,box-shadow] duration-fast ease-app placeholder:text-muted data-[focus-visible=true]:border-accent data-[focus-visible=true]:shadow-[0_0_0_4px_color-mix(in_oklch,var(--accent)_22%,transparent)]",
    error:
      "rounded-2xl border border-danger/40 bg-danger/15 px-4 py-3 text-center text-sm font-semibold text-danger",
    spacer: "min-h-6 flex-1",
    actions: "flex w-full flex-col items-center gap-4 pb-2",
    primary:
      "min-h-14 w-full rounded-full text-base font-bold text-accent-foreground",
    primaryIcon: "ms-2 size-5",
  },
});
