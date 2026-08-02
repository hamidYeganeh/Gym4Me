import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const ibanCardVariants = tv({
  slots: {
    root: [
      "relative h-[190px] w-[320px] max-w-full gap-0 overflow-hidden rounded-[24px] p-6",
      "bg-accent text-accent-foreground",
    ].join(" "),
    pattern: [
      "pointer-events-none absolute inset-[-24%_-34%_-16%_-34%]",
      "size-auto max-w-none text-accent-foreground",
    ].join(" "),
    body: "relative z-10 flex h-full w-full flex-col items-stretch justify-between",
    header: "flex w-full items-start justify-between",
    logo: "flex size-8 shrink-0 items-center justify-center text-accent-foreground",
    contactless: [
      "flex size-8 shrink-0 items-center justify-center text-accent-foreground",
      "[&_svg]:rotate-90",
    ].join(" "),
    footer: "flex w-full items-end gap-6",
    meta: "flex min-w-0 flex-1 flex-col gap-2 uppercase",
    metaRow: "flex w-full items-start gap-4",
    holderName: [
      "min-w-0 flex-1 text-xs font-extrabold leading-4 tracking-[0.1em]",
      "break-words text-accent-foreground",
    ].join(" "),
    expiry: [
      "shrink-0 whitespace-nowrap text-xs font-extrabold leading-4 tracking-[0.1em]",
      "text-accent-foreground",
    ].join(" "),
    number: [
      "whitespace-pre text-base font-extrabold leading-[22px] tracking-[0.1em]",
      "text-accent-foreground",
    ].join(" "),
    network: [
      "relative flex h-[34px] w-12 shrink-0 items-center justify-center",
      "rounded-lg border-0 bg-white",
    ].join(" "),
    networkLogo: "h-[19px] w-[32px]",
  },
});

export type IbanCardVariantProps = VariantProps<typeof ibanCardVariants>;
