import { createAnalyticsApi, type TouchPoint } from "@repo/api/analytics";
import { apiClient } from "@/shared/lib/api-client";

const analyticsApi = createAnalyticsApi(apiClient);

const ATTRIBUTION_SENT_KEY = "gym4me.attribution.sent";

function readPendingTouch(): TouchPoint | null {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const touch: TouchPoint = {
    source: params.get("utm_source") ?? undefined,
    medium: params.get("utm_medium") ?? undefined,
    campaign: params.get("utm_campaign") ?? undefined,
    content: params.get("utm_content") ?? undefined,
    term: params.get("utm_term") ?? undefined,
    referralCode: params.get("ref") ?? params.get("referral") ?? undefined,
    landingPage: `${window.location.pathname}${window.location.search}`,
    referrer: document.referrer || undefined,
    deepLink: window.location.href,
    capturedAt: new Date().toISOString(),
  };

  const hasSignal = Boolean(
    touch.source ||
      touch.medium ||
      touch.campaign ||
      touch.referralCode ||
      touch.referrer,
  );

  return hasSignal ? touch : {
    source: "direct",
    landingPage: touch.landingPage,
    deepLink: touch.deepLink,
    capturedAt: touch.capturedAt,
  };
}

/** Capture first/last touch once per browser after auth. */
export async function captureSessionAttribution() {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem(ATTRIBUTION_SENT_KEY) === "1") return;

  const touch = readPendingTouch();
  if (!touch) return;

  try {
    await analyticsApi.captureAttribution({ touch });
    sessionStorage.setItem(ATTRIBUTION_SENT_KEY, "1");
  } catch {
    // Non-blocking — attribution must not break auth.
  }
}
