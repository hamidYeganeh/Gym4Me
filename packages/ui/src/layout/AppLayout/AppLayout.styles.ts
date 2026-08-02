import { tv } from "tailwind-variants";

export const appLayoutVariants = tv({
  slots: {
    root: "flex min-h-full w-full flex-col bg-background text-start",
    header: "shrink-0",
    /** Screen content: 24px horizontal margins from the design grid */
    main: "flex flex-1 flex-col px-screen",
    footer: "shrink-0 pb-[env(safe-area-inset-bottom)]",
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
