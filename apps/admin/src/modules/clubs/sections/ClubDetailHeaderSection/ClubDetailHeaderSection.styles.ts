import { tv } from 'tailwind-variants';

export const clubDetailHeaderSectionVariants = tv({
  slots: {
    header: 'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
    title: 'text-2xl font-bold tracking-tight text-foreground sm:text-3xl',
    subtitle: 'mt-1 text-sm text-muted',
    actions: 'flex flex-wrap items-center gap-2',
  },
});
