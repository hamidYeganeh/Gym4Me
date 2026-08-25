import { Types, type ClientSession } from 'mongoose';
import {
  LedgerAccount,
  LedgerEntryKind,
  PaymentChannel,
  PaymentPurpose,
  PaymentStatus,
} from '../common/enums';
import { FinanceService } from './finance.service';

describe('FinanceService membership gateway capture', () => {
  it('changes the pending payment and posts one balanced immutable ledger entry', async () => {
    const session = {} as ClientSession;
    const paymentId = new Types.ObjectId();
    const membershipId = new Types.ObjectId();
    const clubId = new Types.ObjectId();
    const payment = {
      _id: paymentId,
      purpose: PaymentPurpose.MEMBERSHIP,
      channel: PaymentChannel.ZARINPAL,
      status: PaymentStatus.PENDING,
      amount: {
        gross: 1_000,
        discount: 0,
        tax: 90,
        providerShare: 0,
        platformFee: 0,
        gatewayFee: 0,
        net: 910,
      },
      reference: { orderId: 'membership-checkout:1' },
      related: { clubId },
      idempotencyKey: 'membership-checkout:1',
      markModified: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      toObject: jest.fn(function (this: Record<string, unknown>) {
        return this;
      }),
    };
    const paymentModel = {
      findById: jest.fn().mockReturnValue({
        session: jest.fn().mockResolvedValue(payment),
      }),
    };
    const ledgerInstances: Array<Record<string, unknown>> = [];
    const ledgerModel = Object.assign(
      jest.fn().mockImplementation((input: Record<string, unknown>) => {
        const ledger = {
          ...input,
          _id: new Types.ObjectId(),
          save: jest.fn().mockResolvedValue(undefined),
          toObject: jest.fn(function (this: Record<string, unknown>) {
            return this;
          }),
        };
        ledgerInstances.push(ledger);
        return ledger;
      }),
      { findOne: jest.fn() },
    );
    const service = Object.create(FinanceService.prototype) as FinanceService;
    Object.assign(service, { paymentModel, ledgerModel });

    const result = await service.capturePendingGatewayPayment(
      {
        paymentId,
        authority: 'authority-1',
        gatewayRefId: 'ref-1',
        membershipId,
      },
      session,
    );

    expect(payment).toMatchObject({
      status: PaymentStatus.CAPTURED,
      related: { clubId, membershipId },
      reference: { authority: 'authority-1', gatewayRefId: 'ref-1' },
    });
    expect(payment.save).toHaveBeenCalledWith({ session });
    expect(ledgerInstances[0]).toMatchObject({
      kind: LedgerEntryKind.PAYMENT,
      paymentId,
      dedupeKey: 'payment:membership-checkout:1',
      related: { clubId, membershipId },
    });
    const lines = ledgerInstances[0]?.lines as Array<{
      account: LedgerAccount;
      debit: number;
      credit: number;
    }>;
    expect(lines.reduce((sum, line) => sum + line.debit, 0)).toBe(1_000);
    expect(lines.reduce((sum, line) => sum + line.credit, 0)).toBe(1_000);
    expect(result.idempotent).toBe(false);
  });

  it('posts platform subscription proceeds to tax and platform revenue', async () => {
    const session = {} as ClientSession;
    const paymentId = new Types.ObjectId();
    const platformSubscriptionId = new Types.ObjectId();
    const payment = {
      _id: paymentId,
      purpose: PaymentPurpose.PLATFORM_SUBSCRIPTION,
      channel: PaymentChannel.ZARINPAL,
      status: PaymentStatus.PENDING,
      amount: {
        gross: 2_000,
        discount: 0,
        tax: 180,
        providerShare: 0,
        platformFee: 1_820,
        gatewayFee: 0,
        net: 0,
      },
      reference: { orderId: 'platform-subscription-checkout:1' },
      related: { platformPlanId: new Types.ObjectId() },
      idempotencyKey: 'platform-subscription-checkout:1',
      markModified: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      toObject: jest.fn(function (this: Record<string, unknown>) {
        return this;
      }),
    };
    const paymentModel = {
      findById: jest.fn().mockReturnValue({
        session: jest.fn().mockResolvedValue(payment),
      }),
    };
    const ledgerInstances: Array<Record<string, unknown>> = [];
    const ledgerModel = Object.assign(
      jest.fn().mockImplementation((input: Record<string, unknown>) => {
        const ledger = {
          ...input,
          _id: new Types.ObjectId(),
          save: jest.fn().mockResolvedValue(undefined),
          toObject: jest.fn(function (this: Record<string, unknown>) {
            return this;
          }),
        };
        ledgerInstances.push(ledger);
        return ledger;
      }),
      { findOne: jest.fn() },
    );
    const service = Object.create(FinanceService.prototype) as FinanceService;
    Object.assign(service, { paymentModel, ledgerModel });

    await service.capturePendingGatewayPayment(
      {
        paymentId,
        authority: 'authority-platform',
        gatewayRefId: 'ref-platform',
        platformSubscriptionId,
      },
      session,
    );

    const lines = ledgerInstances[0]?.lines as Array<{
      account: LedgerAccount;
      debit: number;
      credit: number;
    }>;
    expect(lines).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          account: LedgerAccount.GATEWAY_CLEARING,
          debit: 2_000,
        }),
        expect.objectContaining({
          account: LedgerAccount.TAX_PAYABLE,
          credit: 180,
        }),
        expect.objectContaining({
          account: LedgerAccount.PLATFORM_REVENUE,
          credit: 1_820,
        }),
      ]),
    );
    expect(lines.reduce((sum, line) => sum + line.debit, 0)).toBe(2_000);
    expect(lines.reduce((sum, line) => sum + line.credit, 0)).toBe(2_000);
    expect(payment.related.platformSubscriptionId).toEqual(
      platformSubscriptionId,
    );
  });
});
