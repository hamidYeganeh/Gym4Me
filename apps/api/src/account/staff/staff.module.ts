import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Club, ClubSchema } from '../../schemas/club.schema';
import {
  ClubStaff,
  ClubStaffSchema,
} from '../../schemas/club-staff.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { OwnerStaffController } from './owner-staff.controller';
import { StaffService } from './staff.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClubStaff.name, schema: ClubStaffSchema },
      { name: Club.name, schema: ClubSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [OwnerStaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
