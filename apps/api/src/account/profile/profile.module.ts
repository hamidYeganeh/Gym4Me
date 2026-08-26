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
import { AuthModule } from '../auth/auth.module';
import {
  AccountDeletionRequest,
  AccountDeletionRequestSchema,
} from '../../schemas/account-deletion-request.schema';
import { AccountDataRightsService } from './account-data-rights.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AthleteProfile.name, schema: AthleteProfileSchema },
      { name: CoachProfile.name, schema: CoachProfileSchema },
      {
        name: AccountDeletionRequest.name,
        schema: AccountDeletionRequestSchema,
      },
    ]),
    AuthModule,
    UsersModule,
    BasicsModule,
  ],
  controllers: [ProfileController, FavouriteLocationsController],
  providers: [
    ProfileService,
    FavouriteLocationsService,
    AccountDataRightsService,
  ],
  exports: [
    ProfileService,
    FavouriteLocationsService,
    AccountDataRightsService,
    MongooseModule,
  ],
})
export class ProfileModule {}
