import type { Readable } from 'stream';

/**
 * Object storage behind the media pipeline (SYS: storage abstraction).
 * Uploads are always staged on local disk by multer first; `put` then
 * persists the staged file under `key` in the backing store.
 */
export interface StorageProvider {
  /** Persist a locally staged file under `key` (moves/uploads + cleans up). */
  put(stagedPath: string, key: string, mimeType: string): Promise<void>;
  /** Open a readable stream for a stored object. */
  open(key: string): Promise<{ stream: Readable; size?: number }>;
  exists(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
}
