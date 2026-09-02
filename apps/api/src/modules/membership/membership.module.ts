import { Module } from "@nestjs/common";
import { CommerceModule } from "../commerce/commerce.module.js";
import { OrganizationModule } from "../organization/organization.module.js";
import {
  MembershipCatalogController,
  MembershipController,
  ManagedMembershipController,
  AdminMembershipController,
} from "./membership.controller.js";
import { MembershipService } from "./membership.service.js";
@Module({
  imports: [CommerceModule, OrganizationModule],
  controllers: [
    MembershipCatalogController,
    MembershipController,
    ManagedMembershipController,
    AdminMembershipController,
  ],
  providers: [MembershipService],
})
export class MembershipModule {}
