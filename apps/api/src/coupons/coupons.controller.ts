import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import { CouponsService } from './coupons.service';
import {
  CreateCouponDto,
  ListCouponsQueryDto,
  PreviewCouponDto,
  UpdateCouponDto,
} from './dto/coupons.dto';

/** Checkout-side validation (any signed-in account role). */
@ApiTags('coupons')
@ApiBearerAuth('access-token')
@Controller('account/coupons')
export class AccountCouponsController {
  constructor(private readonly coupons: CouponsService) {}

  @Post('preview')
  @ApiOperation({ summary: 'Validate a coupon and preview the discount' })
  preview(@CurrentUser('sub') userId: string, @Body() dto: PreviewCouponDto) {
    return this.coupons.preview(dto.code, {
      userId,
      clubId: dto.clubId,
      amount: dto.amount,
    });
  }
}

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin/coupons')
export class AdminCouponsController {
  constructor(private readonly coupons: CouponsService) {}

  @Get()
  @ApiOperation({ summary: 'List coupons' })
  list(@Query() query: ListCouponsQueryDto) {
    return this.coupons.list(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a coupon' })
  create(@Body() dto: CreateCouponDto) {
    return this.coupons.create(dto);
  }

  @Patch(':couponId')
  @ApiOperation({ summary: 'Update a coupon' })
  update(@Param('couponId') couponId: string, @Body() dto: UpdateCouponDto) {
    return this.coupons.update(couponId, dto);
  }
}

@ApiTags('club-owner-coupons')
@ApiBearerAuth('access-token')
@Roles(Role.CLUB_OWNER)
@Controller('account/clubs/:clubId/coupons')
export class OwnerCouponsController {
  constructor(private readonly coupons: CouponsService) {}

  @Get()
  @ApiOperation({ summary: 'List coupons owned by this club' })
  list(
    @CurrentUser('sub') ownerId: string,
    @Param('clubId') clubId: string,
    @Query() query: ListCouponsQueryDto,
  ) {
    return this.coupons.listForOwner(ownerId, clubId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create or safely replay a club coupon' })
  create(
    @CurrentUser('sub') ownerId: string,
    @Param('clubId') clubId: string,
    @Body() dto: CreateCouponDto,
  ) {
    return this.coupons.createForOwner(ownerId, clubId, dto);
  }

  @Patch(':couponId')
  @ApiOperation({ summary: 'Update a coupon owned by this club' })
  update(
    @CurrentUser('sub') ownerId: string,
    @Param('clubId') clubId: string,
    @Param('couponId') couponId: string,
    @Body() dto: UpdateCouponDto,
  ) {
    return this.coupons.updateForOwner(ownerId, clubId, couponId, dto);
  }
}
