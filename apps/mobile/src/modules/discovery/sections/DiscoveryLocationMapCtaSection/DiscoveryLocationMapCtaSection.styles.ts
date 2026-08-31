import { tv } from "tailwind-variants";

export const discoveryHomeMapCtaSectionVariants = tv({
  slots: {
    root: "px-screen",
    pressable: [
      "relative flex w-full flex-col gap-4 overflow-hidden rounded-[1.35rem]",
      "border border-border/70 bg-surface p-4 text-start shadow-sm",
      "transition-transform duration-fast ease-app",
      "data-[pressed=true]:scale-[0.985]",
    ].join(" "),
    copy: "flex flex-col items-center gap-1 text-center",
    title: "text-balance text-[1.125rem] leading-snug tracking-tight text-foreground",
    subtitle: "text-pretty text-sm leading-relaxed text-muted",
    mapFrame: [
      "relative isolate aspect-[5/3] w-full overflow-hidden rounded-[1rem]",
      "bg-surface-secondary",
    ].join(" "),
    mapImage: "pointer-events-none object-cover object-center",
    ctaPill: [
      "pointer-events-none absolute bottom-3 start-1/2 z-10",
      "-translate-x-1/2",
      "inline-flex items-center gap-1.5 rounded-full",
      "bg-foreground px-4 py-2.5 text-sm font-semibold text-background",
    ].join(" "),
    ctaIcon: "opacity-90",
  },
});
