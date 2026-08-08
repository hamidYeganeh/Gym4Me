import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DeviceToken,
  DeviceTokenSchema,
} from '../schemas/device-token.schema';
import {
  Notification,
  NotificationSchema,
} from '../schemas/notification.schema';
import {
  NotificationTemplate,
  NotificationTemplateSchema,
} from '../schemas/notification-template.schema';
import { UsersModule } from '../users/users.module';
import {
  DevicesController,
  NotificationsController,
} from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: NotificationTemplate.name, schema: NotificationTemplateSchema },
      { name: DeviceToken.name, schema: DeviceTokenSchema },
    ]),
    UsersModule,
  ],
  controllers: [NotificationsController, DevicesController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
