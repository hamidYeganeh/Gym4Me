/**
 * Idempotent demo seed: role users, coach profiles, KYC requests,
 * clubs (approved / pending / draft) with classes, slots, coaches,
 * user reviews, public FAQ, plus relational demo data:
 * athlete profiles, memberships, bookings, wallets/payments/invoices,
 * metrics, exercises, coach↔student, workout programs/plans, owner tasks.
 *
 * Requires basics seed first (choices / locations / sports / refs):
 *   npm run db:seed -w api
 * Then:
 *   npm run db:seed:demo -w api
 * Or both:
 *   npm run db:seed:all -w api
 *
 * Password: SEED_DEMO_PASSWORD env, else a generated value printed once.
 * Refuses to run in production unless ALLOW_DEMO_SEED=true.
 */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { Model, Types } from 'mongoose';
import { AppModule } from '../../app.module';
import { ClubsService } from '../../account/clubs/clubs.service';
import {
  AthleteBodyType,
  AthleteDiet,
  AthleteExperience,
  AthleteMood,
  BloodGroup,
  BookingResourceType,
  BookingStatus,
  ClubLifecycleStatus,
  ClubOperationalStatus,
  ClubUserReviewStatus,
  CoachType,
  CoachStudentEngagementLevel,
  CoachStudentStatus,
  EntityStatus,
  ExerciseOriginKind,
  ExerciseStatus,
  FaqAudience,
  GeoDirection,
  InvoiceStatus,
  KycRequestKind,
  KycRequestStatus,
  KycStatus,
  MembershipPlanKind,
  MembershipStatus,
  MembershipTransferPolicy,
  MetricAggregation,
  MetricPeriodKind,
  MetricPrivacyClass,
  MetricTypeStatus,
  MetricValueKind,
  OperatingHourAudience,
  OwnerTaskPriority,
  OwnerTaskStatus,
  PaymentChannel,
  PaymentPurpose,
  PaymentStatus,
  Privacy,
  PublishStatus,
  RefType,
  RhFactor,
  Role,
  RulePolicy,
  SlotKind,
  SlotRecurrenceType,
  VerificationStatus,
  WalletOwnerType,
  WeekdayStatus,
  WorkoutPlanStatus,
  WorkoutProgramOwnerType,
  WorkoutProgramStatus,
  LedgerAccount,
  LedgerEntryKind,
} from '../../common/enums';
import { normalizeIranPhone } from '../../common/utils/phone.util';
import {
  AthleteProfile,
  AthleteProfileDocument,
} from '../../schemas/athlete-profile.schema';
import { Booking, BookingDocument } from '../../schemas/booking.schema';
import { Club, ClubDocument } from '../../schemas/club.schema';
import { ClubClass, ClubClassDocument } from '../../schemas/club-class.schema';
import {
  ClubMembership,
  ClubMembershipDocument,
} from '../../schemas/club-membership.schema';
import {
  ClubMembershipPlan,
  ClubMembershipPlanDocument,
} from '../../schemas/club-membership-plan.schema';
import { ClubSlot, ClubSlotDocument } from '../../schemas/club-slot.schema';
import {
  ClubUserReview,
  ClubUserReviewDocument,
} from '../../schemas/club-user-review.schema';
import {
  CoachProfile,
  CoachProfileDocument,
} from '../../schemas/coach-profile.schema';
import {
  CoachStudent,
  CoachStudentDocument,
} from '../../schemas/coach-student.schema';
import { Exercise, ExerciseDocument } from '../../schemas/exercise.schema';
import { FaqItem, FaqItemDocument } from '../../schemas/faq-item.schema';
import { Invoice, InvoiceDocument } from '../../schemas/invoice.schema';
import {
  KycRequest,
  KycRequestDocument,
} from '../../schemas/kyc-request.schema';
import {
  LedgerEntry,
  LedgerEntryDocument,
} from '../../schemas/ledger-entry.schema';
import { Location, LocationDocument } from '../../schemas/location.schema';
import {
  MetricType,
  MetricTypeDocument,
} from '../../schemas/metric-type.schema';
import { OwnerTask, OwnerTaskDocument } from '../../schemas/owner-task.schema';
import { Payment, PaymentDocument } from '../../schemas/payment.schema';
import {
  ProgressMetric,
  ProgressMetricDocument,
} from '../../schemas/progress-metric.schema';
import { RefItem, RefItemDocument } from '../../schemas/ref-item.schema';
import { Sport, SportDocument } from '../../schemas/sport.schema';
import { UserDocument } from '../../schemas/user.schema';
import { Wallet, WalletDocument } from '../../schemas/wallet.schema';
import {
  WorkoutPlan,
  WorkoutPlanDocument,
} from '../../schemas/workout-plan.schema';
import {
  WorkoutProgram,
  WorkoutProgramDocument,
} from '../../schemas/workout-program.schema';
import { UsersService } from '../../users/users.service';

