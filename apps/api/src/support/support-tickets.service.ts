import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Request } from 'express';
import { Model, Types } from 'mongoose';
import type { QueryFilter } from 'mongoose';
import { AuditService } from '../audit/audit.service';
import {
  AuditAction,
  Role,
  SupportMessageAuthorKind,
  SupportTicketStatus,
} from '../common/enums';
import { randomShortCode } from '../common/utils/hash.util';
import {
  paginatedResult,
  resolvePageSize,
} from '../common/utils/pagination.util';
import {
  SupportTicket,
  SupportTicketDocument,
} from '../schemas/support-ticket.schema';
import {
  SupportTicketMessage,
  SupportTicketMessageDocument,
} from '../schemas/support-ticket-message.schema';
import {
  CreateTicketDto,
  ListMyTicketsQueryDto,
  ReplyTicketDto,
} from './dto/support.dto';
import { toPublicMessage, toPublicTicket } from './support-ticket.serializer';

const REQUESTER_POPULATE = ['requester.userId', 'phone name'] as const;

@Injectable()
export class SupportTicketsService {
  constructor(
    @InjectModel(SupportTicket.name)
    private readonly ticketModel: Model<SupportTicketDocument>,
    @InjectModel(SupportTicketMessage.name)
    private readonly messageModel: Model<SupportTicketMessageDocument>,
    private readonly audit: AuditService,
  ) {}

  async create(
    userId: string,
    activeRole: Role,
    dto: CreateTicketDto,
    request: Request,
  ) {
    const ticket = await this.ticketModel.create({
      ticketNumber: await this.generateTicketNumber(),
      requester: { userId: new Types.ObjectId(userId), role: activeRole },
      category: dto.category,
      subject: dto.subject,
      relatedEntity: dto.relatedEntity
        ? {
            kind: dto.relatedEntity.kind,
            id: new Types.ObjectId(dto.relatedEntity.id),
          }
        : undefined,
      lastMessageAt: new Date(),
      messageCount: 1,
    });

    await this.messageModel.create({
      ticketId: ticket._id,
      author: {
        userId: new Types.ObjectId(userId),
        kind: SupportMessageAuthorKind.REQUESTER,
      },
      body: dto.body,
      attachments: (dto.attachments ?? []).map((id) => new Types.ObjectId(id)),
    });

    this.audit.log({
      action: AuditAction.SUPPORT_TICKET_CREATED,
      actorId: userId,
      metadata: {
        ticketId: ticket._id.toString(),
        ticketNumber: ticket.ticketNumber,
        category: ticket.category,
      },
      request,
    });

    return this.getMine(userId, ticket._id.toString());
  }

  async listMine(userId: string, query: ListMyTicketsQueryDto) {
    const filter: QueryFilter<SupportTicketDocument> = {
      'requester.userId': new Types.ObjectId(userId),
    };
    if (query.status) filter.status = query.status;
    if (query.category) filter.category = query.category;

    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.ticketModel
        .find(filter)
        .sort({ lastMessageAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .populate(...REQUESTER_POPULATE)
        .lean(),
      this.ticketModel.countDocuments(filter),
    ]);

    return paginatedResult(items.map(toPublicTicket), total, page, pageSize);
  }

  async getMine(userId: string, ticketId: string) {
    const ticket = await this.findOwnTicket(userId, ticketId);
    const messages = await this.messageModel
      .find({ ticketId: ticket._id })
      .sort({ createdAt: 1 })
      .populate('author.userId', 'phone name')
      .lean();

    const populated = await this.ticketModel
      .findById(ticket._id)
      .populate(...REQUESTER_POPULATE)
      .lean();

    return {
      ...toPublicTicket(populated!),
      messages: messages.map(toPublicMessage),
    };
  }

  async reply(
    userId: string,
    ticketId: string,
    dto: ReplyTicketDto,
    request: Request,
  ) {
    const ticket = await this.findOwnTicket(userId, ticketId);
    if (ticket.status === SupportTicketStatus.CLOSED) {
      throw new ConflictException(
        'This ticket is closed; open a new ticket instead',
      );
    }

    await this.messageModel.create({
      ticketId: ticket._id,
      author: {
        userId: new Types.ObjectId(userId),
        kind: SupportMessageAuthorKind.REQUESTER,
      },
      body: dto.body,
      attachments: (dto.attachments ?? []).map((id) => new Types.ObjectId(id)),
    });

    ticket.status = SupportTicketStatus.AWAITING_ADMIN;
    // A user reply reopens a resolved ticket; the resolution no longer holds.
    ticket.resolution = undefined;
    ticket.lastMessageAt = new Date();
    ticket.messageCount += 1;
    await ticket.save();

    this.audit.log({
      action: AuditAction.SUPPORT_TICKET_REPLIED,
      actorId: userId,
      metadata: {
        ticketId: ticket._id.toString(),
        ticketNumber: ticket.ticketNumber,
        authorKind: SupportMessageAuthorKind.REQUESTER,
      },
      request,
    });

    return this.getMine(userId, ticketId);
  }

  async close(userId: string, ticketId: string, request: Request) {
    const ticket = await this.findOwnTicket(userId, ticketId);
    if (ticket.status === SupportTicketStatus.CLOSED) {
      throw new ConflictException('Ticket is already closed');
    }

    ticket.status = SupportTicketStatus.CLOSED;
    await ticket.save();

    this.audit.log({
      action: AuditAction.SUPPORT_TICKET_CLOSED,
      actorId: userId,
      metadata: {
        ticketId: ticket._id.toString(),
        ticketNumber: ticket.ticketNumber,
        closedBy: 'requester',
      },
      request,
    });

    return this.getMine(userId, ticketId);
  }

  private async findOwnTicket(userId: string, ticketId: string) {
    if (!Types.ObjectId.isValid(ticketId)) {
      throw new NotFoundException('Ticket not found');
    }
    const ticket = await this.ticketModel.findOne({
      _id: new Types.ObjectId(ticketId),
      'requester.userId': new Types.ObjectId(userId),
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  private async generateTicketNumber(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = `T-${randomShortCode(8)}`;
      const exists = await this.ticketModel.exists({
        ticketNumber: candidate,
      });
      if (!exists) return candidate;
    }
    throw new ConflictException('Could not allocate a ticket number');
  }
}
