import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { Role } from '../common/enums';
import {
  CreateTicketDto,
  ListMyTicketsQueryDto,
  ReplyTicketDto,
} from './dto/support.dto';
import { SupportTicketsService } from './support-tickets.service';

@ApiTags('support')
@ApiBearerAuth('access-token')
@Controller('account/support')
export class AccountSupportController {
  constructor(private readonly tickets: SupportTicketsService) {}

  @Throttle({ default: { limit: 10, ttl: 3_600_000 } })
  @Post('tickets')
  @ApiOperation({ summary: 'Open a support ticket' })
  createTicket(
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Body() dto: CreateTicketDto,
    @Req() request: Request,
  ) {
    return this.tickets.create(userId, activeRole, dto, request);
  }

  @Get('tickets')
  @ApiOperation({ summary: 'List my support tickets' })
  listTickets(
    @CurrentUser('sub') userId: string,
    @Query() query: ListMyTicketsQueryDto,
  ) {
    return this.tickets.listMine(userId, query);
  }

  @Get('tickets/:ticketId')
  @ApiOperation({ summary: 'Get one of my tickets with its messages' })
  getTicket(
    @CurrentUser('sub') userId: string,
    @Param('ticketId') ticketId: string,
  ) {
    return this.tickets.getMine(userId, ticketId);
  }

  @Throttle({ default: { limit: 30, ttl: 3_600_000 } })
  @Post('tickets/:ticketId/messages')
  @ApiOperation({ summary: 'Reply on my ticket' })
  reply(
    @CurrentUser('sub') userId: string,
    @Param('ticketId') ticketId: string,
    @Body() dto: ReplyTicketDto,
    @Req() request: Request,
  ) {
    return this.tickets.reply(userId, ticketId, dto, request);
  }

  @Patch('tickets/:ticketId/close')
  @HttpCode(200)
  @ApiOperation({ summary: 'Close my ticket' })
  close(
    @CurrentUser('sub') userId: string,
    @Param('ticketId') ticketId: string,
    @Req() request: Request,
  ) {
    return this.tickets.close(userId, ticketId, request);
  }
}
