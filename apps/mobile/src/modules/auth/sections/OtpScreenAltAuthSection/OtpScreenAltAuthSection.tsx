import { Button } from "@heroui/react/button";
import { Lock1 } from "@repo/icons/Lock1";
import { otpScreenAltAuthSectionVariants } from "./OtpScreenAltAuthSection.styles";
import type { OtpScreenAltAuthSectionProps } from "./OtpScreenAltAuthSection.types";

export function OtpScreenAltAuthSection({
  dividerLabel,
  buttonLabel,
  onPress,
  icon,
  className,
}: OtpScreenAltAuthSectionProps) {
  const styles = otpScreenAltAuthSectionVariants();

  return (
    <div className={styles.root({ className })}>
      <div className={styles.divider()}>
        <span className={styles.dividerLine()} />
        <span className={styles.dividerLabel()}>{dividerLabel}</span>
        <span className={styles.dividerLine()} />
      </div>
      <Button
        className={styles.button()}
        fullWidth
        onPress={onPress}
        size="lg"
        type="button"
        variant="secondary"
      >
        <span aria-hidden className={styles.icon()}>
          {icon ?? <Lock1 size={20} />}
        </span>
        {buttonLabel}
      </Button>
    </div>
  );
}
