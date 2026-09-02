import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { IdempotencyService } from "./idempotency.service.js";
import { LedgerService } from "./ledger.service.js";

@Injectable()
export class WalletService {
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    private readonly ledger: LedgerService,
    private readonly idempotency: IdempotencyService,
  ) {}
  async summary(userId: string, currency = "IRR") {
    const { wallet, account } = await this.ledger.wallet(userId, currency);
    const balance = await this.ledger.balance(String(account._id));
    const recent = await this.models.LedgerTransaction.find({
      "entries.accountId": account._id,
      status: "posted",
    })
      .sort({ postedAt: -1 })
      .limit(20)
      .lean();
    return {
      wallet,
      balance: { amountMinor: balance.toString(), currency },
      recentTransactions: recent,
    };
  }
  async createTopUp(
    userId: string,
    input: { amount_minor: string; currency: string },
    key: string,
  ) {
    return this.idempotency.execute(userId, "wallet.top_up.create", key, input, async () => {
      const wallet = await this.ledger.wallet(userId, input.currency);
      const payment = await this.models.Payment.create({
        payerUserId: objectIdFrom(userId),
        payable: { type: "wallet", id: wallet.wallet._id },
        amount: { amountMinor: input.amount_minor, currency: input.currency },
        method: "sandbox_gateway",
        provider: { code: "sandbox", authority: randomUUID(), mode: "manual_confirm" },
        attempts: [{ createdAt: new Date(), status: "created" }],
        idempotencyKey: key,
        expiresAt: new Date(Date.now() + 15 * 60_000),
        status: "pending",
        createdBy: objectIdFrom(userId),
      });
      return payment;
    });
  }
  async payments(userId: string) {
    return this.models.Payment.find({ payerUserId: objectIdFrom(userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  }
  async invoices(userId: string) {
    return this.models.Invoice.find({ "recipient.userId": objectIdFrom(userId) })
      .sort({ issuedAt: -1 })
      .limit(100)
      .lean();
  }
  async refunds(userId: string) {
    const paymentIds = await this.models.Payment.distinct("_id", {
      payerUserId: objectIdFrom(userId),
    });
    return this.models.Refund.find({ paymentId: { $in: paymentIds } })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
  }
}
