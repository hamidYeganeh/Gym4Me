import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { unitsMetricCardVariants } from "./UnitsMetricCard.styles";
import type { UnitsMetricCardProps } from "./UnitsMetricCard.types";

export function UnitsMetricCard({
  label,
  value,
  icon,
  isDisabled = false,
  onPress,
  className,
}: UnitsMetricCardProps) {
  const styles = unitsMetricCardVariants({ isDisabled });

  return (
    <Button
      aria-disabled={isDisabled || undefined}
      className={styles.trigger({ className })}
      isDisabled={isDisabled}
      onPress={onPress}
      type="button"
      variant="ghost"
     size="lg">
      <span aria-hidden className={styles.icon()}>
        {icon}
      </span>
      <Typography className={styles.label()} type="body" weight="bold">
        {label}
      </Typography>
      <Typography className={styles.value()} type="body-sm">
        {value ?? "—"}
      </Typography>
    </Button>
  );
}
