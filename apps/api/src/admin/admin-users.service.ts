import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { QueryFilter } from 'mongoose';
import type { Request } from 'express';
import { AuditService } from '../audit/audit.service';
import { AuditAction, Role, UserStatus } from '../common/enums';
import {
  createSearchFilter,
  resolveListSort,
} from '../common/utils/list-query.util';
import {
  paginatedResult,
  resolvePageSize,
} from '../common/utils/pagination.util';
import { User, UserDocument } from '../schemas/user.schema';
import { UsersService } from '../users/users.service';
import { TokenService } from '../account/auth/token.service';
import { ProfileService } from '../account/profile/profile.service';
import {
  AdminCreateUserDto,
  AdminUpdateUserDto,
  ListUsersQueryDto,
  UpdateUserRolesDto,
  UpdateUserStatusDto,
} from './dto/admin.dto';

const USER_SORT_FIELDS = {
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  name: 'name.last',
  phone: 'phone',
  code: 'code',
  status: 'status',
  kycStatus: 'kycStatus',
} as const;

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly users: UsersService,
    private readonly tokens: TokenService,
    private readonly profiles: ProfileService,
    private readonly audit: AuditService,
  ) {}

  async list(query: ListUsersQueryDto) {
    const filter: QueryFilter<UserDocument> = {
      ...createSearchFilter(query.search, [
        'phone',
        'name.first',
        'name.last',
        'code',
        'referralCode',
        'nationalId',
      ]),
    };
    if (query.role) filter.roles = { $in: query.role };
    if (query.status) filter.status = { $in: query.status };
    if (query.kycStatus) filter.kycStatus = { $in: query.kycStatus };

    const { page, pageSize } = resolvePageSize(query);
    const sort = resolveListSort(query, USER_SORT_FIELDS, { createdAt: -1 });

    const [items, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      this.userModel.countDocuments(filter),
    ]);

    return paginatedResult(
      items.map((u) => this.users.toPublic(u, { revealNationalId: true })),
      total,
      page,
      pageSize,
    );
  }

  async get(id: string) {
    const user = await this.users.findById(id);
    return this.users.toPublic(user, { revealNationalId: true });
  }

  async create(dto: AdminCreateUserDto, adminId: string, request: Request) {
    const user = await this.users.create({
      phone: dto.phone,
      firstName: dto.firstName,
      lastName: dto.lastName,
      roles: dto.roles,
      password: dto.password,
    });

    this.audit.log({
      action: AuditAction.ADMIN_USER_CREATED,
      actorId: adminId,
      targetUserId: user._id,
      metadata: { roles: user.roles },
      request,
    });

    return this.users.toPublic(user, { revealNationalId: true });
  }

  async update(
    id: string,
    dto: AdminUpdateUserDto,
    adminId: string,
    request: Request,
  ) {
    const user = await this.users.findById(id);
    const changes: Record<string, unknown> = {};

    if (dto.firstName !== undefined && dto.firstName !== user.name?.first) {
      changes['name.first'] = {
        from: user.name?.first ?? null,
        to: dto.firstName,
      };
      user.name = { ...user.name, first: dto.firstName };
    }
    if (dto.lastName !== undefined && dto.lastName !== user.name?.last) {
      changes['name.last'] = {
        from: user.name?.last ?? null,
        to: dto.lastName,
      };
      user.name = { ...user.name, last: dto.lastName };
    }
    if (dto.nationalId !== undefined && dto.nationalId !== user.nationalId) {
      changes.nationalId = {
        from: user.nationalId ?? null,
        to: dto.nationalId,
      };
      user.nationalId = dto.nationalId;
    }

    if (Object.keys(changes).length) {
      user.markModified('name');
      await user.save();
      await this.users.refreshCodeIfAuto(user);
      this.audit.log({
        action: AuditAction.ADMIN_USER_UPDATED,
        actorId: adminId,
        targetUserId: user._id,
        metadata: { changes },
        request,
      });
    }

    return this.users.toPublic(user, { revealNationalId: true });
  }

  async updateStatus(
    id: string,
    dto: UpdateUserStatusDto,
    adminId: string,
    request: Request,
  ) {
    if (id === adminId) {
      throw new BadRequestException('You cannot change your own status');
    }
    const user = await this.users.findById(id);
    const from = user.status;
    user.status = dto.status;
    await user.save();

    // Blocked/deleted users lose all sessions immediately.
    if (dto.status !== UserStatus.ACTIVE) {
      await this.tokens.revokeAll(user._id);
    }

    this.audit.log({
      action:
        dto.status === UserStatus.DELETED
          ? AuditAction.ADMIN_USER_DELETED
          : AuditAction.ADMIN_USER_STATUS_CHANGED,
      actorId: adminId,
      targetUserId: user._id,
      metadata: { from, to: dto.status, reason: dto.reason },
      request,
    });

    return this.users.toPublic(user, { revealNationalId: true });
  }

  async updateRoles(
    id: string,
    dto: UpdateUserRolesDto,
    adminId: string,
    request: Request,
  ) {
    const user = await this.users.findById(id);
    const from = [...user.roles];
    user.roles = dto.roles;
    await user.save();

    // Drop sessions whose activeRole is no longer assigned.
    await this.tokens.revokeInvalidRoleSessions(user._id, user.roles);

    if (dto.roles.includes(Role.ATHLETE)) {
      await this.profiles.ensureAthleteProfile(id);
    }
    if (dto.roles.includes(Role.COACH)) {
      await this.profiles.ensureCoachProfile(id);
    }

    this.audit.log({
      action: AuditAction.ADMIN_USER_ROLES_CHANGED,
      actorId: adminId,
      targetUserId: user._id,
      metadata: { from, to: dto.roles },
      request,
    });

    return this.users.toPublic(user, { revealNationalId: true });
  }

  /** Soft delete: status → deleted, sessions revoked. Data is retained. */
  async remove(id: string, adminId: string, request: Request) {
    return this.updateStatus(
      id,
      { status: UserStatus.DELETED },
      adminId,
      request,
    );
  }
}
