import { Module, forwardRef } from '@nestjs/common';
import { FinanceModule } from '../../finance/finance.module';
import { UsersModule } from '../../users/users.module';
import { ReferralController } from './referral.controller';
import { ReferralService } from './referral.service';

@Module({
  imports: [UsersModule, forwardRef(() => FinanceModule)],
  controllers: [ReferralController],
  providers: [ReferralService],
  exports: [ReferralService],
})
export class ReferralModule {}
