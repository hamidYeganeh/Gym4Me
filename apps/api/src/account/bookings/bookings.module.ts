import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FinanceModule } from '../../finance/finance.module';
import { CouponsModule } from '../../coupons/coupons.module';
import { NotificationsModule } from '../../notifications/notifications.module';
import { OutboxModule } from '../../outbox/outbox.module';
import { Booking, BookingSchema } from '../../schemas/booking.schema';
import { ClubClass, ClubClassSchema } from '../../schemas/club-class.schema';
import { Club, ClubSchema } from '../../schemas/club.schema';
import { ClubSpace, ClubSpaceSchema } from '../../schemas/club-space.schema';
import {
  CoachProfile,
  CoachProfileSchema,
} from '../../schemas/coach-profile.schema';
import { CoachSlot, CoachSlotSchema } from '../../schemas/coach-slot.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { UsersModule } from '../../users/users.module';
import { ClubSlotsModule } from '../club-slots/club-slots.module';
import { CalendarModule } from '../calendar/calendar.module';
import { ReferralModule } from '../referral/referral.module';
import { StaffModule } from '../staff/staff.module';
import { WaitlistModule } from '../../waitlist/waitlist.module';
import { AdminBookingsController } from './admin-bookings.controller';
import { CreateClubBookingCommand } from './application/commands/create-club-booking.command';
import { CreateCoachBookingCommand } from './application/commands/create-coach-booking.command';
import { VerifyBookingPaymentCommand } from './application/commands/verify-booking-payment.command';
import { BookingProjector } from './application/projectors/booking.projector';
import { BookingCalendarGuard } from './application/services/booking-calendar-guard.service';
import { AthleteBookingsController } from './athlete-bookings.controller';
import { BookingsExpireService } from './bookings-expire.service';
import { BookingPaymentReconciliationWorker } from './booking-payment-reconciliation.worker';
import { BookingsService } from './bookings.service';
import { CoachBookingsController } from './coach-bookings.controller';
import { CoachSlotsController } from './coach-slots.controller';
import { CoachSlotsService } from './coach-slots.service';
import { DiscoveryCoachSlotsController } from './discovery-coach-slots.controller';
import { OwnerClubBookingsController } from './owner-club-bookings.controller';

@Module({
  imports: [
    ClubSlotsModule,
    CalendarModule,
    NotificationsModule,
    FinanceModule,
    CouponsModule,
    OutboxModule,
    ReferralModule,
    StaffModule,
    UsersModule,
    WaitlistModule,
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: CoachSlot.name, schema: CoachSlotSchema },
      { name: CoachProfile.name, schema: CoachProfileSchema },
      { name: Club.name, schema: ClubSchema },
      { name: ClubClass.name, schema: ClubClassSchema },
      { name: ClubSpace.name, schema: ClubSpaceSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [
    DiscoveryCoachSlotsController,
    CoachSlotsController,
    AthleteBookingsController,
    CoachBookingsController,
    OwnerClubBookingsController,
    AdminBookingsController,
  ],
  providers: [
    CoachSlotsService,
    CreateClubBookingCommand,
    CreateCoachBookingCommand,
    VerifyBookingPaymentCommand,
    BookingProjector,
    BookingCalendarGuard,
    BookingsService,
    BookingsExpireService,
    BookingPaymentReconciliationWorker,
  ],
  exports: [BookingsService, CoachSlotsService],
})
export class BookingsModule {}
