import { BadRequestException, ConflictException } from '@nestjs/common';
import { Types, type ClientSession } from 'mongoose';
import {
  BookingStatus,
  NotificationTemplateKey,
  PaymentChannel,
  PaymentPurpose,
  PaymentStatus,
} from '../../../../common/enums';
import type { MongoTransactionService } from '../../../../common/mongo/mongo-transaction.service';
import type { BookingDocument } from '../../../../schemas/booking.schema';
import { VerifyBookingPaymentCommand } from './verify-booking-payment.command';

function sessionQuery<T>(value: T) {
  return { session: jest.fn().mockResolvedValue(value) };
}

function selectableQuery<T>(value: T) {
  return { select: jest.fn().mockResolvedValue(value) };
}

describe('VerifyBookingPaymentCommand', () => {
  const athleteId = new Types.ObjectId().toString();
  const authority = 'authority-1';
  const session = {} as ClientSession;

  function booking(status = BookingStatus.AWAITING_PAYMENT) {
    return {
      _id: new Types.ObjectId(),
      athleteId: new Types.ObjectId(athleteId),
      clubId: new Types.ObjectId(),
      code: 'BK-1001',
      status,
      startsAt: new Date('2026-09-01T07:30:00.000Z'),
      occurrence: {
        date: '2026-09-01',
        startTime: '11:00',
        endTime: '12:00',
      },
      pricing: { amount: 200_000, discount: 20_000, total: 180_000 },
      payment: { authority },
      paymentExpiresAt: new Date('2026-08-23T10:15:00.000Z'),
      markModified: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as BookingDocument;
  }

  function setup(initial = booking(), current = initial) {
    const bookingModel = {
      findOne: jest.fn().mockReturnValue(sessionQuery(current)),
    };
    const clubModel = {
      findById: jest
        .fn()
        .mockReturnValue(selectableQuery({ identity: { name: 'باشگاه تست' } })),
    };
    const gateway = {
      verifyPayment: jest
        .fn()
        .mockResolvedValue({ ok: true, refId: 'gateway-ref-1' }),
    };
    const paymentResult = { idempotent: false, payment: {}, ledger: {} };
    const finance = {
      recordPayment: jest.fn().mockResolvedValue(paymentResult),
      runPaymentPostCommitEffects: jest.fn().mockResolvedValue(undefined),
    };
    const outbox = { enqueue: jest.fn().mockResolvedValue(undefined) };
    const transactions = {
      run: jest.fn(
        async (work: (transactionSession: ClientSession) => unknown) =>
          work(session),
      ),
    };
    const command = new VerifyBookingPaymentCommand(
      bookingModel as never,
      clubModel as never,
      gateway as never,
      finance as never,
      outbox as never,
      transactions as unknown as MongoTransactionService,
    );
    return {
      bookingModel,
      clubModel,
      command,
      current,
      finance,
      gateway,
      initial,
      outbox,
      paymentResult,
      transactions,
    };
  }

  it('keeps confirmed callbacks idempotent without contacting the gateway', async () => {
    const confirmed = booking(BookingStatus.CONFIRMED);
    const { command, gateway, transactions } = setup(confirmed);

    await expect(
      command.execute(athleteId, confirmed, { authority, status: 'OK' }),
    ).resolves.toBe(confirmed);
    expect(gateway.verifyPayment).not.toHaveBeenCalled();
    expect(transactions.run).not.toHaveBeenCalled();
  });

  it('preserves invalid-state and unknown-authority failures', async () => {
    const cancelled = booking(BookingStatus.CANCELLED);
    const cancelledSetup = setup(cancelled);
    await expect(
      cancelledSetup.command.execute(athleteId, cancelled, {
        authority,
        status: 'OK',
      }),
    ).rejects.toThrow(ConflictException);

    const awaiting = booking();
    const authoritySetup = setup(awaiting);
    await expect(
      authoritySetup.command.execute(athleteId, awaiting, {
        authority: 'other',
        status: 'OK',
      }),
    ).rejects.toThrow(BadRequestException);
    expect(authoritySetup.gateway.verifyPayment).not.toHaveBeenCalled();
  });

  it('treats a NOK callback as non-mutating', async () => {
    const initial = booking();
    const { command, gateway, transactions } = setup(initial);

    await expect(
      command.execute(athleteId, initial, { authority, status: 'NOK' }),
    ).resolves.toBe(initial);
    expect(gateway.verifyPayment).not.toHaveBeenCalled();
    expect(transactions.run).not.toHaveBeenCalled();
  });

  it('rejects an unsuccessful provider verification before opening a transaction', async () => {
    const initial = booking();
    const { command, gateway, transactions } = setup(initial);
    gateway.verifyPayment.mockResolvedValue({
      ok: false,
      message: 'not verified',
    });

    await expect(
      command.execute(athleteId, initial, { authority, status: 'OK' }),
    ).rejects.toThrow('Payment verification failed: not verified');
    expect(transactions.run).not.toHaveBeenCalled();
  });

  it('commits booking, ledger/payment and outbox together, then runs effects', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-23T10:00:00.000Z'));
    const initial = booking();
    const current = booking();
    current._id = initial._id;
    current.athleteId = initial.athleteId;
    const { command, finance, gateway, outbox, paymentResult, transactions } =
      setup(initial, current);

    await expect(
      command.execute(athleteId, initial, { authority, status: 'OK' }),
    ).resolves.toBe(current);

    expect(gateway.verifyPayment).toHaveBeenCalledWith({
      authority,
      amount: 1_800_000,
    });
    expect(gateway.verifyPayment.mock.invocationCallOrder[0]).toBeLessThan(
      transactions.run.mock.invocationCallOrder[0],
    );
    expect(current.status).toBe(BookingStatus.CONFIRMED);
    expect(current.payment).toEqual({
      authority,
      refId: 'gateway-ref-1',
      paidAt: new Date('2026-08-23T10:00:00.000Z'),
    });
    expect(current.paymentExpiresAt).toBeUndefined();
    expect(current.save).toHaveBeenCalledWith({ session });
    expect(finance.recordPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        purpose: PaymentPurpose.BOOKING,
        channel: PaymentChannel.ZARINPAL,
        status: PaymentStatus.CAPTURED,
        amount: { gross: 200_000, discount: 20_000, net: 180_000 },
        idempotencyKey: `booking:${current._id.toString()}:pay:${authority}`,
      }),
      { actorId: athleteId, session },
    );
    expect(outbox.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'booking.confirmed',
        payload: expect.objectContaining({
          notification: expect.objectContaining({
            templateKey: NotificationTemplateKey.BOOKING_CONFIRMED,
            params: expect.objectContaining({ clubName: 'باشگاه تست' }),
          }),
        }),
      }),
      session,
    );
    expect(finance.runPaymentPostCommitEffects).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: `booking:${current._id.toString()}:pay:${authority}`,
      }),
      { actorId: athleteId },
      paymentResult,
    );
    expect(
      finance.runPaymentPostCommitEffects.mock.invocationCallOrder[0],
    ).toBeGreaterThan(transactions.run.mock.invocationCallOrder[0]);
    jest.useRealTimers();
  });
});
