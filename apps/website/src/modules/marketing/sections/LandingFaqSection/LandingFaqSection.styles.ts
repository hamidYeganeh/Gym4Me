import { tv } from "tailwind-variants";

export const landingFaqSectionStyles = tv({
  slots: {
    root: "flex justify-center bg-background px-5 py-[120px]",
    inner: "flex w-full max-w-[800px] flex-col items-center",
    label:
      "mb-5 text-center text-[26px] font-normal leading-none text-muted",
    title: [
      "mb-[60px] w-full text-center text-[32px] font-semibold leading-[38px]",
      "tracking-tight text-foreground md:text-[44px] md:leading-[48px]",
    ].join(" "),
    list: "flex w-full flex-col gap-5",
    item: [
      "overflow-hidden rounded-[1.25rem] border border-transparent",
      "bg-surface-secondary transition-all duration-moderate ease-app",
      "has-[[aria-expanded=true]]:border-border",
      "has-[[aria-expanded=true]]:bg-surface",
      "has-[[aria-expanded=true]]:shadow-sm",
      "has-[[aria-expanded=true]]:shadow-foreground/5",
    ].join(" "),
    trigger: [
      "group flex h-auto min-h-[88px] w-full cursor-pointer items-center",
      "justify-between gap-3 px-[26px] py-5 text-start select-none",
      "hover:bg-transparent data-[hovered=true]:bg-transparent",
      "md:h-[88px] md:py-0",
    ].join(" "),
    heading: "flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1",
    question:
      "text-[20px] font-medium leading-[30px] tracking-tight text-foreground",
    number: "text-[14px] font-normal tracking-tight text-muted",
    plus: [
      "size-6 shrink-0 text-foreground transition-transform duration-moderate ease-app",
      "group-aria-expanded:rotate-45",
    ].join(" "),
    body: [
      "text-base leading-[1.6] text-muted",
      "[&_.accordion__body-inner]:px-[26px]",
      "[&_.accordion__body-inner]:pt-5",
      "[&_.accordion__body-inner]:pb-[26px]",
    ].join(" "),
  },
});
