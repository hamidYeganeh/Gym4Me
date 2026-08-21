import { tv } from "tailwind-variants";

export const welcomeIntroduceSlideShellVariants = tv({
  slots: {
    root: "relative h-full min-h-0 w-full overflow-hidden bg-black",
    image: "object-cover object-center size-full",
  },
});
