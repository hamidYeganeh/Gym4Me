import { tv } from "tailwind-variants";

export const onboardingNameSectionVariants = tv({
  slots: {
    root: "flex w-full max-w-md flex-col items-center gap-6 px-1",
    fields: "flex w-full flex-col gap-3",
    field: "w-full",
    input:
      "min-h-14 rounded-full border border-border bg-transparent px-6 text-center !text-xl text-foreground shadow-none transition-[border-color,box-shadow,background-color] duration-fast ease-app placeholder:text-muted data-[focus-visible=true]:border-accent data-[focus-visible=true]:bg-accent/5 data-[focus-visible=true]:shadow-[0_0_0_4px_color-mix(in_oklch,var(--accent)_18%,transparent)]",
    hintBlock: "flex max-w-xs flex-col items-center gap-2 text-center",
    hintIcon: "size-7 text-muted",
    hint: "text-sm leading-6 text-muted",
  },
});
