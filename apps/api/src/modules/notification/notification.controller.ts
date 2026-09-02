import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "../../security/rbac.js";
import { paginated, success } from "../../common/response.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import { RequirePermission } from "../../security/permission.decorator.js";
import { PermissionGuard } from "../../security/permission.guard.js";
import { NotificationService } from "./notification.service.js";
import {
  announcementCreateSchema,
  announcementPatchSchema,
  deviceRegistrationSchema,
  notificationListSchema,
  objectId,
  preferenceSchema,
  retrySchema,
  templatePatchSchema,
} from "./schemas/notification.schemas.js";

@ApiTags("Notifications")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("notifications")
export class NotificationController {
  constructor(private readonly service: NotificationService) {}
  @Get("me") async mine(@Req() req: AuthenticatedRequest, @Query() raw: unknown) {
    const q = notificationListSchema.parse(raw),
      r = await this.service.mine(req.auth.sub, q);
    return paginated(req, r.items, { ...q, total: r.total, unread: r.unread });
  }
  @Patch(":notificationId/read") async read(
    @Req() req: AuthenticatedRequest,
    @Param("notificationId") id: string,
  ) {
    return success(req, await this.service.read(req.auth.sub, objectId.parse(id)));
  }
  @Post("me/read-all") async readAll(@Req() req: AuthenticatedRequest) {
    return success(req, await this.service.readAll(req.auth.sub));
  }
  @Get("preferences/me") async preferences(@Req() req: AuthenticatedRequest) {
    return success(req, await this.service.preferences(req.auth.sub));
  }
  @Patch("preferences/me") async updatePreferences(
    @Req() req: AuthenticatedRequest,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.updatePreferences(req.auth.sub, preferenceSchema.parse(raw)),
    );
  }
  @Get("devices/me") async devices(@Req() req: AuthenticatedRequest) {
    return success(req, await this.service.devices(req.auth.sub));
  }
  @Post("devices/me") async registerDevice(@Req() req: AuthenticatedRequest, @Body() raw: unknown) {
    return success(
      req,
      await this.service.registerDevice(req.auth.sub, deviceRegistrationSchema.parse(raw)),
    );
  }
  @Post("devices/:installationId/revoke") async revokeDevice(
    @Req() req: AuthenticatedRequest,
    @Param("installationId") installationId: string,
  ) {
    return success(req, await this.service.revokeDevice(req.auth.sub, installationId));
  }
}

@ApiTags("Organization Announcements")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("organizations/:organizationId/announcements")
export class OrganizationAnnouncementController {
  constructor(private readonly service: NotificationService) {}
  @Get() async list(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Query() raw: unknown,
  ) {
    const q = notificationListSchema.parse(raw),
      r = await this.service.announcements(req.auth.sub, objectId.parse(id), q);
    return paginated(req, r.items, { ...q, total: r.total });
  }
  @Post() async create(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.createAnnouncement(
        req.auth.sub,
        objectId.parse(id),
        announcementCreateSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Patch(":announcementId") async update(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Param("announcementId") announcementId: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.updateAnnouncement(
        req.auth.sub,
        objectId.parse(id),
        objectId.parse(announcementId),
        announcementPatchSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Post(":announcementId/publish") async publish(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Param("announcementId") announcementId: string,
  ) {
    return success(
      req,
      await this.service.publish(
        req.auth.sub,
        objectId.parse(id),
        objectId.parse(announcementId),
        req.id,
      ),
    );
  }
}

@ApiTags("Admin / Notifications")
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@Controller("admin/notifications")
export class AdminNotificationController {
  constructor(private readonly service: NotificationService) {}
  @Get("jobs") @RequirePermission(PERMISSIONS.ADMIN_NOTIFICATIONS_MANAGE) async jobs(
    @Req() req: AuthenticatedRequest,
    @Query() raw: unknown,
  ) {
    const q = notificationListSchema.parse(raw),
      r = await this.service.adminJobs(q);
    return paginated(req, r.items, { ...q, total: r.total });
  }
  @Get("templates") @RequirePermission(PERMISSIONS.ADMIN_NOTIFICATIONS_MANAGE) async templates(
    @Req() req: AuthenticatedRequest,
  ) {
    return success(req, await this.service.adminTemplates());
  }
  @Patch("templates/:templateId")
  @RequirePermission(PERMISSIONS.ADMIN_NOTIFICATIONS_MANAGE)
  async updateTemplate(
    @Req() req: AuthenticatedRequest,
    @Param("templateId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.updateTemplate(
        req.auth.sub,
        objectId.parse(id),
        templatePatchSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Post("jobs/:jobId/retry") @RequirePermission(PERMISSIONS.ADMIN_NOTIFICATIONS_MANAGE) async retry(
    @Req() req: AuthenticatedRequest,
    @Param("jobId") id: string,
    @Body() raw: unknown,
  ) {
    const input = retrySchema.parse(raw);
    return success(
      req,
      await this.service.retry(req.auth.sub, objectId.parse(id), input.reason, req.id),
    );
  }
}
