import { Typography } from "@heroui/react/typography";
import { rolePlaceholderScreenVariants } from "./RolePlaceholderScreen.styles";
import type { RolePlaceholderScreenProps } from "./RolePlaceholderScreen.types";

export function RolePlaceholderScreen({
  title,
  description,
  className,
}: RolePlaceholderScreenProps) {
  const styles = rolePlaceholderScreenVariants();

  return (
    <main className={styles.root({ className })}>
      <Typography className={styles.title()} type="h1" weight="bold">
        {title}
      </Typography>
      <Typography className={styles.body()} type="body">
        {description}
      </Typography>
    </main>
  );
}
