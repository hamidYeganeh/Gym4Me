import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BookingStatus,
  ClubLifecycleStatus,
  ClubOperationalStatus,
  KycStatus,
  PaymentStatus,
  MembershipStatus,
  SocialReportStatus,
  SupportTicketStatus,
  UserStatus,
  VerificationStatus,
} from '../common/enums';
import { Booking, BookingDocument } from '../schemas/booking.schema';
import { Club, ClubDocument } from '../schemas/club.schema';
import {
  ClubMembership,
  ClubMembershipDocument,
} from '../schemas/club-membership.schema';
import {
  CoachProfile,
  CoachProfileDocument,
} from '../schemas/coach-profile.schema';
import { Payment, PaymentDocument } from '../schemas/payment.schema';
import {
  SocialReport,
  SocialReportDocument,
} from '../schemas/social-report.schema';
import {
  SupportTicket,
  SupportTicketDocument,
} from '../schemas/support-ticket.schema';
import { User, UserDocument } from '../schemas/user.schema';

const DAY_MS = 86_400_000;

type DailyPoint = { date: string; value: number };

@Injectable()
export class AdminAnalyticsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Club.name) private readonly clubModel: Model<ClubDocument>,
    @InjectModel(CoachProfile.name)
    private readonly coachModel: Model<CoachProfileDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(ClubMembership.name)
    private readonly membershipModel: Model<ClubMembershipDocument>,
    @InjectModel(SupportTicket.name)
    private readonly ticketModel: Model<SupportTicketDocument>,
    @InjectModel(SocialReport.name)
    private readonly reportModel: Model<SocialReportDocument>,
  ) {}

  /** Platform KPIs for the admin dashboard: totals, review queues, series. */
  async overview() {
    const now = new Date();
    const since30 = new Date(now.getTime() - 30 * DAY_MS);
    const since14 = new Date(now.getTime() - 14 * DAY_MS);
    const capturedStatuses = [
      PaymentStatus.CAPTURED,
      PaymentStatus.PARTIALLY_REFUNDED,
    ];

    const [
      usersTotal,
      usersNew30d,
      activeClubs,
      verifiedCoaches,
      activeMemberships,
      bookings30d,
      gmvAgg,
      pendingKyc,
      pendingCoachVerifications,
      pendingClubReviews,
      openSupportTickets,
      openSocialReports,
      refundRequests,
      revenueDaily,
      signupsDaily,
      bookingsDaily,
    ] = await Promise.all([
      this.userModel.countDocuments({ status: UserStatus.ACTIVE }),
      this.userModel.countDocuments({ createdAt: { $gte: since30 } }),
      this.clubModel.countDocuments({
        'review.status': ClubLifecycleStatus.APPROVED,
        operationalStatus: ClubOperationalStatus.ACTIVE,
      }),
      this.coachModel.countDocuments({
        'verification.status': VerificationStatus.APPROVED,
      }),
      this.membershipModel.countDocuments({
        status: MembershipStatus.ACTIVE,
      }),
      this.bookingModel.countDocuments({
        createdAt: { $gte: since30 },
        status: {
          $in: [
            BookingStatus.CONFIRMED,
            BookingStatus.CHECKED_IN,
            BookingStatus.COMPLETED,
          ],
        },
      }),
      this.paymentModel.aggregate<{ _id: null; gross: number; net: number }>([
        {
          $match: {
            status: { $in: capturedStatuses },
            capturedAt: { $gte: since30 },
          },
        },
        {
          $group: {
            _id: null,
            gross: { $sum: '$amount.gross' },
            net: { $sum: '$amount.net' },
          },
        },
      ]),
      this.userModel.countDocuments({ kycStatus: KycStatus.PENDING }),
      this.coachModel.countDocuments({
        'verification.status': VerificationStatus.PENDING,
      }),
      this.clubModel.countDocuments({
        'review.status': ClubLifecycleStatus.PENDING_REVIEW,
      }),
      this.ticketModel.countDocuments({
        status: {
          $in: [SupportTicketStatus.OPEN, SupportTicketStatus.AWAITING_ADMIN],
        },
      }),
      this.reportModel.countDocuments({ status: SocialReportStatus.OPEN }),
      this.bookingModel.countDocuments({
        status: BookingStatus.REFUND_REQUESTED,
      }),
      this.dailySum(
        this.paymentModel,
        { status: { $in: capturedStatuses }, capturedAt: { $gte: since14 } },
        '$capturedAt',
        '$amount.gross',
      ),
      this.dailyCount(this.userModel, { createdAt: { $gte: since14 } }),
      this.dailyCount(this.bookingModel, { createdAt: { $gte: since14 } }),
    ]);

    return {
      totals: {
        users: usersTotal,
        usersNew30d,
        activeClubs,
        verifiedCoaches,
        activeMemberships,
        bookings30d,
        gmv30d: gmvAgg[0]?.gross ?? 0,
        revenue30d: gmvAgg[0]?.net ?? 0,
      },
      queues: {
        pendingKyc,
        pendingCoachVerifications,
        pendingClubReviews,
        openSupportTickets,
        openSocialReports,
        refundRequests,
      },
      series: {
        revenueDaily,
        signupsDaily,
        bookingsDaily,
      },
      generatedAt: now.toISOString(),
    };
  }

  private async dailyCount(
    model: Model<never> | Model<UserDocument> | Model<BookingDocument>,
    match: Record<string, unknown>,
  ): Promise<DailyPoint[]> {
    const rows = await (model as Model<UserDocument>).aggregate<{
      _id: string;
      value: number;
    }>([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          value: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return rows.map((r) => ({ date: r._id, value: r.value }));
  }

  private async dailySum(
    model: Model<PaymentDocument>,
    match: Record<string, unknown>,
    dateField: string,
    sumField: string,
  ): Promise<DailyPoint[]> {
    const rows = await model.aggregate<{ _id: string; value: number }>([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: dateField },
          },
          value: { $sum: sumField },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return rows.map((r) => ({ date: r._id, value: r.value }));
  }
}
