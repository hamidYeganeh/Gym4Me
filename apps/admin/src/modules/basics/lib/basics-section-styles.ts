import { tv } from "tailwind-variants";

/** Shared layout slots for basics CRUD sections. */
export const basicsSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-5",
    intro: "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between",
    introCopy: "min-w-0",
    title:
      "text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-[2rem]",
    subtitle: "mt-2 max-w-2xl text-sm leading-7 text-muted sm:text-base",
    introActions: "flex shrink-0 flex-wrap items-center gap-3",
    toolbar: "flex flex-wrap items-end gap-3",
    filters: "flex flex-wrap gap-3",
    filter: "w-full min-w-[10rem] sm:w-44",
    tableCard: "overflow-hidden border-0 shadow-none",
    tableContent: "p-0",
    empty: "px-6 py-16 text-center text-sm text-muted",
    loading:
      "flex items-center justify-center gap-3 px-6 py-16 text-sm text-muted",
    error: "px-6 py-4 text-sm text-danger",
    actionsCell: "flex flex-wrap items-center justify-end gap-2",
    chips: "flex flex-wrap gap-1.5",
    form: "flex flex-col gap-4",
    formRow: "grid gap-4 sm:grid-cols-2",
    formError: "text-sm text-danger",
    optionsList: "flex flex-col gap-3",
    optionRow:
      "grid gap-3 rounded-2xl bg-surface p-3 sm:grid-cols-[1fr_1fr_auto]",
    switchRow: "flex items-center justify-between gap-3",
  },
});
