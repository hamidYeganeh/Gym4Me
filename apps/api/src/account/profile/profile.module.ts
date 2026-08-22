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
import { BasicsModule } from '../../basics/basics.module';
import { UsersModule } from '../../users/users.module';
import { FavouriteLocationsController } from './favourite-locations.controller';
import { FavouriteLocationsService } from './favourite-locations.service';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AthleteProfile.name, schema: AthleteProfileSchema },
      { name: CoachProfile.name, schema: CoachProfileSchema },
    ]),
    UsersModule,
    BasicsModule,
  ],
  controllers: [ProfileController, FavouriteLocationsController],
  providers: [ProfileService, FavouriteLocationsService],
  exports: [ProfileService, FavouriteLocationsService, MongooseModule],
})
export class ProfileModule {}
