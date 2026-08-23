import { Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuditService } from '../audit/audit.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuditAction, OutboxMessageStatus, Role } from '../common/enums';
import { ListOperationalOutboxQueryDto } from './dto/outbox.dto';
import { OutboxService } from './outbox.service';

@ApiTags('admin-outbox')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin/outbox')
export class AdminOutboxController {
  constructor(
    private readonly outbox: OutboxService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List operational outbox messages' })
  list(@Query() query: ListOperationalOutboxQueryDto) {
    return this.outbox.listOperational(
      query.status ?? OutboxMessageStatus.DEAD_LETTER,
      query.limit,
    );
  }

  @Post(':id/replay')
  @ApiOperation({ summary: 'Safely replay one dead-letter outbox message' })
  async replay(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    const result = await this.outbox.replayDeadLetter(id);
    this.audit.log({
      action: AuditAction.OUTBOX_REPLAYED,
      actorId: adminId,
      metadata: { outboxMessageId: result.id, eventName: result.eventName },
      request,
    });
    return result;
  }
}
