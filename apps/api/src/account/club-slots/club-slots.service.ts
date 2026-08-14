import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { Request } from 'express';
import { AuditService } from '../../audit/audit.service';
import {
  AuditAction,
  EntityStatus,
  OccurrenceStatus,
  Role,
  SlotExceptionStatus,
  SlotKind,
  SlotRecurrenceType,
} from '../../common/enums';
import type { JwtUser } from '../../common/types';
import { asSinglePageResult } from '../../common/utils/pagination.util';
import { assertCanMutateAsRole } from '../../common/utils/role-assert.util';
import { ClubClass, ClubClassDocument } from '../../schemas/club-class.schema';
import { Club, ClubDocument } from '../../schemas/club.schema';
import {
  ClubSlotOccupancy,
  ClubSlotOccupancyDocument,
} from '../../schemas/club-slot-occupancy.schema';
import {
  ClubSlot,
  ClubSlotDocument,
  SlotRecurrence,
} from '../../schemas/club-slot.schema';
import { ClubSpace, ClubSpaceDocument } from '../../schemas/club-space.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { UsersService } from '../../users/users.service';
import {
  CancelSlotOccurrenceDto,
  ClubCalendarQueryDto,
  CreateClubClassDto,
  CreateClubSlotDto,
  CreateClubSpaceDto,
  UpdateClubClassDto,
  UpdateClubSlotDto,
  UpdateClubSpaceDto,
} from './dto/club-slot.dto';

const MAX_CALENDAR_DAYS = 31;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

@Injectable()
export class ClubSlotsService {
  constructor(
    @InjectModel(Club.name) private readonly clubModel: Model<ClubDocument>,
    @InjectModel(ClubClass.name)
    private readonly classModel: Model<ClubClassDocument>,
    @InjectModel(ClubSlot.name)
    private readonly slotModel: Model<ClubSlotDocument>,
    @InjectModel(ClubSpace.name)
    private readonly spaceModel: Model<ClubSpaceDocument>,
    @InjectModel(ClubSlotOccupancy.name)
    private readonly occupancyModel: Model<ClubSlotOccupancyDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly users: UsersService,
    private readonly audit: AuditService,
  ) {}

  // ── Access ────────────────────────────────────

  async requireOwned(jwt: JwtUser, clubId: string): Promise<ClubDocument> {
    assertCanMutateAsRole(jwt, Role.CLUB_OWNER);
    const club = await this.findClubOrFail(clubId);
    if (club.ownerId.toString() !== jwt.sub) {
      throw new ForbiddenException('Not your club');
    }
    return club;
  }

  async findClubOrFail(clubId: string): Promise<ClubDocument> {
    if (!Types.ObjectId.isValid(clubId)) {
      throw new NotFoundException('Club not found');
    }
    const club = await this.clubModel.findById(clubId);
    if (!club) throw new NotFoundException('Club not found');
    return club;
  }

  // ── Classes ───────────────────────────────────

  async listClasses(clubId: string) {
    await this.findClubOrFail(clubId);
    const items = await this.classModel
      .find({
        clubId: new Types.ObjectId(clubId),
        status: { $ne: EntityStatus.ARCHIVED },
      })
      .sort({ createdAt: -1 });
    return asSinglePageResult(
      await Promise.all(items.map((c) => this.toClassPublic(c))),
    );
  }

  async getClass(clubId: string, classId: string) {
    const doc = await this.findClassOrFail(clubId, classId);
    return this.toClassPublic(doc);
  }

  async createClass(
    clubId: string,
    dto: CreateClubClassDto,
    actorId: string,
    request: Request,
  ) {
    await this.findClubOrFail(clubId);
    const doc = await this.classModel.create({
      clubId: new Types.ObjectId(clubId),
      title: dto.title,
      description: dto.description,
      sportId: dto.sportId ? new Types.ObjectId(dto.sportId) : undefined,
      coachId: dto.coachId ? new Types.ObjectId(dto.coachId) : undefined,
      media: {
        coverMediaId: dto.media?.coverMediaId
          ? new Types.ObjectId(dto.media.coverMediaId)
          : undefined,
      },
      status: dto.status ?? EntityStatus.ACTIVE,
    });

    await this.clubModel.updateOne(
      { _id: new Types.ObjectId(clubId) },
      { $addToSet: { classes: { classId: doc._id } } },
    );

    this.audit.log({
      action: AuditAction.CLUB_UPDATED,
      actorId,
      metadata: { clubId, createClassId: doc._id.toString() },
      request,
    });

    return this.toClassPublic(doc);
  }

