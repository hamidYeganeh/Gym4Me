import { Module } from "@nestjs/common";
import { CommerceModule } from "../commerce/commerce.module.js";
import { OrganizationModule } from "../organization/organization.module.js";
import { AdminFinanceController, OrganizationFinanceController } from "./finance.controller.js";
import { FinanceService } from "./finance.service.js";
@Module({
  imports: [CommerceModule, OrganizationModule],
  controllers: [AdminFinanceController, OrganizationFinanceController],
  providers: [FinanceService],
})
export class FinanceModule {}
