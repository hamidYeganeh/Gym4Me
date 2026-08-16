import { tv } from "tailwind-variants";

export const landingTestimonialsSectionStyles = tv({
  slots: {
    root: "mt-3 rounded-(--radius-card-lg) bg-background px-6 py-20 sm:px-10",
    header: "mx-auto mb-12 max-w-2xl text-center",
    title:
      "text-[32px] font-bold leading-tight tracking-tight text-foreground md:text-[42px]",
    hint: "mt-4 text-sm text-muted",
    grid: "mx-auto grid max-w-6xl gap-4 md:grid-cols-3",
    card: "h-full w-full",
  },
});
