import { NotFoundException } from '@nestjs/common';
import { Types, type ClientSession } from 'mongoose';
import {
  ClubLifecycleStatus,
  ClubOperationalStatus,
  EntityStatus,
  SlotKind,
} from '../../common/enums';
import { ClubSlotsService } from './club-slots.service';

function query<T>(value: T) {
  const result = Promise.resolve(value) as Promise<T> & {
    session: jest.Mock;
  };
  result.session = jest.fn().mockReturnValue(result);
  return result;
}

describe('ClubSlotsService discovery supply visibility', () => {
  const clubId = new Types.ObjectId();
  const slotId = new Types.ObjectId();
  const classId = new Types.ObjectId();

  function setup(options?: {
    club?: object | null;
    linkedClass?: object | null;
    user?: object | null;
    profile?: object | null;
  }) {
    const club =
      options?.club === undefined
        ? {
            _id: clubId,
            review: { status: ClubLifecycleStatus.APPROVED },
            operationalStatus: ClubOperationalStatus.ACTIVE,
          }
        : options.club;
    const clubModel = {
      findOne: jest.fn().mockReturnValue(query(club)),
      findById: jest.fn().mockReturnValue(query(club)),
    };
    const classModel = {
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      }),
      findOne: jest.fn().mockReturnValue(query(options?.linkedClass ?? null)),
      findById: jest.fn().mockReturnValue(query(options?.linkedClass ?? null)),
    };
    const slot = {
      _id: slotId,
      clubId,
      kind: SlotKind.CLASS,
      classId,
      capacity: 5,
      price: 150_000,
      status: EntityStatus.ACTIVE,
      schedule: {
        recurrence: {
          type: 'once',
          date: '2026-09-01',
          startTime: '10:00',
          endTime: '11:00',
        },
        exceptions: [],
      },
    };
    const slotModel = {
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      }),
      findOne: jest.fn().mockReturnValue(query(slot)),
    };
    const spaceModel = { findOne: jest.fn().mockReturnValue(query(null)) };
    const coachProfileModel = {
      findOne: jest.fn().mockReturnValue(query(options?.profile ?? null)),
      find: jest.fn().mockReturnValue(query([])),
    };
    const userModel = {
      findOne: jest.fn().mockReturnValue(query(options?.user ?? null)),
      findById: jest.fn().mockReturnValue(query(options?.user ?? null)),
    };
    const service = new ClubSlotsService(
      clubModel as never,
      classModel as never,
      slotModel as never,
      spaceModel as never,
      coachProfileModel as never,
      {} as never,
      userModel as never,
      { toPublic: jest.fn() } as never,
      {} as never,
      { assertAvailable: jest.fn() } as never,
      {} as never,
    );
    return { service, clubModel, classModel, slotModel };
  }

  it('lists only active classes under an approved and active club', async () => {
    const { service, clubModel, classModel } = setup();

    await service.listDiscoveryClasses(clubId.toString());

    expect(clubModel.findOne).toHaveBeenCalledWith({
      _id: clubId,
      'review.status': ClubLifecycleStatus.APPROVED,
      operationalStatus: ClubOperationalStatus.ACTIVE,
    });
    expect(classModel.find).toHaveBeenCalledWith({
      clubId,
      status: EntityStatus.ACTIVE,
    });
  });

  it('does not expose supply for an inactive or unapproved club', async () => {
    const { service, classModel } = setup({ club: null });

    await expect(
      service.listDiscoveryClasses(clubId.toString()),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(classModel.find).not.toHaveBeenCalled();
  });

  it('rejects booking resolution when the linked class is inactive', async () => {
    const { service } = setup({ linkedClass: null });

    await expect(
      service.resolveBookableOccurrence(
        slotId.toString(),
        '2026-09-01',
        {} as ClientSession,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects booking resolution when the club becomes undiscoverable', async () => {
    const { service, classModel } = setup({ club: null });

    await expect(
      service.resolveBookableOccurrence(
        slotId.toString(),
        '2026-09-01',
        {} as ClientSession,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(classModel.findOne).not.toHaveBeenCalled();
  });
});
