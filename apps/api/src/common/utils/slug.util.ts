import { randomShortCode } from './hash.util';

const FA_MAP: Record<string, string> = {
  آ: 'a', ا: 'a', أ: 'a', إ: 'e', ب: 'b', پ: 'p', ت: 't', ث: 's',
  ج: 'j', چ: 'ch', ح: 'h', خ: 'kh', د: 'd', ذ: 'z', ر: 'r', ز: 'z',
  ژ: 'zh', س: 's', ش: 'sh', ص: 's', ض: 'z', ط: 't', ظ: 'z', ع: 'a',
  غ: 'gh', ف: 'f', ق: 'gh', ک: 'k', ك: 'k', گ: 'g', ل: 'l', م: 'm',
  ن: 'n', و: 'v', ه: 'h', ی: 'y', ي: 'y', ئ: 'y', ء: '', ة: 'h',
  '‌': '-', // ZWNJ
};

function transliterate(value: string): string {
  return value
    .split('')
    .map((ch) => FA_MAP[ch] ?? ch)
    .join('');
}

export function slugify(value: string): string {
  return transliterate(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

/** Handle for a user, e.g. "mahdi-ahmadi-x7k2"; falls back to "user-x7k2". */
export function buildUserCode(firstName?: string, lastName?: string): string {
  const base = slugify([firstName, lastName].filter(Boolean).join(' '));
  const suffix = randomShortCode(4).toLowerCase();
  return base ? `${base}-${suffix}` : `user-${suffix}`;
}

/** Shareable referral code, e.g. "MAHDI-4F2A" or "GYM-4F2A". */
export function buildReferralCode(firstName?: string): string {
  const prefix = firstName
    ? slugify(firstName).replace(/-/g, '').slice(0, 6).toUpperCase()
    : '';
  return `${prefix || 'GYM'}-${randomShortCode(4)}`;
}
