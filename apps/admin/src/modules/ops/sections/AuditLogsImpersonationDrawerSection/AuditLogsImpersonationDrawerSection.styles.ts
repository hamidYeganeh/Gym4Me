import { tv } from "tailwind-variants";

export const auditLogsImpersonationDrawerSectionVariants = tv({
  slots: {
    form: "flex flex-col gap-4",
    field: "flex flex-col gap-1.5",
    subtitle: "max-w-2xl text-sm leading-7 text-muted sm:text-base",
    token:
      "break-all rounded-xl bg-surface-secondary p-3 font-mono text-xs leading-6",
    actions: "flex flex-wrap gap-2",
  },
});
