import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';

const MESSAGE_KEY = /^(?:errors|success|exact|patterns)\.[a-zA-Z0-9.]+$/;
const STANDARD_MESSAGES: Record<string, string> = {
  'bad request': 'errors.badRequest',
  unauthorized: 'errors.unauthorized',
  forbidden: 'errors.forbidden',
  'not found': 'errors.notFound',
  conflict: 'errors.conflict',
  'too many requests': 'errors.rateLimited',
  'internal server error': 'errors.server',
  'service unavailable': 'errors.unavailable',
};

/** Convert legacy human-readable exception copy to a stable next-intl key. */
export function toApiMessageKey(message: unknown): string {
  if (typeof message !== 'string') return 'errors.validation';
  const trimmed = message.trim();
  if (MESSAGE_KEY.test(trimmed)) return trimmed;
  const standard = STANDARD_MESSAGES[trimmed.toLowerCase()];
  if (standard) return standard;

  const words = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return 'errors.generic';
  const [first, ...rest] = words;
  return `exact.${first}${rest
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')}`;
}

@Catch(HttpException)
export class ApiMessageKeyFilter implements ExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus();
    const payload = exception.getResponse();

    if (typeof payload === 'string') {
      response.status(status).json({
        statusCode: status,
        message: toApiMessageKey(payload),
      });
      return;
    }

    const body = payload as Record<string, unknown>;
    response.status(status).json({
      ...body,
      message: toApiMessageKey(body.message),
    });
  }
}
