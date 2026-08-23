import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BookingResourceType } from '../../../../common/enums';
import type { BookingDocument } from '../../../../schemas/booking.schema';
import {
  ClubClass,
  type ClubClassDocument,
} from '../../../../schemas/club-class.schema';
import { Club, type ClubDocument } from '../../../../schemas/club.schema';
import {
  ClubSpace,
  type ClubSpaceDocument,
} from '../../../../schemas/club-space.schema';
import { User, type UserDocument } from '../../../../schemas/user.schema';
import { ClubSlotsService } from '../../../club-slots/club-slots.service';

export type BookingAudience = 'athlete' | 'coach' | 'club' | 'admin';

/** Builds audience-safe booking read models in bounded batches. */
@Injectable()
export class BookingProjector {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Club.name)
    private readonly clubModel: Model<ClubDocument>,
    @InjectModel(ClubClass.name)
    private readonly classModel: Model<ClubClassDocument>,
    @InjectModel(ClubSpace.name)
    private readonly spaceModel: Model<ClubSpaceDocument>,
    private readonly clubSlots: ClubSlotsService,
  ) {}

  async project(booking: BookingDocument, audience: BookingAudience) {
    const [projected] = await this.projectMany([booking], audience);
    return projected;
  }

  async projectMany(bookings: BookingDocument[], audience: BookingAudience) {
    const userIds = new Set<string>();
    for (const booking of bookings) {
      // Athletes see the coach; provider audiences see the athlete.
      if (audience === 'athlete') {
        if (booking.coachUserId) userIds.add(booking.coachUserId.toString());
      } else {
        userIds.add(booking.athleteId.toString());
      }
    }
    const clubIds = [
      ...new Set(
        bookings
          .map((booking) => booking.clubId?.toString())
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const clubSlotIds = [
      ...new Set(
        bookings
          .filter(
            (booking) => booking.resource.type !== BookingResourceType.COACH,
          )
          .map((booking) => booking.resource.refId.toString()),
      ),
    ];

    const usersPromise: Promise<UserDocument[]> = userIds.size
      ? this.userModel
          .find({
            _id: { $in: [...userIds].map((id) => new Types.ObjectId(id)) },
          })
          .select({ name: 1, avatar: 1, code: 1, phone: 1 })
      : Promise.resolve([]);
    const clubsPromise: Promise<ClubDocument[]> = clubIds.length
      ? this.clubModel
          .find({ _id: { $in: clubIds.map((id) => new Types.ObjectId(id)) } })
          .select({ identity: 1, location: 1 })
      : Promise.resolve([]);
    const [users, clubs, targetBySlotId] = await Promise.all([
      usersPromise,
      clubsPromise,
      this.resolveClubSlotTargets(clubSlotIds),
    ]);

    const userById = new Map(users.map((user) => [user._id.toString(), user]));
    const clubById = new Map(clubs.map((club) => [club._id.toString(), club]));

    return bookings.map((booking) => {
      const isCoachBooking =
        booking.resource.type === BookingResourceType.COACH;
      const counterpartId =
        audience === 'athlete'
          ? booking.coachUserId?.toString()
          : booking.athleteId.toString();
      const counterpart = counterpartId
        ? userById.get(counterpartId)
        : undefined;
      const club = booking.clubId
        ? clubById.get(booking.clubId.toString())
        : undefined;
      const target = !isCoachBooking
        ? targetBySlotId.get(booking.resource.refId.toString())
        : undefined;

      const counterpartProjection = counterpart
        ? {
            id: counterpart._id.toString(),
            name: {
              first: counterpart.name?.first ?? null,
              last: counterpart.name?.last ?? null,
            },
            avatar: {
              mediaId: counterpart.avatar?.mediaId?.toString() ?? null,
            },
            code: counterpart.code ?? null,
            phone: audience === 'athlete' ? undefined : counterpart.phone,
          }
        : null;

      return {
        id: booking._id.toString(),
        code: booking.code,
        status: booking.status,
        source: audience === 'athlete' ? undefined : booking.source,
        holderType: audience === 'athlete' ? undefined : booking.holderType,
        createdBy:
          audience === 'athlete' ? undefined : booking.createdBy?.toString(),
        paymentExpiresAt: booking.paymentExpiresAt ?? null,
        approvalExpiresAt: booking.approvalExpiresAt ?? null,
        resource: {
          type: booking.resource.type,
          refId: booking.resource.refId.toString(),
          title: target?.title ?? null,
          coverMediaId: target?.coverMediaId ?? null,
        },
        consultationKind: booking.consultationKind ?? null,
        occurrence: booking.occurrence
          ? {
              date: booking.occurrence.date,
              startTime: booking.occurrence.startTime,
              endTime: booking.occurrence.endTime,
            }
          : null,
        recurringGroupId: booking.recurringGroupId?.toString() ?? null,
        attendeeCount: booking.attendeeCount ?? 1,
        startsAt: booking.startsAt,
        endsAt: booking.endsAt,
        coach: audience === 'athlete' ? counterpartProjection : undefined,
        athlete: audience !== 'athlete' ? counterpartProjection : undefined,
        coachUserId: booking.coachUserId?.toString() ?? null,
        athleteId: booking.athleteId.toString(),
        slotId: booking.slotId?.toString() ?? booking.resource.refId.toString(),
        club: club
          ? {
              id: club._id.toString(),
              name: club.identity?.name ?? '',
              address: club.location?.address ?? null,
            }
          : null,
        intake: {
          note: booking.intake?.note ?? null,
          medicalConditionKeys: booking.intake?.medicalConditionKeys ?? [],
          supplementKeys: booking.intake?.supplementKeys ?? [],
        },
        pricing: {
          version: booking.pricing.version ?? 'booking-pricing-v1',
          amount: booking.pricing.amount,
          discount: booking.pricing.discount,
          couponCode: booking.pricing.couponCode ?? null,
          total: booking.pricing.total,
        },
        payment: booking.payment
          ? {
              refId: booking.payment.refId ?? null,
              paidAt: booking.payment.paidAt ?? null,
            }
          : null,
        cancellation: booking.cancellation
          ? {
              reasonKey: booking.cancellation.reasonKey ?? null,
              note: booking.cancellation.note ?? null,
              cancelledAt: booking.cancellation.cancelledAt,
              cancelledBy: booking.cancellation.cancelledBy,
              feePercent: booking.cancellation.feePercent ?? 0,
              feeAmount: booking.cancellation.feeAmount ?? 0,
              refundAmount: booking.cancellation.refundAmount ?? 0,
            }
          : null,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      };
    });
  }

  private async resolveClubSlotTargets(
    slotIds: string[],
  ): Promise<
    Map<string, { title: string | null; coverMediaId: string | null }>
  > {
    const out = new Map<
      string,
      { title: string | null; coverMediaId: string | null }
    >();
    if (!slotIds.length) return out;

    const slots = await this.clubSlots.findSlotsByIds(slotIds);
    const classIds = [
      ...new Set(
        slots
          .map((slot) => slot.classId?.toString())
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const spaceIds = [
      ...new Set(
        slots
          .map((slot) => slot.spaceId?.toString())
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    const [classes, spaces] = await Promise.all([
      classIds.length
        ? this.classModel.find({
            _id: { $in: classIds.map((id) => new Types.ObjectId(id)) },
          })
        : Promise.resolve([] as ClubClassDocument[]),
      spaceIds.length
        ? this.spaceModel.find({
            _id: { $in: spaceIds.map((id) => new Types.ObjectId(id)) },
          })
        : Promise.resolve([] as ClubSpaceDocument[]),
    ]);
    const classById = new Map(
      classes.map((item) => [item._id.toString(), item]),
    );
    const spaceById = new Map(
      spaces.map((item) => [item._id.toString(), item]),
    );

    for (const slot of slots) {
      const classDoc = slot.classId
        ? classById.get(slot.classId.toString())
        : undefined;
      const spaceDoc = slot.spaceId
        ? spaceById.get(slot.spaceId.toString())
        : undefined;
      out.set(slot._id.toString(), {
        title: classDoc?.title ?? spaceDoc?.title ?? null,
        coverMediaId:
          classDoc?.media?.coverMediaId?.toString() ??
          spaceDoc?.media?.coverMediaId?.toString() ??
          null,
      });
    }
    return out;
  }
}
