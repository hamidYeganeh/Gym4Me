/** At least 8 chars, one letter, one digit. */
export const PASSWORD_PATTERN =
  /^(?=.*[A-Za-z])(?=.*\d)[\S]{8,128}$/;

export const PASSWORD_MESSAGE =
  'password must be 8–128 chars with at least one letter and one digit';
