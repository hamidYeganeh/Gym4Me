import {
  Controller,
  Get,
  NotFoundException,
  Query,
  Res,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '../decorators/public.decorator';
import { MockPaymentOutcomeRule, MockPaymentStatus } from '../enums';
import {
  MockCheckoutOutcome,
  MockPaymentGatewayService,
} from './mock-payment.service';

/**
 * Dev-only pages simulating the PSP checkout (like Zarinpal StartPay).
 * Only mock-created authorities resolve here, so it is inert when
 * PAYMENT_PROVIDER=zarinpal.
 */
@ApiExcludeController()
@Controller('payments/mock')
export class MockPaymentController {
  constructor(private readonly mockGateway: MockPaymentGatewayService) {}

  @Public()
  @Get('checkout')
  async checkout(
    @Query('authority') authority: string,
    @Res() res: Response,
  ): Promise<void> {
    const payment = await this.mockGateway.findByAuthority(authority ?? '');
    if (!payment) throw new NotFoundException('Unknown mock payment');

    // Deterministic rule …1: skip interaction and bounce straight to NOK.
    if (
      payment.status === MockPaymentStatus.CREATED &&
      payment.outcomeRule === MockPaymentOutcomeRule.AUTO_CANCEL
    ) {
      const auto = await this.mockGateway.completeCheckout(
        payment.authority,
        'cancelled',
      );
      if (auto) {
        res.redirect(auto.redirectUrl);
        return;
      }
    }

    res.type('html').send(this.renderCheckoutPage(payment));
  }

  @Public()
  @Get('complete')
  async complete(
    @Query('authority') authority: string,
    @Query('outcome') outcome: string,
    @Res() res: Response,
  ): Promise<void> {
    const normalized: MockCheckoutOutcome =
      outcome === 'paid' ? 'paid' : 'cancelled';
    const result = await this.mockGateway.completeCheckout(
      authority ?? '',
      normalized,
    );
    if (!result) throw new NotFoundException('Unknown mock payment');
    res.redirect(result.redirectUrl);
  }

  private renderCheckoutPage(payment: {
    authority: string;
    amount: number;
    description: string;
  }): string {
    const amountToman = Math.floor(payment.amount / 10).toLocaleString('fa-IR');
    const authority = encodeURIComponent(payment.authority);
    return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>درگاه پرداخت آزمایشی Gym4Me</title>
<style>
  body { font-family: system-ui, sans-serif; background: #f4f4f5; margin: 0;
         display: flex; align-items: center; justify-content: center; min-height: 100vh; }
  .card { background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,.08);
          padding: 32px; max-width: 380px; width: 100%; text-align: center; }
  .badge { display: inline-block; background: #fef3c7; color: #92400e; font-size: 12px;
           border-radius: 999px; padding: 4px 12px; margin-bottom: 16px; }
  h1 { font-size: 18px; margin: 0 0 8px; }
  .desc { color: #52525b; font-size: 14px; margin-bottom: 4px; }
  .amount { font-size: 28px; font-weight: 700; margin: 16px 0 24px; }
  .amount small { font-size: 14px; font-weight: 400; color: #71717a; }
  a.btn { display: block; border-radius: 12px; padding: 14px; margin-bottom: 12px;
          text-decoration: none; font-size: 15px; font-weight: 600; }
  .pay { background: #16a34a; color: #fff; }
  .cancel { background: #f4f4f5; color: #b91c1c; border: 1px solid #e4e4e7; }
  .authority { font-size: 11px; color: #a1a1aa; word-break: break-all; margin-top: 16px; }
</style>
</head>
<body>
  <div class="card">
    <span class="badge">درگاه آزمایشی — پرداخت واقعی انجام نمی‌شود</span>
    <h1>پرداخت Gym4Me</h1>
    <p class="desc">${payment.description}</p>
    <div class="amount">${amountToman} <small>تومان</small></div>
    <a class="btn pay" href="/api/v1/payments/mock/complete?authority=${authority}&outcome=paid">پرداخت موفق</a>
    <a class="btn cancel" href="/api/v1/payments/mock/complete?authority=${authority}&outcome=cancelled">انصراف از پرداخت</a>
    <div class="authority">${payment.authority}</div>
  </div>
</body>
</html>`;
  }
}
