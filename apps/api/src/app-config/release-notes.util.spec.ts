import { normalizeReleaseNotes } from './release-notes.util';

describe('normalizeReleaseNotes', () => {
  it('returns null for empty input', () => {
    expect(normalizeReleaseNotes(undefined)).toBeNull();
    expect(normalizeReleaseNotes(null)).toBeNull();
    expect(normalizeReleaseNotes({ title: '', features: [] })).toBeNull();
    expect(normalizeReleaseNotes({ title: 'نسخه', features: [] })).toBeNull();
    expect(normalizeReleaseNotes({ title: '', features: ['a'] })).toBeNull();
  });

  it('trims, caps length, and keeps up to 8 features', () => {
    const long = 'x'.repeat(200);
    const result = normalizeReleaseNotes({
      title: `  ${long}  `,
      features: [
        '  one  ',
        '',
        long,
        'two',
        'three',
        'four',
        'five',
        'six',
        'seven',
        'eight',
        'nine',
      ],
    });
    expect(result).toEqual({
      title: 'x'.repeat(120),
      features: [
        'one',
        'x'.repeat(120),
        'two',
        'three',
        'four',
        'five',
        'six',
        'seven',
      ],
    });
  });
});
