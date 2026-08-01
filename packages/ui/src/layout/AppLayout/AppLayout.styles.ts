import { tv } from "tailwind-variants";

export const appLayoutVariants = tv({
  slots: {
    root: "flex min-h-full w-full flex-col bg-background text-start",
    header: "shrink-0",
    /** Screen content: 24px horizontal margins from the design grid */
    main: "flex flex-1 flex-col px-screen",
    footer: "shrink-0",
  },
});
