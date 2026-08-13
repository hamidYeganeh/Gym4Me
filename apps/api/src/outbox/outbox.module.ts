import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsModule } from '../notifications/notifications.module';
import {
  OutboxMessage,
  OutboxMessageSchema,
} from '../schemas/outbox-message.schema';
import { OutboxService } from './outbox.service';
import { OutboxWorker } from './outbox.worker';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OutboxMessage.name, schema: OutboxMessageSchema },
    ]),
    NotificationsModule,
  ],
  providers: [OutboxService, OutboxWorker],
  exports: [OutboxService],
})
export class OutboxModule {}
