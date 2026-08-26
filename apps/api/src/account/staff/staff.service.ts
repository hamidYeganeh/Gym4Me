import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, type QueryFilter } from 'mongoose';
import type { Request } from 'express';
import { AuditService } from '../../audit/audit.service';
import {
  AuditAction,
  ClubStaffStatus,
  Role,
  StaffPermissionKey,
  StaffRolePreset,
} from '../../common/enums';
import {
  paginatedResult,
  resolvePageSize,
} from '../../common/utils/pagination.util';
import { Club, ClubDocument } from '../../schemas/club.schema';
import { ClubStaff, ClubStaffDocument } from '../../schemas/club-staff.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import {
  ListStaffQueryDto,
  UpdateStaffPermissionsDto,
  UpsertStaffDto,
} from './dto/staff.dto';
import { PlatformEntitlementService } from '../memberships/application/services/platform-entitlement.service';
import { MongoTransactionService } from '../../common/mongo/mongo-transaction.service';

/** Default grants for named presets — final grants remain per-staff. */
export const STAFF_PRESET_PERMISSIONS: Record<
  StaffRolePreset,
  StaffPermissionKey[]
> = {
  [StaffRolePreset.RECEPTION]: [
    StaffPermissionKey.BOOKINGS_CREATE,
    StaffPermissionKey.BOOKINGS_READ,
    StaffPermissionKey.BOOKINGS_CHECKIN,
    StaffPermissionKey.MEMBERS_CHECKIN,
  ],
  [StaffRolePreset.ACCOUNTANT]: [
    StaffPermissionKey.FINANCE_READ,
    StaffPermissionKey.FINANCE_SETTLE,
    StaffPermissionKey.REPORTS_READ,
  ],
  [StaffRolePreset.MANAGER]: Object.values(StaffPermissionKey),
  [StaffRolePreset.CUSTOM]: [],
};

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(ClubStaff.name)
    private readonly staffModel: Model<ClubStaffDocument>,
    @InjectModel(Club.name)
    private readonly clubModel: Model<ClubDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly audit: AuditService,
    private readonly entitlements: PlatformEntitlementService,
    private readonly transactions: MongoTransactionService,
  ) {}

  /**
   * Owner of the club always passes. Active staff must hold `key` in
   * their grants array. Prefer StaffPermissionGuard on controllers.
   */
  async assertStaffPermission(
    clubId: string,
    userId: string,
    key: StaffPermissionKey,
  ): Promise<void> {
    const club = await this.findClubOrFail(clubId);
    if (club.ownerId.toString() === userId) return;

    const staff = await this.staffModel.findOne({
      clubId: club._id,
      userId: new Types.ObjectId(userId),
      status: ClubStaffStatus.ACTIVE,
    });
    if (!staff || !staff.permissions.includes(key)) {
      throw new ForbiddenException(`Missing staff permission: ${key}`);
    }
  }

  async requireOwnedClub(ownerId: string, clubId: string) {
    const club = await this.findClubOrFail(clubId);
    if (club.ownerId.toString() !== ownerId) {
      throw new ForbiddenException('Not your club');
    }
    return club;
  }

  /**
   * Owner or active staff for the club. Returns whether the actor is the
   * owner (implicit all permissions) or a staff row.
   */
  async requireClubAccess(userId: string, clubId: string) {
    const club = await this.findClubOrFail(clubId);
    if (club.ownerId.toString() === userId) {
      return { club, asOwner: true as const };
    }
    const staff = await this.staffModel.findOne({
      clubId: club._id,
      userId: new Types.ObjectId(userId),
      status: ClubStaffStatus.ACTIVE,
    });
    if (!staff) {
      throw new ForbiddenException('Not a member of this club staff');
    }
    return { club, asOwner: false as const, staff };
  }

  async list(clubId: string, query: ListStaffQueryDto) {
    const filter: QueryFilter<ClubStaffDocument> = {
      clubId: new Types.ObjectId(clubId),
    };
    if (query.status) filter.status = query.status;

    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.staffModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.staffModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((row) => this.toPublic(row)),
      total,
      page,
      pageSize,
    );
  }

  async upsert(
    ownerId: string,
    clubId: string,
    dto: UpsertStaffDto,
    request?: Request,
  ) {
    await this.requireOwnedClub(ownerId, clubId);
    const user = await this.userModel.findById(dto.userId);
    if (!user) throw new NotFoundException('User not found');

    const permissions = this.resolvePermissions(dto.preset, dto.permissions);
    const clubOid = new Types.ObjectId(clubId);
    const userOid = new Types.ObjectId(dto.userId);
    const now = new Date();

    const staff = await this.transactions.run(async (session) => {
      let current = await this.staffModel
        .findOne({ clubId: clubOid, userId: userOid })
        .session(session);
      const willActivate =
        (dto.status ?? ClubStaffStatus.ACTIVE) === ClubStaffStatus.ACTIVE &&
        (!current || current.status !== ClubStaffStatus.ACTIVE);
      if (willActivate) {
        await this.entitlements.serializeAndAssertIncrement({
          userId: ownerId,
          clubId,
          key: 'staff.active_per_club',
          session,
        });
      }

      if (!current) {
        current = new this.staffModel({
          clubId: clubOid,
          userId: userOid,
          status: dto.status ?? ClubStaffStatus.ACTIVE,
          preset: dto.preset,
          permissions,
          invitedAt: now,
          acceptedAt: now,
        });
      } else {
        current.preset = dto.preset;
        current.permissions = permissions;
        if (dto.status) {
          current.status = dto.status;
          current.revokedAt =
            dto.status === ClubStaffStatus.REVOKED ? now : undefined;
        } else if (current.status === ClubStaffStatus.REVOKED) {
          current.status = ClubStaffStatus.ACTIVE;
          current.revokedAt = undefined;
          current.invitedAt = current.invitedAt ?? now;
        }
      }
      await current.save({ session });
      return current;
    });

    await this.ensureClubStaffRole(user);

    this.audit.log({
      action: AuditAction.STAFF_MEMBER_UPSERTED,
      actorId: ownerId,
      targetUserId: dto.userId,
      metadata: {
        clubId,
        staffId: staff._id.toString(),
        preset: dto.preset,
        permissions,
      },
      request,
    });

    return this.toPublic(staff);
  }

  async updatePermissions(
    ownerId: string,
    clubId: string,
    staffId: string,
    dto: UpdateStaffPermissionsDto,
    request?: Request,
  ) {
    await this.requireOwnedClub(ownerId, clubId);
    const staff = await this.transactions.run(async (session) => {
      const current = await this.staffModel
        .findOne({
          _id: new Types.ObjectId(staffId),
          clubId: new Types.ObjectId(clubId),
        })
        .session(session);
      if (!current) throw new NotFoundException('Staff member not found');

      if (
        dto.status === ClubStaffStatus.ACTIVE &&
        current.status !== ClubStaffStatus.ACTIVE
      ) {
        await this.entitlements.serializeAndAssertIncrement({
          userId: ownerId,
          clubId,
          key: 'staff.active_per_club',
          session,
        });
      }
      if (dto.preset !== undefined) current.preset = dto.preset;
      if (dto.permissions !== undefined || dto.preset !== undefined) {
        current.permissions = this.resolvePermissions(
          current.preset,
          dto.permissions ?? current.permissions,
        );
      }
      if (dto.status !== undefined) {
        current.status = dto.status;
        current.revokedAt =
          dto.status === ClubStaffStatus.REVOKED ? new Date() : undefined;
      }
      await current.save({ session });
      return current;
    });

    this.audit.log({
      action: AuditAction.STAFF_MEMBER_UPSERTED,
      actorId: ownerId,
      targetUserId: staff.userId,
      metadata: {
        clubId,
        staffId,
        permissions: staff.permissions,
        status: staff.status,
      },
      request,
    });

    return this.toPublic(staff);
  }

  async revoke(
    ownerId: string,
    clubId: string,
    staffId: string,
    request?: Request,
  ) {
    await this.requireOwnedClub(ownerId, clubId);
    const staff = await this.findStaffOrFail(clubId, staffId);
    staff.status = ClubStaffStatus.REVOKED;
    staff.revokedAt = new Date();
    await staff.save();

    this.audit.log({
      action: AuditAction.STAFF_MEMBER_REVOKED,
      actorId: ownerId,
      targetUserId: staff.userId,
      metadata: { clubId, staffId },
      request,
    });

    return this.toPublic(staff);
  }

  private resolvePermissions(
    preset: StaffRolePreset,
    explicit?: StaffPermissionKey[],
  ): StaffPermissionKey[] {
    if (explicit !== undefined) {
      return [...new Set(explicit)];
    }
    if (preset === StaffRolePreset.CUSTOM) {
      throw new BadRequestException(
        'Custom preset requires an explicit permissions list',
      );
    }
    return [...STAFF_PRESET_PERMISSIONS[preset]];
  }

  private async ensureClubStaffRole(user: UserDocument) {
    if (!user.roles.includes(Role.CLUB_STAFF)) {
      user.roles.push(Role.CLUB_STAFF);
      await user.save();
    }
  }

  private async findStaffOrFail(clubId: string, staffId: string) {
    if (!Types.ObjectId.isValid(staffId)) {
      throw new NotFoundException('Staff member not found');
    }
    const staff = await this.staffModel.findOne({
      _id: new Types.ObjectId(staffId),
      clubId: new Types.ObjectId(clubId),
    });
    if (!staff) throw new NotFoundException('Staff member not found');
    return staff;
  }

  private async findClubOrFail(clubId: string): Promise<ClubDocument> {
    if (!Types.ObjectId.isValid(clubId)) {
      throw new NotFoundException('Club not found');
    }
    const club = await this.clubModel.findById(clubId);
    if (!club) throw new NotFoundException('Club not found');
    return club;
  }

  toPublic(doc: ClubStaffDocument | Record<string, unknown>) {
    const row = doc as ClubStaffDocument;
    return {
      id: row._id.toString(),
      clubId: row.clubId.toString(),
      userId: row.userId.toString(),
      status: row.status,
      preset: row.preset,
      permissions: row.permissions,
      invitedAt: row.invitedAt ?? null,
      acceptedAt: row.acceptedAt ?? null,
      revokedAt: row.revokedAt ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

/** Standalone helper re-export shape for guards / other modules. */
export async function assertStaffPermission(
  staffService: StaffService,
  clubId: string,
  userId: string,
  key: StaffPermissionKey,
): Promise<void> {
  return staffService.assertStaffPermission(clubId, userId, key);
}
