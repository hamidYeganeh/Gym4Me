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
import {
  ClubStaff,
  ClubStaffDocument,
} from '../../schemas/club-staff.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import {
  ListStaffQueryDto,
  UpdateStaffPermissionsDto,
  UpsertStaffDto,
} from './dto/staff.dto';

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
  ) {}

  /**
   * Owner of the club always passes. Active staff must hold `key` in
   * their grants array. Full StaffPermissionGuard can wrap this later.
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

    let staff = await this.staffModel.findOne({
      clubId: clubOid,
      userId: userOid,
    });

    if (staff) {
      staff.preset = dto.preset;
      staff.permissions = permissions;
      if (dto.status) {
        staff.status = dto.status;
        if (dto.status === ClubStaffStatus.REVOKED) {
          staff.revokedAt = now;
        } else if (dto.status === ClubStaffStatus.ACTIVE) {
          staff.revokedAt = undefined;
        }
      } else if (staff.status === ClubStaffStatus.REVOKED) {
        staff.status = ClubStaffStatus.ACTIVE;
        staff.revokedAt = undefined;
        staff.invitedAt = staff.invitedAt ?? now;
      }
      await staff.save();
    } else {
      staff = await this.staffModel.create({
        clubId: clubOid,
        userId: userOid,
        status: dto.status ?? ClubStaffStatus.ACTIVE,
        preset: dto.preset,
        permissions,
        invitedAt: now,
        acceptedAt: now,
      });
    }

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
    const staff = await this.findStaffOrFail(clubId, staffId);

    if (dto.preset !== undefined) staff.preset = dto.preset;
    if (dto.permissions !== undefined || dto.preset !== undefined) {
      staff.permissions = this.resolvePermissions(
        staff.preset,
        dto.permissions ?? staff.permissions,
      );
    }
    if (dto.status !== undefined) {
      staff.status = dto.status;
      if (dto.status === ClubStaffStatus.REVOKED) {
        staff.revokedAt = new Date();
      } else if (dto.status === ClubStaffStatus.ACTIVE) {
        staff.revokedAt = undefined;
      }
    }
    await staff.save();

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
