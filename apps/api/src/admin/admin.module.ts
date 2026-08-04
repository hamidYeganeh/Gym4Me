import { Module } from '@nestjs/common';
import { ClubsModule } from '../account/clubs/clubs.module';
import { AuthModule } from '../account/auth/auth.module';
import { KycModule } from '../account/kyc/kyc.module';
import { ProfileModule } from '../account/profile/profile.module';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';
import { AdminKycService } from './admin-kyc.service';
import { AdminUsersService } from './admin-users.service';
import { AdminVerificationService } from './admin-verification.service';
import { AdminAuthController } from './auth/admin-auth.controller';
import { AdminAuthService } from './auth/admin-auth.service';

@Module({
  imports: [UsersModule, KycModule, AuthModule, ProfileModule, ClubsModule],
  controllers: [AdminController, AdminAuthController],
  providers: [
    AdminUsersService,
    AdminKycService,
    AdminAuthService,
    AdminVerificationService,
  ],
})
export class AdminModule {}
