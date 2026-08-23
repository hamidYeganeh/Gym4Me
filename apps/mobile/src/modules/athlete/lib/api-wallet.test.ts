import type { PaymentRecord } from "@repo/api";
import { mapPaymentsToWalletGroups } from "./api-wallet";

function payment(
  status: PaymentRecord["status"],
  purpose: PaymentRecord["purpose"] = "booking",
): PaymentRecord {
  return {
    _id: `${status}-${purpose}`,
    purpose,
    channel: "zarinpal",
    status,
    amount: { gross: 100_000, discount: 0 },
    reference: { orderId: "order-1" },
    payer: { userId: "507f1f77bcf86cd799439011" },
    createdAt: "2026-08-23T08:00:00.000Z",
    updatedAt: "2026-08-23T08:00:00.000Z",
  };
}

describe("mapPaymentsToWalletGroups", () => {
  it("does not show pending or failed payments as wallet movement", () => {
    expect(
      mapPaymentsToWalletGroups([
        payment("pending", "wallet_topup"),
        payment("failed"),
      ]),
    ).toEqual([]);
  });

  it("shows refunds as credits", () => {
    const refunded = payment("partially_refunded");
    refunded.refundedAmount = 40_000;
    const groups = mapPaymentsToWalletGroups([refunded]);
    expect(groups[0]?.items[0]).toEqual(
      expect.objectContaining({
        direction: "credit",
        kind: "refund",
        amountLabel: expect.stringContaining("۴۰٬۰۰۰"),
      }),
    );
  });
});