  async updateClass(
    clubId: string,
    classId: string,
    dto: UpdateClubClassDto,
    actorId: string,
    request: Request,
  ) {
    const doc = await this.findClassOrFail(clubId, classId);

    if (dto.title !== undefined) doc.title = dto.title;
    if (dto.description !== undefined) {
      doc.description = dto.description ?? undefined;
    }
    if (dto.sportId !== undefined) {
      doc.sportId = dto.sportId ? new Types.ObjectId(dto.sportId) : undefined;
    }
    if (dto.coachId !== undefined) {
      doc.coachId = dto.coachId ? new Types.ObjectId(dto.coachId) : undefined;
    }
    if (dto.media !== undefined) {
      doc.media = {
        coverMediaId: dto.media.coverMediaId
          ? new Types.ObjectId(dto.media.coverMediaId)
          : undefined,
      };
      doc.markModified('media');
    }
    if (dto.status !== undefined) {
      doc.status = dto.status;
      if (dto.status === EntityStatus.ARCHIVED) {
        await this.clubModel.updateOne(
          { _id: new Types.ObjectId(clubId) },
          { $pull: { classes: { classId: doc._id } } },
        );
      } else {
        await this.clubModel.updateOne(
          { _id: new Types.ObjectId(clubId) },
          { $addToSet: { classes: { classId: doc._id } } },
        );
      }
    }

    await doc.save();

    this.audit.log({
      action: AuditAction.CLUB_UPDATED,
      actorId,
      metadata: { clubId, updateClassId: classId },
      request,
    });

    return this.toClassPublic(doc);
  }

  async archiveClass(
    clubId: string,
    classId: string,
    actorId: string,
    request: Request,
  ) {
    return this.updateClass(
      clubId,
      classId,
      { status: EntityStatus.ARCHIVED },
      actorId,
      request,
    );
  }

  // ── Spaces ────────────────────────────────────

  async listSpaces(clubId: string) {
    await this.findClubOrFail(clubId);
    const items = await this.spaceModel
      .find({
        clubId: new Types.ObjectId(clubId),
        status: { $ne: EntityStatus.ARCHIVED },
      })
      .sort({ createdAt: -1 });
    return asSinglePageResult(items.map((s) => this.toSpacePublic(s)));
  }

  async getSpace(clubId: string, spaceId: string) {
    const doc = await this.findSpaceOrFail(clubId, spaceId);
    return this.toSpacePublic(doc);
  }

  async createSpace(
    clubId: string,
    dto: CreateClubSpaceDto,
    actorId: string,
    request: Request,
  ) {
    await this.findClubOrFail(clubId);
    const doc = await this.spaceModel.create({
      clubId: new Types.ObjectId(clubId),
      title: dto.title,
      description: dto.description,
      sportId: dto.sportId ? new Types.ObjectId(dto.sportId) : undefined,
      media: {
        coverMediaId: dto.media?.coverMediaId
          ? new Types.ObjectId(dto.media.coverMediaId)
          : undefined,
      },
      status: dto.status ?? EntityStatus.ACTIVE,
    });

    this.audit.log({
      action: AuditAction.CLUB_UPDATED,
      actorId,
      metadata: { clubId, createSpaceId: doc._id.toString() },
      request,
    });

    return this.toSpacePublic(doc);
  }

