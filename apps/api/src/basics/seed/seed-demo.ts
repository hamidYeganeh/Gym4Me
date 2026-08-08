/**
 * Idempotent demo seed: role users, coach profiles, KYC requests,
 * clubs (approved / pending / draft) with classes, slots, coaches,
 * user reviews and public FAQ.
 *
 * Requires basics seed first (choices / locations / sports / refs):
 *   npm run db:seed -w api
 * Then:
 *   npm run db:seed:demo -w api
 *
 * All demo users share the password `Gym4Me!123`.
 */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { Model, Types } from 'mongoose';
import { AppModule } from '../../app.module';
import { ClubsService } from '../../account/clubs/clubs.service';
import {
  ClubLifecycleStatus,
  ClubOperationalStatus,
  ClubUserReviewStatus,
  EntityStatus,
  FaqAudience,
  GeoDirection,
  KycRequestKind,
  KycRequestStatus,
  KycStatus,
  PublishStatus,
  RefType,
  Role,
  RulePolicy,
  SlotKind,
  SlotRecurrenceType,
  VerificationStatus,
  WeekdayStatus,
} from '../../common/enums';
import { normalizeIranPhone } from '../../common/utils/phone.util';
import { Club, ClubDocument } from '../../schemas/club.schema';
import { ClubClass, ClubClassDocument } from '../../schemas/club-class.schema';
import { ClubSlot, ClubSlotDocument } from '../../schemas/club-slot.schema';
import {
  ClubUserReview,
  ClubUserReviewDocument,
} from '../../schemas/club-user-review.schema';
import {
  CoachProfile,
  CoachProfileDocument,
} from '../../schemas/coach-profile.schema';
import { FaqItem, FaqItemDocument } from '../../schemas/faq-item.schema';
import {
  KycRequest,
  KycRequestDocument,
} from '../../schemas/kyc-request.schema';
import { Location, LocationDocument } from '../../schemas/location.schema';
import { RefItem, RefItemDocument } from '../../schemas/ref-item.schema';
import { Sport, SportDocument } from '../../schemas/sport.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { UsersService } from '../../users/users.service';

const DEMO_PASSWORD = 'Gym4Me!123';

const PHONES = {
  admin: '09121111111',
  owner1: '09122000001',
  owner2: '09122000002',
  coach1: '09123000001',
  coach2: '09123000002',
  coach3: '09123000003',
  athlete1: '09124000001',
  athlete2: '09124000002',
  athlete3: '09124000003',
} as const;

interface DemoUserSpec {
  key: keyof typeof PHONES;
  firstName: string;
  lastName: string;
  roles: Role[];
}

