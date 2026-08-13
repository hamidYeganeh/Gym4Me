import { tv } from "tailwind-variants";

export const appLayoutVariants = tv({
  slots: {
    root: [
      "relative isolate flex min-h-dvh w-full flex-col overflow-x-clip",
      "bg-background text-start",
      "before:pointer-events-none before:absolute before:inset-x-0 before:top-0",
      "before:h-56 before:bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklch,var(--accent)_8%,transparent),transparent_72%)]",
    ].join(" "),
    header: "relative z-30 shrink-0",
    /** Screen content: 24px horizontal margins from the design grid */
    main: "relative z-10 flex flex-1 flex-col px-screen",
    footer: "relative z-30 shrink-0 pb-[env(safe-area-inset-bottom)]",
  },
  variants: {
    hasHeader: {
      false: {
        main: "pt-[env(safe-area-inset-top)]",
      },
    },
    hasFooter: {
      false: {
        main: "pb-[env(safe-area-inset-bottom)]",
      },
    },
  },
  defaultVariants: {
    hasHeader: false,
    hasFooter: false,
  },
});
