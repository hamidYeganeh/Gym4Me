import { Types } from 'mongoose';
import { AccountDeletionRequestStatus } from '../../schemas/account-deletion-request.schema';
import { AccountDataRightsService } from './account-data-rights.service';

describe('AccountDataRightsService', () => {
  const userId = new Types.ObjectId().toString();

  function document(status = AccountDeletionRequestStatus.COOLING_OFF) {
    return {
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId(userId),
      status,
      requestedAt: new Date('2026-08-26T00:00:00.000Z'),
      coolingOffUntil: new Date('2026-09-02T00:00:00.000Z'),
      retentionPolicyVersion: 'pending-adr-1',
    };
  }

  function setup(existing: ReturnType<typeof document> | null = null) {
    const created = document();
    const requests = {
      findOne: jest.fn().mockResolvedValue(existing),
      create: jest.fn().mockResolvedValue(created),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      findOneAndUpdate: jest.fn().mockResolvedValue({
        ...created,
        status: AccountDeletionRequestStatus.CANCELLED,
        cancelledAt: new Date('2026-08-27T00:00:00.000Z'),
      }),
    };
    const tokens = { revokeAll: jest.fn().mockResolvedValue(undefined) };
    const audit = { log: jest.fn() };
    return {
      service: new AccountDataRightsService(
        requests as never,
        tokens as never,
        audit as never,
      ),
      requests,
      tokens,
      audit,
      created,
    };
  }

  it('creates one cooling-off request and revokes every session', async () => {
    const { service, requests, tokens, audit } = setup();
    const result = await service.request(userId, 'privacy', {} as never);
    expect(result).toMatchObject({
      status: AccountDeletionRequestStatus.COOLING_OFF,
      idempotent: false,
    });
    expect(requests.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: new Types.ObjectId(userId),
        retentionPolicyVersion: 'pending-adr-1',
      }),
    );
    expect(tokens.revokeAll).toHaveBeenCalledWith(new Types.ObjectId(userId));
    expect(audit.log).toHaveBeenCalled();
  });

  it('returns the active request idempotently without revoking again', async () => {
    const { service, requests, tokens } = setup(document());
    await expect(
      service.request(userId, undefined, {} as never),
    ).resolves.toMatchObject({
      idempotent: true,
    });
    expect(requests.create).not.toHaveBeenCalled();
    expect(tokens.revokeAll).not.toHaveBeenCalled();
  });

  it('recovers a concurrent unique-index winner idempotently', async () => {
    const winner = document();
    const { service, requests, tokens } = setup();
    requests.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(winner);
    requests.create.mockRejectedValueOnce({ code: 11000 });
    await expect(
      service.request(userId, undefined, {} as never),
    ).resolves.toMatchObject({
      id: winner._id.toString(),
      idempotent: true,
    });
    expect(tokens.revokeAll).not.toHaveBeenCalled();
  });

  it('rolls back a new request when session revocation fails', async () => {
    const { service, requests, tokens, created } = setup();
    tokens.revokeAll.mockRejectedValueOnce(new Error('redis unavailable'));
    await expect(
      service.request(userId, undefined, {} as never),
    ).rejects.toThrow('redis unavailable');
    expect(requests.deleteOne).toHaveBeenCalledWith({ _id: created._id });
  });

  it('cancels only a cooling-off request', async () => {
    const { service, requests, audit } = setup();
    await expect(service.cancel(userId, {} as never)).resolves.toMatchObject({
      status: AccountDeletionRequestStatus.CANCELLED,
    });
    expect(requests.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: AccountDeletionRequestStatus.COOLING_OFF,
        coolingOffUntil: { $gt: expect.any(Date) },
      }),
      expect.any(Object),
      { new: true },
    );
    expect(audit.log).toHaveBeenCalled();
  });

  it('returns a bounded admin queue without exposing hidden fields', async () => {
    const row = { ...document(), reason: 'privacy' };
    const chain = {
      sort: jest.fn(),
      skip: jest.fn(),
      limit: jest.fn().mockResolvedValue([row]),
    };
    chain.sort.mockReturnValue(chain);
    chain.skip.mockReturnValue(chain);
    const { service, requests } = setup();
    requests.findOne = jest.fn();
    Object.assign(requests, {
      find: jest.fn().mockReturnValue(chain),
      countDocuments: jest.fn().mockResolvedValue(1),
    });

    await expect(
      service.listAdmin({
        page: 1,
        page_size: 20,
        status: [AccountDeletionRequestStatus.COOLING_OFF],
      }),
    ).resolves.toMatchObject({
      result: [
        {
          id: row._id.toString(),
          userId,
          reason: 'privacy',
          status: AccountDeletionRequestStatus.COOLING_OFF,
        },
      ],
      pagination: {
        total: 1,
        count: 1,
        page: 1,
        page_size: 20,
      },
    });
    expect(chain.limit).toHaveBeenCalledWith(20);
  });
});
