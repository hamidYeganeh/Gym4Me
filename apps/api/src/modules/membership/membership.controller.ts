import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "../../security/rbac.js";
import type { FastifyRequest } from "fastify";
import { z } from "zod";
import { paginated, success } from "../../common/response.js";
import { AuthGuard } from "../../security/auth.guard.js";
import { PermissionGuard } from "../../security/permission.guard.js";
import { RequirePermission } from "../../security/permission.decorator.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import { MembershipCoverageService } from "../commerce/membership-coverage.service.js";
import { MembershipService } from "./membership.service.js";
import {
  corporateAccountSchema,
  corporateAccountPatchSchema,
  corporateContractSchema,
  corporateContractPatchSchema,
  corporateEnrollmentSchema,
  corporateEnrollmentEndSchema,
  corporateContractRenewSchema,
  corporateBudgetResetSchema,
  corporateMemberPatchSchema,
  corporateMemberSchema,
  eligibleMembershipSchema,
  objectId,
  productCreateSchema,
  productPatchSchema,
  purchaseSchema,
  usageSchema,
  adminMembershipListSchema,
  adminMembershipStatusSchema,
} from "./schemas/membership.schemas.js";
const page = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
@ApiTags("Membership Catalog")
@Controller("catalog/organizations/:organizationId/memberships")
export class MembershipCatalogController {
  constructor(private readonly s: MembershipService) {}
  @Get() async list(
    @Req() req: FastifyRequest,
    @Param("organizationId") id: string,
    @Query() raw: unknown,
  ) {
    const q = page.parse(raw),
      r = await this.s.products(objectId.parse(id), q);
    return paginated(req, r.items, { ...q, total: r.total });
  }
}

