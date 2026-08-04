import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AthleteProfile,
  AthleteProfileSchema,
} from '../../schemas/athlete-profile.schema';
import {
  CoachProfile,
  CoachProfileSchema,
} from '../../schemas/coach-profile.schema';
import { UsersModule } from '../../users/users.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AthleteProfile.name, schema: AthleteProfileSchema },
      { name: CoachProfile.name, schema: CoachProfileSchema },
    ]),
    UsersModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService, MongooseModule],
})
export class ProfileModule {}
