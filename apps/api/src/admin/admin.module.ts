import { Module } from '@nestjs/common';
import { AuthModule } from '../account/auth/auth.module';
import { KycModule } from '../account/kyc/kyc.module';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';
import { AdminKycService } from './admin-kyc.service';
import { AdminUsersService } from './admin-users.service';

@Module({
  imports: [UsersModule, KycModule, AuthModule],
  controllers: [AdminController],
  providers: [AdminUsersService, AdminKycService],
})
export class AdminModule {}
