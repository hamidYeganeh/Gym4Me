/** Validates an Iranian national ID (کد ملی) including its checksum digit. */
export function isValidIranNationalId(value: string): boolean {
  if (!/^\d{10}$/.test(value)) return false;
  if (/^(\d)\1{9}$/.test(value)) return false;

  const check = Number(value[9]);
  const sum =
    value
      .slice(0, 9)
      .split('')
      .reduce((acc, digit, i) => acc + Number(digit) * (10 - i), 0) % 11;

  return sum < 2 ? check === sum : check === 11 - sum;
}
