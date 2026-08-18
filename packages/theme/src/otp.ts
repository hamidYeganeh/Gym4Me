/** OTP slot tokens — mirrors CSS vars in `tokens.css` (375×812 auth frame). */
export const otp = {
  lg: {
    width: 88,
    height: 104,
    radius: 32,
    font: 40,
    gap: 12,
  },
  /** Auth slots use `flex-1` + `aspect-square`; only radius / font / gap are fixed. */
  md: {
    radius: 16,
    font: 24,
    gap: 10,
  },
} as const;

export type OtpSizeToken = keyof typeof otp;
export type OtpTokens = typeof otp;
