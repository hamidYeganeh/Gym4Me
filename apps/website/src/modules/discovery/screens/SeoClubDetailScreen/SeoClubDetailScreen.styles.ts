export const seoClubDetailScreenStyles = {
  root: "min-h-dvh bg-background text-foreground lg:px-6 lg:pt-6",
  galleryWrap: "mx-auto w-full max-w-[1440px]",
  sheet:
    "relative z-10 -mt-10 rounded-t-[2.5rem] bg-surface px-4 pb-28 pt-6 shadow-[0_-18px_50px_rgba(0,0,0,.16)] sm:px-6 lg:mx-auto lg:-mt-16 lg:max-w-[1320px] lg:rounded-[2.5rem] lg:px-10 lg:pb-16 lg:pt-8",
  heroHeader: "border-b border-border/70 pb-6",
  heroCopy: "min-w-0",
  titleRow: "flex flex-wrap items-center gap-3",
  title:
    "text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl",
  verifiedChip: "border-0 bg-success/15 text-success",
  location:
    "mt-3 flex items-start gap-2 text-sm leading-7 text-muted sm:text-base",
  heroMeta: "mt-4 flex flex-wrap items-center gap-3 text-sm text-muted",
  rating:
    "inline-flex items-center gap-1.5 rounded-full bg-warning/12 px-3 py-1.5 text-warning [&_span]:text-muted",
  layout: "mt-2 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_21rem]",
  content: "min-w-0 divide-y divide-border/70",
  section: "py-7 sm:py-8",
  sectionTitleRow: "mb-4 flex items-center gap-3",
  sectionIcon:
    "flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent",
  sectionTitle: "text-xl font-bold tracking-tight sm:text-2xl",
  body: "max-w-3xl whitespace-pre-line text-sm leading-8 text-foreground/85 sm:text-base",
  featureGrid: "grid gap-2 sm:grid-cols-2",
  featureCard:
    "flex items-start gap-3 rounded-2xl bg-surface-secondary/60 p-4 text-success [&_div]:text-foreground [&_p]:mt-1 [&_p]:text-sm [&_p]:leading-6 [&_p]:text-muted",
  chips: "flex flex-wrap gap-2",
  horizontalCards:
    "flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  sportCard:
    "flex min-w-40 snap-start flex-col gap-3 rounded-2xl border border-border/70 bg-surface-secondary/45 p-4 text-accent [&_strong]:text-foreground [&_p]:text-sm [&_p]:leading-6 [&_p]:text-muted",
  equipmentList: "grid gap-2 sm:grid-cols-2",
  equipmentItem:
    "flex items-center gap-3 rounded-2xl border border-border/70 p-3.5 [&_div]:min-w-0 [&_div]:flex-1 [&_p]:mt-1 [&_p]:text-sm [&_p]:text-muted",
  equipmentIcon:
    "flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent",
  quantity:
    "shrink-0 rounded-full bg-surface-secondary px-2.5 py-1 text-xs font-semibold text-muted",
  hoursList: "overflow-hidden rounded-2xl border border-border/70",
  hourRow:
    "flex items-center justify-between gap-4 border-b border-border/60 px-4 py-3 text-sm last:border-b-0 [&_dt]:font-semibold [&_dd]:tabular-nums [&_dd]:text-muted",
  contactList: "grid gap-2 sm:grid-cols-2",
  contactItem:
    "flex items-center justify-between gap-3 rounded-2xl bg-surface-secondary/60 px-4 py-3 text-sm [&_span]:text-muted",
  planGrid: "grid gap-3 sm:grid-cols-2",
  planCard:
    "flex flex-col justify-between gap-5 rounded-2xl border border-border/70 p-5 data-[featured=true]:border-accent data-[featured=true]:bg-accent/6 [&_p]:mt-1 [&_p]:text-sm [&_p]:leading-6 [&_p]:text-muted",
  planPrice:
    "flex items-end gap-1.5 [&_strong]:text-xl [&_span]:text-xs [&_span]:text-muted",
  rules:
    "space-y-2 [&_li]:rounded-2xl [&_li]:bg-surface-secondary/60 [&_li]:p-4 [&_p]:mt-1 [&_p]:text-sm [&_p]:leading-6 [&_p]:text-muted",
  reviewList: "grid gap-3 sm:grid-cols-2",
  reviewCard:
    "rounded-2xl bg-surface-secondary/60 p-4 [&>p]:mt-3 [&>p]:text-sm [&>p]:leading-7 [&>p]:text-muted [&>time]:mt-3 [&>time]:block [&>time]:text-xs [&>time]:text-muted",
  reviewHeader:
    "flex items-center justify-between gap-3 text-sm [&_span]:text-warning",
  locationCard:
    "flex items-start gap-3 rounded-2xl bg-surface-secondary/60 p-4 text-accent [&_div]:text-foreground [&_p]:mt-1 [&_p]:text-sm [&_p]:leading-6 [&_p]:text-muted",
  aside: "hidden lg:block",
  bookingCard:
    "sticky top-28 flex flex-col gap-4 rounded-[1.75rem] border border-border/70 bg-background p-5 shadow-sm",
  bookingEyebrow: "text-sm font-semibold text-accent",
  bookingTitle: "text-xl font-bold leading-8",
  bookingPrice:
    "flex flex-wrap items-end gap-2 [&_span]:text-sm [&_span]:text-muted [&_strong]:text-3xl",
  bookingHint: "text-sm leading-7 text-muted",
  primaryCta:
    "flex min-h-12 items-center justify-center rounded-full bg-accent px-5 font-bold text-accent-foreground",
  secondaryCta:
    "flex min-h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-semibold",
  mobileCta:
    "fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-border/70 bg-surface/95 px-4 pb-[max(.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_35px_rgba(0,0,0,.18)] backdrop-blur-xl lg:hidden [&>div]:flex [&>div]:flex-col [&_span]:text-xs [&_span]:text-muted [&_strong]:text-sm",
  mobileCtaButton:
    "flex min-h-12 min-w-40 items-center justify-center rounded-full bg-accent px-5 font-bold text-accent-foreground",
} as const;
