import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const athleteThreadScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex min-h-[70vh] flex-col gap-3 pb-8 pt-1",
    messages: "flex flex-1 flex-col gap-2",
    bubbleAthlete:
      "ms-8 flex flex-col gap-1 rounded-2xl rounded-se-md bg-accent px-3 py-2 text-accent-foreground",
    bubbleCoach:
      "me-8 flex flex-col gap-1 rounded-[1.25rem] rounded-ss-md border-0 bg-surface px-3 py-2 text-foreground",
    bubbleMeta: "opacity-70",
    empty: "py-16 text-center text-muted",
    composer: "sticky bottom-0 flex items-end gap-2 bg-background pt-2",
    composerField: "min-w-0 flex-1",
  },
});

export type AthleteThreadScreenVariants = VariantProps<
  typeof athleteThreadScreenVariants
>;
