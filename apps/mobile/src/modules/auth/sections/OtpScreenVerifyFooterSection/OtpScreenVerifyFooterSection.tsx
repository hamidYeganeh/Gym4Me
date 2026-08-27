import { Button } from "@heroui/react/button";
import { Lock1 } from "@repo/icons/Lock1";
import { otpScreenVerifyFooterSectionVariants } from "./OtpScreenVerifyFooterSection.styles";
import type { OtpScreenVerifyFooterSectionProps } from "./OtpScreenVerifyFooterSection.types";

export function OtpScreenVerifyFooterSection({
  label,
  onPress,
  className,
}: OtpScreenVerifyFooterSectionProps) {
  const styles = otpScreenVerifyFooterSectionVariants();

  return (
    <div className={styles.root({ className })}>
      <Button
        className={styles.button()}
        onPress={onPress}
        size="lg"
        type="button"
        variant="ghost"
      >
        <Lock1 aria-hidden size={18} />
        {label}
      </Button>
    </div>
  );
}