  async updateSpace(
    clubId: string,
    spaceId: string,
    dto: UpdateClubSpaceDto,
    actorId: string,
    request: Request,
  ) {
    const doc = await this.findSpaceOrFail(clubId, spaceId);

    if (dto.title !== undefined) doc.title = dto.title;
    if (dto.description !== undefined) {
      doc.description = dto.description ?? undefined;
    }
    if (dto.sportId !== undefined) {
      doc.sportId = dto.sportId ? new Types.ObjectId(dto.sportId) : undefined;
    }
    if (dto.media !== undefined) {
      doc.media = {
        coverMediaId: dto.media.coverMediaId
          ? new Types.ObjectId(dto.media.coverMediaId)
          : undefined,
      };
      doc.markModified('media');
    }
    if (dto.status !== undefined) doc.status = dto.status;

    await doc.save();

    this.audit.log({
      action: AuditAction.CLUB_UPDATED,
      actorId,
      metadata: { clubId, updateSpaceId: spaceId },
      request,
    });

    return this.toSpacePublic(doc);
  }

  async archiveSpace(
    clubId: string,
    spaceId: string,
    actorId: string,
    request: Request,
  ) {
    return this.updateSpace(
      clubId,
      spaceId,
      { status: EntityStatus.ARCHIVED },
      actorId,
      request,
    );
  }

  // ── Slots ─────────────────────────────────────

  async listSlots(clubId: string) {
    await this.findClubOrFail(clubId);
    const items = await this.slotModel
      .find({
        clubId: new Types.ObjectId(clubId),
        status: { $ne: EntityStatus.ARCHIVED },
      })
      .sort({ createdAt: -1 });
    return asSinglePageResult(
      await Promise.all(items.map((s) => this.toSlotPublic(s))),
    );
  }

  async getSlot(clubId: string, slotId: string) {
    const doc = await this.findSlotOrFail(clubId, slotId);
    return this.toSlotPublic(doc);
  }

  async createSlot(
    clubId: string,
    dto: CreateClubSlotDto,
    actorId: string,
    request: Request,
  ) {
    await this.findClubOrFail(clubId);
    this.assertValidSchedule(dto.schedule.recurrence);
    if (dto.kind === SlotKind.CLASS) {
      if (!dto.classId) {
        throw new BadRequestException('classId is required for class slots');
      }
      await this.findClassOrFail(clubId, dto.classId);
    }
    if (dto.kind === SlotKind.SPACE) {
      if (!dto.spaceId) {
        throw new BadRequestException('spaceId is required for space slots');
      }
      await this.findSpaceOrFail(clubId, dto.spaceId);
    }

    const doc = await this.slotModel.create({
      clubId: new Types.ObjectId(clubId),
      kind: dto.kind,
      classId: dto.classId ? new Types.ObjectId(dto.classId) : undefined,
      spaceId: dto.spaceId ? new Types.ObjectId(dto.spaceId) : undefined,
      coachId: dto.coachId ? new Types.ObjectId(dto.coachId) : undefined,
      capacity: dto.capacity,
      price: dto.price ?? 0,
      schedule: {
        recurrence: this.normalizeRecurrence(dto.schedule.recurrence),
        exceptions: (dto.schedule.exceptions ?? []).map((e) => ({
          date: e.date,
          status: e.status ?? SlotExceptionStatus.CANCELLED,
        })),
      },
      status: dto.status ?? EntityStatus.ACTIVE,
    });

    this.audit.log({
      action: AuditAction.CLUB_UPDATED,
      actorId,
      metadata: { clubId, createSlotId: doc._id.toString() },
      request,
    });

    return this.toSlotPublic(doc);
  }

