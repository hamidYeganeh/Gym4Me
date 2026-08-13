import { createHash, createHmac } from 'crypto';
import { readFileSync, unlinkSync } from 'fs';
import { request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';
import type { IncomingMessage } from 'http';
import type { Readable } from 'stream';
import type { StorageProvider } from './storage.provider';

export type S3Config = {
  endpoint: string; // e.g. https://s3.ir-thr-at1.arvanstorage.ir
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
};

/**
 * Dependency-free S3-compatible provider (AWS SigV4, path-style URLs).
 * Works with AWS S3, MinIO, ArvanCloud, Liara and other compatible stores.
 */
export class S3StorageProvider implements StorageProvider {
  constructor(private readonly config: S3Config) {}

  async put(stagedPath: string, key: string, mimeType: string): Promise<void> {
    const body = readFileSync(stagedPath);
    const res = await this.send('PUT', key, body, {
      'content-type': mimeType,
    });
    if (res.statusCode !== 200) {
      throw new Error(`S3 PUT failed with status ${res.statusCode}`);
    }
    res.resume();
    unlinkSync(stagedPath);
  }

  async open(key: string): Promise<{ stream: Readable; size?: number }> {
    const res = await this.send('GET', key);
    if (res.statusCode !== 200) {
      res.resume();
      throw new Error(`S3 GET failed with status ${res.statusCode}`);
    }
    const length = res.headers['content-length'];
    return {
      stream: res,
      size: length ? Number(length) : undefined,
    };
  }

  async exists(key: string): Promise<boolean> {
    const res = await this.send('HEAD', key);
    res.resume();
    return res.statusCode === 200;
  }

  async delete(key: string): Promise<void> {
    const res = await this.send('DELETE', key);
    res.resume();
    if (res.statusCode !== 204 && res.statusCode !== 200) {
      throw new Error(`S3 DELETE failed with status ${res.statusCode}`);
    }
  }

  // ── SigV4 signing ───────────────────────────────────────────────────────

  private async send(
    method: string,
    key: string,
    body?: Buffer,
    extraHeaders: Record<string, string> = {},
  ): Promise<IncomingMessage> {
    const url = new URL(this.config.endpoint);
    const path = `/${this.config.bucket}/${encodeURIComponent(key).replace(/%2F/g, '/')}`;

    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    const payloadHash = createHash('sha256')
      .update(body ?? Buffer.alloc(0))
      .digest('hex');

    const headers: Record<string, string> = {
      host: url.host,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
      ...extraHeaders,
    };
    if (body) headers['content-length'] = String(body.length);

    const signedHeaderNames = Object.keys(headers)
      .map((h) => h.toLowerCase())
      .sort();
    const canonicalHeaders = signedHeaderNames
      .map((h) => `${h}:${headers[h].trim()}\n`)
      .join('');
    const signedHeaders = signedHeaderNames.join(';');

    const canonicalRequest = [
      method,
      path,
      '',
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n');

    const scope = `${dateStamp}/${this.config.region}/s3/aws4_request`;
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      scope,
      createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n');

    const kDate = createHmac('sha256', `AWS4${this.config.secretAccessKey}`)
      .update(dateStamp)
      .digest();
    const kRegion = createHmac('sha256', kDate)
      .update(this.config.region)
      .digest();
    const kService = createHmac('sha256', kRegion).update('s3').digest();
    const kSigning = createHmac('sha256', kService)
      .update('aws4_request')
      .digest();
    const signature = createHmac('sha256', kSigning)
      .update(stringToSign)
      .digest('hex');

    headers.authorization =
      `AWS4-HMAC-SHA256 Credential=${this.config.accessKeyId}/${scope}, ` +
      `SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const requestFn = url.protocol === 'http:' ? httpRequest : httpsRequest;
    return new Promise<IncomingMessage>((resolvePromise, reject) => {
      const req = requestFn(
        {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'http:' ? 80 : 443),
          method,
          path,
          headers,
        },
        resolvePromise,
      );
      req.on('error', reject);
      if (body) req.write(body);
      req.end();
    });
  }
}
