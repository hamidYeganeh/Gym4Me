import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtUser } from '../types';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: JwtUser | undefined = request.user;
    return data ? user?.[data] : user;
  },
);
