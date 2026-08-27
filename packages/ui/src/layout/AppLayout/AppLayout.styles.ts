import { tv } from "tailwind-variants";

export const appLayoutVariants = tv({
  slots: {
    root: [
      "relative isolate flex min-h-dvh w-full flex-col overflow-x-clip",
      "bg-background text-start",
    ].join(" "),
    header: "relative z-30 shrink-0 shadow-sm",
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
