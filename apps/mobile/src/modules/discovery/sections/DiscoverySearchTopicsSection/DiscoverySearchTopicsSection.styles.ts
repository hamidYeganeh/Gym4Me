import { tv } from "tailwind-variants";

export const discoverySearchTopicsSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4",
    title: "text-foreground",
    list: "flex flex-wrap gap-2",
    topicButton: [
      "h-auto min-h-0 p-0 shadow-none",
      "hover:bg-transparent data-[hovered=true]:bg-transparent",
    ].join(" "),
    chip: "rounded-[0.75rem] px-3",
    empty: "text-muted",
  },
});
