import { BadRequestException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { Types } from 'mongoose';
import {
  CalendarBlockReason,
  CalendarResourceType,
  EntityStatus,
} from '../../common/enums';
import { CalendarService } from './calendar.service';

describe('CalendarService mutation idempotency', () => {
  const actorId = new Types.ObjectId().toString();
  const clubId = new Types.ObjectId().toString();
  const mutationId = 'holiday-create-1';
  const dto = {
    clientMutationId: mutationId,
    resource: { type: CalendarResourceType.CLUB, id: clubId },
    reason: CalendarBlockReason.HOLIDAY,
    window: {
      from: '2026-09-01T20:30:00.000Z',
      to: '2026-09-02T20:30:00.000Z',
    },
    note: 'تعطیلی باشگاه',
  };

  function fingerprint() {
    return createHash('sha256')
      .update(
        JSON.stringify({
          resource: dto.resource,
          reason: dto.reason,
          window: dto.window,
          note: dto.note,
          status: EntityStatus.ACTIVE,
        }),
      )
      .digest('hex');
  }

  function setup(storedFingerprint: string) {
    const row = {
      _id: new Types.ObjectId(),
      resource: {
        type: CalendarResourceType.CLUB,
        id: new Types.ObjectId(clubId),
      },
      reason: CalendarBlockReason.HOLIDAY,
      window: {
        from: new Date(dto.window.from),
        to: new Date(dto.window.to),
      },
      note: dto.note,
      createdBy: new Types.ObjectId(actorId),
      status: EntityStatus.ACTIVE,
      clientMutationId: mutationId,
      mutationFingerprint: storedFingerprint,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const blockModel = {
      findOne: jest.fn().mockReturnValue({
        session: jest.fn().mockResolvedValue(row),
      }),
    };
    const clubModel = {
      findById: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: clubId }),
      }),
    };
    const staff = {
      requireClubAccess: jest.fn().mockResolvedValue(undefined),
      assertStaffPermission: jest.fn().mockResolvedValue(undefined),
    };
    const audit = { log: jest.fn() };
    const transactions = { run: jest.fn() };
    const service = new CalendarService(
      blockModel as never,
      clubModel as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      staff as never,
      audit as never,
      transactions as never,
    );
    return { audit, service, transactions };
  }

  it('returns the original block without another transaction or audit', async () => {
    const { audit, service, transactions } = setup(fingerprint());

    await expect(service.upsertForClub(actorId, clubId, dto)).resolves.toEqual(
      expect.objectContaining({ reason: CalendarBlockReason.HOLIDAY }),
    );
    expect(transactions.run).not.toHaveBeenCalled();
    expect(audit.log).not.toHaveBeenCalled();
  });

  it('rejects reuse of clientMutationId with a changed payload', async () => {
    const { service } = setup('different');

    await expect(
      service.upsertForClub(actorId, clubId, dto),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
