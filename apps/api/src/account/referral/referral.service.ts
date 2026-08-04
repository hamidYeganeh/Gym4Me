import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { Request } from 'express';
import { EventWriterService } from '../../analytics/event-writer.service';
import { AuditService } from '../../audit/audit.service';
import {
  AnalyticsEventName,
  AuditAction,
  InviteStatus,
  Role,
} from '../../common/enums';
import { SmsService } from '../../common/sms/sms.service';
import { Invite, InviteDocument } from '../../schemas/invite.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { UsersService } from '../../users/users.service';

@Injectable()
export class ReferralService {
  constructor(
    @InjectModel(Invite.name)
    private readonly inviteModel: Model<InviteDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly users: UsersService,
    private readonly sms: SmsService,
    private readonly audit: AuditService,
    private readonly events: EventWriterService,
  ) {}

  /** Public pre-signup check. Only exposes non-sensitive referrer info. */
  async validate(code: string) {
    const referrer = await this.users.findByReferralCode(code);
    if (!referrer) throw new NotFoundException('Referral code not found');

    return {
      valid: true,
      referralCode: referrer.referralCode,
      referrer: {
        name: {
          first: referrer.name?.first ?? null,
          last: referrer.name?.last
            ? `${referrer.name.last[0]}…`
            : null,
        },
        code: referrer.code ?? null,
      },
    };
  }

  async myReferral(userId: string) {
    const user = await this.users.findById(userId);
    const [invitedCount, joinedViaInvite, joinedViaCode] = await Promise.all([
      this.inviteModel.countDocuments({ inviterId: user._id }),
      this.inviteModel.countDocuments({
        inviterId: user._id,
        status: InviteStatus.JOINED,
      }),
      this.userModel.countDocuments({ referredBy: user._id }),
    ]);

    return {
      referralCode: user.referralCode,
      stats: {
        invitesSent: invitedCount,
        invitesJoined: joinedViaInvite,
        totalReferred: joinedViaCode,
      },
    };
  }

  async invite(
    userId: string,
    phones: string[],
    request: Request,
    activeRole?: Role,
  ) {
    const inviter = await this.users.findById(userId);
    const inviterName =
      [inviter.name?.first, inviter.name?.last].filter(Boolean).join(' ') ||
      inviter.phone;

    const results: { phone: string; status: string }[] = [];

    for (const phone of new Set(phones)) {
      if (phone === inviter.phone) {
        results.push({ phone, status: 'skipped_self' });
        continue;
      }
      const existingUser = await this.userModel.exists({ phone });
      if (existingUser) {
        results.push({ phone, status: 'already_registered' });
        continue;
      }

      await this.inviteModel.updateOne(
        { inviterId: inviter._id, phone },
        { $setOnInsert: { inviterId: inviter._id, phone } },
        { upsert: true },
      );
      await this.sms.sendInvite(phone, inviterName, inviter.referralCode!);
      results.push({ phone, status: 'sent' });
    }

    this.audit.log({
      action: AuditAction.INVITE_SENT,
      actorId: inviter._id,
      metadata: { results },
      request,
    });

    const sentCount = results.filter((r) => r.status === 'sent').length;
    if (sentCount > 0) {
      await this.events.track({
        eventName: AnalyticsEventName.REFERRAL_INVITE_SENT,
        actor: { userId, activeRole },
        properties: { sentCount, results },
      });
    }

    return { results };
  }

  async myInvites(userId: string) {
    const items = await this.inviteModel
      .find({ inviterId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return {
      items: items.map((invite) => ({
        id: invite._id.toString(),
        phone: invite.phone,
        status: invite.status,
        joinedUserId: invite.joinedUserId?.toString() ?? null,
        createdAt: invite.createdAt,
      })),
    };
  }
}