const DEMO_PASSWORD =
  process.env.SEED_DEMO_PASSWORD?.trim() ||
  ((process.env.NODE_ENV ?? 'development').toLowerCase() === 'production'
    ? `Gym4Me!${randomBytes(9).toString('base64url')}`
    : 'Gym4Me!123');

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
  {
    key: 'owner1',
    firstName: 'رضا',
    lastName: 'کریمی',
    roles: [Role.CLUB_OWNER, Role.ATHLETE],
  },
  {
    key: 'owner2',
    firstName: 'مریم',
    lastName: 'حسینی',
    roles: [Role.CLUB_OWNER, Role.ATHLETE],
  },
  {
    key: 'coach1',
    firstName: 'امیر',
    lastName: 'محمدی',
    roles: [Role.COACH, Role.ATHLETE],
  },
  {
    key: 'coach2',
    firstName: 'نگار',
    lastName: 'صادقی',
    roles: [Role.COACH, Role.ATHLETE],
  },
  {
    key: 'coach3',
    firstName: 'حسین',
    lastName: 'قاسمی',
    roles: [Role.COACH, Role.ATHLETE],
  },
  {
    key: 'athlete1',
    firstName: 'علی',
    lastName: 'احمدی',
    roles: [Role.ATHLETE],
  },
  {
    key: 'athlete2',
    firstName: 'زهرا',
    lastName: 'موسوی',
    roles: [Role.ATHLETE],
  },
  {
    key: 'athlete3',
    firstName: 'مهدی',
    lastName: 'نوری',
    roles: [Role.ATHLETE],
  },
];

