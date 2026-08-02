import { Module } from '@nestjs/common';
import { UsersModule } from '../../users/users.module';
import { ReferralController } from './referral.controller';
import { ReferralService } from './referral.service';

@Module({
  imports: [UsersModule], // re-exports User + Invite models
  controllers: [ReferralController],
  providers: [ReferralService],
})
export class ReferralModule {}
