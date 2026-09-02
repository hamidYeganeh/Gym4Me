import { Inject, Injectable } from "@nestjs/common";
import { createHash } from "node:crypto";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { ApiError } from "../../common/api-error.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";

@Injectable()
export class IdempotencyService {
  constructor(@Inject(DATABASE_MODELS) private readonly models: DatabaseModels) {}
  key(raw: string | string[] | undefined) {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (!value || value.length < 8 || value.length > 200)
      throw new ApiError("IDEMPOTENCY_KEY_REQUIRED", "هدر Idempotency-Key معتبر الزامی است.", 400);
    return value;
  }
  async execute<T>(
    userId: string,
    operation: string,
    key: string,
    input: unknown,
    handler: () => Promise<T>,
  ): Promise<T> {
    const requestHash = createHash("sha256").update(JSON.stringify(input)).digest("hex");
    const selector = { userId: objectIdFrom(userId), operation, key };
    const existing = (await this.models.IdempotencyRecord.findOne(selector).lean()) as any;
    if (existing) {
      if (existing.requestHash !== requestHash)
        throw new ApiError(
          "IDEMPOTENCY_KEY_REUSED",
          "این Idempotency-Key برای درخواست دیگری استفاده شده است.",
          409,
        );
      if (existing.status === "completed") return existing.response as T;
      if (existing.status === "processing")
        throw new ApiError("REQUEST_IN_PROGRESS", "درخواست مشابه در حال پردازش است.", 409);
      await this.models.IdempotencyRecord.deleteOne({ _id: existing._id });
    }
    try {
      await this.models.IdempotencyRecord.create({
        ...selector,
        requestHash,
        expiresAt: new Date(Date.now() + 86_400_000),
        status: "processing",
      });
    } catch {
      const record = (await this.models.IdempotencyRecord.findOne(selector).lean()) as any;
      if (record?.status === "completed") return record.response as T;
      throw new ApiError("REQUEST_IN_PROGRESS", "درخواست مشابه در حال پردازش است.", 409);
    }
    try {
      const result = await handler();
      const response = JSON.parse(JSON.stringify(result)) as T;
      await this.models.IdempotencyRecord.updateOne(selector, {
        $set: { status: "completed", response },
      });
      return response;
    } catch (error) {
      await this.models.IdempotencyRecord.updateOne(selector, {
        $set: {
          status: "failed",
          error: { message: error instanceof Error ? error.message : "unknown" },
        },
      });
      throw error;
    }
  }
}
