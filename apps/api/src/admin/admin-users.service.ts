import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { QueryFilter } from 'mongoose';
import type { Request } from 'express';
import { AuditService } from '../audit/audit.service';
import { AuditAction, UserStatus } from '../common/enums';
import { User, UserDocument } from '../schemas/user.schema';
import { UsersService } from '../users/users.service';
import { TokenService } from '../account/auth/token.service';
import {
  AdminCreateUserDto,
  AdminUpdateUserDto,
  ListUsersQueryDto,
  UpdateUserRolesDto,
  UpdateUserStatusDto,
} from './dto/admin.dto';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly users: UsersService,
    private readonly tokens: TokenService,
    private readonly audit: AuditService,
  ) {}

  async list(query: ListUsersQueryDto) {
    const filter: QueryFilter<UserDocument> = {};
    if (query.role) filter.roles = query.role;
    if (query.status) filter.status = query.status;
    if (query.kycStatus) filter.kycStatus = query.kycStatus;
    if (query.search) {
      const rx = new RegExp(escapeRegex(query.search.trim()), 'i');
      filter.$or = [
        { phone: rx },
        { firstName: rx },
        { lastName: rx },
        { code: rx },
        { referralCode: rx },
        { nationalId: rx },
      ];
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [items, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.userModel.countDocuments(filter),
    ]);

    return {
      items: items.map((u) => this.users.toPublic(u)),
      total,
      page,
      limit,
    };
  }

  async get(id: string) {
    const user = await this.users.findById(id);
    return this.users.toPublic(user);
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

    return this.users.toPublic(user);
  }

  async update(
    id: string,
    dto: AdminUpdateUserDto,
    adminId: string,
    request: Request,
  ) {
    const user = await this.users.findById(id);
    const changes: Record<string, unknown> = {};

    for (const key of ['firstName', 'lastName', 'nationalId'] as const) {
      if (dto[key] !== undefined && dto[key] !== user[key]) {
        changes[key] = { from: user[key] ?? null, to: dto[key] };
        user[key] = dto[key];
      }
    }

    if (Object.keys(changes).length) {
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

    return this.users.toPublic(user);
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

    return this.users.toPublic(user);
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

    this.audit.log({
      action: AuditAction.ADMIN_USER_ROLES_CHANGED,
      actorId: adminId,
      targetUserId: user._id,
      metadata: { from, to: dto.roles },
      request,
    });

    return this.users.toPublic(user);
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
