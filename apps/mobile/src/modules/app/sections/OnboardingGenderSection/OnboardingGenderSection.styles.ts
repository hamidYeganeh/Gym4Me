import { tv } from "tailwind-variants";

export const onboardingGenderSectionVariants = tv({
  slots: {
    root: "flex w-full max-w-sm flex-col items-center",
    grid: "grid w-full grid-cols-2 gap-3",
    card: [
      "flex w-full flex-col items-center gap-3 border transition-[border-color,background-color,color,transform] duration-fast ease-app",
      "data-[pressed=true]:scale-[0.98]",
    ],
    figure: [
      "relative w-full overflow-hidden",
      // Belly-to-top crop of the 130×360 body art.
      "aspect-[130/175]",
    ],
    art: [
      "absolute inset-x-0 top-0 block w-full select-none",
      "[&_svg]:block [&_svg]:h-auto [&_svg]:w-full [&_svg]:max-w-none",
    ],
    fade: [
      "pointer-events-none absolute inset-x-0 bottom-0 h-1/2",
      "bg-[linear-gradient(to_top,var(--gender-card-bg)_0%,transparent_100%)]",
    ],
    icon: "size-8 shrink-0",
    label: "text-center text-sm font-bold leading-none",
  },
  variants: {
    selected: {
      true: {
        card: [
          "!border-2 !border-accent !bg-accent !text-accent-foreground",
          "[--gender-card-bg:var(--accent)]",
          "[--body-type-body:color-mix(in_oklch,var(--accent-foreground)_16%,var(--accent))]",
          "[--body-type-stroke:var(--accent-foreground)]",
        ].join(" "),
        icon: "text-accent-foreground",
        label: "text-accent-foreground",
      },
      false: {
        card: [
          "!border !border-border !bg-surface !text-foreground data-[hovered=true]:!border-muted",
          "[--gender-card-bg:var(--surface)]",
          "[--body-type-body:color-mix(in_oklch,var(--foreground)_08%,var(--surface))]",
          "[--body-type-stroke:color-mix(in_oklch,var(--foreground)_32%,var(--border))]",
        ].join(" "),
        icon: "text-foreground",
        label: "text-foreground",
      },
    },
  },
  defaultVariants: {
    selected: false,
  },
});
