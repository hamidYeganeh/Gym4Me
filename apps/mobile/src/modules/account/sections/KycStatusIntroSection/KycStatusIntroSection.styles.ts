import { tv } from "tailwind-variants";

export const kycStatusIntroSectionVariants = tv({
  slots: {
    topBar: "mb-2 flex min-h-11 items-center",
    backButton:
      "text-foreground outline-none data-[hovered=true]:bg-transparent data-[pressed=true]:opacity-70",
    header: "mt-2 flex flex-col items-center gap-2 text-center",
    title:
      "text-balance text-[1.65rem] font-bold tracking-tight text-foreground sm:text-[1.85rem]",
    subtitle: "max-w-xs text-pretty text-[0.95rem] leading-relaxed text-muted",
    figure: "mx-auto my-8 flex w-full max-w-[15rem] items-center justify-center",
    figureImage: "h-auto w-full object-contain drop-shadow-sm",
    tips: "flex w-full flex-col gap-3",
    tip: "flex items-center gap-3 text-start text-sm font-medium text-foreground",
    tipIcon: "shrink-0 text-success",
    error:
      "rounded-2xl border border-danger/40 bg-danger/15 px-4 py-3 text-center text-sm font-semibold text-danger",
    spacer: "min-h-6 flex-1",
    actions: "flex w-full flex-col items-center gap-4 pb-2",
    primary: "w-full text-base font-bold text-accent-foreground",
    primaryIcon: "ms-2 size-5",
    skip:
      "font-semibold text-accent underline underline-offset-4 outline-none data-[hovered=true]:opacity-80",
  },
});
