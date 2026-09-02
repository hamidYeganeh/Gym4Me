import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module.js";
import { OrganizationModule } from "../organization/organization.module.js";
import {
  AdminReviewController,
  OrganizationReviewController,
  ReviewCatalogController,
  ReviewController,
} from "./review.controller.js";
import { ReviewService } from "./review.service.js";
@Module({
  imports: [AuditModule, OrganizationModule],
  controllers: [
    ReviewCatalogController,
    ReviewController,
    OrganizationReviewController,
    AdminReviewController,
  ],
  providers: [ReviewService],
})
export class ReviewModule {}
