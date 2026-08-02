import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';
import { PrismaClient, Role } from '../src/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function seedAdmin() {
  const phone = process.env.SEED_ADMIN_PHONE ?? '09000000000';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@Gym4Me1';
  const passwordHash = await argon2.hash(password);

  await prisma.user.upsert({
    where: { phone },
    update: {},
    create: {
      phone,
      email: 'admin@gym4me.app',
      passwordHash,
      fullName: 'مدیر سیستم',
      roles: [Role.ADMIN],
      wallet: { create: {} },
    },
  });
  console.log(`✔ admin user (${phone} / ${password})`);
}

async function seedSports() {
  const sports = [
    { name: 'بدنسازی', slug: 'bodybuilding' },
    { name: 'فیتنس', slug: 'fitness' },
    { name: 'کراسفیت', slug: 'crossfit' },
    { name: 'یوگا', slug: 'yoga' },
    { name: 'پیلاتس', slug: 'pilates' },
    { name: 'شنا', slug: 'swimming' },
    { name: 'فوتبال', slug: 'football' },
    { name: 'فوتسال', slug: 'futsal' },
    { name: 'والیبال', slug: 'volleyball' },
    { name: 'بسکتبال', slug: 'basketball' },
    { name: 'تنیس', slug: 'tennis' },
    { name: 'پدل', slug: 'padel' },
    { name: 'ورزش‌های رزمی', slug: 'martial-arts' },
    { name: 'دویدن', slug: 'running' },
    { name: 'ژیمناستیک', slug: 'gymnastics' },
  ];
  for (const s of sports) {
    await prisma.sport.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    });
  }
  const martialArts = await prisma.sport.findUnique({
    where: { slug: 'martial-arts' },
  });
  const subSports = [
    { name: 'کاراته', slug: 'karate' },
    { name: 'تکواندو', slug: 'taekwondo' },
    { name: 'بوکس', slug: 'boxing' },
    { name: 'جوجیتسو', slug: 'jiu-jitsu' },
  ];
  for (const s of subSports) {
    await prisma.sport.upsert({
      where: { slug: s.slug },
      update: {},
      create: { ...s, parentId: martialArts!.id },
    });
  }
  console.log('✔ sports');
}

