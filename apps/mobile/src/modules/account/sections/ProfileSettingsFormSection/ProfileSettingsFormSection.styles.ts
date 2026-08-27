import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const profileSettingsFormSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-7",
    section: "flex flex-col gap-3.5",
    sectionHead: "mb-0.5 flex items-center gap-2",
    sectionHeadStart: "flex min-w-0 flex-1 items-center gap-2",
    sectionIcon: "size-5 text-accent",
    sectionTitle: "text-base font-bold text-foreground",
    sectionAction: "shrink-0 text-accent",
    locationsList: "gap-2",
    locationsEmpty: "items-start py-2 text-start",
    phoneField: "flex w-full flex-col gap-2",
    phoneLabel: "text-sm font-bold text-foreground",
    phoneTrigger: [
      "flex w-full min-h-[var(--auth-field-height)] items-center gap-0",
      "rounded-[var(--auth-field-radius)] border border-border bg-transparent",
      "px-3 text-start shadow-none [direction:ltr] [unicode-bidi:isolate]",
    ].join(" "),
    phoneCountry:
      "flex shrink-0 flex-row items-center gap-1.5 pe-0 text-sm font-semibold text-foreground",
    phoneFlag:
      "flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full text-base leading-none [&_svg]:size-full",
    phoneDivider: "mx-1 h-5 w-px shrink-0 bg-current opacity-20",
    phoneCode: "tracking-wide tabular-nums",
    phoneValue:
      "min-w-0 flex-1 truncate ps-2 text-start text-base tabular-nums text-foreground [unicode-bidi:isolate]",
    phoneHelp: [
      "ms-1 flex size-6 shrink-0 items-center justify-center rounded-full",
      "border border-border text-muted",
    ].join(" "),
    error: "text-sm text-danger",
    notice: "text-sm text-success",
    actions: "flex flex-col gap-3 pt-2",
    submit: "h-14 min-h-14 rounded-2xl",
  },
});

export type ProfileSettingsFormSectionVariants = VariantProps<
  typeof profileSettingsFormSectionVariants
>;
