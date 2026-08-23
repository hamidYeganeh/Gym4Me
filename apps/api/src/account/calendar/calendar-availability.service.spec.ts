import { ConflictException } from '@nestjs/common';
import type { ClientSession } from 'mongoose';
import { Types } from 'mongoose';
import { CalendarResourceType } from '../../common/enums';
import { CalendarAvailabilityService } from './calendar-availability.service';

describe('CalendarAvailabilityService', () => {
  const from = new Date('2026-09-01T08:00:00.000Z');
  const to = new Date('2026-09-01T09:00:00.000Z');
  const coachId = new Types.ObjectId();

  function setup(rows: unknown[]) {
    const query = {
      session: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(rows),
    };
    const blockModel = { find: jest.fn().mockReturnValue(query) };
    return {
      blockModel,
      query,
      service: new CalendarAvailabilityService(blockModel as never),
    };
  }

  it('rejects an effective window that overlaps an active resource block', async () => {
    const { service } = setup([
      {
        resource: { type: CalendarResourceType.COACH, id: coachId },
        window: { from, to },
      },
    ]);

    await expect(
      service.assertAvailable(
        [{ type: CalendarResourceType.COACH, id: coachId }],
        from,
        to,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('deduplicates resources and keeps the transaction session', async () => {
    const { blockModel, query, service } = setup([]);
    const session = {} as ClientSession;
    const resource = { type: CalendarResourceType.COACH, id: coachId };

    await expect(
      service.findOverlappingBlocks([resource, resource], from, to, session),
    ).resolves.toEqual([]);

    expect(query.session).toHaveBeenCalledWith(session);
    expect(blockModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: [
          {
            'resource.type': CalendarResourceType.COACH,
            'resource.id': coachId,
          },
        ],
      }),
    );
  });
});