const USER_SPECS: DemoUserSpec[] = [
  { key: 'owner1', firstName: 'رضا', lastName: 'کریمی', roles: [Role.CLUB_OWNER, Role.ATHLETE] },
  { key: 'owner2', firstName: 'مریم', lastName: 'حسینی', roles: [Role.CLUB_OWNER, Role.ATHLETE] },
  { key: 'coach1', firstName: 'امیر', lastName: 'محمدی', roles: [Role.COACH, Role.ATHLETE] },
  { key: 'coach2', firstName: 'نگار', lastName: 'صادقی', roles: [Role.COACH, Role.ATHLETE] },
  { key: 'coach3', firstName: 'حسین', lastName: 'قاسمی', roles: [Role.COACH, Role.ATHLETE] },
  { key: 'athlete1', firstName: 'علی', lastName: 'احمدی', roles: [Role.ATHLETE] },
  { key: 'athlete2', firstName: 'زهرا', lastName: 'موسوی', roles: [Role.ATHLETE] },
  { key: 'athlete3', firstName: 'مهدی', lastName: 'نوری', roles: [Role.ATHLETE] },
];

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const log = new Logger('SeedDemo');

  const users = app.get(UsersService);
  const clubsService = app.get(ClubsService);

  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
  const coachModel = app.get<Model<CoachProfileDocument>>(
    getModelToken(CoachProfile.name),
  );
  const kycModel = app.get<Model<KycRequestDocument>>(
    getModelToken(KycRequest.name),
  );
  const clubModel = app.get<Model<ClubDocument>>(getModelToken(Club.name));
  const classModel = app.get<Model<ClubClassDocument>>(
    getModelToken(ClubClass.name),
  );
  const slotModel = app.get<Model<ClubSlotDocument>>(
    getModelToken(ClubSlot.name),
  );
  const reviewModel = app.get<Model<ClubUserReviewDocument>>(
    getModelToken(ClubUserReview.name),
  );
  const faqModel = app.get<Model<FaqItemDocument>>(
    getModelToken(FaqItem.name),
  );
  const locationModel = app.get<Model<LocationDocument>>(
    getModelToken(Location.name),
  );
  const sportModel = app.get<Model<SportDocument>>(getModelToken(Sport.name));
  const refModel = app.get<Model<RefItemDocument>>(
    getModelToken(RefItem.name),
  );

  // ── Basics lookups (must exist) ─────────────────────────────
  const requireDoc = async <T>(
    doc: T,
    label: string,
  ): Promise<NonNullable<T>> => {
    if (doc === null || doc === undefined) {
      throw new Error(
        `Missing basics data (${label}). Run "npm run db:seed -w api" first.`,
      );
    }
    return doc;
  };

  const vanak = await requireDoc(
    await locationModel.findOne({ slug: 'vanak' }),
    'district vanak',
  );
  const saadatAbad = await requireDoc(
    await locationModel.findOne({ slug: 'saadat-abad' }),
    'district saadat-abad',
  );
  const isfahanCity = await requireDoc(
    await locationModel.findOne({ slug: 'isfahan-city' }),
    'city isfahan-city',
  );

  const bodybuilding = await requireDoc(
    await sportModel.findOne({ slug: 'bodybuilding' }),
    'sport bodybuilding',
  );
  const crossfit = await requireDoc(
    await sportModel.findOne({ slug: 'crossfit' }),
    'sport crossfit',
  );
  const futsal = await requireDoc(
    await sportModel.findOne({ slug: 'futsal' }),
    'sport futsal',
  );
  const kickboxing = await requireDoc(
    await sportModel.findOne({ slug: 'kickboxing' }),
    'sport kickboxing',
  );

  const refBySlug = async (type: RefType, slug: string) =>
    requireDoc(await refModel.findOne({ type, slug }), `${type}/${slug}`);

  const gymCategory = await refBySlug(RefType.CLUB_CATEGORY, 'gym');
  const multiSportCategory = await refBySlug(RefType.CLUB_CATEGORY, 'multi-sport');
  const groupClassCategory = await refBySlug(RefType.CLUB_CATEGORY, 'group-class');
  const parking = await refBySlug(RefType.AMENITY, 'parking');
  const shower = await refBySlug(RefType.AMENITY, 'shower');
  const locker = await refBySlug(RefType.AMENITY, 'locker');
  const sauna = await refBySlug(RefType.AMENITY, 'sauna');
  const treadmill = await refBySlug(RefType.EQUIPMENT, 'treadmill');
  const dumbbell = await refBySlug(RefType.EQUIPMENT, 'dumbbell');
  const barbell = await refBySlug(RefType.EQUIPMENT, 'barbell');
  const criterionCleanliness = await refBySlug(RefType.REVIEW_CRITERION, 'cleanliness');
  const criterionHosting = await refBySlug(RefType.REVIEW_CRITERION, 'hosting');
  const criterionValue = await refBySlug(RefType.REVIEW_CRITERION, 'value');

  // ── Users ──────────────────────────────────────────────────
  const passwordHash = await argon2.hash(DEMO_PASSWORD);
  const byKey = new Map<keyof typeof PHONES, UserDocument>();

  const ensureUser = async (spec: DemoUserSpec): Promise<UserDocument> => {
    const phone = normalizeIranPhone(PHONES[spec.key]);
    let user = await users.findByPhone(phone);
    if (!user) {
      user = await users.create({
        phone,
        firstName: spec.firstName,
        lastName: spec.lastName,
        roles: spec.roles,
        password: DEMO_PASSWORD,
        phoneVerified: true,
      });
      log.log(`user: created ${spec.key} (${phone})`);
    }
    let dirty = false;
    for (const role of spec.roles) {
      if (!user.roles.includes(role)) {
        user.roles.push(role);
        dirty = true;
      }
    }
    if (!user.phoneVerifiedAt) {
      user.phoneVerifiedAt = new Date();
      dirty = true;
    }
    if (!user.passwordHash) {
      user.passwordHash = passwordHash;
      dirty = true;
    }
    if (dirty) await user.save();
    byKey.set(spec.key, user);
    return user;
  };

  for (const spec of USER_SPECS) await ensureUser(spec);

  // admin exists via basics seed — make sure it has a password for the panel
  const adminPhone = normalizeIranPhone(PHONES.admin);
  const admin = await users.findByPhone(adminPhone);
  if (admin) {
    if (!admin.passwordHash) {
      admin.passwordHash = passwordHash;
      await admin.save();
      log.log('admin: password set');
    }
    byKey.set('admin', admin);
  } else {
    log.warn('admin: not found — run db:seed first');
  }

  const owner1 = byKey.get('owner1')!;
  const owner2 = byKey.get('owner2')!;
  const coach1 = byKey.get('coach1')!;
  const coach2 = byKey.get('coach2')!;
  const coach3 = byKey.get('coach3')!;
  const athlete1 = byKey.get('athlete1')!;
  const athlete2 = byKey.get('athlete2')!;
  const athlete3 = byKey.get('athlete3')!;

  // ── Coach profiles ─────────────────────────────────────────
  const coachSeeds: Array<{
    user: UserDocument;
    bio: string;
    years: number;
    headline: string;
    sportIds: string[];
    verification: VerificationStatus;
  }> = [
    {
      user: coach1,
      bio: 'مربی کراسفیت با تمرکز روی فرم صحیح حرکات و برنامه‌های عملکردی.',
      years: 8,
      headline: 'مربی کراسفیت و آمادگی جسمانی',
      sportIds: [crossfit._id.toString(), bodybuilding._id.toString()],
      verification: VerificationStatus.APPROVED,
    },
    {
      user: coach2,
      bio: 'مربی بدنسازی بانوان، طراحی برنامهٔ کاهش وزن و فیتنس.',
      years: 6,
      headline: 'مربی بدنسازی و فیتنس',
      sportIds: [bodybuilding._id.toString()],
      verification: VerificationStatus.APPROVED,
    },
    {
      user: coach3,
      bio: 'مربی کیک‌بوکسینگ، سابقهٔ قهرمانی استانی.',
      years: 4,
      headline: 'مربی کیک‌بوکسینگ',
      sportIds: [kickboxing._id.toString()],
      verification: VerificationStatus.PENDING,
    },
  ];

  for (const seed of coachSeeds) {
    const verification =
      seed.verification === VerificationStatus.APPROVED
        ? {
            status: VerificationStatus.APPROVED,
            submittedAt: new Date(Date.now() - 14 * 86400_000),
            reviewedAt: new Date(Date.now() - 10 * 86400_000),
            reviewedBy: admin?._id,
            documentMediaIds: [],
          }
        : {
            status: VerificationStatus.PENDING,
            submittedAt: new Date(Date.now() - 2 * 86400_000),
            documentMediaIds: [],
          };

    await coachModel.updateOne(
      { userId: seed.user._id },
      {
        $set: {
          bio: seed.bio,
          experience: { years: seed.years, headline: seed.headline },
          sportIds: seed.sportIds,
          verification,
        },
        $setOnInsert: { userId: seed.user._id },
      },
      { upsert: true },
    );
  }
  log.log('coach profiles: 2 approved, 1 pending');

  // ── KYC ────────────────────────────────────────────────────
  // athlete1 → approved identity, athlete2 → pending identity
  await kycModel.updateOne(
    { userId: athlete1._id, kind: KycRequestKind.IDENTITY },
    {
      $set: {
        status: KycRequestStatus.APPROVED,
        nationalId: '0012345678',
        birthDate: new Date('1995-03-21'),
        reviewedBy: admin?._id,
        reviewedAt: new Date(Date.now() - 5 * 86400_000),
      },
      $setOnInsert: { userId: athlete1._id, kind: KycRequestKind.IDENTITY },
    },
    { upsert: true },
  );
  if (athlete1.kycStatus !== KycStatus.APPROVED) {
    athlete1.kycStatus = KycStatus.APPROVED;
    athlete1.kycVerifiedAt = new Date(Date.now() - 5 * 86400_000);
    athlete1.nationalId = athlete1.nationalId ?? '0012345678';
    await athlete1.save();
  }

  await kycModel.updateOne(
    { userId: athlete2._id, kind: KycRequestKind.IDENTITY },
    {
      $set: {
        status: KycRequestStatus.PENDING,
        nationalId: '0087654321',
        birthDate: new Date('1998-11-02'),
      },
      $setOnInsert: { userId: athlete2._id, kind: KycRequestKind.IDENTITY },
    },
    { upsert: true },
  );
  if (athlete2.kycStatus === KycStatus.NONE) {
    athlete2.kycStatus = KycStatus.PENDING;
    await athlete2.save();
  }
  log.log('kyc: athlete1 approved, athlete2 pending');

  // ── Clubs ──────────────────────────────────────────────────
  const locationOf = (loc: LocationDocument) => ({
    ancestors: [...(loc.ancestors ?? []), loc._id],
    locationId: loc._id,
  });

  const defaultHours = [0, 1, 2, 3, 4, 5].map((weekday) => ({
    weekday,
    status: WeekdayStatus.OPEN,
    open: '07:00',
    close: '23:00',
  }));

  const ensureClub = async (
    ownerId: Types.ObjectId,
    name: string,
    doc: Partial<Club>,
  ): Promise<ClubDocument> => {
    const existing = await clubModel.findOne({
      ownerId,
      'identity.name': name,
    });
    if (existing) return existing;
    const created = await clubModel.create({
      ownerId,
      ...doc,
      identity: { ...(doc.identity ?? {}), name },
    });
    log.log(`club: created ${name}`);
    return created;
  };

  const approvedReview = {
    status: ClubLifecycleStatus.APPROVED,
    submittedAt: new Date(Date.now() - 30 * 86400_000),
    reviewedAt: new Date(Date.now() - 28 * 86400_000),
    reviewedBy: admin?._id,
    documentMediaIds: [],
  };

  const clubVanak = await ensureClub(owner1._id, 'باشگاه انرژی ونک', {
    identity: {
      name: 'باشگاه انرژی ونک',
      description:
        'باشگاه بدنسازی و کراسفیت مجهز در قلب ونک با سالن‌های مجزا، سونا و پارکینگ اختصاصی.',
    },
    contact: {
      phones: [{ number: '02188770011', label: 'پذیرش' }],
      website: 'https://energy-vanak.example.ir',
    },
    equipments: [
      { equipmentId: treadmill._id },
      { equipmentId: dumbbell._id },
      { equipmentId: barbell._id },
    ],
    amenities: [
      { amenityId: parking._id },
      { amenityId: shower._id },
      { amenityId: locker._id },
      { amenityId: sauna._id },
    ],
    categories: [{ categoryId: gymCategory._id }],
    sports: [{ sportId: bodybuilding._id }, { sportId: crossfit._id }],
    location: {
      address: 'تهران، ونک، خیابان ملاصدرا، پلاک ۱۲',
      point: { type: 'Point', coordinates: [51.4093, 35.7576] },
      direction: GeoDirection.NORTH,
      ...locationOf(vanak),
    },
    audience: {
      genderPolicy: 'mixed',
      ageGroupKeys: ['teens', 'adults'],
      levelKeys: ['standard', 'premium'],
      accessibility: 'accessible',
    },
    operatingHours: defaultHours,
    socials: [
      { platform: 'instagram', url: 'https://instagram.com/energy.vanak' },
    ],
    rules: [
      {
        policy: RulePolicy.FORBIDDEN,
        title: 'ورود با کفش بیرون',
        description: 'استفاده از کفش سالنی الزامی است.',
      },
      { policy: RulePolicy.ALLOWED, title: 'همراه داشتن جای‌قمقمه شخصی' },
    ],
    faq: [
      {
        title: 'آیا پارکینگ دارد؟',
        description: 'بله، پارکینگ اختصاصی رایگان برای اعضا.',
      },
    ],
    review: approvedReview,
    operationalStatus: ClubOperationalStatus.ACTIVE,
  });

  const clubSaadat = await ensureClub(
    owner1._id,
    'مجموعه ورزشی سعادت‌آباد',
    {
      identity: {
        name: 'مجموعه ورزشی سعادت‌آباد',
        description:
          'مجموعهٔ چندرشته‌ای با سالن فوتسال استاندارد و کلاس‌های گروهی.',
      },
      contact: { phones: [{ number: '02122334455' }] },
      amenities: [{ amenityId: parking._id }, { amenityId: locker._id }],
      categories: [
        { categoryId: multiSportCategory._id },
        { categoryId: groupClassCategory._id },
      ],
      sports: [{ sportId: futsal._id }, { sportId: kickboxing._id }],
      location: {
        address: 'تهران، سعادت‌آباد، بلوار دریا، مجموعه ورزشی',
        point: { type: 'Point', coordinates: [51.3781, 35.7796] },
        direction: GeoDirection.WEST,
        ...locationOf(saadatAbad),
      },
      audience: {
        genderPolicy: 'mixed',
        ageGroupKeys: ['kids', 'teens', 'adults'],
        levelKeys: ['standard'],
        accessibility: 'standard',
      },
      operatingHours: defaultHours,
      review: approvedReview,
      operationalStatus: ClubOperationalStatus.ACTIVE,
    },
  );

  const clubIsfahan = await ensureClub(owner2._id, 'باشگاه بانوان نصف‌جهان', {
    identity: {
      name: 'باشگاه بانوان نصف‌جهان',
      description: 'باشگاه تخصصی بانوان در اصفهان با مربیان خانم.',
    },
    contact: { phones: [{ number: '03132221100' }] },
    amenities: [{ amenityId: shower._id }, { amenityId: locker._id }],
    categories: [{ categoryId: gymCategory._id }],
    sports: [{ sportId: bodybuilding._id }],
    location: {
      address: 'اصفهان، خیابان چهارباغ بالا',
      point: { type: 'Point', coordinates: [51.6659, 32.6412] },
      direction: GeoDirection.CENTER,
      ...locationOf(isfahanCity),
    },
    audience: {
      genderPolicy: 'female_only',
      ageGroupKeys: ['adults'],
      levelKeys: ['standard'],
      accessibility: 'standard',
    },
    operatingHours: defaultHours,
    review: approvedReview,
    operationalStatus: ClubOperationalStatus.ACTIVE,
  });

  // pending-review club → admin verification queue demo
  await ensureClub(owner2._id, 'باشگاه آتیه (در انتظار تأیید)', {
    identity: {
      name: 'باشگاه آتیه (در انتظار تأیید)',
      description: 'باشگاه تازه‌تأسیس؛ مدارک در انتظار بررسی ادمین.',
    },
    categories: [{ categoryId: gymCategory._id }],
    sports: [{ sportId: bodybuilding._id }],
    location: {
      address: 'تهران، سعادت‌آباد، خیابان علامه',
      ...locationOf(saadatAbad),
    },
    review: {
      status: ClubLifecycleStatus.PENDING_REVIEW,
      submittedAt: new Date(Date.now() - 86400_000),
      documentMediaIds: [],
    },
    operationalStatus: ClubOperationalStatus.INACTIVE,
  });

  // draft club → owner flow demo
  await ensureClub(owner1._id, 'باشگاه پیش‌نویس من', {
    identity: {
      name: 'باشگاه پیش‌نویس من',
      description: 'هنوز برای بررسی ارسال نشده است.',
    },
    review: { status: ClubLifecycleStatus.DRAFT, documentMediaIds: [] },
    operationalStatus: ClubOperationalStatus.INACTIVE,
  });

  // ── Classes + coach assignment + slots ─────────────────────
  const ensureClass = async (
    club: ClubDocument,
    title: string,
    doc: Partial<ClubClass>,
  ): Promise<ClubClassDocument> => {
    let cls = await classModel.findOne({ clubId: club._id, title });
    if (!cls) {
      cls = await classModel.create({
        clubId: club._id,
        title,
        status: EntityStatus.ACTIVE,
        ...doc,
      });
      log.log(`class: created ${title}`);
    }
    if (!club.classes.some((c) => c.classId.equals(cls!._id))) {
      club.classes.push({ classId: cls._id });
      club.markModified('classes');
      await club.save();
    }
    return cls;
  };

  const ensureClubCoach = async (club: ClubDocument, coach: UserDocument) => {
    if (!club.coaches.some((c) => c.coachId.equals(coach._id))) {
      club.coaches.push({ coachId: coach._id });
      club.markModified('coaches');
      await club.save();
    }
  };

  await ensureClubCoach(clubVanak, coach1);
  await ensureClubCoach(clubVanak, coach2);
  await ensureClubCoach(clubSaadat, coach3);
  await ensureClubCoach(clubIsfahan, coach2);

  const crossfitMorning = await ensureClass(clubVanak, 'کراسفیت صبح', {
    description: 'کلاس گروهی کراسفیت ویژهٔ شروع روز.',
    sportId: crossfit._id,
    coachId: coach1._id,
  });
  const bodybuildingEvening = await ensureClass(clubVanak, 'بدنسازی عصر', {
    description: 'تمرین بدنسازی با برنامهٔ اختصاصی.',
    sportId: bodybuilding._id,
    coachId: coach2._id,
  });
  const kickboxingClass = await ensureClass(clubSaadat, 'کیک‌بوکسینگ مقدماتی', {
    description: 'آموزش پایهٔ کیک‌بوکسینگ برای همهٔ سطوح.',
    sportId: kickboxing._id,
    coachId: coach3._id,
  });
  const ladiesFitness = await ensureClass(clubIsfahan, 'فیتنس بانوان', {
    description: 'کلاس فیتنس و بدنسازی ویژهٔ بانوان.',
    sportId: bodybuilding._id,
    coachId: coach2._id,
  });

  const isoDate = (offsetDays: number) =>
    new Date(Date.now() + offsetDays * 86400_000).toISOString().slice(0, 10);

  const ensureWeeklySlot = async (
    club: ClubDocument,
    opts: {
      kind: SlotKind;
      classId?: Types.ObjectId;
      coachId?: Types.ObjectId;
      capacity: number;
      weekday: number;
      startTime: string;
      endTime: string;
    },
  ) => {
    const filter = {
      clubId: club._id,
      kind: opts.kind,
      ...(opts.classId ? { classId: opts.classId } : {}),
      'schedule.recurrence.weekday': opts.weekday,
      'schedule.recurrence.startTime': opts.startTime,
    };
    const existing = await slotModel.findOne(filter);
    if (existing) return existing;
    return slotModel.create({
      clubId: club._id,
      kind: opts.kind,
      classId: opts.classId,
      coachId: opts.coachId,
      capacity: opts.capacity,
      status: EntityStatus.ACTIVE,
      schedule: {
        recurrence: {
          type: SlotRecurrenceType.WEEKLY,
          weekday: opts.weekday,
          startTime: opts.startTime,
          endTime: opts.endTime,
          startsOn: isoDate(-30),
          endsOn: isoDate(120),
        },
        exceptions: [],
      },
    });
  };

  // weekday convention: 0 = Saturday
  await ensureWeeklySlot(clubVanak, {
    kind: SlotKind.CLASS,
    classId: crossfitMorning._id,
    coachId: coach1._id,
    capacity: 16,
    weekday: 0,
    startTime: '08:00',
    endTime: '09:30',
  });
  await ensureWeeklySlot(clubVanak, {
    kind: SlotKind.CLASS,
    classId: crossfitMorning._id,
    coachId: coach1._id,
    capacity: 16,
    weekday: 2,
    startTime: '08:00',
    endTime: '09:30',
  });
  await ensureWeeklySlot(clubVanak, {
    kind: SlotKind.CLASS,
    classId: bodybuildingEvening._id,
    coachId: coach2._id,
    capacity: 20,
    weekday: 1,
    startTime: '18:00',
    endTime: '19:30',
  });
  await ensureWeeklySlot(clubVanak, {
    kind: SlotKind.SESSION,
    capacity: 40,
    weekday: 4,
    startTime: '10:00',
    endTime: '12:00',
  });
  await ensureWeeklySlot(clubSaadat, {
    kind: SlotKind.CLASS,
    classId: kickboxingClass._id,
    coachId: coach3._id,
    capacity: 12,
    weekday: 3,
    startTime: '17:00',
    endTime: '18:30',
  });
  await ensureWeeklySlot(clubIsfahan, {
    kind: SlotKind.CLASS,
    classId: ladiesFitness._id,
    coachId: coach2._id,
    capacity: 18,
    weekday: 1,
    startTime: '09:00',
    endTime: '10:30',
  });
  log.log('classes + slots seeded');

  // ── User reviews ───────────────────────────────────────────
  const ensureReview = async (
    club: ClubDocument,
    author: UserDocument,
    rating: number,
    comment: string,
    status: ClubUserReviewStatus,
  ) => {
    const existing = await reviewModel.findOne({
      clubId: club._id,
      authorId: author._id,
    });
    if (existing) return existing;
    return reviewModel.create({
      clubId: club._id,
      authorId: author._id,
      rating,
      comment,
      status,
      criteria: [
        { criterionId: criterionCleanliness._id, rating },
        { criterionId: criterionHosting._id, rating: Math.min(5, rating + 1) },
        { criterionId: criterionValue._id, rating: Math.max(1, rating - 1) },
      ],
    });
  };

  await ensureReview(
    clubVanak,
    athlete1,
    5,
    'سالن تمیز و مربی‌ها عالی. تجهیزات به‌روز است.',
    ClubUserReviewStatus.APPROVED,
  );
  await ensureReview(
    clubVanak,
    athlete2,
    4,
    'ساعت‌های شلوغی کمی معطلی دارد ولی در کل راضی‌ام.',
    ClubUserReviewStatus.APPROVED,
  );
  await ensureReview(
    clubVanak,
    athlete3,
    3,
    'رختکن می‌تواند بزرگ‌تر باشد.',
    ClubUserReviewStatus.PENDING,
  );
  await ensureReview(
    clubSaadat,
    athlete3,
    5,
    'سالن فوتسال استاندارد و رزرو راحت.',
    ClubUserReviewStatus.APPROVED,
  );
  await ensureReview(
    clubIsfahan,
    athlete2,
    4,
    'محیط امن و مربی حرفه‌ای.',
    ClubUserReviewStatus.APPROVED,
  );

  for (const club of [clubVanak, clubSaadat, clubIsfahan]) {
    await clubsService.recomputeReviewsSummary(club._id.toString());
  }
  log.log('reviews seeded + summaries recomputed');

  // ── Public FAQ ─────────────────────────────────────────────
  const faqSeeds: Array<{
    question: string;
    answer: string;
    audience: FaqAudience;
    order: number;
  }> = [
    {
      question: 'چطور در Gym4Me ثبت‌نام کنم؟',
      answer:
        'شمارهٔ موبایل خود را وارد کنید، کد تأیید پیامکی را بزنید و پروفایل‌تان را کامل کنید.',
      audience: FaqAudience.ALL,
      order: 0,
    },
    {
      question: 'چطور باشگاه ثبت کنم؟',
      answer:
        'با نقش «مدیر باشگاه» وارد شوید، اطلاعات و مدارک باشگاه را ثبت کنید و برای بررسی ادمین ارسال کنید.',
      audience: FaqAudience.CLUB_OWNER,
      order: 1,
    },
    {
      question: 'تأیید مربیگری چقدر طول می‌کشد؟',
      answer: 'بعد از بارگذاری مدارک، معمولاً طی ۲ تا ۳ روز کاری بررسی می‌شود.',
      audience: FaqAudience.COACH,
      order: 2,
    },
  ];

  for (const f of faqSeeds) {
    await faqModel.updateOne(
      { question: f.question },
      {
        $set: {
          answer: f.answer,
          audience: f.audience,
          order: f.order,
          publishStatus: PublishStatus.PUBLISHED,
        },
        $setOnInsert: { question: f.question },
      },
      { upsert: true },
    );
  }
  log.log('faq seeded');

  log.log('──────────────────────────────────────────');
  log.log(`Demo seed complete. Password for all users: ${DEMO_PASSWORD}`);
  log.log(`admin:    ${PHONES.admin}`);
  log.log(`owners:   ${PHONES.owner1}, ${PHONES.owner2}`);
  log.log(`coaches:  ${PHONES.coach1}, ${PHONES.coach2}, ${PHONES.coach3}`);
  log.log(`athletes: ${PHONES.athlete1}, ${PHONES.athlete2}, ${PHONES.athlete3}`);
  await app.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
