import { Inject, Injectable } from "@nestjs/common";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import type { ClientSession } from "mongoose";
import { ApiError } from "../../common/api-error.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";

@Injectable()
export class MembershipCoverageService {
  constructor(@Inject(DATABASE_MODELS) private readonly models: DatabaseModels) {}

  private async contracts(userId: string, session?: ClientSession) {
    const now = new Date();
    return this.models.MembershipContract.find({
      status: "active",
      "validity.startsAt": { $lte: now },
      "validity.endsAt": { $gt: now },
      $or: [
        { purchaserUserId: objectIdFrom(userId) },
        { "beneficiaries.userId": objectIdFrom(userId) },
      ],
    })
      .session(session ?? null)
      .lean() as any;
  }

  private covers(product: any, offering: any, branchId: string) {
    if (String(product.organizationId) !== String(offering.organizationId)) return false;
    const scope = product.scope ?? {};
    if (
      scope.mode !== "organization_wide" &&
      !(scope.branchIds ?? []).some((id: any) => String(id) === branchId)
    )
      return false;
    const sports = product.benefits?.sports ?? [];
    if (sports.length && !sports.includes(offering.profile?.sport)) return false;
    const services = product.benefits?.includedServices ?? [];
    if (
      services.length &&
      !services.some(
        (item: any) =>
          String(item.offeringId ?? item.offering_id ?? item.id) === String(offering._id),
      )
    )
      return false;
    return true;
  }

  async eligible(userId: string, offeringId: string, branchId: string) {
    const offering = (await this.models.Offering.findOne({
      _id: objectIdFrom(offeringId),
      branchIds: objectIdFrom(branchId),
      status: "active",
    }).lean()) as any;
    if (!offering) throw new ApiError("OFFERING_NOT_FOUND", "خدمت فعال پیدا نشد.", 404);
    const contracts = (await this.contracts(userId)) as any[];
    const products = (await this.models.MembershipProduct.find({
      _id: { $in: contracts.map((item) => item.productId) },
      status: "active",
    }).lean()) as any[];
    return contracts.flatMap((contract) => {
      const product = products.find((item) => String(item._id) === String(contract.productId));
      return product && this.covers(product, offering, branchId)
        ? [{ ...contract, product, coverage: { offeringId: offering._id, branchId } }]
        : [];
    });
  }

  async reserve(
    userId: string,
    contractId: string,
    hold: any,
    bookings: any[],
    session: ClientSession,
  ) {
    const contract = (await this.models.MembershipContract.findOne({
      _id: objectIdFrom(contractId),
      status: "active",
      "validity.startsAt": { $lte: new Date() },
      "validity.endsAt": { $gt: new Date() },
      $or: [
        { purchaserUserId: objectIdFrom(userId) },
        { "beneficiaries.userId": objectIdFrom(userId) },
      ],
    }).session(session)) as any;
    if (!contract)
      throw new ApiError("MEMBERSHIP_NOT_ELIGIBLE", "عضویت فعال و قابل استفاده پیدا نشد.", 409);
    const [product, offering] = (await Promise.all([
      this.models.MembershipProduct.findById(contract.productId).session(session).lean(),
      this.models.Offering.findById(hold.offeringId).session(session).lean(),
    ])) as any[];
    if (!product || product.status !== "active" || !offering)
      throw new ApiError("MEMBERSHIP_NOT_ELIGIBLE", "محصول عضویت قابل استفاده نیست.", 409);
    if (!this.covers(product, offering, String(hold.branchId)))
      throw new ApiError(
        "MEMBERSHIP_SCOPE_MISMATCH",
        "این عضویت برای شعبه یا خدمت انتخاب‌شده معتبر نیست.",
        409,
      );
    const household = (await this.models.Household.findOne({
      ownerUserId: objectIdFrom(userId),
      status: "active",
    })
      .session(session)
      .lean()) as any;
    const participantUserIds = (hold.participants ?? []).map((participant: any) => {
      if (participant.kind === "self") return userId;
      if (participant.kind === "user" && participant.reference_id) return participant.reference_id;
      if (participant.kind === "household_member")
        return String(
          household?.members?.find(
            (member: any) =>
              member.id === (participant.reference_id ?? participant.referenceId) &&
              member.status === "active",
          )?.userId ?? "",
        );
      return "";
    });
    const beneficiaries = new Set(
      (contract.beneficiaries ?? []).map((item: any) => String(item.userId)),
    );
    if (participantUserIds.some((id: string) => !id || !beneficiaries.has(id)))
      throw new ApiError(
        "MEMBERSHIP_PARTICIPANT_MISMATCH",
        "همه شرکت‌کنندگان باید کاربر ثبت‌شده و ذی‌نفع این عضویت باشند.",
        409,
      );
    const amount = bookings.length * (hold.participants?.length ?? 1);
    const unlimited = Boolean(product.benefits?.unlimited);
    if (!unlimited) {
      const updated = await this.models.MembershipContract.updateOne(
        { _id: contract._id, "balances.entriesRemaining": { $gte: amount } },
        { $inc: { "balances.entriesRemaining": -amount } },
        { session },
      );
      if (!updated.modifiedCount)
        throw new ApiError(
          "MEMBERSHIP_BALANCE_INSUFFICIENT",
          "اعتبار باقی‌مانده عضویت برای این رزرو کافی نیست.",
          409,
        );
    }
    const usages = [];
    for (const booking of bookings) {
      const [usage] = await this.models.MembershipUsage.create(
        [
          {
            contractId: contract._id,
            beneficiaryUserId: objectIdFrom(userId),
            bookingId: booking._id,
            usage: {
              amount: hold.participants?.length ?? 1,
              beneficiaryUserIds: participantUserIds.map(objectIdFrom),
              phase: "reserved",
              productSnapshot: { id: product._id, profile: product.profile, scope: product.scope },
            },
            status: "reserved",
            createdBy: objectIdFrom(userId),
          },
        ],
        { session },
      );
      usages.push(usage!);
    }
    return { contract, product, usages };
  }

  async consumeBooking(bookingId: string, actorUserId: string, session: ClientSession) {
    return this.models.MembershipUsage.updateMany(
      { bookingId: objectIdFrom(bookingId), status: "reserved" },
      {
        $set: {
          status: "consumed",
          "usage.phase": "consumed",
          "usage.consumedAt": new Date(),
          updatedBy: objectIdFrom(actorUserId),
        },
      },
      { session },
    );
  }

  async releaseBooking(bookingId: string, actorUserId: string, session: ClientSession) {
    const usages = (await this.models.MembershipUsage.find({
      bookingId: objectIdFrom(bookingId),
      status: "reserved",
    }).session(session)) as any[];
    for (const usage of usages) {
      await this.models.MembershipContract.updateOne(
        { _id: usage.contractId, status: "active", "balances.entriesRemaining": { $ne: null } },
        { $inc: { "balances.entriesRemaining": Number(usage.usage?.amount ?? 1) } },
        { session },
      );
      usage.status = "released";
      usage.usage.phase = "released";
      usage.usage.releasedAt = new Date();
      usage.updatedBy = objectIdFrom(actorUserId);
      await usage.save({ session });
    }
  }
}
