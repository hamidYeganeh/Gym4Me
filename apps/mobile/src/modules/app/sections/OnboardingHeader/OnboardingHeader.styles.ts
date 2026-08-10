import { tv } from "tailwind-variants";

export const onboardingHeaderVariants = tv({
  slots: {
    root: "flex w-full items-center gap-3 px-1",
    back: "shrink-0 text-foreground outline-none data-[hovered=true]:bg-transparent data-[pressed=true]:opacity-70",
    backIcon: "size-6",
    progress: "min-w-0 flex-1",
    track: "h-1.5 overflow-hidden rounded-full bg-default",
    fill: "h-full rounded-full bg-accent transition-[width] duration-300 ease-out",
    skip: "shrink-0 px-1 text-sm font-bold text-accent outline-none data-[hovered=true]:bg-transparent data-[hovered=true]:opacity-80",
  },
});