async function seedGoalTypes() {
  const goals = [
    'کاهش وزن',
    'افزایش وزن',
    'عضله‌سازی',
    'آمادگی مسابقه',
    'افزایش استقامت',
    'افزایش انعطاف‌پذیری',
    'تناسب اندام عمومی',
    'توان‌بخشی و ریکاوری',
    'کاهش استرس',
  ];
  for (const name of goals) {
    await prisma.goalType.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log('✔ goal types');
}

async function seedAmenities() {
  const amenities = [
    'پارکینگ',
    'دوش',
    'کمد',
    'سونا',
    'جکوزی',
    'استخر',
    'بوفه',
    'وای‌فای',
    'سالن هوازی',
    'مربی خصوصی',
    'کافه',
    'فروشگاه مکمل',
  ];
  for (const name of amenities) {
    await prisma.amenity.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log('✔ amenities');
}

async function seedSpaceTypes() {
  const types = [
    'سالن بدنسازی',
    'زمین فوتبال',
    'زمین فوتسال',
    'زمین والیبال',
    'زمین بسکتبال',
    'زمین تنیس',
    'زمین پدل',
    'استخر',
    'سالن رزمی',
    'سالن یوگا',
    'سالن چندمنظوره',
  ];
  for (const name of types) {
    await prisma.spaceType.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log('✔ space types');
}

async function seedMuscles() {
  const muscles: Array<[string, string]> = [
    ['سینه', 'بالاتنه'],
    ['پشت (زیربغل)', 'بالاتنه'],
    ['سرشانه', 'بالاتنه'],
    ['جلو بازو', 'بالاتنه'],
    ['پشت بازو', 'بالاتنه'],
    ['ساعد', 'بالاتنه'],
    ['شکم', 'میان‌تنه'],
    ['فیله کمر', 'میان‌تنه'],
    ['چهارسر ران', 'پایین‌تنه'],
    ['همسترینگ', 'پایین‌تنه'],
    ['باسن', 'پایین‌تنه'],
    ['ساق پا', 'پایین‌تنه'],
  ];
  for (const [name, bodyPart] of muscles) {
    await prisma.muscle.upsert({
      where: { name },
      update: {},
      create: { name, bodyPart },
    });
  }
  console.log('✔ muscles');
}

async function seedEquipment() {
  const items = [
    'هالتر',
    'دمبل',
    'کتل‌بل',
    'دستگاه اسمیت',
    'دستگاه پرس سینه',
    'دستگاه لت',
    'تردمیل',
    'دوچرخه ثابت',
    'الپتیکال',
    'طناب',
    'کش تمرین',
    'توپ سوئیسی',
    'میله بارفیکس',
    'نیمکت تمرین',
  ];
  for (const name of items) {
    await prisma.equipmentItem.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log('✔ equipment');
}

async function seedUnitsAndMetrics() {
  const units: Array<[string, string]> = [
    ['کیلوگرم', 'kg'],
    ['سانتی‌متر', 'cm'],
    ['ضربه در دقیقه', 'bpm'],
    ['میلی‌متر جیوه', 'mmHg'],
    ['ساعت', 'h'],
    ['کیلوکالری', 'kcal'],
    ['قدم', 'steps'],
    ['لیتر', 'L'],
    ['درصد', '%'],
    ['ثانیه', 's'],
    ['متر', 'm'],
  ];
  const unitIds = new Map<string, string>();
  for (const [name, symbol] of units) {
    const u = await prisma.measurementUnit.upsert({
      where: { name },
      update: {},
      create: { name, symbol },
    });
    unitIds.set(symbol, u.id);
  }

  const metrics: Array<{
    key: string;
    name: string;
    unit?: string;
    valueKind?: string;
  }> = [
    { key: 'weight', name: 'وزن', unit: 'kg' },
    { key: 'body_fat', name: 'درصد چربی', unit: '%' },
    { key: 'bmi', name: 'BMI' },
    { key: 'heart_rate', name: 'ضربان قلب', unit: 'bpm' },
    { key: 'blood_pressure', name: 'فشار خون', unit: 'mmHg', valueKind: 'pair' },
    { key: 'hydration', name: 'آب‌رسانی', unit: 'L' },
    { key: 'sleep', name: 'خواب', unit: 'h' },
    { key: 'calories', name: 'کالری مصرفی', unit: 'kcal' },
    { key: 'steps', name: 'تعداد قدم', unit: 'steps' },
    { key: 'mood', name: 'روحیه', valueKind: 'text' },
    { key: 'energy', name: 'سطح انرژی' },
    { key: 'waist', name: 'دور کمر', unit: 'cm' },
    { key: 'arm', name: 'دور بازو', unit: 'cm' },
    { key: 'chest', name: 'دور سینه', unit: 'cm' },
    { key: 'thigh', name: 'دور ران', unit: 'cm' },
  ];
  for (const m of metrics) {
    await prisma.metricType.upsert({
      where: { key: m.key },
      update: {},
      create: {
        key: m.key,
        name: m.name,
        valueKind: m.valueKind ?? 'number',
        unitId: m.unit ? unitIds.get(m.unit) : undefined,
      },
    });
  }
  console.log('✔ units & metric types');
}

async function seedLevelsAndSpecialties() {
  const levels = ['مبتدی', 'متوسط', 'پیشرفته', 'حرفه‌ای'];
  for (let i = 0; i < levels.length; i++) {
    await prisma.athleteLevel.upsert({
      where: { name: levels[i] },
      update: {},
      create: { name: levels[i], order: i },
    });
  }

  const specialties = [
    'کاهش وزن',
    'حجم و قدرت',
    'آمادگی جسمانی',
    'حرکات اصلاحی',
    'تغذیه ورزشی',
    'تمرین بانوان',
    'تمرین سالمندان',
    'آماده‌سازی مسابقه',
  ];
  for (const name of specialties) {
    await prisma.coachSpecialty.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log('✔ athlete levels & coach specialties');
}

async function seedDocumentTypesAndReasons() {
  const docTypes: Array<[string, Role]> = [
    ['کارت مربیگری', Role.COACH],
    ['مدرک تحصیلی مرتبط', Role.COACH],
    ['گواهی دوره تخصصی', Role.COACH],
    ['مجوز فعالیت باشگاه', Role.CLUB_OWNER],
    ['سند یا اجاره‌نامه محل', Role.CLUB_OWNER],
    ['کارت ملی', Role.ATHLETE],
  ];
  for (const [name, audience] of docTypes) {
    await prisma.documentType.upsert({
      where: { name },
      update: {},
      create: { name, audience },
    });
  }

  const reasons: Array<[string, string]> = [
    ['تداخل زمانی', 'booking'],
    ['مشکل شخصی', 'booking'],
    ['بیماری یا آسیب', 'booking'],
    ['لغو توسط باشگاه', 'refund'],
    ['لغو توسط مربی', 'refund'],
    ['نارضایتی از خدمات', 'refund'],
    ['پرداخت اشتباه', 'refund'],
    ['انصراف از عضویت', 'membership'],
  ];
  for (const [title, scope] of reasons) {
    await prisma.cancellationReason.upsert({
      where: { title },
      update: {},
      create: { title, scope },
    });
  }
  console.log('✔ document types & cancellation reasons');
}

async function seedPermissions() {
  const permissions: Array<[string, string]> = [
    ['bookings.read', 'مشاهده رزروها'],
    ['bookings.create', 'ثبت رزرو'],
    ['bookings.cancel', 'لغو رزرو'],
    ['members.read', 'مشاهده اعضا'],
    ['members.checkin', 'ثبت ورود اعضا'],
    ['memberships.sell', 'فروش عضویت'],
    ['finance.read', 'مشاهده گزارش مالی'],
    ['finance.manage', 'مدیریت مالی و تسویه'],
    ['staff.manage', 'مدیریت پرسنل'],
    ['classes.manage', 'مدیریت کلاس‌ها و سانس‌ها'],
    ['announcements.manage', 'مدیریت اعلان‌های باشگاه'],
    ['equipment.manage', 'مدیریت تجهیزات'],
  ];
  for (const [key, title] of permissions) {
    await prisma.permissionDefinition.upsert({
      where: { key },
      update: {},
      create: { key, title },
    });
  }
  console.log('✔ staff permission catalog');
}

async function seedPlatformPlans() {
  const plans = [
    // Athlete
    {
      audience: Role.ATHLETE,
      name: 'رایگان',
      slug: 'athlete-free',
      price: 0,
      limits: { maxActivePrograms: 1, advancedReports: false, maxFileMb: 50 },
      order: 0,
    },
    {
      audience: Role.ATHLETE,
      name: 'حرفه‌ای',
      slug: 'athlete-pro',
      price: 190000,
      limits: { maxActivePrograms: 5, advancedReports: true, maxFileMb: 500 },
      order: 1,
    },
    {
      audience: Role.ATHLETE,
      name: 'پریمیوم',
      slug: 'athlete-premium',
      price: 390000,
      limits: { maxActivePrograms: -1, advancedReports: true, maxFileMb: 2000 },
      order: 2,
    },
    // Coach
    {
      audience: Role.COACH,
      name: 'پایه',
      slug: 'coach-base',
      price: 0,
      limits: {
        maxStudents: 5,
        maxActivePrograms: 5,
        commissionPercent: 15,
        canAdvertise: false,
        maxFileMb: 200,
      },
      order: 0,
    },
    {
      audience: Role.COACH,
      name: 'حرفه‌ای',
      slug: 'coach-pro',
      price: 490000,
      limits: {
        maxStudents: 50,
        maxActivePrograms: 100,
        commissionPercent: 10,
        canAdvertise: true,
        maxFileMb: 2000,
      },
      order: 1,
    },
    {
      audience: Role.COACH,
      name: 'استودیو',
      slug: 'coach-studio',
      price: 990000,
      limits: {
        maxStudents: -1,
        maxActivePrograms: -1,
        commissionPercent: 7,
        canAdvertise: true,
        maxFileMb: 10000,
      },
      order: 2,
    },
    // Club
    {
      audience: Role.CLUB_OWNER,
      name: 'شروع',
      slug: 'club-start',
      price: 0,
      limits: {
        maxBranches: 1,
        maxStaff: 3,
        commissionPercent: 12,
        advancedReports: false,
        canAdvertise: false,
      },
      order: 0,
    },
    {
      audience: Role.CLUB_OWNER,
      name: 'تجاری',
      slug: 'club-business',
      price: 1490000,
      limits: {
        maxBranches: 3,
        maxStaff: 15,
        commissionPercent: 8,
        advancedReports: true,
        canAdvertise: true,
      },
      order: 1,
    },
    {
      audience: Role.CLUB_OWNER,
      name: 'سازمانی',
      slug: 'club-enterprise',
      price: 3900000,
      limits: {
        maxBranches: -1,
        maxStaff: -1,
        commissionPercent: 5,
        advancedReports: true,
        canAdvertise: true,
      },
      order: 2,
    },
  ];
  for (const p of plans) {
    await prisma.platformPlan.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }
  console.log('✔ platform plans');
}

async function seedCities() {
  const cities: Array<[string, string, string[]]> = [
    ['تهران', 'تهران', ['ونک', 'سعادت‌آباد', 'پاسداران', 'تهرانپارس', 'ستارخان']],
    ['مشهد', 'خراسان رضوی', ['احمدآباد', 'وکیل‌آباد', 'هاشمیه']],
    ['اصفهان', 'اصفهان', ['چهارباغ', 'ملک‌شهر']],
    ['شیراز', 'فارس', ['معالی‌آباد', 'زند']],
    ['تبریز', 'آذربایجان شرقی', ['ولیعصر', 'آبرسان']],
    ['کرج', 'البرز', ['گوهردشت', 'جهانشهر']],
  ];
  for (const [name, province, districts] of cities) {
    const city = await prisma.city.upsert({
      where: { name_province: { name, province } },
      update: {},
      create: { name, province },
    });
    for (const d of districts) {
      await prisma.district.upsert({
        where: { cityId_name: { cityId: city.id, name: d } },
        update: {},
        create: { cityId: city.id, name: d },
      });
    }
  }
  console.log('✔ cities & districts');
}

async function seedContent() {
  const templates = [
    {
      key: 'booking_confirmed',
      title: 'تأیید رزرو',
      body: 'رزرو شما برای {{title}} در تاریخ {{date}} تأیید شد.',
      channels: ['inapp', 'push', 'sms'],
    },
    {
      key: 'booking_cancelled',
      title: 'لغو رزرو',
      body: 'رزرو {{title}} لغو شد. {{refundNote}}',
      channels: ['inapp', 'push'],
    },
    {
      key: 'membership_expiring',
      title: 'پایان عضویت',
      body: 'عضویت شما در {{club}} تا {{days}} روز دیگر به پایان می‌رسد.',
      channels: ['inapp', 'push', 'sms'],
    },
    {
      key: 'coach_new_student',
      title: 'شاگرد جدید',
      body: '{{athlete}} درخواست شاگردی برای شما ثبت کرد.',
      channels: ['inapp', 'push'],
    },
  ];
  for (const t of templates) {
    await prisma.notificationTemplate.upsert({
      where: { key: t.key },
      update: {},
      create: t,
    });
  }

  const pages = [
    { slug: 'about', title: 'درباره Gym4Me', body: 'Gym4Me پلتفرم یکپارچه ورزش، رزرو و مربیگری است.' },
    { slug: 'terms', title: 'قوانین و مقررات', body: 'متن قوانین استفاده از پلتفرم.' },
    { slug: 'privacy', title: 'حریم خصوصی', body: 'متن سیاست حریم خصوصی.' },
  ];
  for (const p of pages) {
    await prisma.staticPage.upsert({ where: { slug: p.slug }, update: {}, create: p });
  }
  console.log('✔ notification templates & static pages');
}

async function main() {
  await seedAdmin();
  await seedSports();
  await seedGoalTypes();
  await seedAmenities();
  await seedSpaceTypes();
  await seedMuscles();
  await seedEquipment();
  await seedUnitsAndMetrics();
  await seedLevelsAndSpecialties();
  await seedDocumentTypesAndReasons();
  await seedPermissions();
  await seedPlatformPlans();
  await seedCities();
  await seedContent();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
