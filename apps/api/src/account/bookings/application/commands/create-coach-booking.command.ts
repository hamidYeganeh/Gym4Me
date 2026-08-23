import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'node:crypto';
import { Model, Types, type ClientSession } from 'mongoose';
import {
  BookingResourceType,
  BookingStatus,
  CoachSlotStatus,
  ConsultationKind,
  VerificationStatus,
} from '../../../../common/enums';
import { MongoTransactionService } from '../../../../common/mongo/mongo-transaction.service';
import {
  Booking,
  type BookingDocument,
} from '../../../../schemas/booking.schema';
import {
  CoachProfile,
  type CoachProfileDocument,
} from '../../../../schemas/coach-profile.schema';
import {
  CoachSlot,
  type CoachSlotDocument,
} from '../../../../schemas/coach-slot.schema';
import type { CreateBookingDto } from '../../dto/booking.dto';

/** Atomically reserve a concrete coach slot and persist its booking snapshot. */
@Injectable()
export class CreateCoachBookingCommand {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(CoachSlot.name)
    private readonly slotModel: Model<CoachSlotDocument>,
    @InjectModel(CoachProfile.name)
    private readonly coachModel: Model<CoachProfileDocument>,
    private readonly config: ConfigService,
    private readonly transactions: MongoTransactionService,
  ) {}

  async execute(
    athleteId: string,
    dto: CreateBookingDto,
  ): Promise<BookingDocument> {
    const existing = await this.findIdempotentBooking(athleteId, dto);
    if (existing) return existing;

    const profile = await this.coachModel.findOne({
      userId: new Types.ObjectId(dto.coachUserId),
      'verification.status': VerificationStatus.APPROVED,
    });
    if (!profile) throw new NotFoundException('Coach not found');
    if (athleteId === dto.coachUserId) {
      throw new BadRequestException('You cannot book yourself');
    }

    const price =
      dto.consultationKind === ConsultationKind.IN_PERSON
        ? profile.pricing?.consultation?.inPerson
        : profile.pricing?.consultation?.remote;
    if (price === undefined || price === null) {
      throw new BadRequestException(
        'Coach does not offer this consultation type',
      );
    }

    try {
      return await this.transactions.run(async (session) => {
        const replay = await this.findIdempotentBooking(
          athleteId,
          dto,
          session,
        );
        if (replay) return replay;

        const slot = await this.slotModel.findOneAndUpdate(
          {
            _id: new Types.ObjectId(dto.slotId),
            coachUserId: new Types.ObjectId(dto.coachUserId),
            status: CoachSlotStatus.OPEN,
            startsAt: { $gt: new Date() },
          },
          { $set: { status: CoachSlotStatus.BOOKED } },
          { new: true, session },
        );
        if (!slot) {
          throw new ConflictException('Slot is no longer available');
        }

        const [created] = await this.bookingModel.create(
          [
            {
              code: `BK-${randomBytes(4).toString('hex').toUpperCase()}`,
              idempotencyKey: dto.idempotencyKey,
              athleteId: new Types.ObjectId(athleteId),
              resource: {
                type: BookingResourceType.COACH,
                refId: slot._id,
              },
              coachUserId: new Types.ObjectId(dto.coachUserId),
              slotId: slot._id,
              clubId:
                dto.consultationKind === ConsultationKind.IN_PERSON
                  ? slot.clubId
                  : undefined,
              consultationKind: dto.consultationKind,
              startsAt: slot.startsAt,
              endsAt: slot.endsAt,
              intake: {
                note: dto.intake?.note,
                medicalConditionKeys: dto.intake?.medicalConditionKeys ?? [],
                supplementKeys: dto.intake?.supplementKeys ?? [],
              },
              pricing: {
                amount: price,
                discount: 0,
                couponCode: dto.couponCode,
                total: Math.max(0, price),
              },
              status: BookingStatus.PENDING,
              approvalExpiresAt: this.approvalExpiresAt(),
            },
          ],
          { session },
        );
        if (!created) throw new Error('Booking was not created');
        return created;
      });
    } catch (error) {
      const replay = await this.findIdempotentBooking(athleteId, dto);
      if (replay) return replay;
      throw error;
    }
  }

  private approvalExpiresAt(): Date {
    const minutes = Number(
      this.config.get<string>('BOOKING_COACH_APPROVAL_TTL_MINUTES') ?? 1_440,
    );
    return new Date(Date.now() + Math.max(5, minutes) * 60_000);
  }

  private async findIdempotentBooking(
    athleteId: string,
    dto: CreateBookingDto,
    session?: ClientSession,
  ): Promise<BookingDocument | null> {
    if (!dto.idempotencyKey) return null;
    const query = this.bookingModel.findOne({
      athleteId: new Types.ObjectId(athleteId),
      idempotencyKey: dto.idempotencyKey,
    });
    return session ? query.session(session) : query;
  }
}