  async updateSlot(
    clubId: string,
    slotId: string,
    dto: UpdateClubSlotDto,
    actorId: string,
    request: Request,
  ) {
    const doc = await this.findSlotOrFail(clubId, slotId);
    const nextKind = dto.kind ?? doc.kind;

    if (dto.kind !== undefined) doc.kind = dto.kind;
    if (dto.classId !== undefined) {
      if (dto.classId) {
        await this.findClassOrFail(clubId, dto.classId);
        doc.classId = new Types.ObjectId(dto.classId);
      } else {
        doc.classId = undefined;
      }
    }
    if (nextKind === SlotKind.CLASS && !doc.classId) {
      throw new BadRequestException('classId is required for class slots');
    }
    if (dto.spaceId !== undefined) {
      if (dto.spaceId) {
        await this.findSpaceOrFail(clubId, dto.spaceId);
        doc.spaceId = new Types.ObjectId(dto.spaceId);
      } else {
        doc.spaceId = undefined;
      }
    }
    if (nextKind === SlotKind.SPACE && !doc.spaceId) {
      throw new BadRequestException('spaceId is required for space slots');
    }
    if (dto.coachId !== undefined) {
      doc.coachId = dto.coachId ? new Types.ObjectId(dto.coachId) : undefined;
    }
    if (dto.capacity !== undefined) doc.capacity = dto.capacity;
    if (dto.price !== undefined) doc.price = dto.price;
    if (dto.schedule !== undefined) {
      this.assertValidSchedule(dto.schedule.recurrence);
      doc.schedule = {
        recurrence: this.normalizeRecurrence(dto.schedule.recurrence),
        exceptions: (dto.schedule.exceptions ?? []).map((e) => ({
          date: e.date,
          status: e.status ?? SlotExceptionStatus.CANCELLED,
        })),
      };
      doc.markModified('schedule');
    }
    if (dto.status !== undefined) doc.status = dto.status;

    await doc.save();

    this.audit.log({
      action: AuditAction.CLUB_UPDATED,
      actorId,
      metadata: { clubId, updateSlotId: slotId },
      request,
    });

    return this.toSlotPublic(doc);
  }

  async archiveSlot(
    clubId: string,
    slotId: string,
    actorId: string,
    request: Request,
  ) {
    return this.updateSlot(
      clubId,
      slotId,
      { status: EntityStatus.ARCHIVED },
      actorId,
      request,
    );
  }

  async cancelOccurrence(
    clubId: string,
    slotId: string,
    dto: CancelSlotOccurrenceDto,
    actorId: string,
    request: Request,
  ) {
    const doc = await this.findSlotOrFail(clubId, slotId);
    const exists = doc.schedule.exceptions.some((e) => e.date === dto.date);
    if (!exists) {
      doc.schedule.exceptions.push({
        date: dto.date,
        status: SlotExceptionStatus.CANCELLED,
      });
      doc.markModified('schedule');
      await doc.save();
    }

    this.audit.log({
      action: AuditAction.CLUB_UPDATED,
      actorId,
      metadata: { clubId, cancelSlotId: slotId, date: dto.date },
      request,
    });

    return this.toSlotPublic(doc);
  }

  // ── Calendar ──────────────────────────────────

