import { Inject, Injectable } from "@nestjs/common";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { PERMISSIONS } from "../../security/rbac.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { ApiError } from "../../common/api-error.js";
import { OrganizationAccessService } from "../organization/organization-access.service.js";
import { AuditService } from "../audit/audit.service.js";
import { LedgerService } from "../commerce/ledger.service.js";
import { InvoiceService } from "../commerce/invoice.service.js";
import { toStorage, flattenPatch } from "../organization/entity-mapper.js";
import { randomUUID } from "node:crypto";
@Injectable()
export class MembershipService {
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    private readonly access: OrganizationAccessService,
    private readonly ledger: LedgerService,
    private readonly audit: AuditService,
    private readonly invoices: InvoiceService,
  ) {}
  private async assertProductScope(organizationId: string, input: any) {
    if (input.scope?.club_ids?.length) {
      const count = await this.models.Club.countDocuments({
        _id: { $in: input.scope.club_ids.map(objectIdFrom) },
        organizationId: objectIdFrom(organizationId),
        status: { $ne: "archived" },
      });
      if (count !== new Set(input.scope.club_ids).size)
        throw new ApiError(
          "MEMBERSHIP_SCOPE_INVALID",
          "یک یا چند باشگاه متعلق به این سازمان نیست.",
          422,
        );
    }
    if (input.scope?.branch_ids?.length) {
      const branches = (await this.models.Branch.find({
        _id: { $in: input.scope.branch_ids.map(objectIdFrom) },
        status: { $ne: "archived" },
      }).lean()) as any[];
      const clubs = await this.models.Club.countDocuments({
        _id: { $in: branches.map((item) => item.clubId) },
        organizationId: objectIdFrom(organizationId),
      });
      if (
        branches.length !== input.scope.branch_ids.length ||
        clubs !== new Set(branches.map((item) => String(item.clubId))).size
      )
        throw new ApiError(
          "MEMBERSHIP_SCOPE_INVALID",
          "یک یا چند شعبه متعلق به این سازمان نیست.",
          422,
        );
    }
    const offeringIds = (input.benefits?.included_services ?? [])
      .map((item: any) => item.offering_id ?? item.offeringId ?? item.id)
      .filter(Boolean);
    if (offeringIds.length) {
      const count = await this.models.Offering.countDocuments({
        _id: { $in: offeringIds.map(objectIdFrom) },
        organizationId: objectIdFrom(organizationId),
      });
      if (count !== new Set(offeringIds).size)
        throw new ApiError("MEMBERSHIP_SERVICE_INVALID", "یک یا چند خدمت عضویت معتبر نیست.", 422);
    }
  }
  async products(organizationId: string, query: any, managed = false) {
    const filter: any = {
      organizationId: objectIdFrom(organizationId),
      ...(managed ? {} : { status: "active" }),
    };
    const [items, total] = await Promise.all([
      this.models.MembershipProduct.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      this.models.MembershipProduct.countDocuments(filter),
    ]);
    return { items, total };
  }
  async managedProducts(actor: string, organizationId: string, query: any) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.ORGANIZATION_MEMBERSHIPS_MANAGE,
    );
    return this.products(organizationId, query, true);
  }
  async create(actor: string, organizationId: string, input: any, requestId: string) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.ORGANIZATION_MEMBERSHIPS_MANAGE,
    );
    await this.assertProductScope(organizationId, input);
    const item = await this.models.MembershipProduct.create({
      organizationId: objectIdFrom(organizationId),
      ...(toStorage(input) as any),
      createdBy: objectIdFrom(actor),
    });
    await this.audit.record({
      actorUserId: actor,
      action: "membership.product.created",
      entityType: "membership_product",
      entityId: String(item._id),
      organizationId,
      after: item.toObject(),
      requestId,
    });
    return item.toObject();
  }
  async update(actor: string, organizationId: string, id: string, input: any, requestId: string) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.ORGANIZATION_MEMBERSHIPS_MANAGE,
    );
    await this.assertProductScope(organizationId, input);
    const item = await this.models.MembershipProduct.findOneAndUpdate(
      { _id: objectIdFrom(id), organizationId: objectIdFrom(organizationId) },
      { $set: { ...flattenPatch(toStorage(input) as any), updatedBy: objectIdFrom(actor) } },
      { returnDocument: "after" },
    ).lean();
    if (!item) throw new ApiError("MEMBERSHIP_PRODUCT_NOT_FOUND", "محصول عضویت پیدا نشد.", 404);
    await this.audit.record({
      actorUserId: actor,
      action: "membership.product.updated",
      entityType: "membership_product",
      entityId: id,
      organizationId,
      after: item,
      requestId,
    });
    return item;
  }
  async purchase(userId: string, productId: string, input: any) {
    const product = (await this.models.MembershipProduct.findOne({
      _id: objectIdFrom(productId),
      status: "active",
    }).lean()) as any;
    if (!product)
      throw new ApiError("MEMBERSHIP_PRODUCT_NOT_FOUND", "محصول عضویت فعال پیدا نشد.", 404);
    const price = (product.pricing ?? []).find((x: any) => x.id === input.price_id);
    if (!price)
      throw new ApiError("MEMBERSHIP_PRICE_NOT_FOUND", "قیمت انتخاب‌شده معتبر نیست.", 422);
    if (input.beneficiaries.length > (product.rules?.maximumBeneficiaries ?? 1))
      throw new ApiError(
        "BENEFICIARY_LIMIT_EXCEEDED",
        "تعداد اعضا بیشتر از ظرفیت این عضویت است.",
        422,
      );
    const beneficiaryIds = input.beneficiaries.map((item: any) => item.user_id);
    if (new Set(beneficiaryIds).size !== beneficiaryIds.length || !beneficiaryIds.includes(userId))
      throw new ApiError(
        "MEMBERSHIP_BENEFICIARIES_INVALID",
        "خریدار باید یک‌بار در فهرست ذی‌نفعان عضویت باشد.",
        422,
      );
    if (
      (await this.models.User.countDocuments({
        _id: { $in: beneficiaryIds.map(objectIdFrom) },
        status: "active",
      })) !== beneficiaryIds.length
    )
      throw new ApiError("MEMBERSHIP_BENEFICIARY_INVALID", "یک یا چند ذی‌نفع فعال نیستند.", 422);
    if (input.beneficiaries.some((x: any) => x.user_id !== userId) && !product.rules?.allowFamily)
      throw new ApiError("FAMILY_NOT_ALLOWED", "این عضویت خانوادگی نیست.", 422);
    const existing = await this.models.MembershipContract.findOne({
      purchaserUserId: objectIdFrom(userId),
      "customData.idempotencyKey": input.idempotency_key,
    }).lean();
    if (existing) {
      const payment = await this.models.Payment.findOne({
        "payable.type": "membership_contract",
        "payable.id": existing._id,
      }).lean();
      return {
        contract: existing,
        ...(payment ? { payment } : {}),
        ...(payment?.status === "pending"
          ? { nextAction: { type: "mock_gateway", paymentId: String(payment._id) } }
          : {}),
      };
    }
    const session = await this.models.MembershipContract.db.startSession();
    try {
      let contract: any;
      let payment: any;
      await session.withTransaction(async () => {
        const now = new Date(),
          endsAt = new Date(now.getTime() + price.durationDays * 86400000);
        const amountMinor = String(price.amountMinor ?? "0");
        const isFree = BigInt(amountMinor) === 0n;
        const pendingGateway = input.payment_method === "sandbox_gateway" && !isFree;
        const [created] = await this.models.MembershipContract.create(
          [
            {
              productId: product._id,
              purchaserUserId: objectIdFrom(userId),
              beneficiaries: input.beneficiaries.map((x: any) => ({
                ...x,
                userId: objectIdFrom(x.user_id),
              })),
              validity: { startsAt: now, endsAt },
              balances: { entriesRemaining: product.benefits?.entryLimit ?? null },
              status: pendingGateway ? "pending_payment" : "active",
              customData: {
                idempotencyKey: input.idempotency_key,
                priceSnapshot: price,
                scopeSnapshot: product.scope,
                organizationId: product.organizationId,
              },
              createdBy: objectIdFrom(userId),
            },
          ],
          { session },
        );
        contract = created;
        if (pendingGateway) {
          [payment] = await this.models.Payment.create(
            [
              {
                payerUserId: objectIdFrom(userId),
                payable: { type: "membership_contract", id: created!._id },
                amount: { amountMinor, currency: price.currency },
                method: "sandbox_gateway",
                provider: { code: "sandbox", authority: randomUUID(), mode: "manual_confirm" },
                attempts: [{ createdAt: new Date(), status: "created" }],
                idempotencyKey: input.idempotency_key,
                expiresAt: new Date(Date.now() + 15 * 60_000),
                status: "pending",
                createdBy: objectIdFrom(userId),
              },
            ],
            { session },
          );
        } else {
          if (!isFree)
            await this.ledger.payMembership(
              userId,
              String(created!._id),
              String(product.organizationId),
              amountMinor,
              price.currency,
              input.idempotency_key,
              session,
            );
          await this.invoices.issue(
            {
              sourceType: "membership_contract",
              sourceId: String(created!._id),
              userId,
              organizationId: String(product.organizationId),
              title: product.profile?.name ?? "عضویت باشگاه",
              amountMinor,
              currency: price.currency,
            },
            session,
          );
        }
      });
      return {
        contract: contract.toObject(),
        ...(payment ? { payment: payment.toObject() } : {}),
        ...(payment
          ? { nextAction: { type: "mock_gateway", paymentId: String(payment._id) } }
          : {}),
      };
    } finally {
      await session.endSession();
    }
  }
  async mine(userId: string) {
    const contracts = (await this.models.MembershipContract.find({
      $or: [
        { purchaserUserId: objectIdFrom(userId) },
        { "beneficiaries.userId": objectIdFrom(userId) },
      ],
    })
      .sort({ createdAt: -1 })
      .lean()) as any[];
    const products = (await this.models.MembershipProduct.find({
      _id: { $in: contracts.map((item) => item.productId) },
    }).lean()) as any[];
    return contracts.map((contract) => ({
      ...contract,
      product: products.find((product) => String(product._id) === String(contract.productId)),
    }));
  }
  async contracts(actor: string, organizationId: string, query: any) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.ORGANIZATION_MEMBERSHIPS_MANAGE,
    );
    const products = (await this.models.MembershipProduct.find({
      organizationId: objectIdFrom(organizationId),
    }).lean()) as any[];
    const filter = { productId: { $in: products.map((item) => item._id) } };
    const [contracts, total] = (await Promise.all([
      this.models.MembershipContract.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      this.models.MembershipContract.countDocuments(filter),
    ])) as [any[], number];
    const profiles = (await this.models.UserProfile.find({
      userId: { $in: contracts.map((item) => item.purchaserUserId) },
    }).lean()) as any[];
    return {
      items: contracts.map((contract) => ({
        ...contract,
        product: products.find((product) => String(product._id) === String(contract.productId)),
        purchaser: profiles.find(
          (profile) => String(profile.userId) === String(contract.purchaserUserId),
        ),
      })),
      total,
    };
  }
  async consume(actor: string, organizationId: string, contractId: string, input: any) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.ORGANIZATION_MEMBERSHIPS_MANAGE,
    );
    const contract = (await this.models.MembershipContract.findById(contractId).lean()) as any;
    if (!contract || contract.status !== "active")
      throw new ApiError("MEMBERSHIP_INACTIVE", "عضویت فعال نیست.", 409);
    const product = (await this.models.MembershipProduct.findOne({
      _id: contract.productId,
      organizationId: objectIdFrom(organizationId),
    }).lean()) as any;
    if (!product)
      throw new ApiError("MEMBERSHIP_SCOPE_MISMATCH", "عضویت متعلق به این سازمان نیست.", 403);
    if (
      !(contract.beneficiaries ?? []).some(
        (item: any) => String(item.userId) === input.beneficiary_user_id,
      )
    )
      throw new ApiError("MEMBERSHIP_BENEFICIARY_INVALID", "ذی‌نفع عضویت معتبر نیست.", 422);
    const existing = await this.models.MembershipUsage.findOne({
      contractId: objectIdFrom(contractId),
      "usage.idempotencyKey": input.idempotency_key,
    }).lean();
    if (existing) return existing;
    if (!product.benefits?.unlimited) {
      const updated = await this.models.MembershipContract.updateOne(
        { _id: contract._id, "balances.entriesRemaining": { $gte: input.amount } },
        { $inc: { "balances.entriesRemaining": -input.amount } },
      );
      if (!updated.modifiedCount)
        throw new ApiError("MEMBERSHIP_BALANCE_INSUFFICIENT", "اعتبار عضویت کافی نیست.", 409);
    }
    const usage = await this.models.MembershipUsage.create({
      contractId: objectIdFrom(contractId),
      beneficiaryUserId: objectIdFrom(input.beneficiary_user_id),
      ...(input.booking_id ? { bookingId: objectIdFrom(input.booking_id) } : {}),
      usage: { amount: input.amount, idempotencyKey: input.idempotency_key },
      status: "consumed",
      createdBy: objectIdFrom(actor),
    });
    return usage.toObject();
  }
  async createCorporateAccount(actor: string, organizationId: string, input: any) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.CORPORATE_MEMBERS_MANAGE,
    );
    const item = await this.models.CorporateAccount.create({
      organizationId: objectIdFrom(organizationId),
      ...(toStorage(input) as any),
      createdBy: objectIdFrom(actor),
    });
    await this.audit.record({
      actorUserId: actor,
      action: "membership.corporate_account.created",
      entityType: "corporate_account",
      entityId: String(item._id),
      organizationId,
      after: item.toObject(),
    });
    return item.toObject();
  }
  async createCorporateContract(actor: string, providerOrganizationId: string, input: any) {
    await this.access.assertOrganization(
      actor,
      providerOrganizationId,
      PERMISSIONS.ORGANIZATION_MEMBERSHIPS_MANAGE,
    );
    const [account, product] = await Promise.all([
      this.models.CorporateAccount.findOne({
        _id: objectIdFrom(input.corporate_account_id),
        organizationId: objectIdFrom(providerOrganizationId),
        status: { $ne: "archived" },
      }).lean(),
      this.models.MembershipProduct.findOne({
        _id: objectIdFrom(input.membership_product_id),
        organizationId: objectIdFrom(providerOrganizationId),
        "profile.type": "corporate",
        status: { $in: ["draft", "active"] },
      }).lean(),
    ]);
    if (!account) throw new ApiError("CORPORATE_ACCOUNT_NOT_FOUND", "حساب سازمانی پیدا نشد.", 404);
    if (!product)
      throw new ApiError("CORPORATE_PRODUCT_INVALID", "محصول عضویت سازمانی معتبر نیست.", 422);
    await this.assertProductScope(providerOrganizationId, input);
    const stored = toStorage(input) as any;
    delete stored.corporateAccountId;
    delete stored.membershipProductId;
    const item = await this.models.CorporateContract.create({
      ...stored,
      corporateAccountId: objectIdFrom(input.corporate_account_id),
      providerOrganizationId: objectIdFrom(providerOrganizationId),
      productId: objectIdFrom(input.membership_product_id),
      budget: { ...stored.budget, allocatedMinor: "0" },
      createdBy: objectIdFrom(actor),
    });
    await this.audit.record({
      actorUserId: actor,
      action: "membership.corporate_contract.created",
      entityType: "corporate_contract",
      entityId: String(item._id),
      organizationId: providerOrganizationId,
      after: item.toObject(),
    });
    return item.toObject();
  }

  async corporateAccounts(actor: string, organizationId: string, query: any) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.CORPORATE_MEMBERS_MANAGE,
    );
    const filter = { organizationId: objectIdFrom(organizationId) };
    const [items, total] = await Promise.all([
      this.models.CorporateAccount.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      this.models.CorporateAccount.countDocuments(filter),
    ]);
    return { items, total };
  }

  async updateCorporateAccount(
    actor: string,
    organizationId: string,
    accountId: string,
    input: any,
    requestId: string,
  ) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.CORPORATE_MEMBERS_MANAGE,
    );
    const item = await this.models.CorporateAccount.findOneAndUpdate(
      { _id: objectIdFrom(accountId), organizationId: objectIdFrom(organizationId) },
      { $set: { ...flattenPatch(toStorage(input) as any), updatedBy: objectIdFrom(actor) } },
      { returnDocument: "after" },
    ).lean();
    if (!item) throw new ApiError("CORPORATE_ACCOUNT_NOT_FOUND", "حساب سازمانی پیدا نشد.", 404);
    await this.audit.record({
      actorUserId: actor,
      action: "membership.corporate_account.updated",
      entityType: "corporate_account",
      entityId: accountId,
      organizationId,
      after: item,
      requestId,
    });
    return item;
  }

  private async assertCorporateAccount(organizationId: string, accountId: string) {
    const account = await this.models.CorporateAccount.findOne({
      _id: objectIdFrom(accountId),
      organizationId: objectIdFrom(organizationId),
      status: { $ne: "archived" },
    }).lean();
    if (!account) throw new ApiError("CORPORATE_ACCOUNT_NOT_FOUND", "حساب سازمانی پیدا نشد.", 404);
    return account;
  }

  async corporateMembers(actor: string, organizationId: string, accountId: string, query: any) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.CORPORATE_MEMBERS_MANAGE,
    );
    await this.assertCorporateAccount(organizationId, accountId);
    const filter = { corporateAccountId: objectIdFrom(accountId) };
    const [members, total] = await Promise.all([
      this.models.CorporateMember.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      this.models.CorporateMember.countDocuments(filter),
    ]);
    const profiles = (await this.models.UserProfile.find({
      userId: { $in: members.map((item: any) => item.userId) },
    }).lean()) as any[];
    return {
      items: members.map((item: any) => ({
        ...item,
        userProfile: profiles.find((profile) => String(profile.userId) === String(item.userId)),
      })),
      total,
    };
  }

  async addCorporateMember(
    actor: string,
    organizationId: string,
    accountId: string,
    input: any,
    requestId: string,
  ) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.CORPORATE_MEMBERS_MANAGE,
    );
    await this.assertCorporateAccount(organizationId, accountId);
    const user = await this.models.User.findOne({
      _id: objectIdFrom(input.user_id),
      status: "active",
    }).lean();
    if (!user) throw new ApiError("CORPORATE_MEMBER_USER_INVALID", "کاربر فعال پیدا نشد.", 422);
    const stored = toStorage(input) as any;
    delete stored.userId;
    let item: any;
    try {
      item = await this.models.CorporateMember.create({
        ...stored,
        corporateAccountId: objectIdFrom(accountId),
        userId: objectIdFrom(input.user_id),
        createdBy: objectIdFrom(actor),
      });
    } catch (error: any) {
      if (error?.code === 11000)
        throw new ApiError(
          "CORPORATE_MEMBER_EXISTS",
          "این کاربر قبلاً به حساب سازمانی افزوده شده است.",
          409,
        );
      throw error;
    }
    await this.audit.record({
      actorUserId: actor,
      action: "membership.corporate_member.created",
      entityType: "corporate_member",
      entityId: String(item._id),
      organizationId,
      after: item.toObject(),
      requestId,
    });
    return item.toObject();
  }

  async updateCorporateMember(
    actor: string,
    organizationId: string,
    accountId: string,
    memberId: string,
    input: any,
    requestId: string,
  ) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.CORPORATE_MEMBERS_MANAGE,
    );
    await this.assertCorporateAccount(organizationId, accountId);
    const item = await this.models.CorporateMember.findOneAndUpdate(
      { _id: objectIdFrom(memberId), corporateAccountId: objectIdFrom(accountId) },
      { $set: { ...flattenPatch(toStorage(input) as any), updatedBy: objectIdFrom(actor) } },
      { returnDocument: "after" },
    ).lean();
    if (!item) throw new ApiError("CORPORATE_MEMBER_NOT_FOUND", "عضو سازمانی پیدا نشد.", 404);
    await this.audit.record({
      actorUserId: actor,
      action: "membership.corporate_member.updated",
      entityType: "corporate_member",
      entityId: memberId,
      organizationId,
      after: item,
      requestId,
    });
    return item;
  }

  async corporateContracts(actor: string, organizationId: string, query: any) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.ORGANIZATION_MEMBERSHIPS_MANAGE,
    );
    const filter = { providerOrganizationId: objectIdFrom(organizationId) };
    const [items, total] = await Promise.all([
      this.models.CorporateContract.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      this.models.CorporateContract.countDocuments(filter),
    ]);
    const accountIds = items.map((item: any) => item.corporateAccountId);
    const productIds = items.map((item: any) => item.productId);
    const [accounts, products, enrollments] = await Promise.all([
      this.models.CorporateAccount.find({ _id: { $in: accountIds } }).lean() as any,
      this.models.MembershipProduct.find({ _id: { $in: productIds } }).lean() as any,
      this.models.MembershipContract.aggregate([
        {
          $match: { "customData.corporateContractId": { $in: items.map((item: any) => item._id) } },
        },
        { $group: { _id: "$customData.corporateContractId", count: { $sum: 1 } } },
      ]),
    ]);
    return {
      items: items.map((item: any) => ({
        ...item,
        account: accounts.find((x: any) => String(x._id) === String(item.corporateAccountId)),
        product: products.find((x: any) => String(x._id) === String(item.productId)),
        enrollmentCount:
          enrollments.find((x: any) => String(x._id) === String(item._id))?.count ?? 0,
      })),
      total,
    };
  }

  async updateCorporateContract(
    actor: string,
    organizationId: string,
    contractId: string,
    input: any,
    requestId: string,
  ) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.ORGANIZATION_MEMBERSHIPS_MANAGE,
    );
    if (input.scope) await this.assertProductScope(organizationId, input);
    const item = await this.models.CorporateContract.findOneAndUpdate(
      { _id: objectIdFrom(contractId), providerOrganizationId: objectIdFrom(organizationId) },
      { $set: { ...flattenPatch(toStorage(input) as any), updatedBy: objectIdFrom(actor) } },
      { returnDocument: "after" },
    ).lean();
    if (!item) throw new ApiError("CORPORATE_CONTRACT_NOT_FOUND", "قرارداد سازمانی پیدا نشد.", 404);
    await this.audit.record({
      actorUserId: actor,
      action: "membership.corporate_contract.updated",
      entityType: "corporate_contract",
      entityId: contractId,
      organizationId,
      after: item,
      requestId,
    });
    return item;
  }

  async enrollCorporateMember(
    actor: string,
    organizationId: string,
    contractId: string,
    input: any,
    requestId: string,
  ) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.CORPORATE_MEMBERS_MANAGE,
    );
    const [contract, member] = await Promise.all([
      this.models.CorporateContract.findOne({
        _id: objectIdFrom(contractId),
        providerOrganizationId: objectIdFrom(organizationId),
        status: "active",
      }).lean() as any,
      this.models.CorporateMember.findOne({
        _id: objectIdFrom(input.corporate_member_id),
        status: "active",
      }).lean() as any,
    ]);
    if (!contract)
      throw new ApiError("CORPORATE_CONTRACT_INACTIVE", "قرارداد سازمانی فعال نیست.", 409);
    if (!member || String(member.corporateAccountId) !== String(contract.corporateAccountId))
      throw new ApiError("CORPORATE_MEMBER_INVALID", "عضو متعلق به این حساب سازمانی نیست.", 422);
    const now = new Date();
    if (new Date(contract.validity.startsAt) > now || new Date(contract.validity.endsAt) <= now)
      throw new ApiError(
        "CORPORATE_CONTRACT_OUTSIDE_VALIDITY",
        "قرارداد در بازه اعتبار قرار ندارد.",
        409,
      );
    if (
      (member.eligibility?.startsAt && new Date(member.eligibility.startsAt) > now) ||
      (member.eligibility?.endsAt && new Date(member.eligibility.endsAt) <= now)
    )
      throw new ApiError("CORPORATE_MEMBER_INELIGIBLE", "عضو در بازه واجد شرایط قرار ندارد.", 409);
    const existing: any = await this.models.MembershipContract.findOne({
      "customData.corporateContractId": contract._id,
      "customData.corporateMemberId": member._id,
    }).lean();
    if (existing && (existing as any).status === "active") return existing;
    const product = (await this.models.MembershipProduct.findById(
      contract.productId,
    ).lean()) as any;
    if (!product || product.status !== "active")
      throw new ApiError("CORPORATE_PRODUCT_INACTIVE", "محصول عضویت سازمانی فعال نیست.", 409);
    const price = product.pricing?.[0];
    if (!price)
      throw new ApiError("CORPORATE_PRICE_MISSING", "قیمت محصول سازمانی تعریف نشده است.", 422);
    const session = await this.models.CorporateContract.db.startSession();
    try {
      let enrollment: any;
      await session.withTransaction(async () => {
        const reserved = await this.models.CorporateContract.updateOne(
          {
            _id: contract._id,
            $expr: {
              $lte: [
                {
                  $add: [
                    { $toDecimal: { $ifNull: ["$budget.allocatedMinor", "0"] } },
                    { $toDecimal: price.amountMinor },
                  ],
                },
                { $toDecimal: "$budget.amountMinor" },
              ],
            },
          },
          [
            {
              $set: {
                "budget.allocatedMinor": {
                  $toString: {
                    $add: [
                      { $toDecimal: { $ifNull: ["$budget.allocatedMinor", "0"] } },
                      { $toDecimal: price.amountMinor },
                    ],
                  },
                },
                updatedBy: objectIdFrom(actor),
                updatedAt: new Date(),
              },
            },
          ],
          { session },
        );
        if (!reserved.modifiedCount)
          throw new ApiError(
            "CORPORATE_BUDGET_EXHAUSTED",
            "بودجه قرارداد برای ثبت عضو جدید کافی نیست.",
            409,
          );
        if (existing) {
          enrollment = await this.models.MembershipContract.findOneAndUpdate(
            { _id: existing._id, status: { $in: ["ended", "suspended", "cancelled"] } },
            {
              $set: {
                status: "active",
                validity: {
                  startsAt:
                    now > new Date(contract.validity.startsAt) ? now : contract.validity.startsAt,
                  endsAt: contract.validity.endsAt,
                },
                balances: { entriesRemaining: product.benefits?.entryLimit ?? null },
                "customData.idempotencyKey": input.idempotency_key,
                "customData.reactivatedAt": now,
                updatedBy: objectIdFrom(actor),
              },
            },
            { returnDocument: "after", session },
          );
          if (!enrollment)
            throw new ApiError(
              "CORPORATE_ENROLLMENT_NOT_REACTIVATABLE",
              "تخصیص قبلی قابل فعال‌سازی مجدد نیست.",
              409,
            );
        } else {
          const [created] = await this.models.MembershipContract.create(
            [
              {
                productId: product._id,
                purchaserUserId: member.userId,
                beneficiaries: [{ userId: member.userId, relationship: "self" }],
                validity: {
                  startsAt:
                    now > new Date(contract.validity.startsAt) ? now : contract.validity.startsAt,
                  endsAt: contract.validity.endsAt,
                },
                balances: { entriesRemaining: product.benefits?.entryLimit ?? null },
                status: "active",
                customData: {
                  idempotencyKey: input.idempotency_key,
                  corporateContractId: contract._id,
                  corporateAccountId: contract.corporateAccountId,
                  corporateMemberId: member._id,
                  corporateCostMinor: price.amountMinor,
                  priceSnapshot: price,
                  scopeSnapshot: contract.scope,
                },
                createdBy: objectIdFrom(actor),
              },
            ],
            { session },
          );
          enrollment = created;
        }
      });
      await this.audit.record({
        actorUserId: actor,
        action: "membership.corporate_member.enrolled",
        entityType: "membership_contract",
        entityId: String(enrollment._id),
        organizationId,
        after: enrollment.toObject ? enrollment.toObject() : enrollment,
        requestId,
      });
      return enrollment.toObject ? enrollment.toObject() : enrollment;
    } finally {
      await session.endSession();
    }
  }

  async corporateEnrollments(
    actor: string,
    organizationId: string,
    contractId: string,
    query: any,
  ) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.CORPORATE_MEMBERS_MANAGE,
    );
    const contract = await this.models.CorporateContract.findOne({
      _id: objectIdFrom(contractId),
      providerOrganizationId: objectIdFrom(organizationId),
    }).lean();
    if (!contract)
      throw new ApiError("CORPORATE_CONTRACT_NOT_FOUND", "قرارداد سازمانی پیدا نشد.", 404);
    const filter = { "customData.corporateContractId": objectIdFrom(contractId) };
    const [items, total] = await Promise.all([
      this.models.MembershipContract.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean() as any,
      this.models.MembershipContract.countDocuments(filter),
    ]);
    const members = (await this.models.CorporateMember.find({
      _id: { $in: items.map((item: any) => item.customData?.corporateMemberId).filter(Boolean) },
    }).lean()) as any[];
    const profiles = (await this.models.UserProfile.find({
      userId: { $in: items.map((item: any) => item.purchaserUserId) },
    }).lean()) as any[];
    return {
      items: items.map((item: any) => ({
        ...item,
        corporateMember: members.find(
          (member) => String(member._id) === String(item.customData?.corporateMemberId),
        ),
        userProfile: profiles.find(
          (profile) => String(profile.userId) === String(item.purchaserUserId),
        ),
      })),
      total,
    };
  }

  async endCorporateEnrollment(
    actor: string,
    organizationId: string,
    contractId: string,
    enrollmentId: string,
    reason: string,
    requestId: string,
  ) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.CORPORATE_MEMBERS_MANAGE,
    );
    const [contract, enrollment] = await Promise.all([
      this.models.CorporateContract.findOne({
        _id: objectIdFrom(contractId),
        providerOrganizationId: objectIdFrom(organizationId),
      }).lean() as any,
      this.models.MembershipContract.findOne({
        _id: objectIdFrom(enrollmentId),
        "customData.corporateContractId": objectIdFrom(contractId),
        status: { $in: ["active", "suspended"] },
      }).lean() as any,
    ]);
    if (!contract || !enrollment)
      throw new ApiError("CORPORATE_ENROLLMENT_NOT_FOUND", "تخصیص فعال پیدا نشد.", 404);
    const reserved = await this.models.MembershipUsage.countDocuments({
      contractId: enrollment._id,
      status: "reserved",
    });
    if (reserved)
      throw new ApiError(
        "CORPORATE_ENROLLMENT_HAS_RESERVATIONS",
        "ابتدا رزروهای فعال این عضویت را لغو کنید.",
        409,
      );
    const cost = String(enrollment.customData?.corporateCostMinor ?? "0");
    const session = await this.models.CorporateContract.db.startSession();
    try {
      let item: any;
      await session.withTransaction(async () => {
        item = await this.models.MembershipContract.findOneAndUpdate(
          { _id: enrollment._id, status: { $in: ["active", "suspended"] } },
          {
            $set: {
              status: "ended",
              "customData.endedAt": new Date(),
              "customData.endReason": reason,
              updatedBy: objectIdFrom(actor),
            },
          },
          { returnDocument: "after", session },
        ).lean();
        if (!item)
          throw new ApiError(
            "CORPORATE_ENROLLMENT_ALREADY_ENDED",
            "تخصیص قبلاً پایان یافته است.",
            409,
          );
        await this.models.CorporateContract.updateOne(
          { _id: contract._id },
          [
            {
              $set: {
                "budget.allocatedMinor": {
                  $toString: {
                    $max: [
                      {
                        $subtract: [
                          { $toDecimal: { $ifNull: ["$budget.allocatedMinor", "0"] } },
                          { $toDecimal: cost },
                        ],
                      },
                      { $toDecimal: "0" },
                    ],
                  },
                },
                updatedAt: new Date(),
                updatedBy: objectIdFrom(actor),
              },
            },
          ],
          { session },
        );
      });
      await this.audit.record({
        actorUserId: actor,
        action: "membership.corporate_enrollment.ended",
        entityType: "membership_contract",
        entityId: enrollmentId,
        organizationId,
        after: item,
        requestId,
      });
      return item;
    } finally {
      await session.endSession();
    }
  }

  async renewCorporateContract(
    actor: string,
    organizationId: string,
    contractId: string,
    input: any,
    requestId: string,
  ) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.ORGANIZATION_MEMBERSHIPS_MANAGE,
    );
    const contract = (await this.models.CorporateContract.findOne({
      _id: objectIdFrom(contractId),
      providerOrganizationId: objectIdFrom(organizationId),
      status: { $in: ["active", "ended", "suspended"] },
    }).lean()) as any;
    if (!contract)
      throw new ApiError("CORPORATE_CONTRACT_NOT_RENEWABLE", "قرارداد قابل تمدید نیست.", 409);
    if (input.ends_at <= new Date(contract.validity?.endsAt ?? 0))
      throw new ApiError(
        "CORPORATE_RENEWAL_DATE_INVALID",
        "تاریخ تمدید باید بعد از پایان فعلی باشد.",
        422,
      );
    const nextBudget = input.budget_amount_minor ?? contract.budget?.amountMinor;
    if (BigInt(nextBudget) < BigInt(contract.budget?.allocatedMinor ?? "0"))
      throw new ApiError(
        "CORPORATE_BUDGET_BELOW_ALLOCATED",
        "بودجه جدید کمتر از مبلغ تخصیص‌یافته است.",
        409,
      );
    const session = await this.models.CorporateContract.db.startSession();
    try {
      let item: any;
      await session.withTransaction(async () => {
        item = await this.models.CorporateContract.findByIdAndUpdate(
          contractId,
          {
            $set: {
              status: "active",
              "validity.endsAt": input.ends_at,
              "budget.amountMinor": nextBudget,
              "validity.renewedAt": new Date(),
              updatedBy: objectIdFrom(actor),
            },
            $push: {
              "validity.history": {
                previousEndsAt: contract.validity?.endsAt,
                renewedEndsAt: input.ends_at,
                renewedAt: new Date(),
                renewedBy: objectIdFrom(actor),
              },
            },
          },
          { returnDocument: "after", session },
        ).lean();
        if (input.extend_active_enrollments)
          await this.models.MembershipContract.updateMany(
            { "customData.corporateContractId": contract._id, status: "active" },
            { $set: { "validity.endsAt": input.ends_at, updatedBy: objectIdFrom(actor) } },
            { session },
          );
      });
      await this.audit.record({
        actorUserId: actor,
        action: "membership.corporate_contract.renewed",
        entityType: "corporate_contract",
        entityId: contractId,
        organizationId,
        after: item,
        requestId,
      });
      return item;
    } finally {
      await session.endSession();
    }
  }

  async resetCorporateBudget(
    actor: string,
    organizationId: string,
    contractId: string,
    input: any,
    requestId: string,
  ) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.ORGANIZATION_MEMBERSHIPS_MANAGE,
    );
    const contract = (await this.models.CorporateContract.findOne({
      _id: objectIdFrom(contractId),
      providerOrganizationId: objectIdFrom(organizationId),
      status: "active",
    }).lean()) as any;
    if (!contract) throw new ApiError("CORPORATE_CONTRACT_INACTIVE", "قرارداد فعال نیست.", 409);
    if (contract.budget?.period === "contract")
      throw new ApiError("CORPORATE_BUDGET_NOT_PERIODIC", "بودجه این قرارداد دوره‌ای نیست.", 409);
    const enrollments = (await this.models.MembershipContract.find({
      "customData.corporateContractId": contract._id,
      status: "active",
    })
      .select({ customData: 1 })
      .lean()) as any[];
    const recurring = enrollments.reduce(
      (sum, item) => sum + BigInt(item.customData?.corporateCostMinor ?? "0"),
      0n,
    );
    const amount = BigInt(input.amount_minor ?? contract.budget?.amountMinor ?? "0");
    if (recurring > amount)
      throw new ApiError(
        "CORPORATE_BUDGET_BELOW_ACTIVE_ENROLLMENTS",
        "بودجه دوره جدید هزینه اعضای فعال را پوشش نمی‌دهد.",
        409,
      );
    const item = await this.models.CorporateContract.findByIdAndUpdate(
      contractId,
      {
        $set: {
          "budget.amountMinor": amount.toString(),
          "budget.allocatedMinor": recurring.toString(),
          "budget.periodStartedAt": new Date(),
          updatedBy: objectIdFrom(actor),
        },
        $push: {
          "budget.history": {
            amountMinor: contract.budget?.amountMinor,
            allocatedMinor: contract.budget?.allocatedMinor,
            closedAt: new Date(),
            reason: input.reason,
            closedBy: objectIdFrom(actor),
          },
        },
      },
      { returnDocument: "after" },
    ).lean();
    await this.audit.record({
      actorUserId: actor,
      action: "membership.corporate_contract.budget_reset",
      entityType: "corporate_contract",
      entityId: contractId,
      organizationId,
      after: item,
      requestId,
    });
    return item;
  }
  async adminList(
    resource: "products" | "contracts" | "corporate_accounts" | "corporate_contracts",
    query: any,
  ) {
    const status = query.status ? { status: query.status } : {};
    let model: any;
    let filter: any = status;
    if (resource === "products") {
      model = this.models.MembershipProduct;
      filter = {
        ...status,
        ...(query.organization_id ? { organizationId: objectIdFrom(query.organization_id) } : {}),
      };
    } else if (resource === "contracts") {
      model = this.models.MembershipContract;
      if (query.organization_id) {
        const productIds = await this.models.MembershipProduct.distinct("_id", {
          organizationId: objectIdFrom(query.organization_id),
        });
        filter = { ...status, productId: { $in: productIds } };
      }
    } else if (resource === "corporate_accounts") {
      model = this.models.CorporateAccount;
      filter = {
        ...status,
        ...(query.organization_id ? { organizationId: objectIdFrom(query.organization_id) } : {}),
      };
    } else {
      model = this.models.CorporateContract;
      filter = {
        ...status,
        ...(query.organization_id
          ? { providerOrganizationId: objectIdFrom(query.organization_id) }
          : {}),
      };
    }
    const [items, total] = await Promise.all([
      model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      model.countDocuments(filter),
    ]);
    return { items, total };
  }
  async adminUpdateStatus(
    actor: string,
    resource: "products" | "contracts" | "corporate_accounts" | "corporate_contracts",
    id: string,
    input: any,
    requestId: string,
  ) {
    const allowed: Record<typeof resource, string[]> = {
      products: ["draft", "active", "suspended", "archived"],
      contracts: ["active", "suspended", "ended", "cancelled"],
      corporate_accounts: ["draft", "active", "suspended", "archived"],
      corporate_contracts: ["draft", "active", "suspended", "ended", "archived"],
    };
    if (!allowed[resource].includes(input.status))
      throw new ApiError(
        "MEMBERSHIP_STATUS_INVALID",
        "این وضعیت برای نوع رکورد انتخاب‌شده معتبر نیست.",
        422,
      );
    const models: Record<typeof resource, any> = {
      products: this.models.MembershipProduct,
      contracts: this.models.MembershipContract,
      corporate_accounts: this.models.CorporateAccount,
      corporate_contracts: this.models.CorporateContract,
    };
    const current = await models[resource].findById(id).lean();
    if (!current) throw new ApiError("MEMBERSHIP_RESOURCE_NOT_FOUND", "رکورد عضویت پیدا نشد.", 404);
    if (input.status === "active" && ["contracts", "corporate_contracts"].includes(resource)) {
      const endsAt = current.validity?.endsAt;
      if (!endsAt || new Date(endsAt) <= new Date())
        throw new ApiError(
          "MEMBERSHIP_CONTRACT_EXPIRED",
          "قرارداد منقضی را نمی‌توان فعال کرد.",
          409,
        );
    }
    const item = await models[resource]
      .findByIdAndUpdate(
        id,
        {
          $set: {
            status: input.status,
            "customData.adminStatusReason": input.reason,
            "customData.adminStatusChangedAt": new Date(),
            updatedBy: objectIdFrom(actor),
          },
        },
        { returnDocument: "after" },
      )
      .lean();
    await this.audit.record({
      actorUserId: actor,
      action: `membership.admin.${resource}.status_changed`,
      entityType: resource,
      entityId: id,
      after: item,
      requestId,
    });
    return item;
  }
}
