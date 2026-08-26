import { BadRequestException } from '@nestjs/common';
import { sanitizeUploadedImage } from './image-sanitize.util';

describe('sanitizeUploadedImage', () => {
  it('removes JPEG EXIF and comments while preserving image data', () => {
    const jpeg = Buffer.from([
      0xff,
      0xd8,
      0xff,
      0xe1,
      0x00,
      0x08,
      ...Buffer.from('Exif00'),
      0xff,
      0xfe,
      0x00,
      0x04,
      0x41,
      0x42,
      0xff,
      0xda,
      0x00,
      0x02,
      0x11,
      0x22,
      0xff,
      0xd9,
    ]);

    const output = sanitizeUploadedImage(jpeg, 'image/jpeg');
    expect(output.includes(Buffer.from('Exif'))).toBe(false);
    expect(output.includes(Buffer.from('AB'))).toBe(false);
    expect(output.subarray(-4)).toEqual(Buffer.from([0x11, 0x22, 0xff, 0xd9]));
  });

  it('removes PNG text and EXIF chunks', () => {
    const chunk = (type: string, data = Buffer.alloc(0)) => {
      const result = Buffer.alloc(12 + data.length);
      result.writeUInt32BE(data.length, 0);
      result.write(type, 4);
      data.copy(result, 8);
      return result;
    };
    const png = Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk('IHDR', Buffer.alloc(13)),
      chunk('eXIf', Buffer.from('private-location')),
      chunk('tEXt', Buffer.from('device-name')),
      chunk('IDAT', Buffer.from([1])),
      chunk('IEND'),
    ]);

    const output = sanitizeUploadedImage(png, 'image/png');
    expect(output.includes(Buffer.from('private-location'))).toBe(false);
    expect(output.includes(Buffer.from('device-name'))).toBe(false);
    expect(output.includes(Buffer.from('IDAT'))).toBe(true);
  });

  it('removes WebP EXIF/XMP chunks and clears their VP8X flags', () => {
    const chunk = (type: string, data: Buffer) => {
      const padding = data.length % 2;
      const result = Buffer.alloc(8 + data.length + padding);
      result.write(type, 0);
      result.writeUInt32LE(data.length, 4);
      data.copy(result, 8);
      return result;
    };
    const body = Buffer.concat([
      Buffer.from('WEBP'),
      chunk('VP8X', Buffer.from([0x0c, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
      chunk('EXIF', Buffer.from('gps')),
      chunk('XMP ', Buffer.from('device')),
      chunk('VP8 ', Buffer.from([1, 2])),
    ]);
    const header = Buffer.alloc(8);
    header.write('RIFF');
    header.writeUInt32LE(body.length, 4);

    const output = sanitizeUploadedImage(
      Buffer.concat([header, body]),
      'image/webp',
    );
    expect(output.includes(Buffer.from('gps'))).toBe(false);
    expect(output.includes(Buffer.from('device'))).toBe(false);
    expect(output[20]).toBe(0);
  });

  it.each([
    ['image/jpeg', Buffer.from([0xff, 0xd8, 0xff])],
    [
      'image/jpeg',
      Buffer.from([0xff, 0xd8, 0xff, 0xda, 0, 2, 1, 2, 0xff, 0xd9, 0]),
    ],
    ['image/png', Buffer.from([137, 80, 78, 71])],
    ['image/webp', Buffer.from('RIFFbad-WEBP')],
  ])('rejects corrupt %s input', (mimeType, input) => {
    expect(() => sanitizeUploadedImage(input, mimeType)).toThrow(
      BadRequestException,
    );
  });
});
