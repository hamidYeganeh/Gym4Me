import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { EventWriterService } from '../../analytics/event-writer.service';
import { AuditService } from '../../audit/audit.service';
import { AnalyticsEventName, AuditAction, Role } from '../../common/enums';
import type { JwtUser } from '../../common/types';
import { UsersService } from '../../users/users.service';
import { ProfileService } from '../profile/profile.service';

const SELF_APPLICABLE_ROLES: Role[] = [Role.COACH, Role.CLUB_OWNER];

@Injectable()
export class RoleMembershipService {
  constructor(
    private readonly users: UsersService,
    private readonly profiles: ProfileService,
    private readonly audit: AuditService,
    private readonly events: EventWriterService,
  ) {}

  /**
   * Self-service role apply (coach / club_owner). Admin grants other roles.
   * Creates the matching profile shell idempotently.
   */
  async applyRole(jwt: JwtUser, role: Role, request: Request) {
    if (!SELF_APPLICABLE_ROLES.includes(role)) {
      throw new BadRequestException(
        `Role "${role}" cannot be self-applied; contact support/admin`,
      );
    }

    const user = await this.users.findById(jwt.sub);
    if (user.roles.includes(role)) {
      throw new ConflictException(`You already have the "${role}" role`);
    }

    user.roles = [...user.roles, role];
    await user.save();

    if (role === Role.COACH) {
      await this.profiles.ensureCoachProfile(jwt.sub);
    }

    this.audit.log({
      action: AuditAction.ROLE_APPLIED,
      actorId: jwt.sub,
      targetUserId: jwt.sub,
      metadata: { role },
      request,
    });

    await this.events.track({
      eventName: AnalyticsEventName.ROLE_APPLIED,
      actor: { userId: jwt.sub, activeRole: jwt.activeRole },
      properties: { role },
    });

    return {
      roles: user.roles,
      applied: role,
      user: this.users.toPublic(user),
    };
  }
}
