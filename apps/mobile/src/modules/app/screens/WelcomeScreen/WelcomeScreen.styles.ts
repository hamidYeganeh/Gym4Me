import { tv } from "tailwind-variants";

export const welcomeScreenVariants = tv({
  slots: {
    root: "relative flex min-h-dvh flex-col overflow-hidden bg-background text-foreground",
    media: "pointer-events-none absolute inset-0",
    mediaImage: "h-full w-full object-cover",
    mediaOverlay:
      "absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40",
    content:
      "relative z-10 flex min-h-dvh flex-col justify-end gap-8 px-screen pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]",
    brand: "flex flex-col items-start gap-3",
    brandRow: "flex items-center gap-3",
    brandName: "text-3xl font-bold tracking-tight text-foreground sm:text-4xl",
    title: "max-w-[18ch] text-balance",
    subtitle: "max-w-[34ch] text-pretty text-muted",
    features: "flex flex-col gap-3",
    feature:
      "flex items-start gap-3 rounded-2xl border border-border/60 bg-surface/70 p-3 backdrop-blur-sm",
    featureIcon:
      "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent",
    featureCopy: "flex min-w-0 flex-col gap-0.5",
    featureTitle: "text-foreground",
    featureBody: "text-muted",
    actions: "flex flex-col gap-3",
    primary: "w-full",
    secondary: "w-full",
  },
});
