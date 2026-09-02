import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module.js";
import { OrganizationModule } from "../organization/organization.module.js";
import {
  AdminAdvertisingController,
  AdvertisingCatalogController,
  OrganizationAdvertisingController,
} from "./advertising.controller.js";
import { AdvertisingService } from "./advertising.service.js";

@Module({
  imports: [AuditModule, OrganizationModule],
  controllers: [
    AdvertisingCatalogController,
    OrganizationAdvertisingController,
    AdminAdvertisingController,
  ],
  providers: [AdvertisingService],
})
export class AdvertisingModule {}
