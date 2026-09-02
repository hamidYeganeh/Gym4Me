import { Inject, Injectable } from "@nestjs/common";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import type { ClientSession } from "mongoose";
import { DATABASE_MODELS } from "../../database/database.constants.js";

@Injectable()
export class InvoiceService {
  constructor(@Inject(DATABASE_MODELS) private readonly models: DatabaseModels) {}

  async issue(
    input: {
      sourceType: "booking" | "booking_series" | "membership_contract";
      sourceId: string;
      paymentId?: string;
      userId: string;
      organizationId: string;
      title: string;
      amountMinor: string;
      subtotalMinor?: string;
      taxMinor?: string;
      currency: string;
    },
    session: ClientSession,
  ) {
    const existing = await this.models.Invoice.findOne({
      "source.type": input.sourceType,
      "source.id": objectIdFrom(input.sourceId),
    })
      .session(session)
      .lean();
    if (existing) return existing;
    const number = `G4M-${input.sourceType.toUpperCase().replaceAll("_", "-")}-${input.sourceId.slice(-10).toUpperCase()}`;
    const [invoice] = await this.models.Invoice.create(
      [
        {
          number,
          organizationId: objectIdFrom(input.organizationId),
          source: {
            type: input.sourceType,
            id: objectIdFrom(input.sourceId),
            ...(input.paymentId ? { paymentId: objectIdFrom(input.paymentId) } : {}),
          },
          recipient: { type: "user", userId: objectIdFrom(input.userId) },
          lines: [
            {
              code: input.sourceType,
              title: input.title,
              quantity: 1,
              unitAmountMinor: input.amountMinor,
              totalMinor: input.amountMinor,
              taxMinor: input.taxMinor ?? "0",
            },
          ],
          totals: {
            subtotalMinor: input.subtotalMinor ?? input.amountMinor,
            discountMinor: "0",
            taxMinor: input.taxMinor ?? "0",
            totalMinor: input.amountMinor,
            currency: input.currency,
          },
          issuedAt: new Date(),
          status: "issued",
          createdBy: objectIdFrom(input.userId),
        },
      ],
      { session },
    );
    return invoice!.toObject();
  }
}
