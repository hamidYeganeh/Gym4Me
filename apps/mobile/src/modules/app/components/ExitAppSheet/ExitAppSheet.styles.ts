import { tv } from "tailwind-variants";

export const exitAppSheetVariants = tv({
  slots: {
    dialog: [
      "mx-auto w-full max-w-xl gap-0",
      "rounded-t-[2rem] border-0 bg-background px-0",
      "pb-[max(1.25rem,env(safe-area-inset-bottom))]",
    ].join(" "),
    body: "flex flex-col items-center gap-5 px-6 pt-2",
    figure: [
      "relative flex h-[11.5rem] w-full max-w-[18rem] items-center justify-center",
      "overflow-hidden rounded-2xl bg-black",
    ].join(" "),
    image: "object-contain object-center",
    copy: "flex w-full flex-col items-center gap-2 text-center",
    title: "text-[1.45rem] leading-tight text-foreground sm:text-[1.6rem]",
    subtitle: "max-w-[18rem] text-sm leading-relaxed text-muted",
    footer: "flex w-full flex-col gap-3 px-6 pt-1",
    stay: "min-h-14 w-full rounded-[1.35rem] text-base font-bold",
    leave: [
      "text-sm font-bold text-muted outline-none",
      "data-[hovered=true]:bg-transparent data-[hovered=true]:opacity-80",
    ].join(" "),
  },
});
