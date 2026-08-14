import {
  createReadStream,
  existsSync,
  mkdirSync,
  renameSync,
  statSync,
  unlinkSync,
} from 'fs';
import { dirname, join, resolve } from 'path';
import type { Readable } from 'stream';
import type { StorageProvider } from './storage.provider';

/** Default provider: objects live under UPLOAD_DIR on the API host. */
export class LocalStorageProvider implements StorageProvider {
  constructor(private readonly baseDir: string) {}

  private absolute(key: string): string {
    const abs = resolve(join(this.baseDir, key));
    if (!abs.startsWith(resolve(this.baseDir))) {
      throw new Error('Storage key escapes upload dir');
    }
    return abs;
  }

  put(stagedPath: string, key: string): Promise<void> {
    const target = this.absolute(key);
    if (resolve(stagedPath) !== target) {
      mkdirSync(dirname(target), { recursive: true });
      renameSync(stagedPath, target);
    }
    return Promise.resolve();
  }

  open(key: string): Promise<{ stream: Readable; size?: number }> {
    const abs = this.absolute(key);
    const stats = statSync(abs);
    return Promise.resolve({
      stream: createReadStream(abs),
      size: stats.size,
    });
  }

  exists(key: string): Promise<boolean> {
    return Promise.resolve(existsSync(this.absolute(key)));
  }

  delete(key: string): Promise<void> {
    const abs = this.absolute(key);
    if (existsSync(abs)) unlinkSync(abs);
    return Promise.resolve();
  }
}
