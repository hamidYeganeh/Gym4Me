import { Capacitor } from "@capacitor/core";
import {
  getPaymentCallbackUrl,
  isPaymentReturnPath,
  parseNativePaymentReturn,
} from "./payment-return";

jest.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: jest.fn() },
}));

describe("native payment return", () => {
  it("uses the public API broker instead of a Capacitor WebView origin", () => {
    jest.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
    const callback = new URL(getPaymentCallbackUrl("/athlete/wallet"));
    expect(callback.pathname).toBe("/api/v1/payment-returns/native");
    expect(callback.searchParams.get("returnPath")).toBe("/athlete/wallet");
  });

  it("maps the broker deep link back to an owner checkout route", () => {
    expect(
      parseNativePaymentReturn(
        "com.gym4me.app://payment-return?returnPath=%2Fowner%2Fsubscription&platformCheckoutId=64b64b64b64b64b64b64b64b&Authority=authority-1&Status=OK",
      ),
    ).toBe(
      "/owner/subscription?platformCheckoutId=64b64b64b64b64b64b64b64b&Authority=authority-1&Status=OK",
    );
  });

  it("rejects foreign schemes and non-payment app routes", () => {
    expect(
      parseNativePaymentReturn(
        "https://evil.test/?returnPath=%2Fowner%2Fsubscription",
      ),
    ).toBeNull();
    expect(isPaymentReturnPath("/admin/users")).toBe(false);
  });
});
