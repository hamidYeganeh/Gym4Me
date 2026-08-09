/** Detect allowed upload MIME from magic bytes (never trust client Content-Type). */
export function sniffAllowedMime(buf: Buffer): string | null {
  if (buf.length < 12) return null;

  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return 'image/png';
  }

  // WEBP (RIFF....WEBP)
  if (
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }

  // PDF
  if (buf.toString('ascii', 0, 5) === '%PDF-') {
    return 'application/pdf';
  }

  return null;
}

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

export function extensionForMime(mime: string): string {
  return EXT_BY_MIME[mime] ?? '';
}

/** Strip quotes/CRLF/control chars from Content-Disposition filenames. */
export function sanitizeContentDispositionFilename(name: string): string {
  return name
    .replace(/[\r\n"\\]/g, '')
    .replace(/[^\x20-\x7E]/g, '_')
    .slice(0, 180);
}
