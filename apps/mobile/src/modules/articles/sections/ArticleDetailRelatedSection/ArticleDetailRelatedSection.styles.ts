import { tv } from "tailwind-variants";

export const articleDetailRelatedSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-3",
    title: "tracking-tight",
    scroller:
      "-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    card: "w-[min(100%,22rem)] shrink-0",
  },
});
