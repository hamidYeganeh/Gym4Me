import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Types, type ClientSession } from 'mongoose';
import {
  BookingResourceType,
  BookingStatus,
  NotificationTemplateKey,
  SlotKind,
} from '../../../../common/enums';
import type { MongoTransactionService } from '../../../../common/mongo/mongo-transaction.service';
import type { BookingDocument } from '../../../../schemas/booking.schema';
import { CreateClubBookingCommand } from './create-club-booking.command';

function listQuery<T>(value: T[]) {
  return {
    sort: jest.fn().mockReturnValue({
      session: jest.fn().mockResolvedValue(value),
      then: Promise.resolve(value).then.bind(Promise.resolve(value)),
    }),
  };
}

function sessionQuery<T>(value: T) {
  return { session: jest.fn().mockResolvedValue(value) };
}

describe('CreateClubBookingCommand', () => {
  const athleteId = new Types.ObjectId().toString();
  const clubId = new Types.ObjectId();
  const slotId = new Types.ObjectId();
  const session = {} as ClientSession;
  const occurrence = {
    date: '2026-09-01',
    startTime: '11:00',
    endTime: '12:00',
  };
  const dto = {
    clubId: clubId.toString(),
    slotId: slotId.toString(),
    dates: [occurrence.date],
    attendeeCount: 1,
  };

  function setup(price = 0) {
    const bookingModel = {
      find: jest.fn(),
      findOne: jest.fn().mockReturnValue(sessionQuery(null)),
      create: jest.fn().mockImplementation(async ([input]) => [
        {
          ...input,
          _id: new Types.ObjectId(),
          code: 'BK-TEST',
        } as BookingDocument,
      ]),
    };
    const club = { identity: { name: 'باشگاه تست' } };
    const clubModel = {
      findById: jest.fn().mockReturnValue(sessionQuery(club)),
    };
    const slot = {
      _id: slotId,
      clubId,
      kind: SlotKind.CLASS,
      capacity: 10,
      price,
    };
    const clubSlots = {
      resolveBookableOccurrence: jest
        .fn()
        .mockResolvedValue({ slot, occurrence }),
      occupyOccurrence: jest.fn().mockResolvedValue(true),
    };
    const outbox = { enqueue: jest.fn().mockResolvedValue(undefined) };
    const transactions = {
      run: jest.fn(
        async (work: (transactionSession: ClientSession) => unknown) =>
          work(session),
      ),
    };
    const command = new CreateClubBookingCommand(
      bookingModel as never,
      clubModel as never,
      clubSlots as never,
      new ConfigService({ BOOKING_PAYMENT_TTL_MINUTES: '20' }),
      outbox as never,
      transactions as unknown as MongoTransactionService,
    );
    return {
      bookingModel,
      clubModel,
      clubSlots,
      command,
      outbox,
      transactions,
    };
  }

  afterEach(() => {
    jest.useRealTimers();
  });

  it('atomically confirms a free occurrence and enqueues its notification', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-23T10:00:00.000Z'));
    const { bookingModel, clubSlots, command, outbox, transactions } = setup();

    const result = await command.execute(athleteId, dto);

    expect(transactions.run).toHaveBeenCalledTimes(1);
    expect(clubSlots.resolveBookableOccurrence).toHaveBeenCalledWith(
      dto.slotId,
      occurrence.date,
      session,
    );
    expect(clubSlots.occupyOccurrence).toHaveBeenCalledWith(
      slotId,
      occurrence.date,
      1,
      10,
      session,
    );
    expect(bookingModel.create).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          athleteId: new Types.ObjectId(athleteId),
          clubId,
          occurrence,
          resource: { type: BookingResourceType.CLASS, refId: slotId },
          pricing: { amount: 0, discount: 0, total: 0 },
          status: BookingStatus.CONFIRMED,
        }),
      ],
      { session },
    );
    expect(result.bookings).toHaveLength(1);
    expect(outbox.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'booking.confirmed',
        payload: expect.objectContaining({
          notification: expect.objectContaining({
            templateKey: NotificationTemplateKey.BOOKING_CONFIRMED,
          }),
        }),
      }),
      session,
    );
  });

  it('creates a paid occurrence with a bounded payment deadline and no early outbox', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-23T10:00:00.000Z'));
    const { bookingModel, command, outbox } = setup(150_000);

    await command.execute(athleteId, { ...dto, attendeeCount: 2 });

    expect(bookingModel.create).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          attendeeCount: 2,
          pricing: { amount: 300_000, discount: 0, total: 300_000 },
          status: BookingStatus.AWAITING_PAYMENT,
          paymentExpiresAt: new Date('2026-08-23T10:20:00.000Z'),
        }),
      ],
      { session },
    );
    expect(outbox.enqueue).not.toHaveBeenCalled();
  });

  it('returns a complete idempotent series without reopening capacity', async () => {
    const recurringGroupId = new Types.ObjectId();
    const existing = [
      { recurringGroupId } as BookingDocument,
      { recurringGroupId } as BookingDocument,
    ];
    const { bookingModel, clubSlots, command, transactions } = setup();
    bookingModel.find.mockReturnValue(listQuery(existing));

    const result = await command.execute(athleteId, {
      ...dto,
      dates: ['2026-09-01', '2026-09-02'],
      idempotencyKey: 'series-1',
    });

    expect(result).toEqual({ recurringGroupId, bookings: existing });
    expect(clubSlots.occupyOccurrence).not.toHaveBeenCalled();
    expect(transactions.run).not.toHaveBeenCalled();
  });

  it('rejects a partial idempotent series before mutating capacity', async () => {
    const { bookingModel, clubSlots, command, transactions } = setup();
    bookingModel.find.mockReturnValue(
      listQuery([
        { recurringGroupId: new Types.ObjectId() } as BookingDocument,
      ]),
    );

    await expect(
      command.execute(athleteId, {
        ...dto,
        dates: ['2026-09-01', '2026-09-02'],
        idempotencyKey: 'series-2',
      }),
    ).rejects.toThrow(ConflictException);
    expect(clubSlots.occupyOccurrence).not.toHaveBeenCalled();
    expect(transactions.run).not.toHaveBeenCalled();
  });

  it('rolls back the use case when occurrence capacity cannot be occupied', async () => {
    const { bookingModel, clubSlots, command } = setup();
    clubSlots.occupyOccurrence.mockResolvedValue(false);

    await expect(command.execute(athleteId, dto)).rejects.toThrow(
      ConflictException,
    );
    expect(bookingModel.create).not.toHaveBeenCalled();
  });
});
