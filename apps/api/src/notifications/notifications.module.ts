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
  NotificationPreference,
  NotificationPreferenceSchema,
} from '../schemas/notification-preference.schema';
import {
  NotificationTemplate,
  NotificationTemplateSchema,
} from '../schemas/notification-template.schema';
import { UsersModule } from '../users/users.module';
import { AdminNotificationTemplatesController } from './admin-notification-templates.controller';
import { NotificationPreferencesService } from './notification-preferences.service';
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
      {
        name: NotificationPreference.name,
        schema: NotificationPreferenceSchema,
      },
    ]),
    UsersModule,
  ],
  controllers: [
    NotificationsController,
    DevicesController,
    AdminNotificationTemplatesController,
  ],
  providers: [NotificationsService, NotificationPreferencesService],
  exports: [NotificationsService, NotificationPreferencesService],
})
export class NotificationsModule {}
