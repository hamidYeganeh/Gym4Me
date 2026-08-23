export type PaymentCurrency = 'IRR' | 'IRT';

export interface CreatePaymentRequest {
  /** Amount in the smallest unit of currency (Rials for IRR). */
  amount: number;
  description: string;
  callbackUrl: string;
  /** Idempotency / merchant order id */
  orderId: string;
  mobile?: string;
  email?: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentResult {
  authority: string;
  redirectUrl: string;
  raw?: unknown;
}

export interface VerifyPaymentRequest {
  authority: string;
  amount: number;
}

export type VerifyPaymentResult =
  | {
      ok: true;
      refId: string;
      cardPan?: string;
      raw?: unknown;
    }
  | {
      ok: false;
      code: number | string;
      message: string;
      raw?: unknown;
    };

export interface ReversePaymentRequest {
  authority: string;
}

export type ReversePaymentResult =
  | {
      ok: true;
      code: number | string;
      message?: string;
      raw?: unknown;
    }
  | {
      ok: false;
      code: number | string;
      message: string;
      raw?: unknown;
    };

export abstract class PaymentGatewayService {
  abstract createPayment(
    request: CreatePaymentRequest,
  ): Promise<CreatePaymentResult>;

  abstract verifyPayment(
    request: VerifyPaymentRequest,
  ): Promise<VerifyPaymentResult>;

  /** Fully reverse a verified payment when the configured PSP supports it. */
  abstract reversePayment(
    request: ReversePaymentRequest,
  ): Promise<ReversePaymentResult>;
}
