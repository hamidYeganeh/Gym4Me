import { tv } from "tailwind-variants";

/** Sandow welcome CTA — orange rounded rect, not pill. */
export const welcomeScreenVariants = tv({
  slots: {
    primary: [
      "min-h-12 w-full rounded-[0.875rem] text-[1rem] font-semibold",
      "bg-accent text-accent-foreground shadow-none",
      "data-[hovered=true]:opacity-95 data-[pressed=true]:scale-[0.99]",
    ],
    primaryIcon: "ms-2 size-5",
    footer: "text-[0.875rem] leading-normal text-white/70",
    signIn: [
      "font-semibold text-accent underline underline-offset-4",
      "outline-none data-[hovered=true]:opacity-80",
    ],
  },
});
