import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'node:crypto';
import { MockPaymentOutcomeRule, MockPaymentStatus } from '../enums';
import {
  MockPayment,
  MockPaymentDocument,
} from '../../schemas/mock-payment.schema';
import {
  CreatePaymentRequest,
  CreatePaymentResult,
  PaymentGatewayService,
  ReversePaymentRequest,
  ReversePaymentResult,
  VerifyPaymentRequest,
  VerifyPaymentResult,
} from './payment-gateway.service';

export type MockCheckoutOutcome = 'paid' | 'cancelled';

/**
 * Mock gateway that mirrors the full Zarinpal lifecycle so callers can
 * exercise every state without a real PSP:
 *
 * - `createPayment` → redirect to the local `/payments/mock/checkout` page
 *   where the tester picks "pay" or "cancel" (like StartPay).
 * - Callback carries `Status=OK|NOK` exactly like Zarinpal.
 * - `verifyPayment` reproduces real verify codes:
 *   - success → `ok: true` (repeat verifies keep succeeding = code 101 semantics)
 *   - cancelled / unknown authority → `code: -51`
 *   - amount mismatch → `code: -50`
 *
 * Deterministic rules for automated tests (amount last digit):
 * - `…1` → checkout auto-cancels (no interaction needed)
 * - `…2` → checkout succeeds but verify always fails (`code: -53`)
 */
@Injectable()
export class MockPaymentGatewayService extends PaymentGatewayService {
  private readonly logger = new Logger('MockPayment');
  private readonly baseUrl: string;

  constructor(
    config: ConfigService,
    @InjectModel(MockPayment.name)
    private readonly mockPaymentModel: Model<MockPaymentDocument>,
  ) {
    super();
    this.baseUrl = (
      config.get<string>('API_BASE_URL') ?? 'http://localhost:8088'
    ).replace(/\/$/, '');
  }

  private outcomeRuleFor(amount: number): MockPaymentOutcomeRule {
    const lastDigit = Math.abs(amount) % 10;
    if (lastDigit === 1) return MockPaymentOutcomeRule.AUTO_CANCEL;
    if (lastDigit === 2) return MockPaymentOutcomeRule.VERIFY_FAIL;
    return MockPaymentOutcomeRule.INTERACTIVE;
  }

  async createPayment(
    request: CreatePaymentRequest,
  ): Promise<CreatePaymentResult> {
    const authority = `MOCK-${randomUUID()}`;
    const outcomeRule = this.outcomeRuleFor(request.amount);

    await this.mockPaymentModel.create({
      authority,
      orderId: request.orderId,
      amount: request.amount,
      description: request.description,
      callbackUrl: request.callbackUrl,
      status: MockPaymentStatus.CREATED,
      outcomeRule,
    });

    this.logger.log(
      `[CREATE] amount=${request.amount} order=${request.orderId} authority=${authority} rule=${outcomeRule}`,
    );

    return {
      authority,
      // Matches the global `api` prefix + URI versioning in main.ts.
      redirectUrl: `${this.baseUrl}/api/v1/payments/mock/checkout?authority=${encodeURIComponent(authority)}`,
    };
  }

  async findByAuthority(
    authority: string,
  ): Promise<MockPaymentDocument | null> {
    return this.mockPaymentModel.findOne({ authority });
  }

  /**
   * Finalize the checkout page choice and build the Zarinpal-style callback
   * redirect (`?Authority=…&Status=OK|NOK`). Idempotent: repeating a completed
   * checkout keeps the first outcome.
   */
  async completeCheckout(
    authority: string,
    outcome: MockCheckoutOutcome,
  ): Promise<{ redirectUrl: string } | null> {
    const payment = await this.mockPaymentModel.findOne({ authority });
    if (!payment) return null;

    const effectiveOutcome: MockCheckoutOutcome =
      payment.outcomeRule === MockPaymentOutcomeRule.AUTO_CANCEL
        ? 'cancelled'
        : outcome;

    if (payment.status === MockPaymentStatus.CREATED) {
      payment.status =
        effectiveOutcome === 'paid'
          ? MockPaymentStatus.PAID
          : MockPaymentStatus.CANCELLED;
      await payment.save();
      this.logger.log(
        `[CHECKOUT] authority=${authority} outcome=${payment.status}`,
      );
    }

    const succeeded =
      payment.status === MockPaymentStatus.PAID ||
      payment.status === MockPaymentStatus.VERIFIED;
    const separator = payment.callbackUrl.includes('?') ? '&' : '?';
    const redirectUrl = `${payment.callbackUrl}${separator}Authority=${encodeURIComponent(authority)}&Status=${succeeded ? 'OK' : 'NOK'}`;
    return { redirectUrl };
  }

  async verifyPayment(
    request: VerifyPaymentRequest,
  ): Promise<VerifyPaymentResult> {
    const payment = await this.mockPaymentModel.findOne({
      authority: request.authority,
    });

    this.logger.log(
      `[VERIFY] authority=${request.authority} amount=${request.amount} status=${payment?.status ?? 'not_found'}`,
    );

    if (!payment) {
      return {
        ok: false,
        code: -51,
        message: 'Payment session not found or expired',
      };
    }

    if (payment.amount !== request.amount) {
      return {
        ok: false,
        code: -50,
        message: `Amount mismatch: expected ${payment.amount}, got ${request.amount}`,
      };
    }

    if (
      payment.status === MockPaymentStatus.CANCELLED ||
      payment.status === MockPaymentStatus.CREATED
    ) {
      return {
        ok: false,
        code: -51,
        message: 'Payment was cancelled or never completed by the payer',
      };
    }

    if (payment.outcomeRule === MockPaymentOutcomeRule.VERIFY_FAIL) {
      return {
        ok: false,
        code: -53,
        message: 'Verification failed (forced by mock amount rule …2)',
      };
    }

    if (payment.status === MockPaymentStatus.VERIFIED) {
      // Zarinpal code 101: already verified — still a success for callers.
      return {
        ok: true,
        refId: payment.refId ?? `MOCK-REF-${payment.authority}`,
      };
    }

    payment.status = MockPaymentStatus.VERIFIED;
    payment.refId = `MOCK-REF-${Date.now()}`;
    await payment.save();

    return { ok: true, refId: payment.refId };
  }

  async reversePayment(
    request: ReversePaymentRequest,
  ): Promise<ReversePaymentResult> {
    const payment = await this.mockPaymentModel.findOne({
      authority: request.authority,
    });
    if (!payment) {
      return { ok: false, code: -51, message: 'Payment session not found' };
    }
    if (payment.status === MockPaymentStatus.REVERSED) {
      return { ok: true, code: 100, message: 'Already reversed' };
    }
    if (payment.status !== MockPaymentStatus.VERIFIED) {
      return {
        ok: false,
        code: -60,
        message: 'Only a verified payment can be reversed',
      };
    }
    payment.status = MockPaymentStatus.REVERSED;
    await payment.save();
    return { ok: true, code: 100, message: 'Reversed' };
  }
}
