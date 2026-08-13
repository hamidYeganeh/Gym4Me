import { Typography } from "@heroui/react";
import { adminFormPageVariants } from "./AdminFormPage.styles";
import type { AdminFormPageProps } from "./AdminFormPage.types";

export function AdminFormPage({
  title,
  description,
  children,
  className,
}: AdminFormPageProps) {
  const styles = adminFormPageVariants();

  return (
    <div className={styles.root({ className })}>
      <header className={styles.header()}>
        <Typography className={styles.title()} type="h1" weight="bold">
          {title}
        </Typography>
        {description ? (
          <Typography className={styles.description()}>{description}</Typography>
        ) : null}
      </header>
      <div className={styles.body()}>{children}</div>
    </div>
  );
}
