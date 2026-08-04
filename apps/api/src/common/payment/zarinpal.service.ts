import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreatePaymentRequest,
  CreatePaymentResult,
  PaymentGatewayService,
  VerifyPaymentRequest,
  VerifyPaymentResult,
} from './payment-gateway.service';

@Injectable()
export class MockPaymentGatewayService extends PaymentGatewayService {
  private readonly logger = new Logger('MockPayment');

  async createPayment(
    request: CreatePaymentRequest,
  ): Promise<CreatePaymentResult> {
    const authority = `MOCK-${request.orderId}-${Date.now()}`;
    this.logger.log(
      `[CREATE] amount=${request.amount} order=${request.orderId} authority=${authority}`,
    );
    return {
      authority,
      redirectUrl: `${request.callbackUrl}?Authority=${authority}&Status=OK`,
    };
  }

  async verifyPayment(
    request: VerifyPaymentRequest,
  ): Promise<VerifyPaymentResult> {
    this.logger.log(
      `[VERIFY] authority=${request.authority} amount=${request.amount}`,
    );
    return {
      ok: true,
      refId: `MOCK-REF-${request.authority}`,
    };
  }
}

/**
 * Zarinpal REST (v4).
 * Docs: https://docs.zarinpal.com/paymentGateway/
 *
 * Env:
 *   ZARINPAL_MERCHANT_ID
 *   ZARINPAL_SANDBOX=true|false  (default true)
 */
@Injectable()
export class ZarinpalPaymentGatewayService extends PaymentGatewayService {
  private readonly logger = new Logger('Zarinpal');
  private readonly merchantId: string;
  private readonly baseUrl: string;
  private readonly startPayBase: string;

  constructor(config: ConfigService) {
    super();
    this.merchantId = config.getOrThrow<string>('ZARINPAL_MERCHANT_ID');
    const sandbox =
      (config.get<string>('ZARINPAL_SANDBOX', 'true') ?? 'true').toLowerCase() !==
      'false';
    this.baseUrl = sandbox
      ? 'https://sandbox.zarinpal.com/pg/v4/payment'
      : 'https://api.zarinpal.com/pg/v4/payment';
    this.startPayBase = sandbox
      ? 'https://sandbox.zarinpal.com/pg/StartPay'
      : 'https://www.zarinpal.com/pg/StartPay';
  }

  async createPayment(
    request: CreatePaymentRequest,
  ): Promise<CreatePaymentResult> {
    const body = {
      merchant_id: this.merchantId,
      amount: request.amount,
      description: request.description,
      callback_url: request.callbackUrl,
      metadata: {
        order_id: request.orderId,
        mobile: request.mobile,
        email: request.email,
        ...request.metadata,
      },
    };

    const res = await fetch(`${this.baseUrl}/request.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });

    const json = (await res.json()) as {
      data?: { authority?: string; code?: number; message?: string };
      errors?: unknown;
    };

    const authority = json.data?.authority;
    const code = json.data?.code;
    if (!authority || code !== 100) {
      this.logger.error(`Zarinpal request failed: ${JSON.stringify(json)}`);
      throw new Error(
        `Zarinpal create failed: ${json.data?.message ?? 'unknown'}`,
      );
    }

    return {
      authority,
      redirectUrl: `${this.startPayBase}/${authority}`,
      raw: json,
    };
  }

  async verifyPayment(
    request: VerifyPaymentRequest,
  ): Promise<VerifyPaymentResult> {
    const body = {
      merchant_id: this.merchantId,
      amount: request.amount,
      authority: request.authority,
    };

    const res = await fetch(`${this.baseUrl}/verify.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });

    const json = (await res.json()) as {
      data?: {
        code?: number;
        ref_id?: number | string;
        card_pan?: string;
        message?: string;
      };
      errors?: { code?: number; message?: string };
    };

    const code = json.data?.code;
    // 100 = first verify success, 101 = already verified
    if (code === 100 || code === 101) {
      return {
        ok: true,
        refId: String(json.data?.ref_id ?? ''),
        cardPan: json.data?.card_pan,
        raw: json,
      };
    }

    return {
      ok: false,
      code: code ?? json.errors?.code ?? 'unknown',
      message: json.data?.message ?? json.errors?.message ?? 'verify failed',
      raw: json,
    };
  }
}
