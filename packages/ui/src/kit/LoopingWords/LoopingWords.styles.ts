import { tv } from "tailwind-variants";

export const loopingWordsVariants = tv({
  slots: {
    root: "relative inline-flex overflow-hidden align-bottom",
    word: "inline-flex",
  },
});
