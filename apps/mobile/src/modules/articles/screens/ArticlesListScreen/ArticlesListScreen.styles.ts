import { tv } from "tailwind-variants";

export const articlesListScreenVariants = tv({
  slots: {
    root: "flex min-h-0 flex-1 flex-col",
    content: "flex flex-col gap-5 px-4 pb-8 pt-2",
    filters: "flex flex-col gap-3",
    chips: "flex flex-wrap gap-2",
    scroller:
      "-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    list: "flex flex-col gap-4",
    empty: "py-16 text-center text-muted",
    loading: "py-16 text-center text-muted",
  },
});
