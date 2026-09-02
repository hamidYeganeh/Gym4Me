import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module.js";
import { OrganizationModule } from "../organization/organization.module.js";
import {
  AdminVerificationController,
  OrganizationVerificationController,
  VerificationController,
} from "./verification.controller.js";
import { VerificationService } from "./verification.service.js";
@Module({
  imports: [AuditModule, OrganizationModule],
  controllers: [
    VerificationController,
    OrganizationVerificationController,
    AdminVerificationController,
  ],
  providers: [VerificationService],
})
export class VerificationModule {}
