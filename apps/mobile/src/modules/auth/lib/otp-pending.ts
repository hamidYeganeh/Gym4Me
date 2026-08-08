export type OtpPendingState = {
  phone: string;
  expiresInSeconds: number;
  debugCode?: string;
};

const OTP_PENDING_KEY = "gym4me.otp.pending";

export function saveOtpPending(state: OtpPendingState) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(OTP_PENDING_KEY, JSON.stringify(state));
}

export function readOtpPending(): OtpPendingState | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(OTP_PENDING_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OtpPendingState;
  } catch {
    return null;
  }
}

export function clearOtpPending() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(OTP_PENDING_KEY);
}
