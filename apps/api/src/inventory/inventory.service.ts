import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createHash } from 'node:crypto';
import { Model, Types, type QueryFilter } from 'mongoose';
import { MongoTransactionService } from '../common/mongo/mongo-transaction.service';
import {
  paginatedResult,
  resolvePageSize,
} from '../common/utils/pagination.util';
import { OutboxService } from '../outbox/outbox.service';
import {
  ClubInventoryItem,
  ClubInventoryItemDocument,
  ClubInventoryStatus,
} from '../schemas/club-inventory-item.schema';
import { Club, ClubDocument } from '../schemas/club.schema';
import {
  CreateInventoryItemDto,
  ListInventoryQueryDto,
  UpdateInventoryItemDto,
} from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(ClubInventoryItem.name)
    private readonly items: Model<ClubInventoryItemDocument>,
    @InjectModel(Club.name) private readonly clubs: Model<ClubDocument>,
    private readonly transactions: MongoTransactionService,
    private readonly outbox: OutboxService,
  ) {}

  async list(ownerId: string, clubId: string, query: ListInventoryQueryDto) {
    await this.requireOwner(ownerId, clubId);
    const filter: QueryFilter<ClubInventoryItemDocument> = {
      clubId: this.oid(clubId),
      status: query.status ?? ClubInventoryStatus.ACTIVE,
    };
    if (query.condition) filter.condition = query.condition;
    const { page, pageSize } = resolvePageSize(query);
    const [rows, total] = await Promise.all([
      this.items
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.items.countDocuments(filter),
    ]);
    return paginatedResult(
      rows.map((row) => this.project(row)),
      total,
      page,
      pageSize,
    );
  }

  async create(ownerId: string, clubId: string, dto: CreateInventoryItemDto) {
    const fingerprint = this.fingerprint(dto);
    try {
      return await this.transactions.run(async (session) => {
        await this.requireOwner(ownerId, clubId, session);
        const existing = await this.items
          .findOne({
            clubId: this.oid(clubId),
            createIdempotencyKey: dto.idempotencyKey,
          })
          .session(session)
          .lean();
        if (existing) {
          if (existing.createFingerprint !== fingerprint) {
            throw new ConflictException('Idempotency key payload mismatch');
          }
          return this.project(existing);
        }
        const [item] = await this.items.create(
          [
            {
              clubId: this.oid(clubId),
              name: dto.name.trim(),
              quantity: dto.quantity,
              locationLabel: dto.locationLabel?.trim(),
              condition: dto.condition,
              nextServiceAt: dto.nextServiceAt
                ? new Date(dto.nextServiceAt)
                : undefined,
              maintenanceNote: dto.maintenanceNote?.trim(),
              createdBy: this.oid(ownerId),
              updatedBy: this.oid(ownerId),
              createIdempotencyKey: dto.idempotencyKey,
              createFingerprint: fingerprint,
            },
          ],
          { session },
        );
        await this.outbox.enqueue(
          {
            eventName: 'inventory.item_created',
            idempotencyKey: `inventory:create:${clubId}:${dto.idempotencyKey}`,
            payload: { clubId, itemId: item._id.toString(), actorId: ownerId },
          },
          session,
        );
        return this.project(item.toObject());
      });
    } catch (error: unknown) {
      if (!this.isDuplicateKey(error)) throw error;
      const winner = await this.items
        .findOne({
          clubId: this.oid(clubId),
          createIdempotencyKey: dto.idempotencyKey,
        })
        .lean();
      if (!winner) throw error;
      if (winner.createFingerprint !== fingerprint) {
        throw new ConflictException('Idempotency key payload mismatch');
      }
      return this.project(winner);
    }
  }

  async update(
    ownerId: string,
    clubId: string,
    itemId: string,
    dto: UpdateInventoryItemDto,
  ) {
    return this.transactions.run(async (session) => {
      await this.requireOwner(ownerId, clubId, session);
      const set: Record<string, unknown> = { updatedBy: this.oid(ownerId) };
      const unset: Record<string, 1> = {};
      if (dto.name !== undefined) set.name = dto.name.trim();
      if (dto.quantity !== undefined) set.quantity = dto.quantity;
      if (dto.locationLabel !== undefined)
        set.locationLabel = dto.locationLabel.trim();
      if (dto.condition !== undefined) set.condition = dto.condition;
      if (dto.nextServiceAt === null) unset.nextServiceAt = 1;
      else if (dto.nextServiceAt !== undefined)
        set.nextServiceAt = new Date(dto.nextServiceAt);
      if (dto.maintenanceNote !== undefined)
        set.maintenanceNote = dto.maintenanceNote.trim();
      const item = await this.items.findOneAndUpdate(
        {
          _id: this.oid(itemId),
          clubId: this.oid(clubId),
          status: ClubInventoryStatus.ACTIVE,
          version: dto.expectedVersion,
        },
        {
          $set: set,
          ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}),
          $inc: { version: 1 },
        },
        { new: true, session },
      );
      if (!item) {
        const exists = await this.items
          .exists({ _id: this.oid(itemId), clubId: this.oid(clubId) })
          .session(session);
        if (!exists) throw new NotFoundException('Inventory item not found');
        throw new ConflictException('Inventory item changed; reload and retry');
      }
      await this.outbox.enqueue(
        {
          eventName: 'inventory.item_updated',
          idempotencyKey: `inventory:update:${itemId}:${item.version}`,
          payload: { clubId, itemId, actorId: ownerId, version: item.version },
        },
        session,
      );
      return this.project(item.toObject());
    });
  }

  async archive(
    ownerId: string,
    clubId: string,
    itemId: string,
    expectedVersion: number,
  ) {
    return this.transactions.run(async (session) => {
      await this.requireOwner(ownerId, clubId, session);
      const item = await this.items.findOneAndUpdate(
        {
          _id: this.oid(itemId),
          clubId: this.oid(clubId),
          status: ClubInventoryStatus.ACTIVE,
          version: expectedVersion,
        },
        {
          $set: {
            status: ClubInventoryStatus.ARCHIVED,
            updatedBy: this.oid(ownerId),
          },
          $inc: { version: 1 },
        },
        { new: true, session },
      );
      if (!item)
        throw new ConflictException('Inventory item changed or was archived');
      await this.outbox.enqueue(
        {
          eventName: 'inventory.item_archived',
          idempotencyKey: `inventory:archive:${itemId}:${item.version}`,
          payload: { clubId, itemId, actorId: ownerId, version: item.version },
        },
        session,
      );
      return this.project(item.toObject());
    });
  }

  private async requireOwner(
    ownerId: string,
    clubId: string,
    session?: import('mongoose').ClientSession,
  ) {
    const club = await this.clubs
      .exists({ _id: this.oid(clubId), ownerId: this.oid(ownerId) })
      .session(session ?? null);
    if (!club) throw new ForbiddenException('Club ownership required');
  }

  private oid(value: string) {
    if (!Types.ObjectId.isValid(value))
      throw new NotFoundException('Resource not found');
    return new Types.ObjectId(value);
  }

  private isDuplicateKey(error: unknown): error is { code: 11000 } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    );
  }

  private fingerprint(dto: CreateInventoryItemDto) {
    return createHash('sha256')
      .update(
        JSON.stringify({
          name: dto.name.trim(),
          quantity: dto.quantity,
          locationLabel: dto.locationLabel?.trim() ?? null,
          condition: dto.condition ?? 'good',
          nextServiceAt: dto.nextServiceAt ?? null,
          maintenanceNote: dto.maintenanceNote?.trim() ?? null,
        }),
      )
      .digest('hex');
  }

  private project(item: {
    _id: Types.ObjectId;
    clubId: Types.ObjectId;
    name: string;
    quantity: number;
    locationLabel?: string;
    condition: string;
    nextServiceAt?: Date;
    maintenanceNote?: string;
    status: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: item._id.toString(),
      clubId: item.clubId.toString(),
      name: item.name,
      quantity: item.quantity,
      locationLabel: item.locationLabel ?? null,
      condition: item.condition,
      nextServiceAt: item.nextServiceAt?.toISOString?.() ?? null,
      maintenanceNote: item.maintenanceNote ?? null,
      status: item.status,
      version: item.version,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
