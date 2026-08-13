import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Readable } from 'stream';
import { LocalStorageProvider } from './local-storage.provider';
import { S3StorageProvider } from './s3-storage.provider';
import type { StorageProvider } from './storage.provider';

/**
 * Provider-agnostic object storage (`STORAGE_PROVIDER=local|s3`).
 * Local disk remains the default; S3 needs endpoint/bucket/credentials.
 */
@Injectable()
export class StorageService implements StorageProvider {
  private readonly logger = new Logger(StorageService.name);
  private readonly provider: StorageProvider;
  readonly providerName: 'local' | 's3';

  constructor(config: ConfigService) {
    const requested = (config.get<string>('STORAGE_PROVIDER') ?? 'local')
      .trim()
      .toLowerCase();

    if (requested === 's3') {
      const endpoint = config.get<string>('S3_ENDPOINT');
      const bucket = config.get<string>('S3_BUCKET');
      const accessKeyId = config.get<string>('S3_ACCESS_KEY_ID');
      const secretAccessKey = config.get<string>('S3_SECRET_ACCESS_KEY');
      if (endpoint && bucket && accessKeyId && secretAccessKey) {
        this.provider = new S3StorageProvider({
          endpoint,
          bucket,
          accessKeyId,
          secretAccessKey,
          region: config.get<string>('S3_REGION') ?? 'us-east-1',
        });
        this.providerName = 's3';
        this.logger.log(`Storage provider: s3 (${endpoint}/${bucket})`);
        return;
      }
      this.logger.warn(
        'STORAGE_PROVIDER=s3 but S3_* config incomplete — falling back to local',
      );
    }

    this.provider = new LocalStorageProvider(
      config.get<string>('UPLOAD_DIR') ?? './uploads',
    );
    this.providerName = 'local';
  }

  put(stagedPath: string, key: string, mimeType: string): Promise<void> {
    return this.provider.put(stagedPath, key, mimeType);
  }

  open(key: string): Promise<{ stream: Readable; size?: number }> {
    return this.provider.open(key);
  }

  exists(key: string): Promise<boolean> {
    return this.provider.exists(key);
  }

  delete(key: string): Promise<void> {
    return this.provider.delete(key);
  }
}
