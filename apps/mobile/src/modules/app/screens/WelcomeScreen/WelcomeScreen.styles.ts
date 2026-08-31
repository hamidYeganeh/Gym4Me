import { tv } from "tailwind-variants";

/** Sandow welcome CTA — orange rounded rect, not pill. */
export const welcomeScreenVariants = tv({
  slots: {
    primary: [

      "w-full",

    ],
    primaryIcon: "ms-2",
    footer: "text-[0.875rem] leading-normal text-white/70",
    signIn: [
      "font-semibold text-accent underline underline-offset-4",
      "outline-none data-[hovered=true]:opacity-80",
    ],
  },
});
