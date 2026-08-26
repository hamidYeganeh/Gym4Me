import { ConflictException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { Types } from 'mongoose';
import { ClubInventoryCondition } from '../schemas/club-inventory-item.schema';
import { InventoryService } from './inventory.service';

describe('InventoryService', () => {
  const ownerId = new Types.ObjectId().toString();
  const clubId = new Types.ObjectId().toString();
  const itemId = new Types.ObjectId();
  const session = { id: 'session' };

  function setup() {
    const items = {
      findOne: jest.fn(),
      create: jest.fn(),
      findOneAndUpdate: jest.fn(),
      exists: jest.fn(),
    };
    const clubs = {
      exists: jest.fn().mockReturnValue({
        session: jest.fn().mockResolvedValue({ _id: clubId }),
      }),
    };
    const transactions = {
      run: jest.fn((work: (value: typeof session) => unknown) => work(session)),
    };
    const outbox = { enqueue: jest.fn().mockResolvedValue({}) };
    const service = new InventoryService(
      items as never,
      clubs as never,
      transactions as never,
      outbox as never,
    );
    return { clubs, items, outbox, service, transactions };
  }

  const input = {
    name: 'تردمیل',
    quantity: 2,
    condition: ClubInventoryCondition.GOOD,
    idempotencyKey: 'inventory-create-1',
  };

  it('writes the item and outbox in the same transaction session', async () => {
    const { items, outbox, service } = setup();
    items.findOne.mockReturnValue({
      session: jest
        .fn()
        .mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }),
    });
    const stored = {
      _id: itemId,
      clubId: new Types.ObjectId(clubId),
      name: input.name,
      quantity: input.quantity,
      condition: input.condition,
      status: 'active',
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    items.create.mockResolvedValue([{ _id: itemId, toObject: () => stored }]);

    const result = await service.create(ownerId, clubId, input);

    expect(result.id).toBe(itemId.toString());
    expect(items.create).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ session }),
    );
    expect(outbox.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'inventory.item_created' }),
      session,
    );
  });

  it('rejects reuse of a create idempotency key with another payload', async () => {
    const { items, outbox, service } = setup();
    items.findOne.mockReturnValue({
      session: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ createFingerprint: 'different' }),
      }),
    });

    await expect(service.create(ownerId, clubId, input)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(items.create).not.toHaveBeenCalled();
    expect(outbox.enqueue).not.toHaveBeenCalled();
  });

  it('recovers a concurrent duplicate-key winner when the payload matches', async () => {
    const { items, service, transactions } = setup();
    const fingerprint = createHash('sha256')
      .update(
        JSON.stringify({
          name: input.name,
          quantity: input.quantity,
          locationLabel: null,
          condition: input.condition,
          nextServiceAt: null,
          maintenanceNote: null,
        }),
      )
      .digest('hex');
    transactions.run.mockRejectedValue({ code: 11000 });
    items.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: itemId,
        clubId: new Types.ObjectId(clubId),
        name: input.name,
        quantity: input.quantity,
        condition: input.condition,
        status: 'active',
        version: 1,
        createFingerprint: fingerprint,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    });

    await expect(service.create(ownerId, clubId, input)).resolves.toEqual(
      expect.objectContaining({ id: itemId.toString() }),
    );
  });

  it('rejects a stale optimistic-concurrency update', async () => {
    const { items, outbox, service } = setup();
    items.findOneAndUpdate.mockResolvedValue(null);
    items.exists.mockReturnValue({
      session: jest.fn().mockResolvedValue(true),
    });

    await expect(
      service.update(ownerId, clubId, itemId.toString(), {
        expectedVersion: 1,
        condition: ClubInventoryCondition.OUT_OF_SERVICE,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(outbox.enqueue).not.toHaveBeenCalled();
  });
});
