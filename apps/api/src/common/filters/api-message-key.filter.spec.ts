import { toApiMessageKey } from './api-message-key.filter';

describe('toApiMessageKey', () => {
  it('keeps keys and converts legacy exception copy', () => {
    expect(toApiMessageKey('errors.validation')).toBe('errors.validation');
    expect(toApiMessageKey('Invalid national ID')).toBe(
      'exact.invalidNationalId',
    );
    expect(toApiMessageKey(['must be valid'])).toBe('errors.validation');
  });

  it('maps Nest throttler copy to rateLimited', () => {
    expect(toApiMessageKey('Too Many Requests')).toBe('errors.rateLimited');
    expect(toApiMessageKey('ThrottlerException: Too Many Requests')).toBe(
      'errors.rateLimited',
    );
  });
});
