import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module.js";
import { OrganizationModule } from "../organization/organization.module.js";
import {
  AdminNotificationController,
  NotificationController,
  OrganizationAnnouncementController,
} from "./notification.controller.js";
import { NotificationService } from "./notification.service.js";

@Module({
  imports: [OrganizationModule, AuditModule],
  controllers: [
    NotificationController,
    OrganizationAnnouncementController,
    AdminNotificationController,
  ],
  providers: [NotificationService],
})
export class NotificationModule {}
