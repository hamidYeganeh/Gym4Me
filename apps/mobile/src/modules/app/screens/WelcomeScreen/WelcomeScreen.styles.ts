import { tv } from "tailwind-variants";

export const welcomeScreenVariants = tv({
  slots: {
    root: "relative flex min-h-dvh flex-col overflow-hidden bg-black text-white",
    media: "pointer-events-none absolute inset-0",
    mediaImage: "h-full w-full object-cover object-center",
    mediaOverlay:
      "absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/30",
    content:
      "relative z-10 flex min-h-dvh flex-col justify-end gap-6 px-screen pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]",
    copy: "flex flex-col items-center gap-3 text-center",
    title:
      "max-w-[16ch] text-balance text-[1.75rem] leading-tight tracking-tight text-white sm:text-[2rem]",
    subtitle: "max-w-[30ch] text-pretty text-[0.95rem] leading-relaxed text-white/55",
    actions: "mt-2 flex flex-col items-center gap-5",
    primary:
      "min-h-14 w-full rounded-full text-base font-semibold text-accent-foreground",
    primaryIcon: "ms-2 size-5",
    footer: "flex flex-wrap items-center justify-center gap-x-1 text-sm text-white/55",
    signIn:
      "font-semibold text-accent underline underline-offset-4 outline-none data-[hovered=true]:opacity-80",
  },
});