  async getCalendar(clubId: string, query: ClubCalendarQueryDto) {
    await this.findClubOrFail(clubId);
    const days = this.enumerateDates(query.from, query.to);
    if (days.length === 0) {
      throw new BadRequestException('Invalid from/to range');
    }
    if (days.length > MAX_CALENDAR_DAYS) {
      throw new BadRequestException(
        `Calendar range cannot exceed ${MAX_CALENDAR_DAYS} days`,
      );
    }

    const slots = await this.slotModel.find({
      clubId: new Types.ObjectId(clubId),
      status: EntityStatus.ACTIVE,
    });

    const classIds = [
      ...new Set(
        slots.filter((s) => s.classId).map((s) => s.classId!.toString()),
      ),
    ];

    const classes = classIds.length
      ? await this.classModel.find({
          _id: { $in: classIds.map((id) => new Types.ObjectId(id)) },
        })
      : ([] as ClubClassDocument[]);

    const spaceIds = [
      ...new Set(
        slots.filter((s) => s.spaceId).map((s) => s.spaceId!.toString()),
      ),
    ];

    const spaces = spaceIds.length
      ? await this.spaceModel.find({
          _id: { $in: spaceIds.map((id) => new Types.ObjectId(id)) },
        })
      : ([] as ClubSpaceDocument[]);

    const coachIds = [
      ...new Set([
        ...slots.filter((s) => s.coachId).map((s) => s.coachId!.toString()),
        ...classes.filter((c) => c.coachId).map((c) => c.coachId!.toString()),
      ]),
    ];

    const coaches = coachIds.length
      ? await this.userModel.find({
          _id: { $in: coachIds.map((id) => new Types.ObjectId(id)) },
        })
      : ([] as UserDocument[]);

    const classById = new Map(classes.map((c) => [c._id.toString(), c]));
    const spaceById = new Map(spaces.map((s) => [s._id.toString(), s]));
    const coachById = new Map(coaches.map((u) => [u._id.toString(), u]));

    const occupancies = slots.length
      ? await this.occupancyModel
          .find({
            slotId: { $in: slots.map((s) => s._id) },
            date: { $gte: days[0], $lte: days[days.length - 1] },
          })
          .lean()
      : [];
    const reservedByKey = new Map(
      occupancies.map((o) => [`${o.slotId.toString()}:${o.date}`, o.reserved]),
    );

    const byDate = new Map<
      string,
      {
        date: string;
        weekday: number;
        items: Array<Record<string, unknown>>;
      }
    >();

    for (const date of days) {
      byDate.set(date, {
        date,
        weekday: weekdaySat0(date),
        items: [],
      });
    }

    for (const slot of slots) {
      const occurrences = this.expandSlot(slot, days);
      for (const occ of occurrences) {
        const day = byDate.get(occ.date);
        if (!day) continue;

        const classDoc = slot.classId
          ? classById.get(slot.classId.toString())
          : undefined;
        const spaceDoc = slot.spaceId
          ? spaceById.get(slot.spaceId.toString())
          : undefined;
        const coachId =
          slot.coachId?.toString() ?? classDoc?.coachId?.toString();
        const coach = coachId ? coachById.get(coachId) : undefined;
        const reserved =
          reservedByKey.get(`${slot._id.toString()}:${occ.date}`) ?? 0;

        day.items.push({
          slotId: slot._id.toString(),
          kind: slot.kind,
          class: classDoc
            ? {
                id: classDoc._id.toString(),
                title: classDoc.title,
                media: {
                  coverMediaId:
                    classDoc.media?.coverMediaId?.toString() ?? null,
                },
              }
            : null,
          space: spaceDoc
            ? {
                id: spaceDoc._id.toString(),
                title: spaceDoc.title,
                media: {
                  coverMediaId:
                    spaceDoc.media?.coverMediaId?.toString() ?? null,
                },
              }
            : null,
          coach: coach
            ? {
                id: coach._id.toString(),
                name: {
                  first: coach.name?.first ?? null,
                  last: coach.name?.last ?? null,
                },
              }
            : coachId
              ? { id: coachId, name: { first: null, last: null } }
              : null,
          startTime: occ.startTime,
          endTime: occ.endTime,
          capacity: slot.capacity,
          remaining: Math.max(0, slot.capacity - reserved),
          price: slot.price ?? 0,
          occurrenceStatus: occ.status,
        });
      }
    }

    for (const day of byDate.values()) {
      day.items.sort((a, b) =>
        String(a.startTime).localeCompare(String(b.startTime)),
      );
    }

    return { timezone: 'Asia/Tehran', days: [...byDate.values()] };
  }

  // ── Helpers ───────────────────────────────────

  private async findClassOrFail(clubId: string, classId: string) {
    if (!Types.ObjectId.isValid(classId)) {
      throw new NotFoundException('Class not found');
    }
    const doc = await this.classModel.findOne({
      _id: new Types.ObjectId(classId),
      clubId: new Types.ObjectId(clubId),
    });
    if (!doc) throw new NotFoundException('Class not found');
    return doc;
  }

  private async findSpaceOrFail(clubId: string, spaceId: string) {
    if (!Types.ObjectId.isValid(spaceId)) {
      throw new NotFoundException('Space not found');
    }
    const doc = await this.spaceModel.findOne({
      _id: new Types.ObjectId(spaceId),
      clubId: new Types.ObjectId(clubId),
    });
    if (!doc) throw new NotFoundException('Space not found');
    return doc;
  }

  /**
   * Resolve one bookable occurrence of an active club slot for the
   * reservation flow. Throws if the date does not match the recurrence,
   * the occurrence is cancelled, or the slot is inactive.
   */
  async resolveBookableOccurrence(slotId: string, date: string) {
    if (!Types.ObjectId.isValid(slotId) || !DATE_RE.test(date)) {
      throw new NotFoundException('Slot occurrence not found');
    }
    const slot = await this.slotModel.findOne({
      _id: new Types.ObjectId(slotId),
      status: EntityStatus.ACTIVE,
    });
    if (!slot) throw new NotFoundException('Slot not found');

    const [occurrence] = this.expandSlot(slot, [date]);
    if (!occurrence) {
      throw new BadRequestException('Slot has no occurrence on that date');
    }
    if (occurrence.status === OccurrenceStatus.CANCELLED) {
      throw new BadRequestException('This occurrence has been cancelled');
    }
    return {
      slot,
      occurrence: {
        date,
        startTime: occurrence.startTime,
        endTime: occurrence.endTime,
      },
    };
  }

