import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WorkerLease,
  WorkerLeaseSchema,
} from '../../schemas/worker-lease.schema';
import { WorkerLeaseService } from './worker-lease.service';
import { AdminWorkerJobsController } from './admin-worker-jobs.controller';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkerLease.name, schema: WorkerLeaseSchema },
    ]),
  ],
  controllers: [AdminWorkerJobsController],
  providers: [WorkerLeaseService],
  exports: [WorkerLeaseService],
})
export class WorkerRuntimeModule {}
