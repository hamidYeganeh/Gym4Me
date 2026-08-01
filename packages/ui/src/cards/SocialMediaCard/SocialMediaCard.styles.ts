import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const socialMediaCardVariants = tv({
  slots: {
    root: [
      "w-full gap-4 overflow-hidden rounded-[32px] p-6",
      "bg-surface text-surface-foreground",
    ].join(" "),
    header: "flex flex-row items-center justify-between gap-3 p-0",
    title: "tracking-wide uppercase text-surface-foreground",
    shareIcon: "shrink-0 text-surface-foreground",
    list: "flex w-full flex-col -gap-2.5",
    item: [
      // Override HeroUI Button defaults (h-10, inline-flex, ghost fill)
      "relative !flex !h-16 w-full min-w-0 shrink-0 items-center justify-center",
      "rounded-[24px] border-0",
      "bg-surface-secondary text-surface-secondary-foreground",
      "transition-transform duration-fast ease-app outline-none data-[pressed=true]:scale-[0.99]",
      "hover:bg-surface-tertiary data-[hovered=true]:bg-surface-tertiary",
    ].join(" "),
    itemIcon: "flex items-center justify-center text-current [&_svg]:size-6",
  },
});

export type SocialMediaCardVariantProps = VariantProps<
  typeof socialMediaCardVariants
>;
