import { HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import {
  flattenValidationErrors,
  validationExceptionFactory,
} from './validation-exception.util';

describe('flattenValidationErrors', () => {
  it('maps constraints to a field-keyed string array', () => {
    const errors: ValidationError[] = [
      {
        property: 'phone',
        children: [],
        constraints: {
          whitelistValidation: 'property phone should not exist',
        },
      },
      {
        property: 'mobile',
        children: [],
        constraints: {
          matches: 'شماره موبایل باید معتبر و ایرانی باشد',
          isString: 'mobile باید رشته باشد',
        },
      },
    ];

    expect(flattenValidationErrors(errors)).toEqual({
      phone: ['property phone should not exist'],
      mobile: [
        'شماره موبایل باید معتبر و ایرانی باشد',
        'mobile باید رشته باشد',
      ],
    });
  });

  it('uses dotted paths for nested children', () => {
    const errors: ValidationError[] = [
      {
        property: 'guest',
        children: [
          {
            property: 'phone',
            children: [],
            constraints: { isString: 'phone must be a string' },
          },
        ],
      },
    ];

    expect(flattenValidationErrors(errors)).toEqual({
      'guest.phone': ['phone must be a string'],
    });
  });
});

describe('validationExceptionFactory', () => {
  it('returns Nest envelope with a field error map', () => {
    const exception = validationExceptionFactory([
      {
        property: 'code',
        children: [],
        constraints: { isLength: 'code must be 6 characters' },
      },
    ]);
    const response = exception.getResponse();

    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(response).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'errors.validation',
      fieldErrors: { code: ['code must be 6 characters'] },
    });
  });
});
