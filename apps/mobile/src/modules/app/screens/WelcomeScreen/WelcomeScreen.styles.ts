import { tv } from "tailwind-variants";

export const welcomeScreenVariants = tv({
  slots: {
    primary:
      "min-h-14 w-full rounded-full text-base font-semibold text-accent-foreground",
    primaryIcon: "ms-2 size-5",
    footer: "text-sm text-white/80",
    signIn:
      "font-semibold text-accent underline underline-offset-4 outline-none data-[hovered=true]:opacity-80",
  },
});
