import { Module } from "@nestjs/common";
import { OrganizationModule } from "../organization/organization.module.js";
import { SupplyModule } from "../supply/supply.module.js";
import { AdminBookingController } from "./admin-booking.controller.js";
import { AccessPassController } from "./access-pass.controller.js";
import { AccessPassService } from "./access-pass.service.js";
import { BookingController } from "./booking.controller.js";
import { BookingOperationsController } from "./booking-operations.controller.js";
import { BookingOperationsService } from "./booking-operations.service.js";
import { BookingService } from "./booking.service.js";
import { CancellationPolicyController } from "./cancellation-policy.controller.js";
import { CancellationPolicyService } from "./cancellation-policy.service.js";
import { HouseholdController } from "./household.controller.js";
import { HouseholdService } from "./household.service.js";
import { IdempotencyService } from "./idempotency.service.js";
import { InvoiceService } from "./invoice.service.js";
import { LedgerService } from "./ledger.service.js";
import { MockGatewayController } from "./mock-gateway.controller.js";
import { MockGatewayService } from "./mock-gateway.service.js";
import { MembershipCoverageService } from "./membership-coverage.service.js";
import { QuoteService } from "./quote.service.js";
import { WalletController } from "./wallet.controller.js";
import { WalletService } from "./wallet.service.js";
import { WaitlistController } from "./waitlist.controller.js";
import { WaitlistService } from "./waitlist.service.js";
import { TaxCalculationService } from "./tax-calculation.service.js";

@Module({
  imports: [OrganizationModule, SupplyModule],
  controllers: [
    BookingController,
    BookingOperationsController,
    AccessPassController,
    WaitlistController,
    HouseholdController,
    WalletController,
    AdminBookingController,
    CancellationPolicyController,
    MockGatewayController,
  ],
  providers: [
    IdempotencyService,
    LedgerService,
    CancellationPolicyService,
    MockGatewayService,
    QuoteService,
    BookingService,
    BookingOperationsService,
    AccessPassService,
    WaitlistService,
    HouseholdService,
    WalletService,
    MembershipCoverageService,
    InvoiceService,
    TaxCalculationService,
  ],
  exports: [LedgerService, MembershipCoverageService, InvoiceService],
})
export class CommerceModule {}
