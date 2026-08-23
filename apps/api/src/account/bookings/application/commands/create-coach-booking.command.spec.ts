import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ClientSession } from 'mongoose';
import { Types } from 'mongoose';
import {
  BookingResourceType,
  BookingStatus,
  CoachSlotStatus,
  ConsultationKind,
} from '../../../../common/enums';
import type { MongoTransactionService } from '../../../../common/mongo/mongo-transaction.service';
import type { BookingDocument } from '../../../../schemas/booking.schema';
import { CreateCoachBookingCommand } from './create-coach-booking.command';

function queryResult<T>(value: T) {
  const query = Promise.resolve(value) as Promise<T> & {
    session: jest.Mock<Promise<T>, [ClientSession]>;
  };
  query.session = jest.fn().mockResolvedValue(value);
  return query;
}

describe('CreateCoachBookingCommand', () => {
  const athleteId = new Types.ObjectId().toString();
  const coachUserId = new Types.ObjectId().toString();
  const slotId = new Types.ObjectId();
  const session = {} as ClientSession;
  const dto = {
    coachUserId,
    slotId: slotId.toString(),
    consultationKind: ConsultationKind.REMOTE,
    intake: {
      note: 'Need a recovery plan',
      medicalConditionKeys: ['knee_pain'],
      supplementKeys: ['creatine'],
    },
    couponCode: 'LATER',
  };

  function setup(options?: {
    profile?: unknown;
    slot?: unknown;
    created?: BookingDocument;
  }) {
    const created =
      options?.created ??
      ({
        _id: new Types.ObjectId(),
        code: 'BK-TEST',
      } as BookingDocument);
    const bookingModel = {
      findOne: jest.fn(),
      create: jest.fn().mockResolvedValue([created]),
    };
    const slotModel = {
      findOneAndUpdate: jest.fn().mockResolvedValue(
        options && 'slot' in options
          ? options.slot
          : {
              _id: slotId,
              startsAt: new Date('2026-09-01T08:00:00.000Z'),
              endsAt: new Date('2026-09-01T09:00:00.000Z'),
            },
      ),
    };
    const coachModel = {
      findOne: jest
        .fn()
        .mockResolvedValue(
          options && 'profile' in options
            ? options.profile
            : { pricing: { consultation: { remote: 250_000 } } },
        ),
    };
    const transactions = {
      run: jest.fn(
        async (work: (transactionSession: ClientSession) => unknown) =>
          work(session),
      ),
    };
    const command = new CreateCoachBookingCommand(
      bookingModel as never,
      slotModel as never,
      coachModel as never,
      new ConfigService({ BOOKING_COACH_APPROVAL_TTL_MINUTES: '30' }),
      transactions as unknown as MongoTransactionService,
    );
    return {
      bookingModel,
      coachModel,
      command,
      created,
      slotModel,
      transactions,
    };
  }

  it('reserves the slot and creates the pending price snapshot in one transaction', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-23T10:00:00.000Z'));
    const { bookingModel, command, created, slotModel, transactions } = setup();

    await expect(command.execute(athleteId, dto)).resolves.toBe(created);

    expect(transactions.run).toHaveBeenCalledTimes(1);
    expect(slotModel.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: new Types.ObjectId(dto.slotId),
        coachUserId: new Types.ObjectId(dto.coachUserId),
        status: CoachSlotStatus.OPEN,
      }),
      { $set: { status: CoachSlotStatus.BOOKED } },
      { new: true, session },
    );
    expect(bookingModel.create).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          athleteId: new Types.ObjectId(athleteId),
          coachUserId: new Types.ObjectId(coachUserId),
          consultationKind: ConsultationKind.REMOTE,
          resource: { type: BookingResourceType.COACH, refId: slotId },
          slotId,
          intake: dto.intake,
          pricing: {
            amount: 250_000,
            discount: 0,
            couponCode: 'LATER',
            total: 250_000,
          },
          status: BookingStatus.PENDING,
          approvalExpiresAt: new Date('2026-08-23T10:30:00.000Z'),
        }),
      ],
      { session },
    );
    jest.useRealTimers();
  });

  it('returns an idempotent replay before querying coach or slot state', async () => {
    const existing = { _id: new Types.ObjectId() } as BookingDocument;
    const { bookingModel, coachModel, command, slotModel, transactions } =
      setup();
    bookingModel.findOne.mockReturnValue(queryResult(existing));

    await expect(
      command.execute(athleteId, { ...dto, idempotencyKey: 'retry-1' }),
    ).resolves.toBe(existing);

    expect(coachModel.findOne).not.toHaveBeenCalled();
    expect(slotModel.findOneAndUpdate).not.toHaveBeenCalled();
    expect(transactions.run).not.toHaveBeenCalled();
  });

  it('returns the winning booking when a concurrent idempotent insert races', async () => {
    const existing = { _id: new Types.ObjectId() } as BookingDocument;
    const { bookingModel, command, transactions } = setup();
    bookingModel.findOne
      .mockReturnValueOnce(queryResult(null))
      .mockReturnValueOnce(queryResult(existing));
    transactions.run.mockRejectedValueOnce(new Error('duplicate key'));

    await expect(
      command.execute(athleteId, { ...dto, idempotencyKey: 'retry-2' }),
    ).resolves.toBe(existing);
  });

  it('preserves validation failures before opening a transaction', async () => {
    const noCoach = setup({ profile: null });
    await expect(noCoach.command.execute(athleteId, dto)).rejects.toThrow(
      NotFoundException,
    );
    expect(noCoach.transactions.run).not.toHaveBeenCalled();

    const selfBooking = setup();
    await expect(selfBooking.command.execute(coachUserId, dto)).rejects.toThrow(
      BadRequestException,
    );
    expect(selfBooking.transactions.run).not.toHaveBeenCalled();

    const noRemotePrice = setup({
      profile: { pricing: { consultation: { inPerson: 250_000 } } },
    });
    await expect(noRemotePrice.command.execute(athleteId, dto)).rejects.toThrow(
      BadRequestException,
    );
    expect(noRemotePrice.transactions.run).not.toHaveBeenCalled();
  });

  it('does not persist a booking when the slot is no longer open', async () => {
    const { bookingModel, command } = setup({ slot: null });

    await expect(command.execute(athleteId, dto)).rejects.toThrow(
      ConflictException,
    );
    expect(bookingModel.create).not.toHaveBeenCalled();
  });
});
