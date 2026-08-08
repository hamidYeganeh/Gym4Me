import {
  BadRequestException,
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
  SupportMessageAuthorKind,
  SupportTicketStatus,
} from '../common/enums';
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
  AdminListTicketsQueryDto,
  AdminUpdateTicketDto,
} from './dto/admin-support.dto';
import { ReplyTicketDto } from './dto/support.dto';
import { toPublicMessage, toPublicTicket } from './support-ticket.serializer';

const TICKET_POPULATE: [string, string][] = [
  ['requester.userId', 'phone name'],
  ['assignment.adminId', 'phone name'],
  ['resolution.resolvedBy', 'phone name'],
];

@Injectable()
export class AdminSupportService {
  constructor(
    @InjectModel(SupportTicket.name)
    private readonly ticketModel: Model<SupportTicketDocument>,
    @InjectModel(SupportTicketMessage.name)
    private readonly messageModel: Model<SupportTicketMessageDocument>,
    private readonly audit: AuditService,
  ) {}

  async list(query: AdminListTicketsQueryDto) {
    const filter: QueryFilter<SupportTicketDocument> = {};
    if (query.status) filter.status = query.status;
    if (query.category) filter.category = query.category;
    if (query.priority) filter.priority = query.priority;
    if (query.search) {
      const pattern = new RegExp(
        query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i',
      );
      filter.$or = [{ ticketNumber: pattern }, { subject: pattern }];
    }

    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.ticketModel
        .find(filter)
        .sort({ lastMessageAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .populate(TICKET_POPULATE.map(([path, select]) => ({ path, select })))
        .lean(),
      this.ticketModel.countDocuments(filter),
    ]);

    return paginatedResult(items.map(toPublicTicket), total, page, pageSize);
  }

  async get(ticketId: string) {
    const ticket = await this.findTicket(ticketId);
    const [populated, messages] = await Promise.all([
      this.ticketModel
        .findById(ticket._id)
        .populate(TICKET_POPULATE.map(([path, select]) => ({ path, select })))
        .lean(),
      this.messageModel
        .find({ ticketId: ticket._id })
        .sort({ createdAt: 1 })
        .populate('author.userId', 'phone name')
        .lean(),
    ]);

    return {
      ...toPublicTicket(populated!),
      messages: messages.map(toPublicMessage),
    };
  }

  async reply(
    ticketId: string,
    dto: ReplyTicketDto,
    adminId: string,
    request: Request,
  ) {
    const ticket = await this.findTicket(ticketId);
    if (ticket.status === SupportTicketStatus.CLOSED) {
      throw new ConflictException('Cannot reply to a closed ticket');
    }

    await this.messageModel.create({
      ticketId: ticket._id,
      author: {
        userId: new Types.ObjectId(adminId),
        kind: SupportMessageAuthorKind.ADMIN,
      },
      body: dto.body,
      attachments: (dto.attachments ?? []).map((id) => new Types.ObjectId(id)),
    });

    ticket.status = SupportTicketStatus.AWAITING_USER;
    ticket.lastMessageAt = new Date();
    ticket.messageCount += 1;
    if (!ticket.assignment) {
      ticket.assignment = {
        adminId: new Types.ObjectId(adminId),
        assignedAt: new Date(),
      };
    }
    await ticket.save();

    this.audit.log({
      action: AuditAction.SUPPORT_TICKET_REPLIED,
      actorId: adminId,
      targetUserId: ticket.requester.userId,
      metadata: {
        ticketId: ticket._id.toString(),
        ticketNumber: ticket.ticketNumber,
        authorKind: SupportMessageAuthorKind.ADMIN,
      },
      request,
    });

    return this.get(ticketId);
  }

  async assignToMe(ticketId: string, adminId: string, request: Request) {
    const ticket = await this.findTicket(ticketId);
    ticket.assignment = {
      adminId: new Types.ObjectId(adminId),
      assignedAt: new Date(),
    };
    await ticket.save();

    this.audit.log({
      action: AuditAction.SUPPORT_TICKET_UPDATED,
      actorId: adminId,
      targetUserId: ticket.requester.userId,
      metadata: {
        ticketId: ticket._id.toString(),
        ticketNumber: ticket.ticketNumber,
        change: 'assigned',
      },
      request,
    });

    return this.get(ticketId);
  }

  async update(
    ticketId: string,
    dto: AdminUpdateTicketDto,
    adminId: string,
    request: Request,
  ) {
    const ticket = await this.findTicket(ticketId);

    if (dto.priority) ticket.priority = dto.priority;

    if (dto.status) {
      if (dto.status === SupportTicketStatus.RESOLVED) {
        if (!dto.resolutionNote) {
          throw new BadRequestException(
            'resolutionNote is required when resolving a ticket',
          );
        }
        ticket.resolution = {
          note: dto.resolutionNote,
          resolvedBy: new Types.ObjectId(adminId),
          resolvedAt: new Date(),
        };
      }
      if (
        dto.status !== SupportTicketStatus.RESOLVED &&
        dto.status !== SupportTicketStatus.CLOSED
      ) {
        ticket.resolution = undefined;
      }
      ticket.status = dto.status;
    }

    await ticket.save();

    this.audit.log({
      action:
        dto.status === SupportTicketStatus.CLOSED
          ? AuditAction.SUPPORT_TICKET_CLOSED
          : AuditAction.SUPPORT_TICKET_UPDATED,
      actorId: adminId,
      targetUserId: ticket.requester.userId,
      metadata: {
        ticketId: ticket._id.toString(),
        ticketNumber: ticket.ticketNumber,
        status: dto.status,
        priority: dto.priority,
      },
      request,
    });

    return this.get(ticketId);
  }

  private async findTicket(ticketId: string) {
    if (!Types.ObjectId.isValid(ticketId)) {
      throw new NotFoundException('Ticket not found');
    }
    const ticket = await this.ticketModel.findById(ticketId);
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }
}
