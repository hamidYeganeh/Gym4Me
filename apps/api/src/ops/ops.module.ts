import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditModule } from '../audit/audit.module';
import { Club, ClubSchema } from '../schemas/club.schema';
import { OwnerTask, OwnerTaskSchema } from '../schemas/owner-task.schema';
import { OpsService } from './ops.service';
import { OwnerOpsController } from './owner-ops.controller';

@Module({
  imports: [
    AuditModule,
    MongooseModule.forFeature([
      { name: OwnerTask.name, schema: OwnerTaskSchema },
      { name: Club.name, schema: ClubSchema },
    ]),
  ],
  controllers: [OwnerOpsController],
  providers: [OpsService],
  exports: [OpsService],
})
export class OpsModule {}
