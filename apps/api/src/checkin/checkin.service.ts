import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, type QueryFilter } from 'mongoose';
import type { Request } from 'express';
import { AuditService } from '../audit/audit.service';
import {
  AuditAction,
  BookingStatus,
  CheckInMethod,
  CheckInSyncMode,
  StaffPermissionKey,
} from '../common/enums';
import {
  paginatedResult,
  resolvePageSize,
} from '../common/utils/pagination.util';
import { Booking, BookingDocument } from '../schemas/booking.schema';
import { CheckIn, CheckInDocument } from '../schemas/check-in.schema';
import { StaffService } from '../account/staff/staff.service';
import {
  CheckInByBookingCodeDto,
  CheckInByMembershipDto,
  ListCheckInsQueryDto,
  OfflineCheckInItemDto,
  SyncOfflineBatchDto,
} from './dto/checkin.dto';

@Injectable()
export class CheckinService {
  constructor(
    @InjectModel(CheckIn.name)
    private readonly checkInModel: Model<CheckInDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    private readonly staff: StaffService,
    private readonly audit: AuditService,
  ) {}

  async assertDeskAccess(clubId: string, actorId: string) {
    await this.staff.requireClubAccess(actorId, clubId);
    await this.staff.assertStaffPermission(
      clubId,
      actorId,
      StaffPermissionKey.BOOKINGS_CHECKIN,
    );
  }

  async assertListAccess(clubId: string, actorId: string) {
    await this.staff.requireClubAccess(actorId, clubId);
    await this.staff.assertStaffPermission(
      clubId,
      actorId,
      StaffPermissionKey.BOOKINGS_READ,
    );
  }

  async assertMembersCheckin(clubId: string, actorId: string) {
    await this.staff.requireClubAccess(actorId, clubId);
    await this.staff.assertStaffPermission(
      clubId,
      actorId,
      StaffPermissionKey.MEMBERS_CHECKIN,
    );
  }

  async checkInByBookingCode(
    clubId: string,
    actorId: string,
    dto: CheckInByBookingCodeDto,
    request?: Request,
  ) {
    await this.assertDeskAccess(clubId, actorId);

    if (dto.clientIdempotencyKey) {
      const existing = await this.findByIdempotencyKey(
        dto.clientIdempotencyKey,
      );
      if (existing) return this.toPublic(existing);
    }

    const booking = await this.bookingModel.findOne({
      code: dto.code.trim(),
      clubId: new Types.ObjectId(clubId),
    });
    if (!booking) throw new NotFoundException('Booking not found');

    return this.recordBookingCheckIn({
      booking,
      clubId,
      actorId,
      method: dto.method ?? CheckInMethod.QR,
      syncMode: CheckInSyncMode.ONLINE,
      clientIdempotencyKey: dto.clientIdempotencyKey,
      occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : new Date(),
      request,
    });
  }

  async checkInByMembership(
    clubId: string,
    actorId: string,
    dto: CheckInByMembershipDto,
    request?: Request,
  ) {
    await this.assertMembersCheckin(clubId, actorId);

    if (dto.clientIdempotencyKey) {
      const existing = await this.findByIdempotencyKey(
        dto.clientIdempotencyKey,
      );
      if (existing) return this.toPublic(existing);
    }

    const doc = await this.checkInModel.create({
      clubId: new Types.ObjectId(clubId),
      membershipId: new Types.ObjectId(dto.membershipId),
      userId: new Types.ObjectId(dto.userId),
      method: dto.method ?? CheckInMethod.MANUAL,
      sync: {
        mode: CheckInSyncMode.ONLINE,
        clientIdempotencyKey: dto.clientIdempotencyKey,
        reconciledAt: new Date(),
      },
      recordedBy: new Types.ObjectId(actorId),
      occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : new Date(),
    });

    this.audit.log({
      action: AuditAction.CHECKIN_RECORDED,
      actorId,
      targetUserId: dto.userId,
      metadata: {
        clubId,
        checkInId: doc._id.toString(),
        membershipId: dto.membershipId,
        method: doc.method,
      },
      request,
    });

    return this.toPublic(doc);
  }

