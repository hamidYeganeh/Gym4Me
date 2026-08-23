import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, type ClientSession } from 'mongoose';
import { CalendarResourceType, EntityStatus } from '../../common/enums';
import {
  ResourceCalendarBlock,
  type ResourceCalendarBlockDocument,
} from '../../schemas/resource-calendar-block.schema';

export type CalendarResourceRef = {
  type: CalendarResourceType;
  id: Types.ObjectId;
};

export type OverlappingCalendarBlock = {
  resource: CalendarResourceRef;
  window: { from: Date; to: Date };
};

@Injectable()
export class CalendarAvailabilityService {
  constructor(
    @InjectModel(ResourceCalendarBlock.name)
    private readonly blockModel: Model<ResourceCalendarBlockDocument>,
  ) {}

  /** Reject any half-open [from,to) window overlapping an active block. */
  async assertAvailable(
    resources: CalendarResourceRef[],
    from: Date,
    to: Date,
    session?: ClientSession,
  ): Promise<void> {
    const blocks = await this.findOverlappingBlocks(
      resources,
      from,
      to,
      session,
    );
    if (blocks.length) {
      throw new ConflictException(
        'Selected time conflicts with an active calendar block',
      );
    }
  }

  /** Bulk lookup used by availability projections to hide blocked inventory. */
  async findOverlappingBlocks(
    resources: CalendarResourceRef[],
    from: Date,
    to: Date,
    session?: ClientSession,
  ): Promise<OverlappingCalendarBlock[]> {
    const unique = new Map(
      resources.map((resource) => [
        `${resource.type}:${resource.id.toString()}`,
        resource,
      ]),
    );
    if (!unique.size) return [];

    const query = this.blockModel.find({
      status: EntityStatus.ACTIVE,
      'window.from': { $lt: to },
      'window.to': { $gt: from },
      $or: [...unique.values()].map((resource) => ({
        'resource.type': resource.type,
        'resource.id': resource.id,
      })),
    });
    if (session) query.session(session);
    const blocks = await query.select({ resource: 1, window: 1 }).lean().exec();
    return blocks.map((block) => ({
      resource: {
        type: block.resource.type,
        id: block.resource.id,
      },
      window: block.window,
    }));
  }
}
