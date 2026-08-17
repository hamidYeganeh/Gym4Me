import { Link } from "@heroui/react";
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
    <p className={className}>
      <Link className={styles.link()} onPress={onPress}>
        <Lock1 size={18} />
        {label}
      </Link>
    </p>
  );
}
