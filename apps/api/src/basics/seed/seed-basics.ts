/**
 * Idempotent seed for choices, Iran locations, sports tree, common refs,
 * and a default platform admin.
 * Run: npm run db:seed -w api
 */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { LocationKind, RefType, Role, SportKind } from '../../common/enums';
import { normalizeIranPhone } from '../../common/utils/phone.util';
import { UsersService } from '../../users/users.service';
import { ChoicesService } from '../choices/choices.service';
import { LocationService } from '../location/location.service';
import { RefService } from '../ref/ref.service';
import { SportService } from '../sport/sport.service';
import { IRAN_FLAG_SVG } from './iran-flag';

const SEED_ADMIN_PHONE = '09121111111';

async function seed() {
  const nodeEnv = (process.env.NODE_ENV ?? 'development').toLowerCase();
  if (nodeEnv === 'production' && process.env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error(
      'Refusing basics seed in production without ALLOW_DEMO_SEED=true',
    );
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const log = new Logger('SeedBasics');

  const choices = app.get(ChoicesService);
  const locations = app.get(LocationService);
  const sports = app.get(SportService);
  const refs = app.get(RefService);
  const users = app.get(UsersService);

  // ── Choice groups ──────────────────────────────
  const choiceSeeds = [
    {
      key: 'gender',
      name: 'جنسیت',
      isSystem: true,
      options: [
        { value: 'male', name: 'مرد', order: 0 },
        { value: 'female', name: 'زن', order: 1 },
        { value: 'other', name: 'سایر', order: 2 },
      ],
    },
    {
      key: 'weight_unit',
      name: 'واحد وزن',
      isSystem: true,
      options: [
        { value: 'kg', name: 'کیلوگرم', order: 0 },
        { value: 'lb', name: 'پوند', order: 1 },
      ],
    },
    {
      key: 'height_unit',
      name: 'واحد قد',
      isSystem: true,
      options: [
        { value: 'cm', name: 'سانتی‌متر', order: 0 },
        { value: 'ft_in', name: 'فوت/اینچ', order: 1 },
      ],
    },
    {
      key: 'athlete_level',
      name: 'سطح ورزشکار',
      isSystem: false,
      options: [
        { value: 'beginner', name: 'مبتدی', order: 0 },
        { value: 'intermediate', name: 'متوسط', order: 1 },
        { value: 'advanced', name: 'پیشرفته', order: 2 },
        { value: 'pro', name: 'حرفه‌ای', order: 3 },
      ],
    },
    {
      key: 'coach_level',
      name: 'سطح مربی',
      isSystem: false,
      options: [
        { value: 'junior', name: 'جونیور', order: 0 },
        { value: 'mid', name: 'متوسط', order: 1 },
        { value: 'senior', name: 'ارشد', order: 2 },
        { value: 'master', name: 'مستر', order: 3 },
      ],
    },
    {
      key: 'club_level',
      name: 'سطح باشگاه',
      isSystem: false,
      options: [
        { value: 'local', name: 'محلی', order: 0 },
        { value: 'standard', name: 'استاندارد', order: 1 },
        { value: 'premium', name: 'پریمیوم', order: 2 },
        { value: 'elite', name: 'نخبگان', order: 3 },
      ],
    },
    {
      key: 'gender_policy',
      name: 'پذیرش جنسیتی',
      isSystem: true,
      options: [
        { value: 'mixed', name: 'مختلط', order: 0 },
        { value: 'male_only', name: 'فقط آقایان', order: 1 },
        { value: 'female_only', name: 'فقط بانوان', order: 2 },
      ],
    },
    {
      key: 'age_group',
      name: 'گروه سنی',
      isSystem: true,
      options: [
        { value: 'kids', name: 'کودکان', order: 0 },
        { value: 'teens', name: 'نوجوانان', order: 1 },
        { value: 'adults', name: 'بزرگسالان', order: 2 },
        { value: 'seniors', name: 'سالمندان', order: 3 },
      ],
    },
    {
      key: 'social_platform',
      name: 'شبکه‌های اجتماعی',
      isSystem: false,
      options: [
        { value: 'instagram', name: 'اینستاگرام', order: 0 },
        { value: 'telegram', name: 'تلگرام', order: 1 },
        { value: 'whatsapp', name: 'واتساپ', order: 2 },
        { value: 'website', name: 'وب‌سایت', order: 3 },
        { value: 'x', name: 'ایکس', order: 4 },
      ],
    },
  ];

  for (const c of choiceSeeds) {
    await choices.upsertSeed(c);
    log.log(`choice: ${c.key}`);
  }

  // ── Locations (Iran sample) ────────────────────
  const iran = await locations.upsertSeed({
    kind: LocationKind.COUNTRY,
    name: 'ایران',
    slug: 'iran',
    flagSvg: IRAN_FLAG_SVG,
    center: { lng: 53.688, lat: 32.4279 },
    order: 0,
  });
  if (!iran.flagSvg) {
    iran.flagSvg = IRAN_FLAG_SVG;
    await iran.save();
  }

  const tehranProvince = await locations.upsertSeed({
    kind: LocationKind.PROVINCE,
    name: 'تهران',
    slug: 'tehran',
    parentId: iran._id.toString(),
    center: { lng: 51.389, lat: 35.6892 },
    order: 0,
  });

  const isfahanProvince = await locations.upsertSeed({
    kind: LocationKind.PROVINCE,
    name: 'اصفهان',
    slug: 'isfahan',
    parentId: iran._id.toString(),
    center: { lng: 51.6746, lat: 32.6546 },
    order: 1,
  });

  const tehranCity = await locations.upsertSeed({
    kind: LocationKind.CITY,
    name: 'تهران',
    slug: 'tehran-city',
    parentId: tehranProvince._id.toString(),
    center: { lng: 51.389, lat: 35.6892 },
    order: 0,
  });

  await locations.upsertSeed({
    kind: LocationKind.CITY,
    name: 'اصفهان',
    slug: 'isfahan-city',
    parentId: isfahanProvince._id.toString(),
    center: { lng: 51.6746, lat: 32.6546 },
    order: 0,
  });

  for (const [name, slug, order] of [
    ['ونک', 'vanak', 0],
    ['سعادت‌آباد', 'saadat-abad', 1],
    ['تجریش', 'tajrish', 2],
  ] as const) {
    await locations.upsertSeed({
      kind: LocationKind.DISTRICT,
      name,
      slug,
      parentId: tehranCity._id.toString(),
      order,
    });
  }
  log.log('locations: iran tree seeded');

  // ── Sports tree ────────────────────────────────
  const ball = await sports.upsertSeed({
    kind: SportKind.CATEGORY,
    name: 'ورزش‌های توپی',
    slug: 'ball-sports',
    order: 0,
  });
  const fitness = await sports.upsertSeed({
    kind: SportKind.CATEGORY,
    name: 'آمادگی جسمانی',
    slug: 'fitness',
    order: 1,
  });
  const combat = await sports.upsertSeed({
    kind: SportKind.CATEGORY,
    name: 'رزمی',
    slug: 'combat',
    order: 2,
  });

  const football = await sports.upsertSeed({
    kind: SportKind.SPORT,
    name: 'فوتبال',
    slug: 'football',
    parentId: ball._id.toString(),
    order: 0,
  });
  await sports.upsertSeed({
    kind: SportKind.SPORT,
    name: 'والیبال',
    slug: 'volleyball',
    parentId: ball._id.toString(),
    order: 1,
  });
  await sports.upsertSeed({
    kind: SportKind.SPORT,
    name: 'بدنسازی',
    slug: 'bodybuilding',
    parentId: fitness._id.toString(),
    order: 0,
  });
  await sports.upsertSeed({
    kind: SportKind.SPORT,
    name: 'کراسفیت',
    slug: 'crossfit',
    parentId: fitness._id.toString(),
    order: 1,
  });
  await sports.upsertSeed({
    kind: SportKind.SPORT,
    name: 'کیک‌بوکسینگ',
    slug: 'kickboxing',
    parentId: combat._id.toString(),
    order: 0,
  });

  await sports.upsertSeed({
    kind: SportKind.BRANCH,
    name: 'فوتبال ساحلی',
    slug: 'beach-football',
    parentId: football._id.toString(),
    order: 0,
  });
  await sports.upsertSeed({
    kind: SportKind.BRANCH,
    name: 'فوتسال',
    slug: 'futsal',
    parentId: football._id.toString(),
    order: 1,
  });
  log.log('sports: tree seeded');

  // ── Generic refs ───────────────────────────────
  const amenitySeeds = [
    ['پارکینگ', 'parking'],
    ['دوش', 'shower'],
    ['کمد', 'locker'],
    ['سونا', 'sauna'],
    ['استخر', 'pool'],
    ['wifi', 'wifi'],
    ['دسترسی‌پذیری', 'accessibility'],
  ] as const;
  for (const [i, [name, slug]] of amenitySeeds.entries()) {
    await refs.upsertSeed(RefType.AMENITY, { name, slug, order: i });
  }

  const equipmentSeeds = [
    ['دمبل', 'dumbbell'],
    ['هالتر', 'barbell'],
    ['تردمیل', 'treadmill'],
    ['کش مقاومتی', 'resistance-band'],
    ['توپ مدیسین', 'medicine-ball'],
  ] as const;
  for (const [i, [name, slug]] of equipmentSeeds.entries()) {
    await refs.upsertSeed(RefType.EQUIPMENT, { name, slug, order: i });
  }

  const muscleSeeds = [
    ['سینه', 'chest'],
    ['پشت', 'back'],
    ['شانه', 'shoulders'],
    ['بازو', 'biceps'],
    ['پا', 'legs'],
    ['هسته', 'core'],
  ] as const;
  for (const [i, [name, slug]] of muscleSeeds.entries()) {
    await refs.upsertSeed(RefType.MUSCLE, { name, slug, order: i });
  }

  const goalSeeds = [
    ['کاهش وزن', 'weight-loss'],
    ['عضله‌سازی', 'muscle-gain'],
    ['آمادگی مسابقه', 'competition'],
    ['سلامت عمومی', 'general-health'],
  ] as const;
  for (const [i, [name, slug]] of goalSeeds.entries()) {
    await refs.upsertSeed(RefType.GOAL_TYPE, { name, slug, order: i });
  }

  const clubCategorySeeds = [
    ['بدنسازی', 'gym'],
    ['استخر', 'pool'],
    ['فوتبال', 'football'],
    ['مجموعه ورزشی', 'multi-sport'],
    ['کلاس گروهی', 'group-class'],
  ] as const;
  for (const [i, [name, slug]] of clubCategorySeeds.entries()) {
    await refs.upsertSeed(RefType.CLUB_CATEGORY, { name, slug, order: i });
  }

  const reviewCriterionSeeds = [
    ['نحوه پذیرش', 'check-in'],
    ['نظافت', 'cleanliness'],
    ['تطابق با اطلاعات', 'accuracy'],
    ['نحوه میزبانی', 'hosting'],
    ['موقعیت مکانی', 'location'],
    ['ارزش قیمت', 'value'],
  ] as const;
  for (const [i, [name, slug]] of reviewCriterionSeeds.entries()) {
    await refs.upsertSeed(RefType.REVIEW_CRITERION, { name, slug, order: i });
  }

  log.log('refs: amenities/equipment/muscles/goals/categories/criteria seeded');

  // ── Platform admin ─────────────────────────────
  const adminPhone = normalizeIranPhone(SEED_ADMIN_PHONE);
  const existingAdmin = await users.findByPhone(adminPhone);
  if (existingAdmin) {
    if (!existingAdmin.roles.includes(Role.ADMIN)) {
      existingAdmin.roles = [...existingAdmin.roles, Role.ADMIN];
      await existingAdmin.save();
      log.log(`admin: granted Role.ADMIN to ${adminPhone}`);
    } else {
      log.log(`admin: ${adminPhone} already exists`);
    }
    if (!existingAdmin.phoneVerifiedAt) {
      existingAdmin.phoneVerifiedAt = new Date();
      await existingAdmin.save();
    }
  } else {
    await users.create({
      phone: adminPhone,
      firstName: 'Admin',
      lastName: 'Gym4Me',
      roles: [Role.ADMIN],
      phoneVerified: true,
    });
    log.log(`admin: created ${adminPhone}`);
  }

  log.log('Seed complete');
  await app.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
