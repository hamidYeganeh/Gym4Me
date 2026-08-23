import type { ConfigService } from '@nestjs/config';
import { ZarinpalPaymentGatewayService } from './zarinpal.service';

describe('ZarinpalPaymentGatewayService', () => {
  const originalFetch = global.fetch;
  const config = {
    getOrThrow: jest.fn(() => 'merchant-id'),
    get: jest.fn((key: string, fallback?: string) =>
      key === 'ZARINPAL_SANDBOX' ? 'false' : fallback,
    ),
  } as unknown as ConfigService;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('uses the production payment host and returns the official StartPay URL', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({
        data: { code: 100, authority: 'A000000000000000000000000000001' },
      }),
    });
    const gateway = new ZarinpalPaymentGatewayService(config);

    const result = await gateway.createPayment({
      amount: 100_000,
      description: 'booking',
      callbackUrl: 'https://app.example.com/payment',
      orderId: 'order-1',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://payment.zarinpal.com/pg/v4/payment/request.json',
      expect.any(Object),
    );
    expect(result.redirectUrl).toBe(
      'https://payment.zarinpal.com/pg/StartPay/A000000000000000000000000000001',
    );
  });

  it('calls reverse.json with only server-owned merchant and authority', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ data: { code: 100, message: 'Reversed' } }),
    });
    const gateway = new ZarinpalPaymentGatewayService(config);

    await expect(
      gateway.reversePayment({ authority: 'authority-1' }),
    ).resolves.toMatchObject({ ok: true, code: 100 });
    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [
      string,
      RequestInit,
    ];
    if (typeof init.body !== 'string') throw new Error('Expected JSON body');
    expect(JSON.parse(init.body) as unknown).toEqual({
      merchant_id: 'merchant-id',
      authority: 'authority-1',
    });
  });
});
