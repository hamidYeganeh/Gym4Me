export const seoClubDetailGallerySectionStyles = {
  root: "relative w-full",
  hero: "relative h-[52dvh] min-h-80 w-full overflow-hidden bg-surface-secondary sm:h-[60dvh] lg:h-[min(68dvh,760px)] lg:rounded-[2rem]",
  image: "object-cover object-center",
  scrim:
    "pointer-events-none absolute inset-0 bg-linear-to-t from-background/55 via-transparent to-background/15",
  counter:
    "absolute bottom-14 start-4 border-0 bg-foreground/75 text-background shadow-sm backdrop-blur-md lg:bottom-5",
  controls: "absolute bottom-14 end-4 flex gap-2 lg:bottom-5",
  control: "bg-background/80 text-foreground shadow-sm backdrop-blur-md",
  thumbnails:
    "absolute inset-x-0 bottom-3 z-10 hidden justify-center gap-2 px-5 lg:flex",
  thumbnail:
    "relative size-16 overflow-hidden rounded-xl border-2 border-transparent opacity-65 transition data-[active=true]:border-accent data-[active=true]:opacity-100",
  thumbnailImage: "object-cover",
  emptyRoot:
    "flex h-[45dvh] min-h-72 w-full flex-col items-center justify-center gap-3 bg-surface-secondary text-muted lg:rounded-[2rem]",
} as const;
