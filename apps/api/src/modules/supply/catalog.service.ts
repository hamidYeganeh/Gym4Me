import { Inject, Injectable } from "@nestjs/common";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { ApiError } from "../../common/api-error.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";

@Injectable()
export class CatalogService {
  constructor(@Inject(DATABASE_MODELS) private readonly models: DatabaseModels) {}
  async branches(query: any) {
    const amenities = String(query.amenities ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const nowParts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Tehran",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());
    const weekday = nowParts.find((part) => part.type === "weekday")?.value ?? "Sun";
    const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
    const localTime = `${nowParts.find((part) => part.type === "hour")?.value ?? "00"}:${nowParts.find((part) => part.type === "minute")?.value ?? "00"}`;
    const match: any = {
      status: "active",
      ...(query.city ? { "profile.address.city": { $regex: query.city, $options: "i" } } : {}),
      ...(query.district
        ? { "profile.address.district": { $regex: query.district, $options: "i" } }
        : {}),
      ...(query.gender_policy
        ? { "profile.genderPolicy": { $in: ["all", query.gender_policy] } }
        : {}),
      ...(query.open_now
        ? {
            workingHours: {
              $elemMatch: {
                dayOfWeek,
                status: "active",
                periods: {
                  $elemMatch: { opensAt: { $lte: localTime }, closesAt: { $gte: localTime } },
                },
              },
            },
          }
        : {}),
      ...(query.search
        ? {
            $or: [
              { "profile.name": { $regex: query.search, $options: "i" } },
              { "profile.address.city": { $regex: query.search, $options: "i" } },
              { "profile.address.district": { $regex: query.search, $options: "i" } },
            ],
          }
        : {}),
    };
    const first: any =
      query.latitude !== undefined
        ? {
            $geoNear: {
              near: { type: "Point", coordinates: [query.longitude, query.latitude] },
              distanceField: "distanceMeters",
              maxDistance: query.radius_km * 1000,
              spherical: true,
              query: match,
            },
          }
        : { $match: match };
    const pipeline: any[] = [
      first,
      {
        $lookup: {
          from: this.models.Club.collection.name,
          localField: "clubId",
          foreignField: "_id",
          as: "club",
        },
      },
      { $unwind: "$club" },
      {
        $match: {
          "club.status": "active",
          ...(query.sport
            ? {
                $or: [
                  { "club.sports": query.sport },
                  { "club.sports.code": query.sport },
                  { "club.sports.sport": query.sport },
                  { "club.sports.branch": query.sport },
                ],
              }
            : {}),
          ...(amenities.length
            ? {
                $and: amenities.map((amenity) => ({
                  $or: [
                    { "club.amenities": amenity },
                    { "club.amenities.code": amenity },
                    { "club.amenities.name": amenity },
                  ],
                })),
              }
            : {}),
        },
      },
      {
        $lookup: {
          from: this.models.Offering.collection.name,
          let: { branchId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $in: ["$$branchId", "$branchIds"] }, { $eq: ["$status", "active"] }],
                },
              },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                minPrice: { $min: "$pricing.baseAmount" },
                maxPrice: { $max: "$pricing.baseAmount" },
                coachCount: { $sum: { $cond: [{ $eq: ["$provider.type", "coach"] }, 1, 0] } },
              },
            },
          ],
          as: "offeringStats",
        },
      },
      {
        $lookup: {
          from: this.models.Review.collection.name,
          let: { clubId: "$club._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$subject.id", "$$clubId"] },
                    { $eq: ["$subject.type", "club"] },
                    { $eq: ["$status", "active"] },
                  ],
                },
              },
            },
            { $group: { _id: null, average: { $avg: "$rating.overall" }, count: { $sum: 1 } } },
          ],
          as: "reviewStats",
        },
      },
      {
        $lookup: {
          from: this.models.MembershipProduct.collection.name,
          let: { organizationId: "$club.organizationId", branchId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$organizationId", "$$organizationId"] },
                    { $eq: ["$status", "active"] },
                    {
                      $or: [
                        { $eq: ["$scope.mode", "organization_wide"] },
                        { $in: ["$$branchId", { $ifNull: ["$scope.branchIds", []] }] },
                      ],
                    },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "memberships",
        },
      },
      {
        $addFields: {
          offeringStats: {
            $ifNull: [
              { $arrayElemAt: ["$offeringStats", 0] },
              { count: 0, minPrice: null, maxPrice: null, coachCount: 0 },
            ],
          },
          reviewStats: {
            $ifNull: [{ $arrayElemAt: ["$reviewStats", 0] }, { average: 0, count: 0 }],
          },
          membershipAvailable: { $gt: [{ $size: "$memberships" }, 0] },
        },
      },
      {
        $match: {
          ...(query.min_rating !== undefined
            ? { "reviewStats.average": { $gte: query.min_rating } }
            : {}),
          ...(query.min_price !== undefined
            ? { "offeringStats.maxPrice": { $gte: query.min_price } }
            : {}),
          ...(query.max_price !== undefined
            ? { "offeringStats.minPrice": { $lte: query.max_price } }
            : {}),
          ...(query.has_online_booking ? { "offeringStats.count": { $gt: 0 } } : {}),
          ...(query.has_active_coach ? { "offeringStats.coachCount": { $gt: 0 } } : {}),
          ...(query.membership_available ? { membershipAvailable: true } : {}),
        },
      },
      {
        $facet: {
          items: [
            { $sort: query.latitude !== undefined ? { distanceMeters: 1 } : { "profile.name": 1 } },
            { $skip: (query.page - 1) * query.limit },
            { $limit: query.limit },
            {
              $project: {
                profile: 1,
                location: 1,
                workingHours: 1,
                offeringStats: 1,
                reviewStats: 1,
                membershipAvailable: 1,
                status: 1,
                distanceMeters: 1,
                club: {
                  _id: "$club._id",
                  profile: "$club.profile",
                  sports: "$club.sports",
                  amenities: "$club.amenities",
                  verification: "$club.verification",
                  organizationId: "$club.organizationId",
                },
              },
            },
          ],
          count: [{ $count: "total" }],
        },
      },
    ];
    const [result] = await this.models.Branch.aggregate(pipeline);
    return { items: result?.items ?? [], total: result?.count?.[0]?.total ?? 0 };
  }
  private async activeBranch(branchId: string) {
    const branch = (await this.models.Branch.findOne({
      _id: objectIdFrom(branchId),
      status: "active",
    }).lean()) as any;
    if (!branch) throw new ApiError("BRANCH_NOT_FOUND", "شعبه فعال پیدا نشد.", 404);
    const club = await this.models.Club.findOne({ _id: branch.clubId, status: "active" }).lean();
    if (!club) throw new ApiError("CLUB_UNAVAILABLE", "باشگاه در دسترس نیست.", 404);
    return branch;
  }
  async branch(branchId: string) {
    const branch = (await this.models.Branch.findOne({
      _id: objectIdFrom(branchId),
      status: "active",
    }).lean()) as any;
    if (!branch) throw new ApiError("BRANCH_NOT_FOUND", "شعبه فعال پیدا نشد.", 404);
    const club = (await this.models.Club.findOne({
      _id: branch.clubId,
      status: "active",
    }).lean()) as any;
    if (!club) throw new ApiError("CLUB_UNAVAILABLE", "باشگاه در دسترس نیست.", 404);
    const [offeringStats] = (await this.models.Offering.aggregate([
      { $match: { branchIds: branch._id, status: "active" } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          minPrice: { $min: "$pricing.baseAmount" },
          maxPrice: { $max: "$pricing.baseAmount" },
          coachCount: { $sum: { $cond: [{ $eq: ["$provider.type", "coach"] }, 1, 0] } },
        },
      },
    ])) as any[];
    const [reviewStats] = (await this.models.Review.aggregate([
      {
        $match: {
          "subject.id": club._id,
          "subject.type": "club",
          status: "active",
        },
      },
      { $group: { _id: null, average: { $avg: "$rating.overall" }, count: { $sum: 1 } } },
    ])) as any[];
    return {
      ...branch,
      club,
      offeringStats: offeringStats ?? { count: 0, minPrice: null, maxPrice: null, coachCount: 0 },
      reviewStats: reviewStats ?? { average: 0, count: 0 },
    };
  }
  async resources(branchId: string, query: any) {
    await this.activeBranch(branchId);
    const filter: any = {
      branchId: objectIdFrom(branchId),
      status: "active",
      ...(query.type ? { type: query.type } : {}),
      ...(query.sport ? { "profile.sports": query.sport } : {}),
      ...(query.gender_policy
        ? { "profile.genderPolicy": { $in: ["all", query.gender_policy] } }
        : {}),
      ...(query.search ? { "profile.name": { $regex: query.search, $options: "i" } } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.models.Resource.find(filter)
        .sort({ "profile.name": 1 })
        .skip(skip)
        .limit(query.limit)
        .lean(),
      this.models.Resource.countDocuments(filter),
    ]);
    return { items, total };
  }
  async offerings(branchId: string, query: any) {
    await this.activeBranch(branchId);
    const filter: any = {
      branchIds: objectIdFrom(branchId),
      status: "active",
      ...(query.type ? { "profile.type": query.type } : {}),
      ...(query.sport ? { "profile.sport": query.sport } : {}),
      ...(query.search ? { "profile.name": { $regex: query.search, $options: "i" } } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.models.Offering.find(filter)
        .sort({ "profile.name": 1 })
        .skip(skip)
        .limit(query.limit)
        .lean(),
      this.models.Offering.countDocuments(filter),
    ]);
    return { items, total };
  }
}
