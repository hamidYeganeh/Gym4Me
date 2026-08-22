import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const adminDashboardLayoutVariants = tv({
  slots: {
    shell:
      "flex min-h-dvh items-stretch gap-4 bg-background p-4 text-foreground sm:gap-5 sm:p-6",
    sidebar:
      "relative flex w-[4.25rem] shrink-0 flex-col items-center gap-5 rounded-full bg-accent py-5 text-accent-foreground shadow-[0_18px_48px_-28px_color-mix(in_oklab,var(--accent)_65%,transparent)] sm:w-[4.75rem] sm:gap-6 sm:py-6",
    secondaryPanel:
      "hidden w-52 shrink-0 flex-col gap-5 rounded-[2rem] border border-divider bg-surface px-3 py-6 text-surface-foreground shadow-[0_24px_70px_-45px_rgba(0,0,0,0.35)] lg:flex",
    secondaryTitle: "px-3 text-sm font-semibold text-muted",
    secondaryNav: "flex flex-col gap-1",
    secondaryItem:
      "w-full justify-start rounded-xl px-3 text-start text-muted outline-none data-[hovered=true]:bg-accent/10 data-[hovered=true]:text-foreground",
    secondaryItemActive:
      "bg-accent/15 font-semibold text-foreground data-[hovered=true]:bg-accent/20",
    logoButton:
      "text-accent-foreground outline-none data-[hovered=true]:bg-accent-foreground/10 data-[pressed=true]:bg-accent-foreground/15",
    nav: "relative flex w-full flex-1 flex-col items-center gap-1",
    navItemWrap: "relative flex w-full items-center justify-center",
    navItem: "outline-none",
    navItemActive:
      "text-accent-foreground data-[hovered=true]:bg-accent-foreground/10",
    navIndicator:
      "pointer-events-none absolute start-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-e-full bg-accent-foreground",
    avatarWrap: "mt-auto flex items-center justify-center pb-1",
    avatar: "size-10 ring-2 ring-accent-foreground/25 sm:size-11",
    main: "flex min-w-0 flex-1 flex-col overflow-hidden rounded-[2rem] bg-surface text-surface-foreground shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)] sm:rounded-[2.5rem]",
    header: "flex flex-col gap-3 px-5 py-5 sm:px-8 sm:py-6",
    headerSection: "flex flex-col gap-3 px-5 py-4 sm:px-8 sm:py-4",
    headerRow:
      "flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
    breadcrumbs: "text-xs text-muted",
    breadcrumbItem: "outline-none",
    headerActions: "flex items-center gap-2 sm:gap-3",
    greeting:
      "text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]",
    search: "w-full sm:w-auto",
    searchGroup: "min-h-11 rounded-full bg-surface px-1 shadow-none",
    searchInput: "w-full min-w-0 sm:w-64",
    filterButton:
      "shrink-0 text-muted outline-none data-[pressed=true]:opacity-70",
    themeButton:
      "shrink-0 text-muted outline-none data-[pressed=true]:opacity-70",
    themeButtonSection: "shrink-0 outline-none data-[pressed=true]:opacity-70",
    content: "min-h-0 flex-1 p-5 sm:p-8",
  },
  variants: {
    colorScheme: {
      light: {
        // Inverse strip on light canvas — same composition as the dark reference.
        headerSection: "bg-background",
        themeButtonSection:
          "text-foreground data-[hovered=true]:bg-background/10 data-[hovered=true]:text-foreground",
      },
      dark: {
        headerSection: "bg-black",
        themeButtonSection:
          "text-neutral-300 data-[hovered=true]:bg-white/10 data-[hovered=true]:text-white",
      },
    },
  },
  defaultVariants: {
    colorScheme: "light",
  },
});

export type AdminDashboardLayoutVariants = VariantProps<
  typeof adminDashboardLayoutVariants
>;
