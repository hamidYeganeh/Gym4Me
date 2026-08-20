import { tv } from "tailwind-variants";

export const pageTransitionVariants = tv({
  slots: {
    // Do not leave `will-change-transform` / transforms on the idle shell —
    // either creates a containing block and breaks `position: fixed` headers.
    root: "min-h-dvh w-full overflow-x-clip",
  },
});
