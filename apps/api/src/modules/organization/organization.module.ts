import { Module } from "@nestjs/common";
import { AdminOrganizationController } from "./admin-organization.controller.js";
import { AdminOrganizationService } from "./admin-organization.service.js";
import { BranchesController } from "./branches.controller.js";
import { BranchesService } from "./branches.service.js";
import { ClubsController } from "./clubs.controller.js";
import { ClubsService } from "./clubs.service.js";
import { OrganizationAccessService } from "./organization-access.service.js";
import { OrganizationsController } from "./organizations.controller.js";
import { OrganizationsService } from "./organizations.service.js";
import { StaffController } from "./staff.controller.js";
import { StaffService } from "./staff.service.js";

@Module({
  controllers: [
    OrganizationsController,
    ClubsController,
    BranchesController,
    StaffController,
    AdminOrganizationController,
  ],
  providers: [
    OrganizationAccessService,
    OrganizationsService,
    ClubsService,
    BranchesService,
    StaffService,
    AdminOrganizationService,
  ],
  exports: [OrganizationAccessService],
})
export class OrganizationModule {}
