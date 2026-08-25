import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MembershipsModule } from '../account/memberships/memberships.module';
import { StaffModule } from '../account/staff/staff.module';
import { StaffPermissionGuard } from '../common/guards/staff-permission.guard';
import { Booking, BookingSchema } from '../schemas/booking.schema';
import { CheckIn, CheckInSchema } from '../schemas/check-in.schema';
import {
  CheckinDevice,
  CheckinDeviceSchema,
} from '../schemas/checkin-device.schema';
import {
  ClubMembership,
  ClubMembershipSchema,
} from '../schemas/club-membership.schema';
import {
  CheckinOfflineSnapshot,
  CheckinOfflineSnapshotSchema,
} from '../schemas/checkin-offline-snapshot.schema';
import {
  CheckinOfflineReconciliation,
  CheckinOfflineReconciliationSchema,
} from '../schemas/checkin-offline-reconciliation.schema';
import { AthleteCheckinController } from './athlete-checkin.controller';
import { CheckinService } from './checkin.service';
import { OfflineCheckinService } from './offline-checkin.service';
import {
  ClubCheckinController,
  ClubCheckinDevicesController,
  HardwareCheckinController,
} from './club-checkin.controller';

@Module({
  imports: [
    StaffModule,
    MembershipsModule,
    MongooseModule.forFeature([
      { name: CheckIn.name, schema: CheckInSchema },
      { name: CheckinDevice.name, schema: CheckinDeviceSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: ClubMembership.name, schema: ClubMembershipSchema },
      {
        name: CheckinOfflineSnapshot.name,
        schema: CheckinOfflineSnapshotSchema,
      },
      {
        name: CheckinOfflineReconciliation.name,
        schema: CheckinOfflineReconciliationSchema,
      },
    ]),
  ],
  controllers: [
    ClubCheckinController,
    ClubCheckinDevicesController,
    HardwareCheckinController,
    AthleteCheckinController,
  ],
  providers: [CheckinService, OfflineCheckinService, StaffPermissionGuard],
  exports: [CheckinService],
})
export class CheckinModule {}
