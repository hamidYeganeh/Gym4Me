import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../account/auth/auth.module';
import { KycModule } from '../account/kyc/kyc.module';
import { ProfileModule } from '../account/profile/profile.module';
import { RolesModule } from '../account/roles/roles.module';
import { Booking, BookingSchema } from '../schemas/booking.schema';
import { Club, ClubSchema } from '../schemas/club.schema';
import {
  ClubMembership,
  ClubMembershipSchema,
} from '../schemas/club-membership.schema';
import {
  CoachProfile,
  CoachProfileSchema,
} from '../schemas/coach-profile.schema';
import {
  ImpersonationSession,
  ImpersonationSessionSchema,
} from '../schemas/impersonation-session.schema';
import { Payment, PaymentSchema } from '../schemas/payment.schema';
import {
  SocialReport,
  SocialReportSchema,
} from '../schemas/social-report.schema';
import {
  SupportTicket,
  SupportTicketSchema,
} from '../schemas/support-ticket.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { AdminAnalyticsService } from './admin-analytics.service';
import { AdminImpersonationService } from './admin-impersonation.service';
import { AdminKycService } from './admin-kyc.service';
import { AdminUsersService } from './admin-users.service';
import { AdminVerificationService } from './admin-verification.service';
import { AdminAuthController } from './auth/admin-auth.controller';
import { AdminAuthService } from './auth/admin-auth.service';

@Module({
  imports: [
    UsersModule,
    KycModule,
    AuthModule,
    ProfileModule,
    RolesModule,
    MongooseModule.forFeature([
      { name: ImpersonationSession.name, schema: ImpersonationSessionSchema },
      { name: User.name, schema: UserSchema },
      { name: Club.name, schema: ClubSchema },
      { name: CoachProfile.name, schema: CoachProfileSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: ClubMembership.name, schema: ClubMembershipSchema },
      { name: SupportTicket.name, schema: SupportTicketSchema },
      { name: SocialReport.name, schema: SocialReportSchema },
    ]),
  ],
  controllers: [AdminController, AdminAnalyticsController, AdminAuthController],
  providers: [
    AdminUsersService,
    AdminKycService,
    AdminAuthService,
    AdminVerificationService,
    AdminImpersonationService,
    AdminAnalyticsService,
  ],
})
export class AdminModule {}
