/** Mirrors API `PASSWORD_PATTERN`: 8–128 chars, letter + digit. */
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[\S]{8,128}$/;

export function isValidPassword(password: string): boolean {
  return PASSWORD_PATTERN.test(password);
}
