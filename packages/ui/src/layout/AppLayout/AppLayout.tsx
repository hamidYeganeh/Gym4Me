import { appLayoutVariants } from "./AppLayout.styles";
import type { AppLayoutProps } from "./AppLayout.types";

export function AppLayout({
  header,
  footer,
  children,
  className,
  headerClassName,
}: AppLayoutProps) {
  const hasHeader = Boolean(header);
  const hasFooter = Boolean(footer);
  const slots = appLayoutVariants({ hasHeader, hasFooter });

  return (
    <div className={slots.root({ className })}>
      {header ? (
        <div className={slots.header({ className: headerClassName })}>
          {header}
        </div>
      ) : null}
      <main className={slots.main()}>{children}</main>
      {footer ? <div className={slots.footer()}>{footer}</div> : null}
    </div>
  );
}
