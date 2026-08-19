import { tv } from "tailwind-variants";

export const onboardingIdentitySectionVariants = tv({
  slots: {
    root: "flex w-full max-w-lg flex-col gap-7 pb-2",
    title:
      "text-balance text-center text-[1.45rem] font-bold leading-tight text-foreground",
    avatarWrap: "relative mx-auto size-24",
    avatar:
      "flex size-24 items-center justify-center rounded-full border-2 border-accent/40 bg-accent/10 text-accent",
    avatarEdit:
      "absolute end-0 bottom-0 flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground",
    section: "flex flex-col gap-3.5",
    sectionHead: "mb-0.5 flex items-center gap-2",
    sectionIcon: "size-5 text-accent",
    sectionTitle: "text-base font-bold text-foreground",
    field: "w-full",
    input:
      "min-h-12 rounded-2xl border-0 bg-default px-4 text-sm text-foreground shadow-none",
    row: "grid grid-cols-2 gap-3",
    trigger:
      "flex min-h-12 w-full items-center justify-between gap-2 rounded-2xl border-0 bg-default px-4 text-start text-sm text-foreground outline-none data-[hovered=true]:bg-default/80",
    triggerIcon: "size-5 shrink-0 text-muted",
    triggerValue: "min-w-0 flex-1 truncate text-foreground",
    chips: "flex flex-wrap items-center gap-2",
    chip: "rounded-full bg-default px-3 py-1.5 text-xs font-medium text-foreground",
    editLink:
      "ms-auto text-sm font-semibold text-accent outline-none data-[hovered=true]:opacity-80",
    fieldLabel: "mb-2 text-sm font-semibold text-foreground",
    sliderBlock:
      "flex flex-col gap-2 overflow-hidden rounded-2xl border border-accent/25 bg-accent/[0.04] px-3 py-3",
    security:
      "flex items-start gap-2 text-center text-xs leading-5 text-muted",
    securityIcon: "mt-0.5 size-4 shrink-0 text-accent",
    drawerBody: "flex flex-col gap-4 overflow-hidden pb-2",
    wheel:
      "mx-auto flex max-h-64 w-full max-w-xs flex-col gap-1 overflow-y-auto overscroll-contain py-2 [-webkit-overflow-scrolling:touch]",
    wheelItem:
      "w-full rounded-2xl px-4 py-3 text-center text-base font-medium text-muted outline-none transition-colors data-[selected=true]:bg-accent/10 data-[selected=true]:font-semibold data-[selected=true]:text-accent data-[selected=true]:ring-1 data-[selected=true]:ring-accent",
    mapShell: "relative h-72 w-full overflow-hidden rounded-2xl",
    selectBtn:
      "min-h-12 w-full rounded-[1.2rem] text-base font-bold text-accent-foreground",
    selectIcon: "ms-2 size-5",
  },
});
