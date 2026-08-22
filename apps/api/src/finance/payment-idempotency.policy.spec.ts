import { ConflictException } from '@nestjs/common';
import { PaymentChannel, PaymentPurpose, PaymentStatus } from '../common/enums';
import type { PaymentAmountSplit } from '../schemas/payment.schema';
import { assertPaymentIdempotencyMatch } from './payment-idempotency.policy';

const amount: PaymentAmountSplit = {
  discount: 10,
  gatewayFee: 5,
  gross: 100,
  net: 10,
  platformFee: 10,
  providerShare: 60,
  tax: 5,
};

const existing = {
  amount,
  channel: PaymentChannel.ZARINPAL,
  payer: { userId: { toString: () => 'user-1' } },
  purpose: PaymentPurpose.BOOKING,
  reference: { orderId: 'order-1' },
  status: PaymentStatus.CAPTURED,
};

const requested = {
  amount: { ...amount },
  channel: PaymentChannel.ZARINPAL,
  idempotencyKey: 'payment-1',
  payer: { userId: 'user-1' },
  purpose: PaymentPurpose.BOOKING,
  reference: { orderId: 'order-1' },
};

describe('assertPaymentIdempotencyMatch', () => {
  it('accepts the original payload and the default captured status', () => {
    expect(() =>
      assertPaymentIdempotencyMatch(existing, requested),
    ).not.toThrow();
  });

  it('allows omitted optional split fields to match their normalized values', () => {
    expect(() =>
      assertPaymentIdempotencyMatch(existing, {
        ...requested,
        amount: { gross: amount.gross },
      }),
    ).not.toThrow();
  });

  it.each([
    ['purpose', { purpose: PaymentPurpose.MEMBERSHIP }],
    ['channel', { channel: PaymentChannel.WALLET }],
    ['status', { status: PaymentStatus.PENDING }],
    ['order', { reference: { orderId: 'order-2' } }],
    ['payer', { payer: { userId: 'user-2' } }],
    ['guest', { payer: { guest: { phone: '+989121111111' } } }],
  ])('rejects a replay with changed %s', (_label, override) => {
    expect(() =>
      assertPaymentIdempotencyMatch(existing, { ...requested, ...override }),
    ).toThrow(ConflictException);
  });

  it.each([
    'gross',
    'discount',
    'tax',
    'providerShare',
    'platformFee',
    'gatewayFee',
    'net',
  ] as const)('rejects a replay with changed amount.%s', (field) => {
    expect(() =>
      assertPaymentIdempotencyMatch(existing, {
        ...requested,
        amount: { ...requested.amount, [field]: amount[field] + 1 },
      }),
    ).toThrow(ConflictException);
  });
});