  /** Bulk lookup for booking projections (no status filter — history safe). */
  async findSlotsByIds(slotIds: string[]): Promise<ClubSlotDocument[]> {
    const valid = slotIds.filter((id) => Types.ObjectId.isValid(id));
    if (!valid.length) return [];
    return this.slotModel.find({
      _id: { $in: valid.map((id) => new Types.ObjectId(id)) },
    });
  }

  /**
   * Atomically reserve seats on an occurrence. Returns false when the
   * occurrence is already at capacity (never oversells under concurrency).
   */
  async occupyOccurrence(
    slotId: Types.ObjectId,
    date: string,
    seats: number,
    capacity: number,
  ): Promise<boolean> {
    try {
      const updated = await this.occupancyModel.findOneAndUpdate(
        { slotId, date, reserved: { $lte: capacity - seats } },
        { $inc: { reserved: seats } },
        { upsert: true, new: true },
      );
      return Boolean(updated);
    } catch (error: unknown) {
      // Duplicate key = doc exists but failed the capacity filter → full.
      if ((error as { code?: number }).code === 11000) return false;
      throw error;
    }
  }

  async releaseOccurrence(
    slotId: Types.ObjectId,
    date: string,
    seats: number,
  ): Promise<void> {
    await this.occupancyModel.updateOne(
      { slotId, date, reserved: { $gte: seats } },
      { $inc: { reserved: -seats } },
    );
  }

  private async findSlotOrFail(clubId: string, slotId: string) {
    if (!Types.ObjectId.isValid(slotId)) {
      throw new NotFoundException('Slot not found');
    }
    const doc = await this.slotModel.findOne({
      _id: new Types.ObjectId(slotId),
      clubId: new Types.ObjectId(clubId),
    });
    if (!doc) throw new NotFoundException('Slot not found');
    return doc;
  }

  private assertValidSchedule(recurrence: {
    type: SlotRecurrenceType;
    weekday?: number;
    date?: string;
    startTime: string;
    endTime: string;
    startsOn?: string;
    endsOn?: string;
  }) {
    if (recurrence.startTime >= recurrence.endTime) {
      throw new BadRequestException('endTime must be after startTime');
    }
    if (recurrence.type === SlotRecurrenceType.WEEKLY) {
      if (recurrence.weekday === undefined || recurrence.weekday === null) {
        throw new BadRequestException('weekday is required for weekly slots');
      }
      if (!recurrence.startsOn || !DATE_RE.test(recurrence.startsOn)) {
        throw new BadRequestException('startsOn is required for weekly slots');
      }
      if (recurrence.endsOn && recurrence.endsOn < recurrence.startsOn) {
        throw new BadRequestException('endsOn must be on/after startsOn');
      }
    } else if (recurrence.type === SlotRecurrenceType.ONCE) {
      if (!recurrence.date || !DATE_RE.test(recurrence.date)) {
        throw new BadRequestException('date is required for once slots');
      }
    }
  }

  private normalizeRecurrence(recurrence: {
    type: SlotRecurrenceType;
    weekday?: number;
    date?: string;
    startTime: string;
    endTime: string;
    startsOn?: string;
    endsOn?: string;
  }): SlotRecurrence {
    if (recurrence.type === SlotRecurrenceType.WEEKLY) {
      return {
        type: SlotRecurrenceType.WEEKLY,
        weekday: recurrence.weekday,
        startTime: recurrence.startTime,
        endTime: recurrence.endTime,
        startsOn: recurrence.startsOn,
        endsOn: recurrence.endsOn,
      };
    }
    return {
      type: SlotRecurrenceType.ONCE,
      date: recurrence.date,
      startTime: recurrence.startTime,
      endTime: recurrence.endTime,
    };
  }

