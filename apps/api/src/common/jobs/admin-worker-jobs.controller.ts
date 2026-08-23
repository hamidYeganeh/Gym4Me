import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums';
import { WorkerLeaseService } from './worker-lease.service';

@ApiTags('admin-worker-jobs')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin/worker-jobs')
export class AdminWorkerJobsController {
  constructor(private readonly leases: WorkerLeaseService) {}

  @Get()
  @ApiOperation({ summary: 'List periodic worker leases and heartbeats' })
  list() {
    return this.leases.listOperational();
  }
}
