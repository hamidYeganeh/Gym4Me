import { BadRequestException } from '@nestjs/common';

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function invalidImage(): never {
  throw new BadRequestException('Invalid or corrupt image file');
}

function sanitizeJpeg(input: Buffer): Buffer {
  if (
    input.length < 4 ||
    input[0] !== 0xff ||
    input[1] !== 0xd8 ||
    input[input.length - 2] !== 0xff ||
    input[input.length - 1] !== 0xd9
  ) {
    return invalidImage();
  }
  const parts = [input.subarray(0, 2)];
  let offset = 2;
  let sawImageData = false;
  while (offset < input.length) {
    if (input[offset] !== 0xff) return invalidImage();
    const markerStart = offset;
    while (input[offset] === 0xff) offset += 1;
    if (offset >= input.length) return invalidImage();
    const marker = input[offset++];
    if (marker === 0xd9) {
      parts.push(input.subarray(markerStart, offset));
      sawImageData = true;
      break;
    }
    if (marker === 0xda) {
      if (offset + 2 > input.length) return invalidImage();
      const length = input.readUInt16BE(offset);
      if (length < 2 || offset + length > input.length) return invalidImage();
      parts.push(input.subarray(markerStart));
      sawImageData = true;
      offset = input.length;
      break;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      parts.push(input.subarray(markerStart, offset));
      continue;
    }
    if (offset + 2 > input.length) return invalidImage();
    const length = input.readUInt16BE(offset);
    if (length < 2 || offset + length > input.length) return invalidImage();
    const end = offset + length;
    // APP1 contains EXIF/XMP and COM may contain user/device metadata.
    if (marker !== 0xe1 && marker !== 0xfe) {
      parts.push(input.subarray(markerStart, end));
    }
    offset = end;
  }
  if (!sawImageData) return invalidImage();
  return Buffer.concat(parts);
}

function sanitizePng(input: Buffer): Buffer {
  if (input.length < 20 || !input.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return invalidImage();
  }
  const parts = [input.subarray(0, 8)];
  const metadataChunks = new Set(['eXIf', 'iTXt', 'tEXt', 'zTXt']);
  let offset = 8;
  let sawHeader = false;
  let sawEnd = false;
  while (offset + 12 <= input.length) {
    const length = input.readUInt32BE(offset);
    const end = offset + 12 + length;
    if (end > input.length) return invalidImage();
    const type = input.toString('ascii', offset + 4, offset + 8);
    if (!sawHeader && type !== 'IHDR') return invalidImage();
    sawHeader ||= type === 'IHDR';
    if (!metadataChunks.has(type)) parts.push(input.subarray(offset, end));
    offset = end;
    if (type === 'IEND') {
      sawEnd = true;
      break;
    }
  }
  if (!sawHeader || !sawEnd || offset !== input.length) return invalidImage();
  return Buffer.concat(parts);
}

function sanitizeWebp(input: Buffer): Buffer {
  if (
    input.length < 20 ||
    input.toString('ascii', 0, 4) !== 'RIFF' ||
    input.toString('ascii', 8, 12) !== 'WEBP' ||
    input.readUInt32LE(4) + 8 !== input.length
  ) {
    return invalidImage();
  }
  const chunks: Buffer[] = [];
  let offset = 12;
  let sawImage = false;
  while (offset + 8 <= input.length) {
    const type = input.toString('ascii', offset, offset + 4);
    const length = input.readUInt32LE(offset + 4);
    const end = offset + 8 + length + (length % 2);
    if (end > input.length) return invalidImage();
    if (type === 'VP8 ' || type === 'VP8L' || type === 'ANMF') sawImage = true;
    if (type !== 'EXIF' && type !== 'XMP ') {
      const chunk = Buffer.from(input.subarray(offset, end));
      if (type === 'VP8X' && length >= 1) chunk[8] &= ~0x0c;
      chunks.push(chunk);
    }
    offset = end;
  }
  if (!sawImage || offset !== input.length) return invalidImage();
  const body = Buffer.concat([Buffer.from('WEBP'), ...chunks]);
  const header = Buffer.alloc(8);
  header.write('RIFF');
  header.writeUInt32LE(body.length, 4);
  return Buffer.concat([header, body]);
}

/** Validates image container structure and removes location/device/text metadata. */
export function sanitizeUploadedImage(input: Buffer, mimeType: string): Buffer {
  if (mimeType === 'image/jpeg') return sanitizeJpeg(input);
  if (mimeType === 'image/png') return sanitizePng(input);
  if (mimeType === 'image/webp') return sanitizeWebp(input);
  return invalidImage();
}
