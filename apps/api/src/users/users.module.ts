import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AthleteProfile,
  AthleteProfileSchema,
} from '../schemas/athlete-profile.schema';
import { Invite, InviteSchema } from '../schemas/invite.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Invite.name, schema: InviteSchema },
      { name: AthleteProfile.name, schema: AthleteProfileSchema },
    ]),
  ],
  providers: [UsersService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}
