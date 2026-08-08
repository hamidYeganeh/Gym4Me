import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Club, ClubSchema } from '../../schemas/club.schema';
import {
  CoachProfile,
  CoachProfileSchema,
} from '../../schemas/coach-profile.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { DiscoveryCoachesController } from './discovery-coaches.controller';
import { DiscoveryCoachesService } from './discovery-coaches.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CoachProfile.name, schema: CoachProfileSchema },
      { name: User.name, schema: UserSchema },
      { name: Club.name, schema: ClubSchema },
    ]),
  ],
  controllers: [DiscoveryCoachesController],
  providers: [DiscoveryCoachesService],
  exports: [DiscoveryCoachesService],
})
export class CoachesModule {}
