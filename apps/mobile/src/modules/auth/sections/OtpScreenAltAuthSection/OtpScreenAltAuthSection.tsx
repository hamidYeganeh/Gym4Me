import { Button } from "@heroui/react";
import { Lock1 } from "@repo/icons/Lock1";
import { otpScreenAltAuthSectionVariants } from "./OtpScreenAltAuthSection.styles";
import type { OtpScreenAltAuthSectionProps } from "./OtpScreenAltAuthSection.types";

export function OtpScreenAltAuthSection({
  dividerLabel,
  buttonLabel,
  onPress,
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
        <Lock1 aria-hidden className={styles.icon()} size={20} />
        {buttonLabel}
      </Button>
    </div>
  );
}
