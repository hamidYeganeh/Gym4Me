import { ConflictException } from '@nestjs/common';
import { PaymentChannel, PaymentPurpose, PaymentStatus } from '../common/enums';
import type { PaymentAmountSplit } from '../schemas/payment.schema';

type ComparablePayment = {
  purpose: PaymentPurpose;
  channel: PaymentChannel;
  status: PaymentStatus;
  amount: PaymentAmountSplit;
  reference: { orderId: string };
  payer: {
    userId?: { toString(): string };
    guest?: { phone: string };
  };
};

type RequestedPayment = {
  purpose: PaymentPurpose;
  channel: PaymentChannel;
  status?: PaymentStatus;
  amount: {
    gross: number;
    discount?: number;
    tax?: number;
    providerShare?: number;
    platformFee?: number;
    gatewayFee?: number;
    net?: number;
  };
  reference: { orderId: string };
  payer: { userId?: string; guest?: { phone: string } };
};

/** Prevent an idempotency key from being replayed with different money semantics. */
export function assertPaymentIdempotencyMatch(
  existing: ComparablePayment,
  requested: RequestedPayment,
): void {
  const requestedUserId = requested.payer.userId ?? null;
  const existingUserId = existing.payer.userId?.toString() ?? null;
  const requestedGuestPhone = requested.payer.guest?.phone ?? null;
  const existingGuestPhone = existing.payer.guest?.phone ?? null;
  const suppliedSplit = requested.amount;
  const splitMismatch =
    existing.amount.gross !== suppliedSplit.gross ||
    (suppliedSplit.discount !== undefined &&
      existing.amount.discount !== suppliedSplit.discount) ||
    (suppliedSplit.tax !== undefined &&
      existing.amount.tax !== suppliedSplit.tax) ||
    (suppliedSplit.providerShare !== undefined &&
      existing.amount.providerShare !== suppliedSplit.providerShare) ||
    (suppliedSplit.platformFee !== undefined &&
      existing.amount.platformFee !== suppliedSplit.platformFee) ||
    (suppliedSplit.gatewayFee !== undefined &&
      existing.amount.gatewayFee !== suppliedSplit.gatewayFee) ||
    (suppliedSplit.net !== undefined &&
      existing.amount.net !== suppliedSplit.net);

  if (
    existing.purpose !== requested.purpose ||
    existing.channel !== requested.channel ||
    existing.reference.orderId !== requested.reference.orderId ||
    existingUserId !== requestedUserId ||
    existingGuestPhone !== requestedGuestPhone ||
    splitMismatch
  ) {
    throw new ConflictException(
      'Idempotency key is already used with a different payment payload',
    );
  }
}
