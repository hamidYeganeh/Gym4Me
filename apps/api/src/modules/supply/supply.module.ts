import { Module } from "@nestjs/common";
import { OrganizationModule } from "../organization/organization.module.js";
import { AdminSupplyController } from "./admin-supply.controller.js";
import { AdminSupplyService } from "./admin-supply.service.js";
import { AvailabilityController } from "./availability.controller.js";
import { AvailabilityService } from "./availability.service.js";
import { CatalogController } from "./catalog.controller.js";
import { CatalogService } from "./catalog.service.js";
import { OfferingService } from "./offering.service.js";
import { OfferingsController } from "./offerings.controller.js";
import { ResourceService } from "./resource.service.js";
import { ResourcesController } from "./resources.controller.js";

@Module({
  imports: [OrganizationModule],
  controllers: [
    ResourcesController,
    OfferingsController,
    AvailabilityController,
    CatalogController,
    AdminSupplyController,
  ],
  providers: [
    ResourceService,
    OfferingService,
    AvailabilityService,
    CatalogService,
    AdminSupplyService,
  ],
  exports: [AvailabilityService],
})
export class SupplyModule {}
