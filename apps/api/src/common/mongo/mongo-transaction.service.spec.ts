import type { ClientSession, Connection } from 'mongoose';
import { MongoTransactionService } from './mongo-transaction.service';

describe('MongoTransactionService', () => {
  it('returns the work result and always ends the session', async () => {
    const endSession = jest.fn().mockResolvedValue(undefined);
    const session = {
      withTransaction: jest.fn(async (callback: () => Promise<void>) => {
        await callback();
      }),
      endSession,
    } as unknown as ClientSession;
    const connection = {
      startSession: jest.fn().mockResolvedValue(session),
    } as unknown as Connection;
    const service = new MongoTransactionService(connection);

    await expect(service.run(async () => 'committed')).resolves.toBe(
      'committed',
    );
    expect(endSession).toHaveBeenCalledTimes(1);
  });

  it('propagates failures and still ends the session', async () => {
    const endSession = jest.fn().mockResolvedValue(undefined);
    const session = {
      withTransaction: jest.fn(async (callback: () => Promise<void>) => {
        await callback();
      }),
      endSession,
    } as unknown as ClientSession;
    const connection = {
      startSession: jest.fn().mockResolvedValue(session),
    } as unknown as Connection;
    const service = new MongoTransactionService(connection);

    await expect(
      service.run(async () => {
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');
    expect(endSession).toHaveBeenCalledTimes(1);
  });
});
