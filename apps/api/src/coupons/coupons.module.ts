import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Coupon,
  CouponRedemption,
  CouponRedemptionSchema,
  CouponSchema,
  CouponUserUsage,
  CouponUserUsageSchema,
} from '../schemas/coupon.schema';
import {
  AccountCouponsController,
  AdminCouponsController,
} from './coupons.controller';
import { CouponsService } from './coupons.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Coupon.name, schema: CouponSchema },
      { name: CouponRedemption.name, schema: CouponRedemptionSchema },
      { name: CouponUserUsage.name, schema: CouponUserUsageSchema },
    ]),
  ],
  controllers: [AccountCouponsController, AdminCouponsController],
  providers: [CouponsService],
  exports: [CouponsService],
})
export class CouponsModule {}
