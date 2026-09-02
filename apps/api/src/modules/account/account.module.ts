import { Module } from "@nestjs/common";
import { AccountController } from "./account.controller.js";
import { AccountService } from "./account.service.js";
import { AdminAccountController } from "./admin-account.controller.js";
import { AdminAccountService } from "./admin-account.service.js";
@Module({
  controllers: [AccountController, AdminAccountController],
  providers: [AccountService, AdminAccountService],
})
export class AccountModule {}
