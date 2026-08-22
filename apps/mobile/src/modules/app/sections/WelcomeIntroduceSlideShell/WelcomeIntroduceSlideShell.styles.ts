import { tv } from "tailwind-variants";

export const welcomeIntroduceSlideShellVariants = tv({
  slots: {
    root: "relative h-full min-h-dvh w-full overflow-hidden bg-black",
    image: "absolute inset-0 size-full object-cover object-top",
  },
});
