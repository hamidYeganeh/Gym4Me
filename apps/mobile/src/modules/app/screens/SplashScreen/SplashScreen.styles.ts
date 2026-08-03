export const splashScreenStyles = {
  root: "relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-screen",
  glow: "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,color-mix(in_oklab,var(--accent)_22%,transparent),transparent_60%)]",
  content: "relative z-10 flex flex-col items-center gap-6 text-center",
  brand:
    "text-5xl font-semibold tracking-tight text-foreground sm:text-6xl",
  tagline:
    "min-h-[1.5em] text-lg font-medium tracking-normal text-muted sm:text-xl",
} as const;
