import { tv } from "tailwind-variants";

export const networkOfflineOverlayVariants = tv({
  slots: {
    root: [
      "fixed inset-0 z-[100] flex items-center justify-center bg-background px-screen",
      "pt-[max(2rem,env(safe-area-inset-top))]",
      "pb-[max(2rem,env(safe-area-inset-bottom))]",
    ],
  },
});