async function seed() {
  const nodeEnv = (process.env.NODE_ENV ?? 'development').toLowerCase();
  if (nodeEnv === 'production' && process.env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error(
      'Refusing demo seed in production without ALLOW_DEMO_SEED=true',
    );
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const log = new Logger('SeedDemo');
  log.warn(`Demo password for all seeded users: ${DEMO_PASSWORD}`);

  const users = app.get(UsersService);
  const clubsService = app.get(ClubsService);

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
  const faqModel = app.get<Model<FaqItemDocument>>(getModelToken(FaqItem.name));
  const locationModel = app.get<Model<LocationDocument>>(
    getModelToken(Location.name),
  );
  const sportModel = app.get<Model<SportDocument>>(getModelToken(Sport.name));
  const refModel = app.get<Model<RefItemDocument>>(getModelToken(RefItem.name));
  const athleteProfileModel = app.get<Model<AthleteProfileDocument>>(
    getModelToken(AthleteProfile.name),
  );
  const membershipPlanModel = app.get<Model<ClubMembershipPlanDocument>>(
    getModelToken(ClubMembershipPlan.name),
  );
  const membershipModel = app.get<Model<ClubMembershipDocument>>(
    getModelToken(ClubMembership.name),
  );
  const bookingModel = app.get<Model<BookingDocument>>(
    getModelToken(Booking.name),
  );
  const walletModel = app.get<Model<WalletDocument>>(
    getModelToken(Wallet.name),
  );
  const paymentModel = app.get<Model<PaymentDocument>>(
    getModelToken(Payment.name),
  );
  const ledgerModel = app.get<Model<LedgerEntryDocument>>(
    getModelToken(LedgerEntry.name),
  );
  const invoiceModel = app.get<Model<InvoiceDocument>>(
    getModelToken(Invoice.name),
  );
  const metricTypeModel = app.get<Model<MetricTypeDocument>>(
    getModelToken(MetricType.name),
  );
  const progressMetricModel = app.get<Model<ProgressMetricDocument>>(
    getModelToken(ProgressMetric.name),
  );
  const exerciseModel = app.get<Model<ExerciseDocument>>(
    getModelToken(Exercise.name),
  );
  const coachStudentModel = app.get<Model<CoachStudentDocument>>(
    getModelToken(CoachStudent.name),
  );
  const workoutProgramModel = app.get<Model<WorkoutProgramDocument>>(
    getModelToken(WorkoutProgram.name),
  );
  const workoutPlanModel = app.get<Model<WorkoutPlanDocument>>(
    getModelToken(WorkoutPlan.name),
  );
  const ownerTaskModel = app.get<Model<OwnerTaskDocument>>(
    getModelToken(OwnerTask.name),
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
  const multiSportCategory = await refBySlug(
    RefType.CLUB_CATEGORY,
    'multi-sport',
  );
  const groupClassCategory = await refBySlug(
    RefType.CLUB_CATEGORY,
    'group-class',
  );
  const parking = await refBySlug(RefType.AMENITY, 'parking');
  const shower = await refBySlug(RefType.AMENITY, 'shower');
  const locker = await refBySlug(RefType.AMENITY, 'locker');
  const sauna = await refBySlug(RefType.AMENITY, 'sauna');
  const treadmill = await refBySlug(RefType.EQUIPMENT, 'treadmill');
  const dumbbell = await refBySlug(RefType.EQUIPMENT, 'dumbbell');
  const barbell = await refBySlug(RefType.EQUIPMENT, 'barbell');
  const criterionCleanliness = await refBySlug(
    RefType.REVIEW_CRITERION,
    'cleanliness',
  );
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
    coachTypes: CoachType[];
    verification: VerificationStatus;
    pricing?: { consultation: { inPerson?: number; remote?: number } };
  }> = [
    {
      user: coach1,
      bio: 'مربی کراسفیت با تمرکز روی فرم صحیح حرکات و برنامه‌های عملکردی.',
      years: 8,
      headline: 'مربی کراسفیت و آمادگی جسمانی',
      sportIds: [crossfit._id.toString(), bodybuilding._id.toString()],
      coachTypes: [
        CoachType.CROSSFIT,
        CoachType.FUNCTIONAL_TRAINING,
        CoachType.GENERAL_FITNESS,
      ],
      verification: VerificationStatus.APPROVED,
      pricing: { consultation: { inPerson: 350_000, remote: 200_000 } },
    },
    {
      user: coach2,
      bio: 'مربی بدنسازی بانوان، طراحی برنامهٔ کاهش وزن و فیتنس.',
      years: 6,
      headline: 'مربی بدنسازی و فیتنس',
      sportIds: [bodybuilding._id.toString()],
      coachTypes: [
        CoachType.BODYBUILDING,
        CoachType.WEIGHT_LOSS,
        CoachType.WOMENS_FITNESS,
      ],
      verification: VerificationStatus.APPROVED,
      pricing: { consultation: { inPerson: 300_000, remote: 180_000 } },
    },
    {
      user: coach3,
      bio: 'مربی کیک‌بوکسینگ، سابقهٔ قهرمانی استانی.',
      years: 4,
      headline: 'مربی کیک‌بوکسینگ',
      sportIds: [kickboxing._id.toString()],
      coachTypes: [CoachType.BOXING_KICKBOXING, CoachType.MARTIAL_ARTS],
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
            credential: {
              typeKey: 'fitness_federation_coaching_card',
              issuer: 'فدراسیون ورزش‌های همگانی ایران',
              issuedAt: new Date(Date.now() - 365 * 86400_000),
              expiresAt: new Date(Date.now() + 365 * 86400_000),
            },
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
          coachTypes: seed.coachTypes,
          verification,
          ...(seed.pricing ? { pricing: seed.pricing } : {}),
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
  // Always reset: a previous test run may have approved athlete2, but the
  // demo fixture is the "pending KYC" showcase for the admin queue.
  if (athlete2.kycStatus !== KycStatus.PENDING) {
    athlete2.kycStatus = KycStatus.PENDING;
    athlete2.kycVerifiedAt = undefined;
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
    audience: OperatingHourAudience.SHARED,
    open: '07:00',
    close: '23:00',
  }));

  /** Mixed club with time-separated male/female hours (Iran common pattern). */
  const genderSplitHours = [0, 1, 2, 3, 4, 5].flatMap((weekday) => [
    {
      weekday,
      status: WeekdayStatus.OPEN,
      audience: OperatingHourAudience.MALE,
      open: '06:00',
      close: '14:00',
    },
    {
      weekday,
      status: WeekdayStatus.OPEN,
      audience: OperatingHourAudience.FEMALE,
      open: '14:00',
      close: '23:00',
    },
  ]);

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
    operatingHours: genderSplitHours,
    socials: [
      { platform: 'instagram', url: 'https://instagram.com/energy.vanak' },
      { platform: 'website', url: 'https://energy-vanak.example.ir' },
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

  const clubSaadat = await ensureClub(owner1._id, 'مجموعه ورزشی سعادت‌آباد', {
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
  });

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
  const clubPendingReview = await ensureClub(
    owner2._id,
    'باشگاه آتیه (در انتظار تأیید)',
    {
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
    },
  );
  // Demo fixture must stay in the admin verification queue: a previous test
  // run may have approved it, and ensureClub never touches existing docs.
  if (clubPendingReview.review?.status !== ClubLifecycleStatus.PENDING_REVIEW) {
    clubPendingReview.set('review', {
      status: ClubLifecycleStatus.PENDING_REVIEW,
      submittedAt: new Date(Date.now() - 86400_000),
      documentMediaIds: [],
    });
    clubPendingReview.operationalStatus = ClubOperationalStatus.INACTIVE;
    await clubPendingReview.save();
    log.log('club: reset باشگاه آتیه back to pending_review');
  }

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
    if (!club.classes.some((c) => c.classId.equals(cls._id))) {
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
      price?: number;
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
    if (existing) {
      if (opts.price !== undefined && existing.price !== opts.price) {
        existing.price = opts.price;
        await existing.save();
      }
      return existing;
    }
    return slotModel.create({
      clubId: club._id,
      kind: opts.kind,
      classId: opts.classId,
      coachId: opts.coachId,
      capacity: opts.capacity,
      price: opts.price ?? 0,
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
    price: 120_000,
  });
  await ensureWeeklySlot(clubVanak, {
    kind: SlotKind.CLASS,
    classId: crossfitMorning._id,
    coachId: coach1._id,
    capacity: 16,
    weekday: 2,
    startTime: '08:00',
    endTime: '09:30',
    price: 120_000,
  });
  await ensureWeeklySlot(clubVanak, {
    kind: SlotKind.CLASS,
    classId: bodybuildingEvening._id,
    coachId: coach2._id,
    capacity: 20,
    weekday: 1,
    startTime: '18:00',
    endTime: '19:30',
    price: 150_000,
  });
  await ensureWeeklySlot(clubVanak, {
    kind: SlotKind.SESSION,
    capacity: 40,
    weekday: 4,
    startTime: '10:00',
    endTime: '12:00',
    price: 80_000,
  });
  // kickboxing stays free so the zero-price auto-confirm path keeps coverage
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
    price: 100_000,
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

  // ── Athlete profiles ───────────────────────────────────────
  const ensureAthleteProfile = async (
    user: UserDocument,
    doc: Partial<AthleteProfile>,
  ) => {
    await athleteProfileModel.updateOne(
      { userId: user._id },
      {
        $set: doc,
        $setOnInsert: { userId: user._id },
      },
      { upsert: true },
    );
  };

  await ensureAthleteProfile(athlete1, {
    bio: 'ورزشکار کراسفیت؛ هدف کاهش چربی و افزایش قدرت.',
    levelKey: 'intermediate',
    body: { heightCm: 178, weightKg: 82 },
    privacy: { metrics: Privacy.COACH_ONLY, photos: Privacy.PRIVATE },
    metrics: {
      preferredKeys: ['weight_kg', 'heart_rate', 'hydration', 'body_fat'],
    },
    sportIds: [crossfit._id.toString(), bodybuilding._id.toString()],
    goalKeys: ['weight-loss', 'muscle-gain'],
    lifestyle: {
      bodyType: AthleteBodyType.MESOMORPH,
      experience: AthleteExperience.EXPERIENCED,
      sleepLevel: 4,
      mood: AthleteMood.HAPPY,
      diet: AthleteDiet.PROTEIN,
      dailyCalories: 2400,
      activityKeys: ['crossfit', 'jogging'],
    },
    health: {
      bloodType: { group: BloodGroup.O, rh: RhFactor.POSITIVE },
      allergies: [],
      conditions: '',
      note: 'بدون محدودیت پزشکی خاص.',
    },
    points: { balance: 320, lifetime: 850 },
  });
  await ensureAthleteProfile(athlete2, {
    bio: 'تمرکز روی فیتنس و استقامت.',
    levelKey: 'beginner',
    body: { heightCm: 165, weightKg: 58 },
    privacy: { metrics: Privacy.PRIVATE, photos: Privacy.PRIVATE },
    metrics: { preferredKeys: ['weight_kg', 'hydration'] },
    sportIds: [bodybuilding._id.toString()],
    goalKeys: ['general-health'],
    lifestyle: {
      bodyType: AthleteBodyType.ECTOMORPH,
      experience: AthleteExperience.BEGINNER,
      sleepLevel: 3,
      mood: AthleteMood.NEUTRAL,
      diet: AthleteDiet.BALANCED,
      activityKeys: ['yoga', 'walking'],
    },
    health: {
      bloodType: { group: BloodGroup.A, rh: RhFactor.POSITIVE },
      allergies: ['بادام'],
    },
    points: { balance: 40, lifetime: 40 },
  });
  await ensureAthleteProfile(athlete3, {
    bio: 'علاقه‌مند به فوتسال و کلاس‌های رزمی.',
    levelKey: 'advanced',
    body: { heightCm: 181, weightKg: 76 },
    privacy: { metrics: Privacy.FOLLOWERS, photos: Privacy.FOLLOWERS },
    metrics: { preferredKeys: ['weight_kg', 'heart_rate'] },
    sportIds: [futsal._id.toString(), kickboxing._id.toString()],
    goalKeys: ['competition'],
    lifestyle: {
      bodyType: AthleteBodyType.MESOMORPH,
      experience: AthleteExperience.EXPERIENCED,
      sleepLevel: 5,
      mood: AthleteMood.OVERJOYED,
      diet: AthleteDiet.BALANCED,
      dailyCalories: 2800,
      activityKeys: ['futsal', 'kickboxing'],
    },
    health: { allergies: [] },
    points: { balance: 120, lifetime: 400 },
  });
  log.log('athlete profiles seeded');

  // ── Metric catalog + sample progress ───────────────────────
  const metricSeeds = [
    {
      key: 'weight_kg',
      name: 'وزن',
      valueKind: MetricValueKind.NUMBER,
      unit: 'kg',
      sortHint: 10,
      chartKind: 'line',
    },
    {
      key: 'heart_rate',
      name: 'ضربان قلب',
      valueKind: MetricValueKind.NUMBER,
      unit: 'bpm',
      sortHint: 20,
      chartKind: 'line',
    },
    {
      key: 'hydration',
      name: 'آب روزانه',
      valueKind: MetricValueKind.NUMBER,
      unit: 'L',
      sortHint: 30,
      chartKind: 'stacked',
    },
    {
      key: 'body_fat',
      name: 'چربی بدن',
      valueKind: MetricValueKind.NUMBER,
      unit: '%',
      sortHint: 40,
      chartKind: 'line',
    },
    {
      key: 'muscle_mass_kg',
      name: 'توده عضلانی',
      valueKind: MetricValueKind.NUMBER,
      unit: 'kg',
      sortHint: 50,
      chartKind: 'line',
    },
    {
      key: 'waist_cm',
      name: 'دور کمر',
      valueKind: MetricValueKind.NUMBER,
      unit: 'cm',
      sortHint: 60,
      chartKind: 'line',
    },
  ] as const;

  for (const m of metricSeeds) {
    await metricTypeModel.updateOne(
      { key: m.key },
      {
        $set: {
          name: m.name,
          valueKind: m.valueKind,
          unit: m.unit,
          canonicalUnit: m.unit,
          aggregation: MetricAggregation.LATEST,
          periodKind: MetricPeriodKind.POINT,
          privacyClass: MetricPrivacyClass.HEALTH,
          sortHint: m.sortHint,
          chartKind: m.chartKind,
          status: MetricTypeStatus.ACTIVE,
        },
        $setOnInsert: { key: m.key },
      },
      { upsert: true },
    );
  }

  const weightSamples = [
    { daysAgo: 28, value: 84.2 },
    { daysAgo: 21, value: 83.5 },
    { daysAgo: 14, value: 82.8 },
    { daysAgo: 7, value: 82.3 },
    { daysAgo: 1, value: 82.0 },
  ];
  for (const sample of weightSamples) {
    const recordedAt = new Date(Date.now() - sample.daysAgo * 86400_000);
    recordedAt.setUTCHours(7, 0, 0, 0);
    const exists = await progressMetricModel.findOne({
      athleteUserId: athlete1._id,
      metricKey: 'weight_kg',
      recordedAt,
    });
    if (!exists) {
      await progressMetricModel.create({
        athleteUserId: athlete1._id,
        metricKey: 'weight_kg',
        value: sample.value,
        unit: 'kg',
        recordedAt,
        privacy: Privacy.COACH_ONLY,
      });
    }
  }
  log.log('metric types + athlete1 weight history seeded');

  // ── Exercise bank ──────────────────────────────────────────
  const exerciseSeeds: Array<{
    name: string;
    muscleKeys: string[];
    equipmentKeys: string[];
    description: string;
  }> = [
    {
      name: 'اسکوات با هالتر',
      muscleKeys: ['legs'],
      equipmentKeys: ['barbell'],
      description: 'اسکوات پشت‌پا با هالتر؛ تمرکز روی فرم صحیح.',
    },
    {
      name: 'پرس سینه دمبل',
      muscleKeys: ['chest'],
      equipmentKeys: ['dumbbell'],
      description: 'پرس سینه روی نیمکت صاف با دمبل.',
    },
    {
      name: 'پلانک',
      muscleKeys: ['core'],
      equipmentKeys: [],
      description: 'نگه داشتن وضعیت پلانک برای تقویت هسته.',
    },
    {
      name: 'ددلیفت رومانیایی',
      muscleKeys: ['back', 'legs'],
      equipmentKeys: ['barbell'],
      description: 'حرکت hinging با تمرکز روی همسترینگ.',
    },
    {
      name: 'برپی',
      muscleKeys: ['legs', 'core'],
      equipmentKeys: [],
      description: 'حرکت ترکیبی کاردیو و قدرت.',
    },
  ];

  const exerciseIds: Types.ObjectId[] = [];
  for (const ex of exerciseSeeds) {
    let doc = await exerciseModel.findOne({
      name: ex.name,
      'origin.kind': ExerciseOriginKind.SYSTEM,
    });
    if (!doc) {
      doc = await exerciseModel.create({
        ...ex,
        status: ExerciseStatus.ACTIVE,
        origin: { kind: ExerciseOriginKind.SYSTEM },
      });
    }
    exerciseIds.push(doc._id);
  }
  log.log(`exercises: ${exerciseIds.length} system movements`);

  // ── Membership plans + memberships ─────────────────────────
  const ensurePlan = async (
    club: ClubDocument,
    name: string,
    doc: Partial<ClubMembershipPlan>,
  ) => {
    let plan = await membershipPlanModel.findOne({ clubId: club._id, name });
    if (!plan) {
      plan = await membershipPlanModel.create({
        clubId: club._id,
        name,
        status: EntityStatus.ACTIVE,
        publishStatus: PublishStatus.PUBLISHED,
        rules: {
          freezeMaxDays: 14,
          transferPolicy: MembershipTransferPolicy.FORBIDDEN,
        },
        ...doc,
      });
      log.log(`membership plan: ${name}`);
    }
    return plan;
  };

  const vanakMonthly = await ensurePlan(clubVanak, 'عضویت ماهانه عمومی', {
    kind: MembershipPlanKind.DURATION,
    durationDays: 30,
    description: 'دسترسی آزاد به سالن و کلاس‌های گروهی پایه.',
    pricing: { amount: 2_500_000, tax: 0, currency: 'IRT' },
  });
  const vanakSessions = await ensurePlan(clubVanak, 'پکیج ۱۲ جلسه', {
    kind: MembershipPlanKind.SESSIONS,
    sessionsTotal: 12,
    description: '۱۲ جلسه کلاس گروهی به انتخاب عضو.',
    pricing: { amount: 1_800_000, tax: 0, currency: 'IRT' },
  });
  await ensurePlan(clubSaadat, 'ورودهای ۱۰تایی فوتسال', {
    kind: MembershipPlanKind.ENTRIES,
    entriesTotal: 10,
    description: '۱۰ ورود به سالن فوتسال.',
    pricing: { amount: 1_200_000, tax: 0, currency: 'IRT' },
  });
  await ensurePlan(clubIsfahan, 'عضویت ماهانه بانوان', {
    kind: MembershipPlanKind.DURATION,
    durationDays: 30,
    pricing: { amount: 2_200_000, tax: 0, currency: 'IRT' },
  });

  const ensureMembership = async (
    club: ClubDocument,
    plan: ClubMembershipPlanDocument,
    holder: UserDocument,
    credit: ClubMembership['credit'],
    status: MembershipStatus = MembershipStatus.ACTIVE,
  ) => {
    const existing = await membershipModel.findOne({
      clubId: club._id,
      planId: plan._id,
      'holder.userId': holder._id,
      status: { $in: [MembershipStatus.ACTIVE, MembershipStatus.FROZEN] },
    });
    if (existing) return existing;
    return membershipModel.create({
      clubId: club._id,
      planId: plan._id,
      holder: { userId: holder._id },
      status,
      credit,
      soldBy: owner1._id,
    });
  };

  const membershipAthlete1 = await ensureMembership(
    clubVanak,
    vanakMonthly,
    athlete1,
    { expiresAt: new Date(Date.now() + 22 * 86400_000) },
  );
  await ensureMembership(clubVanak, vanakSessions, athlete2, {
    remainingSessions: 8,
    expiresAt: new Date(Date.now() + 60 * 86400_000),
  });
  log.log('memberships seeded');

  // ── Bookings (club class occurrences) ──────────────────────
  /** Iran weekday 0=Sat … 6=Fri → next matching calendar date (YYYY-MM-DD). */
  const nextIranWeekdayDate = (iranWeekday: number, weeksAhead = 0): string => {
    const jsTarget = (iranWeekday + 6) % 7;
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    const delta = (jsTarget - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + delta + weeksAhead * 7);
    return d.toISOString().slice(0, 10);
  };

  const parseLocal = (date: string, time: string) => {
    const [y, m, day] = date.split('-').map(Number);
    const [hh, mm] = time.split(':').map(Number);
    return new Date(y, m - 1, day, hh, mm, 0, 0);
  };

  const ensureClassBooking = async (opts: {
    code: string;
    athlete: UserDocument;
    club: ClubDocument;
    slot: ClubSlotDocument;
    coach?: UserDocument;
    weekday: number;
    startTime: string;
    endTime: string;
    weeksAhead?: number;
    status: BookingStatus;
    amount: number;
  }) => {
    const existing = await bookingModel.findOne({ code: opts.code });
    if (existing) return existing;
    const date = nextIranWeekdayDate(opts.weekday, opts.weeksAhead ?? 0);
    const startsAt = parseLocal(date, opts.startTime);
    const endsAt = parseLocal(date, opts.endTime);
    return bookingModel.create({
      code: opts.code,
      athleteId: opts.athlete._id,
      resource: {
        type: BookingResourceType.CLASS,
        refId: opts.slot._id,
      },
      coachUserId: opts.coach?._id,
      clubId: opts.club._id,
      occurrence: {
        date,
        startTime: opts.startTime,
        endTime: opts.endTime,
      },
      attendeeCount: 1,
      startsAt,
      endsAt,
      intake: {
        note: 'رزرو دمو',
        medicalConditionKeys: [],
        supplementKeys: [],
      },
      pricing: {
        amount: opts.amount,
        discount: 0,
        total: opts.amount,
      },
      payment:
        opts.status === BookingStatus.CONFIRMED ||
        opts.status === BookingStatus.CHECKED_IN ||
        opts.status === BookingStatus.COMPLETED
          ? {
              provider: 'mock',
              authority: `AUTH-${opts.code}`,
              paidAt: new Date(startsAt.getTime() - 2 * 86400_000),
            }
          : undefined,
      status: opts.status,
    });
  };

  const crossfitSlotSat = await slotModel.findOne({
    clubId: clubVanak._id,
    classId: crossfitMorning._id,
    'schedule.recurrence.weekday': 0,
  });
  const bodybuildingSlot = await slotModel.findOne({
    clubId: clubVanak._id,
    classId: bodybuildingEvening._id,
  });
  const kickboxingSlot = await slotModel.findOne({
    clubId: clubSaadat._id,
    classId: kickboxingClass._id,
  });

  if (crossfitSlotSat) {
    await ensureClassBooking({
      code: 'BK-DEMO0001',
      athlete: athlete1,
      club: clubVanak,
      slot: crossfitSlotSat,
      coach: coach1,
      weekday: 0,
      startTime: '08:00',
      endTime: '09:30',
      weeksAhead: 0,
      status: BookingStatus.CONFIRMED,
      amount: 350_000,
    });
    await ensureClassBooking({
      code: 'BK-DEMO0002',
      athlete: athlete1,
      club: clubVanak,
      slot: crossfitSlotSat,
      coach: coach1,
      weekday: 0,
      startTime: '08:00',
      endTime: '09:30',
      weeksAhead: 1,
      status: BookingStatus.AWAITING_PAYMENT,
      amount: 350_000,
    });
  }
  if (bodybuildingSlot) {
    await ensureClassBooking({
      code: 'BK-DEMO0003',
      athlete: athlete2,
      club: clubVanak,
      slot: bodybuildingSlot,
      coach: coach2,
      weekday: 1,
      startTime: '18:00',
      endTime: '19:30',
      weeksAhead: 0,
      status: BookingStatus.CONFIRMED,
      amount: 280_000,
    });
  }
  if (kickboxingSlot) {
    await ensureClassBooking({
      code: 'BK-DEMO0004',
      athlete: athlete3,
      club: clubSaadat,
      slot: kickboxingSlot,
      coach: coach3,
      weekday: 3,
      startTime: '17:00',
      endTime: '18:30',
      weeksAhead: 0,
      status: BookingStatus.COMPLETED,
      amount: 300_000,
    });
  }
  log.log('bookings seeded');

  // ── Wallets + payment + invoice ────────────────────────────
  const ensureWallet = async (
    type: WalletOwnerType,
    id: Types.ObjectId,
    balance: number,
  ) => {
    await walletModel.updateOne(
      { 'owner.type': type, 'owner.id': id },
      {
        $set: { balance, currency: 'IRT' },
        $setOnInsert: { owner: { type, id } },
      },
      { upsert: true },
    );
  };

  await ensureWallet(WalletOwnerType.USER, athlete1._id, 1_250_000);
  await ensureWallet(WalletOwnerType.USER, athlete2._id, 450_000);
  await ensureWallet(WalletOwnerType.USER, athlete3._id, 80_000);
  await ensureWallet(WalletOwnerType.CLUB, clubVanak._id, 12_500_000);
  await ensureWallet(WalletOwnerType.COACH, coach1._id, 3_200_000);

  const membershipPaymentKey = `seed-membership-${membershipAthlete1._id.toString()}`;
  let membershipPayment = await paymentModel.findOne({
    idempotencyKey: membershipPaymentKey,
  });
  if (!membershipPayment) {
    const gross = vanakMonthly.pricing.amount;
    const platformFee = Math.round(gross * 0.08);
    const gatewayFee = Math.round(gross * 0.01);
    const providerShare = gross - platformFee - gatewayFee;
    membershipPayment = await paymentModel.create({
      purpose: PaymentPurpose.MEMBERSHIP,
      channel: PaymentChannel.CASH,
      status: PaymentStatus.CAPTURED,
      amount: {
        gross,
        discount: 0,
        tax: 0,
        providerShare,
        platformFee,
        gatewayFee,
        net: 0,
      },
      reference: {
        orderId: `MEM-${membershipAthlete1._id.toString().slice(-8)}`,
        authority: 'MOCK-MEM-1',
      },
      payer: { userId: athlete1._id },
      operator: { userId: owner1._id, note: 'فروش حضوری دمو' },
      related: {
        membershipId: membershipAthlete1._id,
        clubId: clubVanak._id,
      },
      idempotencyKey: membershipPaymentKey,
      capturedAt: new Date(Date.now() - 8 * 86400_000),
    });
    membershipAthlete1.paymentId = membershipPayment._id;
    await membershipAthlete1.save();
  }

  // Captured payments must always have a balancing ledger entry.
  const membershipLedgerKey = `payment:${membershipPaymentKey}`;
  const existingMembershipLedger = await ledgerModel.findOne({
    dedupeKey: membershipLedgerKey,
  });
  if (!existingMembershipLedger && membershipPayment) {
    const split = membershipPayment.amount;
    const paid = split.gross - (split.discount ?? 0);
    await ledgerModel.create({
      kind: LedgerEntryKind.PAYMENT,
      paymentId: membershipPayment._id,
      lines: [
        { account: LedgerAccount.CASH, debit: paid, credit: 0 },
        ...(split.platformFee > 0
          ? [
              {
                account: LedgerAccount.PLATFORM_REVENUE,
                debit: 0,
                credit: split.platformFee,
              },
            ]
          : []),
        ...(split.gatewayFee > 0
          ? [
              {
                account: LedgerAccount.GATEWAY_CLEARING,
                debit: 0,
                credit: split.gatewayFee,
              },
            ]
          : []),
        ...(split.providerShare > 0
          ? [
              {
                account: LedgerAccount.PROVIDER_PAYABLE,
                debit: 0,
                credit: split.providerShare,
                party: {
                  type: WalletOwnerType.CLUB,
                  id: clubVanak._id,
                },
              },
            ]
          : []),
      ],
      split,
      related: {
        membershipId: membershipAthlete1._id,
        clubId: clubVanak._id,
      },
      dedupeKey: membershipLedgerKey,
      occurredAt: membershipPayment.capturedAt ?? new Date(),
      note: 'seed membership payment',
    });
  }

  const invoiceNumber = 'INV-DEMO-0001';
  const existingInvoice = await invoiceModel.findOne({ number: invoiceNumber });
  if (!existingInvoice && membershipPayment) {
    const payable = membershipPayment.amount.gross;
    await invoiceModel.create({
      paymentId: membershipPayment._id,
      number: invoiceNumber,
      title: 'فاکتور عضویت ماهانه — باشگاه انرژی ونک',
      status: InvoiceStatus.ISSUED,
      lines: [
        {
          title: vanakMonthly.name,
          qty: 1,
          unitPrice: payable,
          total: payable,
        },
      ],
      amounts: {
        subtotal: payable,
        discount: 0,
        tax: 0,
        payable,
      },
      party: {
        payerUserId: athlete1._id,
        clubId: clubVanak._id,
        clubName: clubVanak.identity.name,
      },
      issuedAt: membershipPayment.capturedAt ?? new Date(),
    });
  }
  log.log('wallets + membership payment/invoice/ledger seeded');

  // ── Coach ↔ student + programs ─────────────────────────────
  const ensureCoachStudent = async (
    coach: UserDocument,
    athlete: UserDocument,
    coaching: { goalKey?: string; levelKey?: string },
    engagement: {
      level: CoachStudentEngagementLevel;
      progressPercent?: number;
    },
    notes?: string,
  ) => {
    await coachStudentModel.updateOne(
      { coachUserId: coach._id, athleteUserId: athlete._id },
      {
        $set: {
          status: CoachStudentStatus.ACTIVE,
          coaching,
          engagement: {
            ...engagement,
            scoredAt: new Date(),
            lastSessionAt: new Date(Date.now() - 3 * 86400_000),
          },
          notes,
        },
        $setOnInsert: {
          coachUserId: coach._id,
          athleteUserId: athlete._id,
        },
      },
      { upsert: true },
    );
  };

  await ensureCoachStudent(
    coach1,
    athlete1,
    { goalKey: 'muscle-gain', levelKey: 'intermediate' },
    { level: CoachStudentEngagementLevel.HEALTHY, progressPercent: 72 },
    'پاسخ‌گو؛ برنامه کراسفیت ۳ روز در هفته.',
  );
  await ensureCoachStudent(
    coach2,
    athlete2,
    { goalKey: 'weight-loss', levelKey: 'beginner' },
    { level: CoachStudentEngagementLevel.AT_RISK, progressPercent: 35 },
    'دو هفته اخیر حضور کم داشته.',
  );
  await ensureCoachStudent(
    coach3,
    athlete3,
    { goalKey: 'competition', levelKey: 'advanced' },
    { level: CoachStudentEngagementLevel.QUIET, progressPercent: 10 },
  );

  let program = await workoutProgramModel.findOne({
    'owner.type': WorkoutProgramOwnerType.COACH,
    'owner.id': coach1._id,
    title: 'کراسفیت پایه ۴ هفته‌ای',
  });
  if (!program) {
    program = await workoutProgramModel.create({
      owner: { type: WorkoutProgramOwnerType.COACH, id: coach1._id },
      title: 'کراسفیت پایه ۴ هفته‌ای',
      status: WorkoutProgramStatus.PUBLISHED,
      privacy: Privacy.COACH_ONLY,
      meta: {
        focusLabel: 'قدرت + استقامت',
        weekCount: 4,
        sessionsPerWeek: 3,
      },
      weeks: [
        {
          weekIndex: 0,
          days: [
            {
              dayIndex: 0,
              exercises: [
                {
                  exerciseId: exerciseIds[0],
                  sets: 4,
                  reps: 8,
                },
                {
                  exerciseId: exerciseIds[4],
                  sets: 3,
                  durationSec: 60,
                },
              ],
            },
            {
              dayIndex: 2,
              exercises: [
                {
                  exerciseId: exerciseIds[1],
                  sets: 4,
                  reps: 10,
                },
                {
                  exerciseId: exerciseIds[2],
                  sets: 3,
                  durationSec: 45,
                },
              ],
            },
          ],
        },
      ],
      assignedCount: 0,
    });
  }

  let assignedPlan = await workoutPlanModel.findOne({
    athleteUserId: athlete1._id,
    programId: program._id,
  });
  if (!assignedPlan) {
    assignedPlan = await workoutPlanModel.create({
      athleteUserId: athlete1._id,
      coachUserId: coach1._id,
      programId: program._id,
      title: program.title,
      status: WorkoutPlanStatus.ACTIVE,
      privacy: Privacy.COACH_ONLY,
      weeks: program.weeks,
      period: {
        start: new Date(Date.now() - 7 * 86400_000),
        end: new Date(Date.now() + 21 * 86400_000),
      },
    });
    await workoutProgramModel.updateOne(
      { _id: program._id },
      { $set: { assignedCount: 1 } },
    );
  }
  log.log('coach-student + workout program/plan seeded');

  // ── Owner tasks ────────────────────────────────────────────
  const ensureOwnerTask = async (
    club: ClubDocument,
    title: string,
    doc: Partial<OwnerTask>,
  ) => {
    const existing = await ownerTaskModel.findOne({ clubId: club._id, title });
    if (existing) return existing;
    return ownerTaskModel.create({
      clubId: club._id,
      title,
      createdByUserId: owner1._id,
      assigneeUserId: owner1._id,
      status: OwnerTaskStatus.OPEN,
      priority: OwnerTaskPriority.NORMAL,
      related: {},
      ...doc,
    });
  };

  await ensureOwnerTask(clubVanak, 'پیگیری تمدید عضویت ورزشکار', {
    body: 'عضویت ماهانه علی احمدی تا ۲۲ روز دیگر منقضی می‌شود.',
    priority: OwnerTaskPriority.HIGH,
    dueAt: new Date(Date.now() + 5 * 86400_000),
    related: { membershipId: membershipAthlete1._id },
  });
  await ensureOwnerTask(clubVanak, 'بازبینی نظرات در انتظار تأیید', {
    body: 'یک نظر با امتیاز ۳ در صف بررسی است.',
    priority: OwnerTaskPriority.NORMAL,
    status: OwnerTaskStatus.IN_PROGRESS,
  });
  await ensureOwnerTask(clubSaadat, 'هماهنگی مربی کیک‌بوکسینگ', {
    body: 'مدارک تأیید مربی هنوز pending است؛ با ادمین هماهنگ شود.',
    priority: OwnerTaskPriority.LOW,
    status: OwnerTaskStatus.OPEN,
  });
  log.log('owner tasks seeded');

  log.log('──────────────────────────────────────────');
  log.log(`Demo seed complete. Password for all users: ${DEMO_PASSWORD}`);
  log.log(`admin:    ${PHONES.admin}`);
  log.log(`owners:   ${PHONES.owner1}, ${PHONES.owner2}`);
  log.log(`coaches:  ${PHONES.coach1}, ${PHONES.coach2}, ${PHONES.coach3}`);
  log.log(
    `athletes: ${PHONES.athlete1}, ${PHONES.athlete2}, ${PHONES.athlete3}`,
  );
  log.log(
    'Linked demo: memberships, bookings BK-DEMO0001…4, wallet, INV-DEMO-0001',
  );
  await app.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
