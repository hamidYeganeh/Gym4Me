import { ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import { PaymentStatus } from '../../../common/enums';
import { WalletTopUpService } from './wallet-top-up.service';

function payment(overrides: Record<string, unknown> = {}) {
  const value = {
    _id: new Types.ObjectId(),
    status: PaymentStatus.PENDING,
    amount: { gross: 500_000 },
    reference: { orderId: 'wallet-topup:user-1:key-1' },
    toObject() {
      return this;
    },
    ...overrides,
  };
  return value;
}

describe('WalletTopUpService', () => {
  function setup(initial = payment()) {
    const payments = {
      findById: jest.fn().mockResolvedValue(initial),
      findOne: jest.fn().mockResolvedValue(initial),
      findOneAndUpdate: jest.fn(),
      find: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };
    const gateway = {
      createPayment: jest.fn().mockResolvedValue({
        authority: 'authority-1',
        redirectUrl: 'https://gateway.test/authority-1',
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        ok: true,
        refId: 'ref-1',
      }),
    };
    const finance = {
      recordPayment: jest.fn().mockResolvedValue({
        payment: { _id: initial._id },
        ledger: null,
        idempotent: false,
      }),
      capturePendingWalletTopUp: jest.fn().mockResolvedValue({
        payment: payment({ status: PaymentStatus.CAPTURED }),
        ledger: {},
        idempotent: false,
      }),
      cancelPendingWalletTopUp: jest
        .fn()
        .mockResolvedValue(payment({ status: PaymentStatus.CANCELLED })),
    };
    const service = new WalletTopUpService(
      payments as never,
      gateway as never,
      finance as never,
    );
    return { finance, gateway, payments, service };
  }

  it('creates only a pending payment, claims initiation and sends rials to the gateway', async () => {
    const initial = payment();
    const initiated = payment({
      _id: initial._id,
      reference: {
        orderId: 'wallet-topup:user-1:key-1',
        authority: 'authority-1',
        redirectUrl: 'https://gateway.test/authority-1',
      },
    });
    const { finance, gateway, payments, service } = setup(initial);
    payments.findOneAndUpdate
      .mockResolvedValueOnce(initial)
      .mockResolvedValueOnce(initiated);

    await expect(
      service.initiate('507f1f77bcf86cd799439011', {
        amount: 500_000,
        idempotencyKey: 'key-1',
        callbackUrl: 'https://app.test/athlete/wallet',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        authority: 'authority-1',
        redirectUrl: 'https://gateway.test/authority-1',
        status: PaymentStatus.PENDING,
      }),
    );
    expect(finance.recordPayment).toHaveBeenCalledWith(
      expect.objectContaining({ status: PaymentStatus.PENDING }),
    );
    expect(gateway.createPayment).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 5_000_000 }),
    );
  });

  it('returns an existing authority without creating a second gateway payment', async () => {
    const existing = payment({
      reference: {
        orderId: 'wallet-topup:user-1:key-1',
        authority: 'authority-existing',
        redirectUrl: 'https://gateway.test/authority-existing',
      },
    });
    const { gateway, service } = setup(existing);

    await service.initiate('507f1f77bcf86cd799439011', {
      amount: 500_000,
      idempotencyKey: 'key-1',
      callbackUrl: 'https://app.test/athlete/wallet',
    });

    expect(gateway.createPayment).not.toHaveBeenCalled();
  });

  it('rejects a concurrent initiation when another instance owns the claim', async () => {
    const { payments, service } = setup();
    payments.findOneAndUpdate.mockResolvedValueOnce(null);
    payments.findById.mockResolvedValueOnce(payment()).mockResolvedValue(null);

    await expect(
      service.initiate('507f1f77bcf86cd799439011', {
        amount: 500_000,
        idempotencyKey: 'key-1',
        callbackUrl: 'https://app.test/athlete/wallet',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('verifies a successful callback before capture and never trusts the client amount', async () => {
    const { finance, gateway, service } = setup();

    await service.verify('507f1f77bcf86cd799439011', {
      authority: 'authority-1',
      status: 'OK',
    });

    expect(gateway.verifyPayment).toHaveBeenCalledWith({
      authority: 'authority-1',
      amount: 5_000_000,
    });
    expect(finance.capturePendingWalletTopUp).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      'authority-1',
      'ref-1',
      undefined,
    );
  });

  it('cancels a NOK callback without calling the gateway or crediting the wallet', async () => {
    const { finance, gateway, service } = setup();

    await service.verify('507f1f77bcf86cd799439011', {
      authority: 'authority-1',
      status: 'NOK',
    });

    expect(gateway.verifyPayment).not.toHaveBeenCalled();
    expect(finance.capturePendingWalletTopUp).not.toHaveBeenCalled();
    expect(finance.cancelPendingWalletTopUp).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      'authority-1',
    );
  });

  it('reconciles a captured provider payment when its callback was lost', async () => {
    const candidate = payment({
      payer: { userId: new Types.ObjectId('507f1f77bcf86cd799439011') },
      reference: {
        orderId: 'wallet-topup:user-1:key-1',
        authority: 'authority-1',
        initiatedAt: new Date(Date.now() - 5 * 60_000),
      },
    });
    const { finance, payments, service } = setup(candidate);
    const limit = jest.fn().mockResolvedValue([candidate]);
    const sort = jest.fn().mockReturnValue({ limit });
    payments.find.mockReturnValue({ sort });

    await expect(service.reconcilePending()).resolves.toEqual({
      scanned: 1,
      captured: 1,
      unresolved: 0,
      expired: 0,
    });
    expect(finance.capturePendingWalletTopUp).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      'authority-1',
      'ref-1',
    );
  });
});
