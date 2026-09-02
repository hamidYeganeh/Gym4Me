import { Module } from "@nestjs/common";
import { OrganizationModule } from "../organization/organization.module.js";
import { PublicAssetController, UploadController } from "./upload.controller.js";
import { UploadService } from "./upload.service.js";
@Module({
  imports: [OrganizationModule],
  controllers: [UploadController, PublicAssetController],
  providers: [UploadService],
})
export class UploadModule {}
