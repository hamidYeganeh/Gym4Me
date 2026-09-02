import { Inject, Injectable } from "@nestjs/common";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";

@Injectable()
export class TaxCalculationService {
  constructor(@Inject(DATABASE_MODELS) private readonly models: DatabaseModels) {}

  async calculate(input: {
    organizationId: string;
    branchId: string;
    offeringId: string;
    grossMinor: string;
    currency: string;
    offeringTaxIncluded: boolean;
  }) {
    const now = new Date();
    const rules = (await this.models.TaxRule.find({
      organizationId: objectIdFrom(input.organizationId),
      status: "active",
      $and: [
        {
          $or: [
            { "validity.startsAt": { $exists: false } },
            { "validity.startsAt": null },
            { "validity.startsAt": { $lte: now } },
          ],
        },
        {
          $or: [
            { "validity.endsAt": { $exists: false } },
            { "validity.endsAt": null },
            { "validity.endsAt": { $gt: now } },
          ],
        },
      ],
      $or: [
        { "scope.type": "offering", "scope.id": objectIdFrom(input.offeringId) },
        { "scope.type": "branch", "scope.id": objectIdFrom(input.branchId) },
        { "scope.type": "organization", "scope.id": objectIdFrom(input.organizationId) },
      ],
    }).lean()) as any[];
    const rank: Record<string, number> = { offering: 3, branch: 2, organization: 1 };
    const rule = rules.sort(
      (left, right) =>
        (rank[right.scope?.type] ?? 0) - (rank[left.scope?.type] ?? 0) ||
        Number(right.priority ?? 0) - Number(left.priority ?? 0),
    )[0];
    const gross = BigInt(input.grossMinor);
    if (!rule || gross === 0n)
      return {
        subtotalMinor: gross.toString(),
        taxMinor: "0",
        totalMinor: gross.toString(),
        taxIncluded: input.offeringTaxIncluded,
      };
    const mode = rule.calculation?.priceMode ?? "inherit";
    const included = mode === "inclusive" || (mode === "inherit" && input.offeringTaxIncluded);
    const tax =
      rule.calculation?.type === "fixed"
        ? BigInt(rule.calculation?.amountMinor ?? "0")
        : included
          ? (gross * BigInt(rule.calculation?.percentageBps ?? 0)) /
            (10000n + BigInt(rule.calculation?.percentageBps ?? 0))
          : (gross * BigInt(rule.calculation?.percentageBps ?? 0)) / 10000n;
    return {
      subtotalMinor: (included ? (tax > gross ? 0n : gross - tax) : gross).toString(),
      taxMinor: tax.toString(),
      totalMinor: (included ? gross : gross + tax).toString(),
      taxIncluded: included,
      taxRule: {
        id: rule._id,
        name: rule.profile?.name,
        calculation: rule.calculation,
      },
    };
  }
}
