/** Mirrors API `PASSWORD_PATTERN`: 8–128 chars, letter + digit. */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[\S]{8,128}$/;

export function isValidPassword(password: string): boolean {
  return PASSWORD_PATTERN.test(password);
}

export type PasswordStrengthLevel = 0 | 1 | 2 | 3 | 4;

export type PasswordStrength = {
  level: PasswordStrengthLevel;
  /** Segment fill count for a 4-bar meter (0–4). */
  segments: PasswordStrengthLevel;
  hasMinLength: boolean;
  hasLetter: boolean;
  hasDigit: boolean;
  isValid: boolean;
};

export function evaluatePasswordStrength(password: string): PasswordStrength {
  const hasMinLength = password.length >= PASSWORD_MIN_LENGTH;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const isLong = password.length >= 12;

  let score = 0;
  if (password.length > 0) score += 1;
  if (hasMinLength) score += 1;
  if (hasLetter && hasDigit) score += 1;
  if (hasSymbol || isLong) score += 1;

  const level = Math.min(4, score) as PasswordStrengthLevel;
  const isValid = hasMinLength && hasLetter && hasDigit;

  return {
    level,
    segments: level,
    hasMinLength,
    hasLetter,
    hasDigit,
    isValid,
  };
}

export function passwordStrengthMessageKey(
  strength: PasswordStrength,
): "empty" | "weak" | "fair" | "good" | "strong" {
  if (!strength.level) return "empty";
  if (strength.level <= 1) return "weak";
  if (strength.level === 2) return "fair";
  if (strength.level === 3) return "good";
  return "strong";
}