  async syncOfflineBatch(
    clubId: string,
    actorId: string,
    dto: SyncOfflineBatchDto,
    request?: Request,
  ) {
    await this.staff.requireClubAccess(actorId, clubId);

    const results: Array<{
      clientIdempotencyKey: string;
      status: 'created' | 'duplicate' | 'error';
      checkIn?: ReturnType<CheckinService['toPublic']>;
      error?: string;
    }> = [];

    for (const item of dto.items) {
      try {
        const outcome = await this.syncOneOfflineItem(
          clubId,
          actorId,
          item,
          request,
        );
        results.push(outcome);
      } catch (err) {
        results.push({
          clientIdempotencyKey: item.clientIdempotencyKey,
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return { items: results };
  }

  async listForClub(clubId: string, query: ListCheckInsQueryDto) {
    const filter: QueryFilter<CheckInDocument> = {
      clubId: new Types.ObjectId(clubId),
    };
    if (query.userId) filter.userId = new Types.ObjectId(query.userId);
    if (query.bookingId) {
      filter.bookingId = new Types.ObjectId(query.bookingId);
    }
    if (query.from || query.to) {
      filter.occurredAt = {};
      if (query.from) {
        (filter.occurredAt as Record<string, Date>).$gte = new Date(
          query.from,
        );
      }
      if (query.to) {
        (filter.occurredAt as Record<string, Date>).$lte = new Date(query.to);
      }
    }

    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.checkInModel
        .find(filter)
        .sort({ occurredAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.checkInModel.countDocuments(filter),
    ]);

    return paginatedResult(
      items.map((row) => this.toPublic(row as CheckInDocument)),
      total,
      page,
      pageSize,
    );
  }

  async listMine(userId: string, query: ListCheckInsQueryDto) {
    const filter: QueryFilter<CheckInDocument> = {
      userId: new Types.ObjectId(userId),
    };
    if (query.from || query.to) {
      filter.occurredAt = {};
      if (query.from) {
        (filter.occurredAt as Record<string, Date>).$gte = new Date(
          query.from,
        );
      }
      if (query.to) {
        (filter.occurredAt as Record<string, Date>).$lte = new Date(query.to);
      }
    }

    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.checkInModel
        .find(filter)
        .sort({ occurredAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.checkInModel.countDocuments(filter),
    ]);

    return paginatedResult(
      items.map((row) => this.toPublic(row as CheckInDocument)),
      total,
      page,
      pageSize,
    );
  }

  private async syncOneOfflineItem(
    clubId: string,
    actorId: string,
    item: OfflineCheckInItemDto,
    request?: Request,
  ) {
    const existing = await this.findByIdempotencyKey(
      item.clientIdempotencyKey,
    );
    if (existing) {
      return {
        clientIdempotencyKey: item.clientIdempotencyKey,
        status: 'duplicate' as const,
        checkIn: this.toPublic(existing),
      };
    }

    if (item.bookingCode) {
      await this.staff.assertStaffPermission(
        clubId,
        actorId,
        StaffPermissionKey.BOOKINGS_CHECKIN,
      );
      const booking = await this.bookingModel.findOne({
        code: item.bookingCode.trim(),
        clubId: new Types.ObjectId(clubId),
      });
      if (!booking) throw new NotFoundException('Booking not found');

      const checkIn = await this.recordBookingCheckIn({
        booking,
        clubId,
        actorId,
        method: item.method,
        syncMode: CheckInSyncMode.OFFLINE,
        clientIdempotencyKey: item.clientIdempotencyKey,
        occurredAt: new Date(item.occurredAt),
        request,
      });
      return {
        clientIdempotencyKey: item.clientIdempotencyKey,
        status: 'created' as const,
        checkIn,
      };
    }

    if (item.membershipId && item.userId) {
      await this.staff.assertStaffPermission(
        clubId,
        actorId,
        StaffPermissionKey.MEMBERS_CHECKIN,
      );
      const doc = await this.checkInModel.create({
        clubId: new Types.ObjectId(clubId),
        membershipId: new Types.ObjectId(item.membershipId),
        userId: new Types.ObjectId(item.userId),
        method: item.method,
        sync: {
          mode: CheckInSyncMode.OFFLINE,
          clientIdempotencyKey: item.clientIdempotencyKey,
          reconciledAt: new Date(),
        },
        recordedBy: new Types.ObjectId(actorId),
        occurredAt: new Date(item.occurredAt),
      });
      this.audit.log({
        action: AuditAction.CHECKIN_RECORDED,
        actorId,
        targetUserId: item.userId,
        metadata: {
          clubId,
          checkInId: doc._id.toString(),
          membershipId: item.membershipId,
          offline: true,
        },
        request,
      });
      return {
        clientIdempotencyKey: item.clientIdempotencyKey,
        status: 'created' as const,
        checkIn: this.toPublic(doc),
      };
    }

    throw new BadRequestException(
      'Each offline item needs bookingCode or membershipId+userId',
    );
  }

  private async recordBookingCheckIn(args: {
    booking: BookingDocument;
    clubId: string;
    actorId: string;
    method: CheckInMethod;
    syncMode: CheckInSyncMode;
    clientIdempotencyKey?: string;
    occurredAt: Date;
    request?: Request;
  }) {
    const {
      booking,
      clubId,
      actorId,
      method,
      syncMode,
      clientIdempotencyKey,
      occurredAt,
      request,
    } = args;

    if (
      booking.status !== BookingStatus.CONFIRMED &&
      booking.status !== BookingStatus.CHECKED_IN
    ) {
      throw new ConflictException(
        `Cannot check in booking in status "${booking.status}"`,
      );
    }

    if (clientIdempotencyKey) {
      const raced = await this.findByIdempotencyKey(clientIdempotencyKey);
      if (raced) return this.toPublic(raced);
    }

    let doc: CheckInDocument;
    try {
      doc = await this.checkInModel.create({
        clubId: new Types.ObjectId(clubId),
        bookingId: booking._id,
        userId: booking.athleteId,
        method,
        sync: {
          mode: syncMode,
          clientIdempotencyKey,
          reconciledAt: new Date(),
        },
        recordedBy: new Types.ObjectId(actorId),
        occurredAt,
      });
    } catch (err: unknown) {
      if (this.isDuplicateKey(err) && clientIdempotencyKey) {
        const existing = await this.findByIdempotencyKey(clientIdempotencyKey);
        if (existing) return this.toPublic(existing);
      }
      throw err;
    }

    if (booking.status === BookingStatus.CONFIRMED) {
      booking.status = BookingStatus.CHECKED_IN;
      await booking.save();
    }

    this.audit.log({
      action: AuditAction.CHECKIN_RECORDED,
      actorId,
      targetUserId: booking.athleteId,
      metadata: {
        clubId,
        checkInId: doc._id.toString(),
        bookingId: booking._id.toString(),
        method,
        syncMode,
      },
      request,
    });

    return this.toPublic(doc);
  }

  private async findByIdempotencyKey(key: string) {
    return this.checkInModel.findOne({
      'sync.clientIdempotencyKey': key,
    });
  }

  private isDuplicateKey(err: unknown): boolean {
    return (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: number }).code === 11000
    );
  }

  toPublic(doc: CheckInDocument | Record<string, unknown>) {
    const row = doc as CheckInDocument;
    return {
      id: row._id.toString(),
      clubId: row.clubId?.toString() ?? null,
      bookingId: row.bookingId?.toString() ?? null,
      membershipId: row.membershipId?.toString() ?? null,
      userId: row.userId.toString(),
      method: row.method,
      sync: {
        mode: row.sync.mode,
        reconciledAt: row.sync.reconciledAt ?? null,
        clientIdempotencyKey: row.sync.clientIdempotencyKey ?? null,
      },
      recordedBy: row.recordedBy?.toString() ?? null,
      occurredAt: row.occurredAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
