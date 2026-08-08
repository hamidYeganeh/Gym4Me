import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import { AdminSupportService } from './admin-support.service';
import {
  AdminListFaqQueryDto,
  AdminListTicketsQueryDto,
  AdminUpdateTicketDto,
  CreateFaqDto,
  UpdateFaqDto,
} from './dto/admin-support.dto';
import { ReplyTicketDto } from './dto/support.dto';
import { FaqService } from './faq.service';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin/support')
export class AdminSupportController {
  constructor(
    private readonly support: AdminSupportService,
    private readonly faq: FaqService,
  ) {}

  // ── Tickets ────────────────────────────────────

  @Get('tickets')
  @ApiOperation({ summary: 'List support tickets' })
  listTickets(@Query() query: AdminListTicketsQueryDto) {
    return this.support.list(query);
  }

  @Get('tickets/:ticketId')
  @ApiOperation({ summary: 'Get a ticket with its messages' })
  getTicket(@Param('ticketId') ticketId: string) {
    return this.support.get(ticketId);
  }

  @Post('tickets/:ticketId/messages')
  @ApiOperation({ summary: 'Reply to a ticket as admin' })
  reply(
    @Param('ticketId') ticketId: string,
    @Body() dto: ReplyTicketDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.support.reply(ticketId, dto, adminId, request);
  }

  @Patch('tickets/:ticketId/assign')
  @HttpCode(200)
  @ApiOperation({ summary: 'Assign the ticket to the current admin' })
  assign(
    @Param('ticketId') ticketId: string,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.support.assignToMe(ticketId, adminId, request);
  }

  @Patch('tickets/:ticketId')
  @ApiOperation({ summary: 'Update ticket status / priority / resolution' })
  updateTicket(
    @Param('ticketId') ticketId: string,
    @Body() dto: AdminUpdateTicketDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.support.update(ticketId, dto, adminId, request);
  }

  // ── FAQ ────────────────────────────────────────

  @Get('faq')
  @ApiOperation({ summary: 'List FAQ items (all statuses)' })
  listFaq(@Query() query: AdminListFaqQueryDto) {
    return this.faq.adminList(query);
  }

  @Post('faq')
  @ApiOperation({ summary: 'Create an FAQ item' })
  createFaq(
    @Body() dto: CreateFaqDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.faq.create(dto, adminId, request);
  }

  @Patch('faq/:id')
  @ApiOperation({ summary: 'Update an FAQ item' })
  updateFaq(
    @Param('id') id: string,
    @Body() dto: UpdateFaqDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.faq.update(id, dto, adminId, request);
  }

  @Delete('faq/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete an FAQ item' })
  deleteFaq(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.faq.remove(id, adminId, request);
  }
}
