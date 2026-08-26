import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BookingStatus,
  NotificationTemplateKey,
  PaymentChannel,
  PaymentPurpose,
  PaymentStatus,
} from '../../../../common/enums';
import { MongoTransactionService } from '../../../../common/mongo/mongo-transaction.service';
import { PaymentGatewayService } from '../../../../common/payment/payment-gateway.service';
import { FinanceService } from '../../../../finance/finance.service';
import { OutboxService } from '../../../../outbox/outbox.service';
import {
  Booking,
  type BookingDocument,
} from '../../../../schemas/booking.schema';
import { Club, type ClubDocument } from '../../../../schemas/club.schema';
import type { VerifyBookingPaymentDto } from '../../dto/booking.dto';

/** Verify externally, then commit booking, ledger/payment, and outbox atomically. */
@Injectable()
export class VerifyBookingPaymentCommand {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Club.name)
    private readonly clubModel: Model<ClubDocument>,
    private readonly gateway: PaymentGatewayService,
    private readonly finance: FinanceService,
    private readonly outbox: OutboxService,
    private readonly transactions: MongoTransactionService,
  ) {}

  async execute(
    athleteId: string,
    booking: BookingDocument,
    dto: VerifyBookingPaymentDto,
  ): Promise<BookingDocument> {
    if (booking.status === BookingStatus.CONFIRMED) return booking;
    this.assertAwaitingKnownPayment(booking, dto.authority);
    if (dto.status !== 'OK') return booking;

    // Provider calls must remain outside Mongo transaction retries.
    const verification = await this.gateway.verifyPayment({
      authority: dto.authority,
      amount: booking.pricing.total * 10,
    });
    if (!verification.ok) {
      throw new BadRequestException(
        `Payment verification failed: ${verification.message}`,
      );
    }

    const clubName = await this.resolveClubName(booking);
    const committed = await this.transactions.run(async (session) => {
      const current = await this.bookingModel
        .findOne({ _id: booking._id, athleteId: booking.athleteId })
        .session(session);
      if (!current) throw new NotFoundException('Booking not found');
      if (current.status === BookingStatus.CONFIRMED) {
        return { booking: current, postCommit: null };
      }
      this.assertAwaitingKnownPayment(current, dto.authority);

      current.payment = {
        ...current.payment,
        refId: verification.refId,
        paidAt: new Date(),
      };
      current.status = BookingStatus.CONFIRMED;
      current.paymentExpiresAt = undefined;
      current.markModified('payment');
      await current.save({ session });

      const paymentDto = {
        purpose: PaymentPurpose.BOOKING,
        channel: PaymentChannel.ZARINPAL,
        status: PaymentStatus.CAPTURED,
        amount: {
          gross: current.pricing.amount,
          discount: current.pricing.discount,
          net: current.pricing.total,
        },
        reference: {
          orderId: current.code,
          authority: dto.authority,
          gatewayRefId: verification.refId,
        },
        payer: { userId: athleteId },
        related: {
          bookingId: current._id.toString(),
          clubId: current.clubId?.toString(),
          coachUserId: current.coachUserId?.toString(),
        },
        idempotencyKey: `booking:${current._id.toString()}:pay:${dto.authority}`,
      };
      const paymentResult = await this.finance.recordPayment(paymentDto, {
        actorId: athleteId,
        session,
      });

      await this.outbox.enqueue(
        {
          eventName: 'booking.confirmed',
          payload: {
            bookingId: current._id.toString(),
            code: current.code,
            athleteId: current.athleteId.toString(),
            clubId: current.clubId?.toString() ?? null,
            notification: {
              userId: current.athleteId.toString(),
              templateKey: NotificationTemplateKey.BOOKING_CONFIRMED,
              params: {
                clubName: clubName ?? 'Gym4Me',
                date:
                  current.occurrence?.date ??
                  current.startsAt.toISOString().slice(0, 10),
                time:
                  current.occurrence?.startTime ??
                  formatTimeTehran(current.startsAt),
              },
              payload: {
                bookingId: current._id.toString(),
                code: current.code,
              },
              critical: true,
              forceSms: true,
              smsTokens: [
                clubName ?? 'Gym4Me',
                current.occurrence?.date ??
                  current.startsAt.toISOString().slice(0, 10),
                current.occurrence?.startTime ??
                  formatTimeTehran(current.startsAt),
              ],
            },
          },
          idempotencyKey: `outbox:booking.confirmed:${current._id.toString()}`,
        },
        session,
      );

      return { booking: current, postCommit: { paymentDto, paymentResult } };
    });

    if (committed.postCommit) {
      await this.finance.runPaymentPostCommitEffects(
        committed.postCommit.paymentDto,
        { actorId: athleteId },
        committed.postCommit.paymentResult,
      );
    }
    return committed.booking;
  }

  private assertAwaitingKnownPayment(
    booking: BookingDocument,
    authority: string,
  ): void {
    if (booking.status !== BookingStatus.AWAITING_PAYMENT) {
      throw new ConflictException('Booking is not awaiting payment');
    }
    if (booking.payment?.authority !== authority) {
      throw new BadRequestException('Unknown payment authority');
    }
  }

  private async resolveClubName(
    booking: BookingDocument,
  ): Promise<string | null> {
    if (!booking.clubId) return null;
    const club = await this.clubModel
      .findById(booking.clubId)
      .select({ identity: 1 });
    return club?.identity?.name ?? null;
  }
}

function formatTimeTehran(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tehran',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}
