import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const sportCategoryCardVariants = tv({
  slots: {
    root: [
      // Override HeroUI Button defaults (h-10, inline-flex, items-center, etc.)
      "relative !flex flex-col items-stretch justify-between",
      "overflow-hidden text-start whitespace-normal",
      "transition-transform duration-fast ease-app data-[pressed=true]:scale-[0.98]",
      "outline-none",
    ].join(" "),
    backgroundImage:
      "pointer-events-none absolute inset-0 size-full object-cover select-none",
    overlay: "pointer-events-none absolute inset-0",
    body: "relative z-10 flex flex-col justify-between gap-4",
    action:
      "flex shrink-0 items-center justify-center self-end rounded-full",
    content: "flex min-w-0 shrink-0 flex-col",
    icon: "",
    subtitle: "opacity-95",
    title: "line-clamp-2 leading-snug tracking-tight",
  },
  variants: {
    size: {
      sm: {
        root: "h-[136px] w-[200px] rounded-[24px] p-4",
        action: "size-9 [&_svg]:!size-4",
        content: "gap-0.5",
        icon: "mb-0.5 [&_svg]:!size-6",
        subtitle: "text-xs",
        title: "text-base",
      },
      md: {
        root: "min-h-[220px] w-[280px] rounded-[32px] p-6",
        action: "size-12 [&_svg]:!size-[22px]",
        content: "gap-1",
        icon: "mb-1 [&_svg]:!size-8",
        subtitle: "text-sm",
        title: "text-[22px]",
      },
      lg: {
        root: "h-[228px] w-[336px] rounded-[36px] p-7",
        action: "size-14 [&_svg]:!size-6",
        content: "gap-1.5",
        icon: "mb-1.5 [&_svg]:!size-10",
        subtitle: "text-base",
        title: "text-[26px]",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type SportCategoryCardVariantProps = VariantProps<
  typeof sportCategoryCardVariants
>;
