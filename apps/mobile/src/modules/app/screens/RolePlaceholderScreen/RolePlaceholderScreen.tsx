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
      <h1 className={styles.title()}>{title}</h1>
      <p className={styles.body()}>{description}</p>
    </main>
  );
}
