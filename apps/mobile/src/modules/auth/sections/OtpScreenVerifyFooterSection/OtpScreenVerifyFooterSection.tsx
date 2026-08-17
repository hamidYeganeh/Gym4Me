import { Link, Typography } from "@heroui/react";
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
    <Typography className={className} type="body-sm">
      <Link className={styles.link()} onPress={onPress}>
        <Lock1 size={18} />
        {label}
      </Link>
    </Typography>
  );
}
