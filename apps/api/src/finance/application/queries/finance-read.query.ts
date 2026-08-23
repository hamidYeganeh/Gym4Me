import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, type QueryFilter } from 'mongoose';
import {
  paginatedResult,
  resolvePageSize,
} from '../../../common/utils/pagination.util';
import {
  createSearchFilter,
  resolveListSort,
} from '../../../common/utils/list-query.util';
import {
  LedgerEntry,
  type LedgerEntryDocument,
} from '../../../schemas/ledger-entry.schema';
import { Payment, type PaymentDocument } from '../../../schemas/payment.schema';
import type {
  ListLedgerQueryDto,
  ListPaymentsQueryDto,
} from '../../dto/finance.dto';

/** Bounded payment and immutable-ledger read models for finance facades. */
@Injectable()
export class FinanceReadQuery {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(LedgerEntry.name)
    private readonly ledgerModel: Model<LedgerEntryDocument>,
  ) {}

  async listPayments(query: ListPaymentsQueryDto) {
    const filter: QueryFilter<PaymentDocument> = {};
    if (query.status) filter.status = { $in: query.status };
    if (query.channel) filter.channel = { $in: query.channel };
    if (query.purpose) filter.purpose = { $in: query.purpose };
    if (query.clubId) {
      filter['related.clubId'] = this.toObjectId(query.clubId, 'clubId');
    }
    if (query.payerUserId) {
      filter['payer.userId'] = this.toObjectId(
        query.payerUserId,
        'payerUserId',
      );
    }
    Object.assign(
      filter,
      createSearchFilter(query.search, [
        'reference.orderId',
        'reference.authority',
        'reference.gatewayRefId',
        'reference.externalRef',
        'idempotencyKey',
        'payer.guest.name',
        'payer.guest.phone',
        'operator.note',
      ]),
    );

    const { page, pageSize } = resolvePageSize(query);
    const sort = resolveListSort(
      query,
      {
        createdAt: 'createdAt',
        capturedAt: 'capturedAt',
        amount: 'amount.gross',
        status: 'status',
        channel: 'channel',
        purpose: 'purpose',
        orderId: 'reference.orderId',
      },
      { createdAt: -1 },
    );
    const [items, total] = await Promise.all([
      this.paymentModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.paymentModel.countDocuments(filter),
    ]);
    return paginatedResult(items, total, page, pageSize);
  }

  async listLedger(query: ListLedgerQueryDto) {
    const filter: QueryFilter<LedgerEntryDocument> = {};
    if (query.kind) filter.kind = { $in: query.kind };
    if (query.clubId) {
      filter['related.clubId'] = this.toObjectId(query.clubId, 'clubId');
    }
    if (query.paymentId) {
      filter.paymentId = this.toObjectId(query.paymentId, 'paymentId');
    }
    if (query.from || query.to) {
      filter.occurredAt = {};
      if (query.from) {
        (filter.occurredAt as Record<string, Date>).$gte = new Date(query.from);
      }
      if (query.to) {
        (filter.occurredAt as Record<string, Date>).$lte = new Date(query.to);
      }
    }
    Object.assign(
      filter,
      createSearchFilter(query.search, ['dedupeKey', 'note']),
    );

    const { page, pageSize } = resolvePageSize(query);
    const sort = resolveListSort(
      query,
      {
        occurredAt: 'occurredAt',
        createdAt: 'createdAt',
        kind: 'kind',
        amount: 'split.gross',
        dedupeKey: 'dedupeKey',
      },
      { occurredAt: -1 },
    );
    const [items, total] = await Promise.all([
      this.ledgerModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.ledgerModel.countDocuments(filter),
    ]);
    return paginatedResult(items, total, page, pageSize);
  }

  private toObjectId(id: string, label: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${label}`);
    }
    return new Types.ObjectId(id);
  }
}
