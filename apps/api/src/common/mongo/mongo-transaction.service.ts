import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { ClientSession, Connection } from 'mongoose';

export type MongoTransactionWork<T> = (session: ClientSession) => Promise<T>;

/**
 * Shared Mongo transaction boundary for cross-document domain mutations.
 * The driver retries transient transaction/commit errors inside
 * `withTransaction`; callers must keep their work idempotent.
 */
@Injectable()
export class MongoTransactionService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async run<T>(work: MongoTransactionWork<T>): Promise<T> {
    const session = await this.connection.startSession();
    let completed = false;
    let result!: T;

    try {
      await session.withTransaction(
        async () => {
          result = await work(session);
          completed = true;
        },
        {
          readConcern: { level: 'snapshot' },
          writeConcern: { w: 'majority' },
          readPreference: 'primary',
        },
      );

      if (!completed) {
        throw new Error('Mongo transaction completed without a result');
      }
      return result;
    } finally {
      await session.endSession();
    }
  }
}
