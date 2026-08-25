import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '../decorators/public.decorator';

const RETURN_PATHS = [
  /^\/athlete\/wallet$/,
  /^\/athlete\/memberships$/,
  /^\/athlete\/bookings\/[a-f\d]{24}$/i,
  /^\/owner\/subscription$/,
];

export function assertPaymentReturnPath(value: string): string {
  if (!RETURN_PATHS.some((pattern) => pattern.test(value))) {
    throw new BadRequestException('Unsupported payment return path');
  }
  return value;
}

@ApiExcludeController()
@Controller('payment-returns')
export class PaymentReturnController {
  constructor(private readonly config: ConfigService) {}

  @Public()
  @Get('native')
  native(
    @Query('returnPath') returnPath: string,
    @Query('checkoutId') checkoutId: string | undefined,
    @Query('platformCheckoutId') platformCheckoutId: string | undefined,
    @Query('Authority') authority: string | undefined,
    @Query('Status') status: string | undefined,
    @Res() response: Response,
  ): void {
    const path = assertPaymentReturnPath(returnPath ?? '');
    const scheme = this.config.get<string>(
      'MOBILE_DEEP_LINK_SCHEME',
      'com.gym4me.app',
    );
    if (!scheme || !/^[a-z][a-z\d+.-]*$/i.test(scheme)) {
      throw new BadRequestException('Invalid mobile deep-link scheme');
    }
    if (status && status !== 'OK' && status !== 'NOK') {
      throw new BadRequestException('Invalid payment callback status');
    }
    const target = new URL(`${scheme}://payment-return`);
    target.searchParams.set('returnPath', path);
    this.forwardObjectId(target, 'checkoutId', checkoutId);
    this.forwardObjectId(target, 'platformCheckoutId', platformCheckoutId);
    if (authority) {
      target.searchParams.set('Authority', authority.slice(0, 120));
    }
    if (status) target.searchParams.set('Status', status);
    response.setHeader('Cache-Control', 'no-store');
    response.redirect(302, target.toString());
  }

  private forwardObjectId(
    target: URL,
    key: 'checkoutId' | 'platformCheckoutId',
    value: string | undefined,
  ) {
    if (!value) return;
    if (!/^[a-f\d]{24}$/i.test(value)) {
      throw new BadRequestException(`Invalid ${key}`);
    }
    target.searchParams.set(key, value);
  }
}
