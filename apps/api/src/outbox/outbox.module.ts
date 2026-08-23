import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';
import {
  OutboxMessage,
  OutboxMessageSchema,
} from '../schemas/outbox-message.schema';
import { OutboxService } from './outbox.service';
import { OutboxWorker } from './outbox.worker';
import { AdminOutboxController } from './admin-outbox.controller';

@Module({
  imports: [
    AuditModule,
    MongooseModule.forFeature([
      { name: OutboxMessage.name, schema: OutboxMessageSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [AdminOutboxController],
  providers: [OutboxService, OutboxWorker],
  exports: [OutboxService],
})
export class OutboxModule {}