  private expandSlot(
    slot: ClubSlotDocument,
    days: string[],
  ): Array<{
    date: string;
    startTime: string;
    endTime: string;
    status: OccurrenceStatus;
  }> {
    const { recurrence, exceptions } = slot.schedule;
    const cancelled = new Set(
      (exceptions ?? [])
        .filter((e) => e.status === SlotExceptionStatus.CANCELLED)
        .map((e) => e.date),
    );
    const out: Array<{
      date: string;
      startTime: string;
      endTime: string;
      status: OccurrenceStatus;
    }> = [];

    if (recurrence.type === SlotRecurrenceType.ONCE) {
      const date = recurrence.date!;
      if (days.includes(date)) {
        out.push({
          date,
          startTime: recurrence.startTime,
          endTime: recurrence.endTime,
          status: cancelled.has(date)
            ? OccurrenceStatus.CANCELLED
            : OccurrenceStatus.SCHEDULED,
        });
      }
      return out;
    }

    const startsOn = recurrence.startsOn!;
    const endsOn = recurrence.endsOn;
    const weekday = recurrence.weekday!;

    for (const date of days) {
      if (date < startsOn) continue;
      if (endsOn && date > endsOn) continue;
      if (weekdaySat0(date) !== weekday) continue;
      out.push({
        date,
        startTime: recurrence.startTime,
        endTime: recurrence.endTime,
        status: cancelled.has(date)
          ? OccurrenceStatus.CANCELLED
          : OccurrenceStatus.SCHEDULED,
      });
    }
    return out;
  }

  private enumerateDates(from: string, to: string): string[] {
    if (!DATE_RE.test(from) || !DATE_RE.test(to) || to < from) return [];
    const out: string[] = [];
    let cursor = from;
    while (cursor <= to) {
      out.push(cursor);
      cursor = addDays(cursor, 1);
      if (out.length > MAX_CALENDAR_DAYS + 1) break;
    }
    return out;
  }

  async toClassPublic(doc: ClubClassDocument) {
    let coach: Record<string, unknown> | null = null;
    if (doc.coachId) {
      const user = await this.userModel.findById(doc.coachId);
      coach = user
        ? { ...this.users.toPublic(user) }
        : { id: doc.coachId.toString() };
    }
    return {
      id: doc._id.toString(),
      clubId: doc.clubId.toString(),
      title: doc.title,
      description: doc.description ?? null,
      sportId: doc.sportId?.toString() ?? null,
      coachId: doc.coachId?.toString() ?? null,
      coach,
      media: {
        coverMediaId: doc.media?.coverMediaId?.toString() ?? null,
      },
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  toSpacePublic(doc: ClubSpaceDocument) {
    return {
      id: doc._id.toString(),
      clubId: doc.clubId.toString(),
      title: doc.title,
      description: doc.description ?? null,
      sportId: doc.sportId?.toString() ?? null,
      media: {
        coverMediaId: doc.media?.coverMediaId?.toString() ?? null,
      },
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async toSlotPublic(doc: ClubSlotDocument) {
    return {
      id: doc._id.toString(),
      clubId: doc.clubId.toString(),
      kind: doc.kind,
      classId: doc.classId?.toString() ?? null,
      spaceId: doc.spaceId?.toString() ?? null,
      coachId: doc.coachId?.toString() ?? null,
      capacity: doc.capacity,
      price: doc.price ?? 0,
      schedule: {
        recurrence: {
          type: doc.schedule.recurrence.type,
          weekday: doc.schedule.recurrence.weekday ?? null,
          date: doc.schedule.recurrence.date ?? null,
          startTime: doc.schedule.recurrence.startTime,
          endTime: doc.schedule.recurrence.endTime,
          startsOn: doc.schedule.recurrence.startsOn ?? null,
          endsOn: doc.schedule.recurrence.endsOn ?? null,
        },
        exceptions: (doc.schedule.exceptions ?? []).map((e) => ({
          date: e.date,
          status: e.status,
        })),
      },
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}

/** 0 = Saturday (Jalali week), matching Club.operatingHours. */
function weekdaySat0(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  const jsDay = new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).getUTCDay();
  return (jsDay + 1) % 7;
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}
