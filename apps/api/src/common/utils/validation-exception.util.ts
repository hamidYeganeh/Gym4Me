import {
  BadRequestException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

export type FieldErrorMap = Record<string, string[]>;

export function flattenValidationErrors(
  errors: ValidationError[],
  parent = '',
): FieldErrorMap {
  const result: FieldErrorMap = {};

  for (const error of errors) {
    const path = parent ? `${parent}.${error.property}` : error.property;
    const messages = error.constraints
      ? Object.values(error.constraints).filter(
          (msg): msg is string => typeof msg === 'string' && msg.length > 0,
        )
      : [];

    if (messages.length > 0) {
      result[path] = result[path] ? [...result[path], ...messages] : messages;
    }

    if (error.children?.length) {
      const nested = flattenValidationErrors(error.children, path);
      for (const [key, value] of Object.entries(nested)) {
        result[key] = result[key] ? [...result[key], ...value] : value;
      }
    }
  }

  return result;
}

export function validationExceptionFactory(errors: ValidationError[]) {
  const message = flattenValidationErrors(errors);
  return new BadRequestException({
    statusCode: HttpStatus.BAD_REQUEST,
    error: 'Bad Request',
    message: Object.keys(message).length > 0 ? message : 'Validation failed',
  });
}

export function createAppValidationPipe() {
  return new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    exceptionFactory: validationExceptionFactory,
  });
}
