/** OTP slot tokens — mirrors CSS vars in `heroui.css` (375×812 auth frame). */
export const otp = {
  lg: {
    width: 88,
    height: 104,
    radius: 32,
    font: 40,
    gap: 12,
  },
  md: {
    width: 48,
    height: 56,
    radius: 18,
    font: 22,
    gap: 8,
  },
} as const;

export type OtpSizeToken = keyof typeof otp;
export type OtpTokens = typeof otp;
