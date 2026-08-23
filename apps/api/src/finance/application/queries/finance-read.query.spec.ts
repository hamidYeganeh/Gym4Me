import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  LedgerEntryKind,
  PaymentChannel,
  PaymentPurpose,
  PaymentStatus,
} from '../../../common/enums';
import { FinanceReadQuery } from './finance-read.query';

function boundedQuery<T>(items: T[]) {
  const lean = jest.fn().mockResolvedValue(items);
  const limit = jest.fn().mockReturnValue({ lean });
  const skip = jest.fn().mockReturnValue({ limit });
  const sort = jest.fn().mockReturnValue({ skip });
  return { root: { sort }, spies: { lean, limit, skip, sort } };
}

describe('FinanceReadQuery', () => {
  function setup() {
    const paymentQuery = boundedQuery([{ id: 'payment-1' }]);
    const ledgerQuery = boundedQuery([{ id: 'ledger-1' }]);
    const paymentModel = {
      find: jest.fn().mockReturnValue(paymentQuery.root),
      countDocuments: jest.fn().mockResolvedValue(51),
    };
    const ledgerModel = {
      find: jest.fn().mockReturnValue(ledgerQuery.root),
      countDocuments: jest.fn().mockResolvedValue(1),
    };
    return {
      ledgerModel,
      ledgerQuery,
      paymentModel,
      paymentQuery,
      query: new FinanceReadQuery(paymentModel as never, ledgerModel as never),
    };
  }

  it('builds a bounded, searchable payment page with explicit filters', async () => {
    const clubId = new Types.ObjectId().toString();
    const payerUserId = new Types.ObjectId().toString();
    const { paymentModel, paymentQuery, query } = setup();

    const result = await query.listPayments({
      page: 2,
      page_size: 25,
      status: [PaymentStatus.CAPTURED],
      channel: [PaymentChannel.ZARINPAL],
      purpose: [PaymentPurpose.BOOKING],
      clubId,
      payerUserId,
      search: 'order.1',
      sortBy: 'amount',
      sortOrder: 'asc',
    });

    expect(paymentModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        status: { $in: [PaymentStatus.CAPTURED] },
        channel: { $in: [PaymentChannel.ZARINPAL] },
        purpose: { $in: [PaymentPurpose.BOOKING] },
        'related.clubId': new Types.ObjectId(clubId),
        'payer.userId': new Types.ObjectId(payerUserId),
        $or: expect.arrayContaining([
          { 'reference.orderId': /order\.1/i },
          { idempotencyKey: /order\.1/i },
        ]),
      }),
    );
    expect(paymentQuery.spies.sort).toHaveBeenCalledWith({
      'amount.gross': 1,
      _id: 1,
    });
    expect(paymentQuery.spies.skip).toHaveBeenCalledWith(25);
    expect(paymentQuery.spies.limit).toHaveBeenCalledWith(25);
    expect(result).toEqual({
      message: 'success.generic',
      result: [{ id: 'payment-1' }],
      pagination: {
        page: 2,
        page_size: 25,
        next: 3,
        prev: 1,
        count: 51,
        total: 51,
      },
    });
  });

  it('bounds ledger reads and preserves the immutable occurrence range', async () => {
    const clubId = new Types.ObjectId().toString();
    const paymentId = new Types.ObjectId().toString();
    const { ledgerModel, ledgerQuery, query } = setup();

    const result = await query.listLedger({
      limit: 500,
      kind: [LedgerEntryKind.PAYMENT],
      clubId,
      paymentId,
      from: '2026-08-01T00:00:00.000Z',
      to: '2026-08-31T23:59:59.999Z',
      search: 'payment:',
    });

    expect(ledgerModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: { $in: [LedgerEntryKind.PAYMENT] },
        'related.clubId': new Types.ObjectId(clubId),
        paymentId: new Types.ObjectId(paymentId),
        occurredAt: {
          $gte: new Date('2026-08-01T00:00:00.000Z'),
          $lte: new Date('2026-08-31T23:59:59.999Z'),
        },
        $or: [{ dedupeKey: /payment:/i }, { note: /payment:/i }],
      }),
    );
    expect(ledgerQuery.spies.sort).toHaveBeenCalledWith({ occurredAt: -1 });
    expect(ledgerQuery.spies.skip).toHaveBeenCalledWith(0);
    expect(ledgerQuery.spies.limit).toHaveBeenCalledWith(200);
    expect(result.pagination.page_size).toBe(200);
  });

  it('rejects invalid scoped identifiers before querying Mongo', async () => {
    const { paymentModel, query } = setup();

    await expect(query.listPayments({ clubId: 'invalid' })).rejects.toThrow(
      BadRequestException,
    );
    expect(paymentModel.find).not.toHaveBeenCalled();
  });
});
