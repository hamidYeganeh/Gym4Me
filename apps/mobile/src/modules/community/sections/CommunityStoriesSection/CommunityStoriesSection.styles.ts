import { tv } from "tailwind-variants";

export const communityStoriesSectionVariants = tv({
  slots: {
    root: "flex flex-col",
    scroller: [
      "-mx-screen flex snap-x snap-mandatory gap-4 overflow-x-auto",
      "scroll-smooth px-screen pb-1",
      "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    ].join(" "),
    item: [
      "h-auto w-[4.75rem] shrink-0 flex-col gap-2 rounded-none bg-transparent",
      "px-0 py-0 shadow-none",
      "hover:bg-transparent data-[hovered=true]:bg-transparent",
    ].join(" "),
    ring: [
      "overflow-hidden rounded-full p-[2.5px]",
      "bg-[conic-gradient(from_210deg,#c084fc_0%,#f472b6_32%,#fb923c_68%,#facc15_100%)]",
    ].join(" "),
    ringInner: "block overflow-hidden rounded-full bg-background p-[2px]",
    avatar: "size-16",
    username: "w-full truncate text-center text-foreground",
  },
});
