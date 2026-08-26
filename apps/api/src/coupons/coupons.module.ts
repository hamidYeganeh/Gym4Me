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
import { Club, ClubSchema } from '../schemas/club.schema';
import {
  AccountCouponsController,
  AdminCouponsController,
  OwnerCouponsController,
} from './coupons.controller';
import { CouponsService } from './coupons.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Coupon.name, schema: CouponSchema },
      { name: CouponRedemption.name, schema: CouponRedemptionSchema },
      { name: CouponUserUsage.name, schema: CouponUserUsageSchema },
      { name: Club.name, schema: ClubSchema },
    ]),
  ],
  controllers: [
    AccountCouponsController,
    AdminCouponsController,
    OwnerCouponsController,
  ],
  providers: [CouponsService],
  exports: [CouponsService],
})
export class CouponsModule {}
