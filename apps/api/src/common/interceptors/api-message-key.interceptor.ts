import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, type Observable } from 'rxjs';
import { toApiMessageKey } from '../filters/api-message-key.filter';

/** Key top-level success messages without touching domain fields nested in data. */
@Injectable()
export class ApiMessageKeyInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(
      map((payload: unknown) => {
        if (
          !payload ||
          typeof payload !== 'object' ||
          Array.isArray(payload) ||
          typeof (payload as { message?: unknown }).message !== 'string'
        ) {
          return payload;
        }
        return {
          ...(payload as Record<string, unknown>),
          message: toApiMessageKey((payload as { message: string }).message),
        };
      }),
    );
  }
}
