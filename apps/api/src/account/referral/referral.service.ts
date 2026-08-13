import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { Request } from 'express';
import { EventWriterService } from '../../analytics/event-writer.service';
import { AuditService } from '../../audit/audit.service';
import {
  AnalyticsEventName,
  AuditAction,
  InviteStatus,
  PaymentChannel,
  ReferralQualifyTrigger,
  ReferralRewardStatus,
  Role,
} from '../../common/enums';
import { SmsService } from '../../common/sms/sms.service';
import { FinanceService } from '../../finance/finance.service';
import { Invite, InviteDocument } from '../../schemas/invite.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { UsersService } from '../../users/users.service';

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);

  constructor(
    @InjectModel(Invite.name)
    private readonly inviteModel: Model<InviteDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly users: UsersService,
    private readonly sms: SmsService,
    private readonly audit: AuditService,
    private readonly events: EventWriterService,
    private readonly finance: FinanceService,
    private readonly config: ConfigService,
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
        {
          $setOnInsert: {
            inviterId: inviter._id,
            phone,
            reward: { status: ReferralRewardStatus.PENDING },
          },
        },
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
        reward: {
          status: invite.reward?.status ?? ReferralRewardStatus.PENDING,
          trigger: invite.reward?.trigger ?? null,
          qualifiedAt: invite.reward?.qualifiedAt ?? null,
        },
        createdAt: invite.createdAt,
      })),
    };
  }

  /**
   * First qualifying conversion for a referred user (payment or check-in).
   * Dual wallet credits with idempotent keys `referral:{inviteId}:inviter|invitee`.
   */
  async qualifyReferral(
    userId: string,
    trigger: 'payment' | 'checkin',
  ): Promise<{ qualified: boolean; inviteId?: string }> {
    const user = await this.userModel.findById(userId);
    if (!user?.referredBy) {
      return { qualified: false };
    }
    if (user.referredBy.toString() === userId) {
      return { qualified: false };
    }

    let invite = await this.inviteModel.findOne({
      joinedUserId: user._id,
      inviterId: user.referredBy,
    });
    if (!invite) {
      // Code-only referral without prior invite SMS — materialize a joined row.
      invite = await this.inviteModel.findOneAndUpdate(
        { inviterId: user.referredBy, phone: user.phone },
        {
          $set: {
            status: InviteStatus.JOINED,
            joinedUserId: user._id,
          },
          $setOnInsert: {
            inviterId: user.referredBy,
            phone: user.phone,
            reward: { status: ReferralRewardStatus.PENDING },
          },
        },
        { upsert: true, new: true },
      );
    }

    if (!invite) return { qualified: false };

    const rewardStatus =
      invite.reward?.status ?? ReferralRewardStatus.PENDING;
    if (
      rewardStatus === ReferralRewardStatus.QUALIFIED ||
      rewardStatus === ReferralRewardStatus.CLAWED_BACK
    ) {
      return { qualified: false, inviteId: invite._id.toString() };
    }

    const amount = Math.max(
      0,
      Number(this.config.get<string>('REFERRAL_REWARD_AMOUNT') ?? 50_000),
    );
    const inviteId = invite._id.toString();
    const qualifyTrigger =
      trigger === 'payment'
        ? ReferralQualifyTrigger.PAYMENT
        : ReferralQualifyTrigger.CHECKIN;

    if (amount > 0) {
      const inviterId = invite.inviterId.toString();
      await this.finance.topUpWallet(inviterId, {
        amount,
        channel: PaymentChannel.CASH,
        idempotencyKey: `referral:${inviteId}:inviter`,
        orderId: `referral-inviter-${inviteId}`,
      });
      await this.finance.topUpWallet(userId, {
        amount,
        channel: PaymentChannel.CASH,
        idempotencyKey: `referral:${inviteId}:invitee`,
        orderId: `referral-invitee-${inviteId}`,
      });
    }

    invite.reward = {
      status: ReferralRewardStatus.QUALIFIED,
      trigger: qualifyTrigger,
      qualifiedAt: new Date(),
    };
    invite.markModified('reward');
    await invite.save();

    this.audit.log({
      action: AuditAction.REFERRAL_JOINED,
      actorId: userId,
      targetUserId: invite.inviterId,
      metadata: {
        inviteId,
        trigger,
        rewardAmount: amount,
      },
    });

    return { qualified: true, inviteId };
  }

  /**
   * Clawback (R9): post reversing ledger adjustments for both reward
   * top-ups, pull the amounts back from the wallets, then mark the reward.
   * Reversals are idempotent per dedupe key, so retries are safe.
   */
  async clawbackReferralReward(inviteId: string, reason?: string) {
    if (!Types.ObjectId.isValid(inviteId)) {
      throw new NotFoundException('Invite not found');
    }
    const invite = await this.inviteModel.findById(inviteId);
    if (!invite) throw new NotFoundException('Invite not found');

    const status = invite.reward?.status ?? ReferralRewardStatus.PENDING;
    if (status !== ReferralRewardStatus.QUALIFIED) {
      throw new BadRequestException(
        `Cannot clawback invite in reward status ${status}`,
      );
    }

    const note = `Referral clawback for invite ${inviteId}${reason ? `: ${reason}` : ''}`;
    const reversals = await Promise.all(
      (['inviter', 'invitee'] as const).map((side) =>
        this.finance.reverseWalletTopUp(`referral:${inviteId}:${side}`, {
          dedupeKey: `referral-clawback:${inviteId}:${side}`,
          note,
        }),
      ),
    );

    invite.reward = {
      ...invite.reward,
      status: ReferralRewardStatus.CLAWED_BACK,
      clawedBackAt: new Date(),
    };
    invite.markModified('reward');
    await invite.save();

    this.audit.log({
      action: AuditAction.REFERRAL_JOINED,
      metadata: {
        inviteId,
        clawback: true,
        reason,
        reversedLedgerIds: reversals
          .filter((r): r is NonNullable<typeof r> => r !== null)
          .map((r) => r.ledgerId),
      },
    });

    return {
      inviteId,
      reward: {
        status: invite.reward.status,
        clawedBackAt: invite.reward.clawedBackAt,
      },
      reversals: reversals.map((r, index) => ({
        side: index === 0 ? 'inviter' : 'invitee',
        ledgerId: r?.ledgerId ?? null,
      })),
    };
  }
}