@ApiTags("Admin / Memberships")
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@Controller("admin/memberships")
export class AdminMembershipController {
  constructor(private readonly service: MembershipService) {}
  @Get(":resource") @RequirePermission(PERMISSIONS.ADMIN_MEMBERSHIPS_MANAGE) async list(
    @Req() req: AuthenticatedRequest,
    @Param("resource") rawResource: string,
    @Query() raw: unknown,
  ) {
    const resource = z
      .enum(["products", "contracts", "corporate_accounts", "corporate_contracts"])
      .parse(rawResource);
    const query = adminMembershipListSchema.parse(raw),
      result = await this.service.adminList(resource, query);
    return paginated(req, result.items, { ...query, total: result.total });
  }
  @Patch(":resource/:itemId/status")
  @RequirePermission(PERMISSIONS.ADMIN_MEMBERSHIPS_MANAGE)
  async status(
    @Req() req: AuthenticatedRequest,
    @Param("resource") rawResource: string,
    @Param("itemId") id: string,
    @Body() raw: unknown,
  ) {
    const resource = z
      .enum(["products", "contracts", "corporate_accounts", "corporate_contracts"])
      .parse(rawResource);
    return success(
      req,
      await this.service.adminUpdateStatus(
        req.auth.sub,
        resource,
        objectId.parse(id),
        adminMembershipStatusSchema.parse(raw),
        req.id,
      ),
    );
  }
}
@ApiTags("Memberships")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("memberships")
export class MembershipController {
  constructor(
    private readonly s: MembershipService,
    private readonly coverage: MembershipCoverageService,
  ) {}
  @Post("products/:productId/purchase") async purchase(
    @Req() req: AuthenticatedRequest,
    @Param("productId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.s.purchase(req.auth.sub, objectId.parse(id), purchaseSchema.parse(raw)),
    );
  }
  @Get("me") async mine(@Req() req: AuthenticatedRequest) {
    return success(req, await this.s.mine(req.auth.sub));
  }
  @Get("eligible") async eligible(@Req() req: AuthenticatedRequest, @Query() raw: unknown) {
    const query = eligibleMembershipSchema.parse(raw);
    return success(
      req,
      await this.coverage.eligible(req.auth.sub, query.offering_id, query.branch_id),
    );
  }
}
@ApiTags("Organization Memberships")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("organizations/:organizationId/memberships")
export class ManagedMembershipController {
  constructor(private readonly s: MembershipService) {}
  @Get("products") async products(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Query() raw: unknown,
  ) {
    const q = page.parse(raw),
      r = await this.s.managedProducts(req.auth.sub, objectId.parse(id), q);
    return paginated(req, r.items, { ...q, total: r.total });
  }
  @Get("contracts") async contracts(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Query() raw: unknown,
  ) {
    const q = page.parse(raw);
    const r = await this.s.contracts(req.auth.sub, objectId.parse(id), q);
    return paginated(req, r.items, { ...q, total: r.total });
  }
  @Post("products") async create(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.s.create(req.auth.sub, objectId.parse(id), productCreateSchema.parse(raw), req.id),
    );
  }
  @Patch("products/:productId") async update(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") oid: string,
    @Param("productId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.s.update(
        req.auth.sub,
        objectId.parse(oid),
        objectId.parse(id),
        productPatchSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Post("contracts/:contractId/usage") async consume(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") organizationId: string,
    @Param("contractId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.s.consume(
        req.auth.sub,
        objectId.parse(organizationId),
        objectId.parse(id),
        usageSchema.parse(raw),
      ),
    );
  }
  @Post("corporate-accounts") async corporate(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.s.createCorporateAccount(
        req.auth.sub,
        objectId.parse(id),
        corporateAccountSchema.parse(raw),
      ),
    );
  }
  @Get("corporate-accounts") async corporateAccounts(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Query() raw: unknown,
  ) {
    const q = page.parse(raw),
      r = await this.s.corporateAccounts(req.auth.sub, objectId.parse(id), q);
    return paginated(req, r.items, { ...q, total: r.total });
  }
  @Patch("corporate-accounts/:accountId") async updateCorporateAccount(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Param("accountId") accountId: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.s.updateCorporateAccount(
        req.auth.sub,
        objectId.parse(id),
        objectId.parse(accountId),
        corporateAccountPatchSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Get("corporate-accounts/:accountId/members") async corporateMembers(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Param("accountId") accountId: string,
    @Query() raw: unknown,
  ) {
    const q = page.parse(raw),
      r = await this.s.corporateMembers(
        req.auth.sub,
        objectId.parse(id),
        objectId.parse(accountId),
        q,
      );
    return paginated(req, r.items, { ...q, total: r.total });
  }
  @Post("corporate-accounts/:accountId/members") async addCorporateMember(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Param("accountId") accountId: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.s.addCorporateMember(
        req.auth.sub,
        objectId.parse(id),
        objectId.parse(accountId),
        corporateMemberSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Patch("corporate-accounts/:accountId/members/:memberId") async updateCorporateMember(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Param("accountId") accountId: string,
    @Param("memberId") memberId: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.s.updateCorporateMember(
        req.auth.sub,
        objectId.parse(id),
        objectId.parse(accountId),
        objectId.parse(memberId),
        corporateMemberPatchSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Post("corporate-contracts") async contract(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.s.createCorporateContract(
        req.auth.sub,
        objectId.parse(id),
        corporateContractSchema.parse(raw),
      ),
    );
  }
  @Get("corporate-contracts") async corporateContracts(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Query() raw: unknown,
  ) {
    const q = page.parse(raw),
      r = await this.s.corporateContracts(req.auth.sub, objectId.parse(id), q);
    return paginated(req, r.items, { ...q, total: r.total });
  }
  @Patch("corporate-contracts/:contractId") async updateCorporateContract(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Param("contractId") contractId: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.s.updateCorporateContract(
        req.auth.sub,
        objectId.parse(id),
        objectId.parse(contractId),
        corporateContractPatchSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Post("corporate-contracts/:contractId/enrollments") async enrollCorporateMember(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Param("contractId") contractId: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.s.enrollCorporateMember(
        req.auth.sub,
        objectId.parse(id),
        objectId.parse(contractId),
        corporateEnrollmentSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Get("corporate-contracts/:contractId/enrollments") async corporateEnrollments(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Param("contractId") contractId: string,
    @Query() raw: unknown,
  ) {
    const q = page.parse(raw),
      result = await this.s.corporateEnrollments(
        req.auth.sub,
        objectId.parse(id),
        objectId.parse(contractId),
        q,
      );
    return paginated(req, result.items, { ...q, total: result.total });
  }
  @Post("corporate-contracts/:contractId/enrollments/:enrollmentId/end")
  async endCorporateEnrollment(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Param("contractId") contractId: string,
    @Param("enrollmentId") enrollmentId: string,
    @Body() raw: unknown,
  ) {
    const input = corporateEnrollmentEndSchema.parse(raw);
    return success(
      req,
      await this.s.endCorporateEnrollment(
        req.auth.sub,
        objectId.parse(id),
        objectId.parse(contractId),
        objectId.parse(enrollmentId),
        input.reason,
        req.id,
      ),
    );
  }
  @Post("corporate-contracts/:contractId/renew") async renewCorporateContract(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Param("contractId") contractId: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.s.renewCorporateContract(
        req.auth.sub,
        objectId.parse(id),
        objectId.parse(contractId),
        corporateContractRenewSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Post("corporate-contracts/:contractId/reset-budget") async resetCorporateBudget(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Param("contractId") contractId: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.s.resetCorporateBudget(
        req.auth.sub,
        objectId.parse(id),
        objectId.parse(contractId),
        corporateBudgetResetSchema.parse(raw),
        req.id,
      ),
    );
  }
}
