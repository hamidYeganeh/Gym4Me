import "dotenv/config";
import { connectDatabase, disconnectDatabase, registerModels } from "./index.js";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required");

const permissions = [
  "*",
  "account.profile.read.self",
  "account.profile.update.self",
  "account.security.manage.self",
  "booking.quote.create.self",
  "booking.hold.create.self",
  "booking.manage.self",
  "booking.household.manage.self",
  "finance.wallet.read.self",
  "finance.wallet.top-up.self",
  "finance.payment.create.self",
  "coach.profile.manage.self",
  "coach.schedule.manage.self",
  "coach.booking.read.self",
  "branch.booking.read",
  "branch.booking.create",
  "branch.booking.cancel",
  "branch.booking.reschedule",
  "branch.booking.override-cancellation",
  "branch.check-in.create",
  "branch.check-out.create",
  "branch.resources.read",
  "branch.resources.manage",
  "branch.offerings.read",
  "branch.offerings.manage",
  "branch.availability.read",
  "branch.availability.manage",
  "branch.profile.read",
  "branch.profile.manage",
  "club.profile.read",
  "club.profile.manage",
  "organization.profile.read",
  "organization.profile.manage",
  "organization.staff.manage",
  "organization.roles.manage",
  "organization.finance.read",
  "organization.finance.manage",
  "organization.memberships.manage",
  "organization.advertising.manage",
  "organization.reviews.manage",
  "organization.announcements.manage",
  "organization.cancellation-policy.manage",
  "corporate.members.manage",
  "corporate.benefits.manage",
  "admin.users.manage",
  "admin.bookings.manage",
  "admin.organizations.manage",
  "admin.catalog.manage",
  "admin.verifications.manage",
  "admin.finance.read",
  "admin.finance.refund",
  "admin.finance.adjust",
  "admin.advertising.manage",
  "admin.reviews.moderate",
  "admin.notifications.manage",
  "admin.memberships.manage",
  "admin.configuration.manage",
  "admin.roles.manage",
  "admin.audit.read",
  "admin.impersonate",
] as const;
const roles = [
  {
    code: "athlete",
    name: "Athlete",
    type: "system",
    scopeType: "self",
    permissionCodes: [
      "account.profile.read.self",
      "account.profile.update.self",
      "account.security.manage.self",
      "booking.quote.create.self",
      "booking.hold.create.self",
      "booking.manage.self",
      "booking.household.manage.self",
      "finance.wallet.read.self",
      "finance.wallet.top-up.self",
      "finance.payment.create.self",
    ],
  },
  {
    code: "coach",
    name: "Coach",
    type: "system",
    scopeType: "self",
    permissionCodes: [
      "account.profile.read.self",
      "account.profile.update.self",
      "account.security.manage.self",
      "booking.quote.create.self",
      "booking.hold.create.self",
      "booking.manage.self",
      "booking.household.manage.self",
      "finance.wallet.read.self",
      "finance.wallet.top-up.self",
      "finance.payment.create.self",
      "coach.profile.manage.self",
      "coach.schedule.manage.self",
      "coach.booking.read.self",
    ],
  },
  {
    code: "club_owner",
    name: "Club Owner",
    type: "organization_default",
    scopeType: "organization",
    permissionCodes: permissions.filter(
      (code) =>
        code.startsWith("organization.") || code.startsWith("club.") || code.startsWith("branch."),
    ),
  },
  {
    code: "branch_manager",
    name: "Branch Manager",
    type: "organization_default",
    scopeType: "branch",
    permissionCodes: [
      "branch.profile.read",
      "branch.profile.manage",
      "branch.resources.read",
      "branch.resources.manage",
      "branch.offerings.read",
      "branch.offerings.manage",
      "branch.availability.read",
      "branch.availability.manage",
      "branch.booking.read",
      "branch.booking.create",
      "branch.booking.cancel",
      "branch.booking.reschedule",
      "branch.booking.override-cancellation",
      "branch.check-in.create",
      "branch.check-out.create",
      "organization.staff.manage",
    ],
  },
  {
    code: "reception",
    name: "Reception",
    type: "organization_default",
    scopeType: "branch",
    permissionCodes: [
      "branch.profile.read",
      "branch.resources.read",
      "branch.offerings.read",
      "branch.availability.read",
      "branch.booking.read",
      "branch.booking.create",
      "branch.booking.cancel",
      "branch.booking.reschedule",
      "branch.check-in.create",
      "branch.check-out.create",
    ],
  },
  {
    code: "finance_staff",
    name: "Finance Staff",
    type: "organization_default",
    scopeType: "organization",
    permissionCodes: [
      "organization.profile.read",
      "organization.finance.read",
      "organization.finance.manage",
    ],
  },
  {
    code: "corporate_admin",
    name: "Corporate Admin",
    type: "organization_default",
    scopeType: "organization",
    permissionCodes: [
      "organization.profile.read",
      "corporate.members.manage",
      "corporate.benefits.manage",
    ],
  },
  {
    code: "super_admin",
    name: "Super Admin",
    type: "admin",
    scopeType: "global",
    permissionCodes: ["*"],
  },
  {
    code: "user_admin",
    name: "User Admin",
    type: "admin",
    scopeType: "global",
    permissionCodes: ["admin.users.manage", "admin.roles.manage"],
  },
  {
    code: "finance_admin",
    name: "Finance Admin",
    type: "admin",
    scopeType: "global",
    permissionCodes: [
      "admin.finance.read",
      "admin.finance.refund",
      "admin.finance.adjust",
      "admin.memberships.manage",
    ],
  },
  {
    code: "verification_admin",
    name: "Verification Admin",
    type: "admin",
    scopeType: "global",
    permissionCodes: ["admin.verifications.manage", "admin.organizations.manage"],
  },
  {
    code: "content_moderator",
    name: "Content Moderator",
    type: "admin",
    scopeType: "global",
    permissionCodes: [
      "admin.reviews.moderate",
      "admin.advertising.manage",
      "admin.notifications.manage",
    ],
  },
  {
    code: "support_agent",
    name: "Support Agent",
    type: "admin",
    scopeType: "global",
    permissionCodes: ["admin.bookings.manage", "admin.users.manage", "admin.impersonate"],
  },
] as const;
const entities = [
  ["athlete_profile", "account", "athleteprofiles", "پروفایل ورزشکار"],
  ["coach_profile", "account", "coachprofiles", "پروفایل مربی"],
  ["club", "organization", "clubs", "باشگاه"],
  ["branch", "organization", "branches", "شعبه"],
  ["resource", "organization", "resources", "منبع قابل رزرو"],
  ["offering", "organization", "offerings", "خدمت"],
  ["membership_product", "membership", "membershipproducts", "محصول عضویت"],
  ["ad_campaign", "advertising", "adcampaigns", "کمپین تبلیغاتی"],
] as const;
const taxonomies = [
  ["sports", "رشته‌های ورزشی", true],
  ["coach_specialties", "تخصص مربی", true],
  ["club_amenities", "امکانات باشگاه", true],
  ["athlete_goals", "اهداف ورزشکار", true],
  ["experience_levels", "سطح تجربه", false],
  ["equipment_types", "تجهیزات", true],
  ["document_types", "انواع مدارک", true],
  ["cancellation_reasons", "دلایل لغو", true],
  ["cities", "شهرها", true],
] as const;

type SportSeed = {
  code: string;
  fa: string;
  en: string;
  branches?: Array<{ code: string; fa: string; en: string }>;
};

const sportCatalog: Array<{
  code: string;
  fa: string;
  en: string;
  icon: string;
  sports: SportSeed[];
}> = [
  {
    code: "martial_arts",
    fa: "ورزش‌های رزمی",
    en: "Martial arts",
    icon: "martial-arts",
    sports: [
      {
        code: "karate",
        fa: "کاراته",
        en: "Karate",
        branches: [
          { code: "shotokan", fa: "شوتوکان", en: "Shotokan" },
          { code: "kyokushin", fa: "کیوکوشین", en: "Kyokushin" },
          { code: "goju_ryu", fa: "گوجوریو", en: "Goju-ryu" },
        ],
      },
      {
        code: "wushu",
        fa: "ووشو",
        en: "Wushu",
        branches: [
          { code: "sanda", fa: "ساندا", en: "Sanda" },
          { code: "taolu", fa: "تالو", en: "Taolu" },
        ],
      },
      {
        code: "taekwondo",
        fa: "تکواندو",
        en: "Taekwondo",
        branches: [
          { code: "kyorugi", fa: "کیوروگی", en: "Kyorugi" },
          { code: "poomsae", fa: "پومسه", en: "Poomsae" },
        ],
      },
      { code: "judo", fa: "جودو", en: "Judo" },
      { code: "aikido", fa: "آیکیدو", en: "Aikido" },
      { code: "boxing", fa: "بوکس", en: "Boxing" },
      { code: "kickboxing", fa: "کیک‌بوکسینگ", en: "Kickboxing" },
      { code: "wrestling", fa: "کشتی", en: "Wrestling" },
      { code: "mma", fa: "هنرهای رزمی ترکیبی", en: "MMA" },
    ],
  },
  {
    code: "ball_sports",
    fa: "ورزش‌های توپی",
    en: "Ball sports",
    icon: "ball",
    sports: [
      {
        code: "football",
        fa: "فوتبال",
        en: "Football",
        branches: [
          { code: "football_indoor", fa: "فوتسال", en: "Futsal" },
          { code: "football_beach", fa: "فوتبال ساحلی", en: "Beach football" },
        ],
      },
      {
        code: "volleyball",
        fa: "والیبال",
        en: "Volleyball",
        branches: [{ code: "beach_volleyball", fa: "والیبال ساحلی", en: "Beach volleyball" }],
      },
      { code: "basketball", fa: "بسکتبال", en: "Basketball" },
      { code: "handball", fa: "هندبال", en: "Handball" },
      { code: "tennis", fa: "تنیس", en: "Tennis" },
      { code: "padel", fa: "پدل", en: "Padel" },
      { code: "badminton", fa: "بدمینتون", en: "Badminton" },
      { code: "table_tennis", fa: "تنیس روی میز", en: "Table tennis" },
      { code: "squash", fa: "اسکواش", en: "Squash" },
    ],
  },
  {
    code: "aquatic_sports",
    fa: "ورزش‌های آبی",
    en: "Aquatic sports",
    icon: "water",
    sports: [
      {
        code: "swimming",
        fa: "شنا و استخر",
        en: "Swimming",
        branches: [
          { code: "freestyle_swimming", fa: "شنای آزاد", en: "Freestyle" },
          { code: "backstroke", fa: "کرال پشت", en: "Backstroke" },
          { code: "breaststroke", fa: "قورباغه", en: "Breaststroke" },
          { code: "butterfly", fa: "پروانه", en: "Butterfly" },
        ],
      },
      { code: "water_polo", fa: "واترپلو", en: "Water polo" },
      { code: "diving", fa: "شیرجه", en: "Diving" },
      { code: "aqua_fitness", fa: "آکوافیتنس", en: "Aqua fitness" },
      { code: "rowing", fa: "قایقرانی", en: "Rowing" },
    ],
  },
  {
    code: "strength_fitness",
    fa: "قدرتی و تناسب اندام",
    en: "Strength and fitness",
    icon: "strength",
    sports: [
      { code: "bodybuilding", fa: "بدنسازی", en: "Bodybuilding" },
      { code: "functional_training", fa: "تمرینات فانکشنال", en: "Functional training" },
      { code: "crossfit", fa: "کراس‌فیت", en: "CrossFit" },
      { code: "powerlifting", fa: "پاورلیفتینگ", en: "Powerlifting" },
      { code: "weightlifting", fa: "وزنه‌برداری", en: "Weightlifting" },
      { code: "calisthenics", fa: "کالستنیکس", en: "Calisthenics" },
      { code: "aerobics", fa: "ایروبیک", en: "Aerobics" },
    ],
  },
  {
    code: "mind_body",
    fa: "ذهن و بدن",
    en: "Mind and body",
    icon: "mind-body",
    sports: [
      {
        code: "yoga",
        fa: "یوگا",
        en: "Yoga",
        branches: [
          { code: "hatha_yoga", fa: "هاتا یوگا", en: "Hatha yoga" },
          { code: "vinyasa_yoga", fa: "وینیاسا یوگا", en: "Vinyasa yoga" },
          { code: "aerial_yoga", fa: "یوگای هوایی", en: "Aerial yoga" },
        ],
      },
      { code: "pilates", fa: "پیلاتس", en: "Pilates" },
      { code: "meditation", fa: "مدیتیشن", en: "Meditation" },
      { code: "tai_chi", fa: "تای‌چی", en: "Tai chi" },
    ],
  },
  {
    code: "gymnastics_dance",
    fa: "ژیمناستیک و حرکات نمایشی",
    en: "Gymnastics and dance",
    icon: "gymnastics",
    sports: [
      { code: "gymnastics", fa: "ژیمناستیک", en: "Gymnastics" },
      { code: "parkour", fa: "پارکور", en: "Parkour" },
      { code: "dance_fitness", fa: "رقص ورزشی", en: "Dance fitness" },
      { code: "zumba", fa: "زومبا", en: "Zumba" },
    ],
  },
  {
    code: "endurance_athletics",
    fa: "هوازی و استقامتی",
    en: "Endurance and athletics",
    icon: "endurance",
    sports: [
      { code: "running", fa: "دویدن", en: "Running" },
      { code: "athletics", fa: "دوومیدانی", en: "Athletics" },
      { code: "cycling", fa: "دوچرخه‌سواری", en: "Cycling" },
      { code: "spinning", fa: "اسپینینگ", en: "Spinning" },
      { code: "triathlon", fa: "سه‌گانه", en: "Triathlon" },
    ],
  },
  {
    code: "outdoor_adventure",
    fa: "طبیعت و ماجراجویی",
    en: "Outdoor and adventure",
    icon: "outdoor",
    sports: [
      { code: "mountaineering", fa: "کوهنوردی", en: "Mountaineering" },
      { code: "rock_climbing", fa: "صخره‌نوردی", en: "Rock climbing" },
      { code: "hiking", fa: "طبیعت‌گردی", en: "Hiking" },
      { code: "archery", fa: "تیراندازی با کمان", en: "Archery" },
      { code: "horse_riding", fa: "سوارکاری", en: "Horse riding" },
    ],
  },
  {
    code: "winter_sports",
    fa: "ورزش‌های زمستانی",
    en: "Winter sports",
    icon: "winter",
    sports: [
      { code: "skiing", fa: "اسکی", en: "Skiing" },
      { code: "snowboarding", fa: "اسنوبرد", en: "Snowboarding" },
      { code: "ice_skating", fa: "اسکیت روی یخ", en: "Ice skating" },
      { code: "ice_hockey", fa: "هاکی روی یخ", en: "Ice hockey" },
    ],
  },
];

const connection = await connectDatabase(uri);
const models = registerModels(connection);
for (const code of permissions) {
  const [module, resource = "all", action = "manage"] =
    code === "*" ? ["admin", "all", "manage"] : code.split(".");
  await models.Permission.updateOne(
    { code },
    {
      $setOnInsert: {
        code,
        module,
        resource,
        action,
        riskLevel: code.startsWith("admin.") || code === "*" ? "critical" : "normal",
        status: "active",
      },
    },
    { upsert: true },
  );
}
for (const role of roles) {
  await models.Role.updateOne(
    { code: role.code },
    {
      $set: {
        name: role.name,
        type: role.type,
        scopeType: role.scopeType,
        system: true,
        status: "active",
        permissions: role.permissionCodes.map((code) => ({ code, effect: "allow" })),
      },
    },
    { upsert: true },
  );
}
for (const [code, module, storageCollection, faLabel] of entities) {
  await models.EntityTypeDefinition.updateOne(
    { code },
    {
      $setOnInsert: {
        code,
        module,
        storageCollection,
        labels: { "fa-IR": faLabel, en: code },
        schemaVersion: 1,
        status: "active",
      },
    },
    { upsert: true },
  );
}
for (const [code, faLabel, hierarchical] of taxonomies) {
  await models.Taxonomy.updateOne(
    { code },
    {
      $setOnInsert: {
        code,
        labels: { "fa-IR": faLabel, en: code },
        hierarchical,
        status: "active",
      },
    },
    { upsert: true },
  );
}

const sportsTaxonomy = await models.Taxonomy.findOne({ code: "sports" });
if (!sportsTaxonomy) throw new Error("Sports taxonomy was not created");

for (const [categoryIndex, category] of sportCatalog.entries()) {
  const categoryTerm = await models.TaxonomyTerm.findOneAndUpdate(
    { taxonomyId: sportsTaxonomy._id, code: category.code },
    {
      $set: {
        parentId: null,
        labels: { "fa-IR": category.fa, fa: category.fa, en: category.en },
        path: [category.code],
        displayOrder: categoryIndex,
        customData: { level: "category", icon: category.icon },
        status: "active",
      },
    },
    { upsert: true, returnDocument: "after" },
  );

  for (const [sportIndex, sport] of category.sports.entries()) {
    const sportTerm = await models.TaxonomyTerm.findOneAndUpdate(
      { taxonomyId: sportsTaxonomy._id, code: sport.code },
      {
        $set: {
          parentId: categoryTerm._id,
          labels: { "fa-IR": sport.fa, fa: sport.fa, en: sport.en },
          path: [category.code, sport.code],
          displayOrder: sportIndex,
          customData: { level: "sport" },
          status: "active",
        },
      },
      { upsert: true, returnDocument: "after" },
    );

    for (const [branchIndex, branch] of (sport.branches ?? []).entries()) {
      await models.TaxonomyTerm.findOneAndUpdate(
        { taxonomyId: sportsTaxonomy._id, code: branch.code },
        {
          $set: {
            parentId: sportTerm._id,
            labels: { "fa-IR": branch.fa, fa: branch.fa, en: branch.en },
            path: [category.code, sport.code, branch.code],
            displayOrder: branchIndex,
            customData: { level: "branch" },
            status: "active",
          },
        },
        { upsert: true, returnDocument: "after" },
      );
    }
  }
}
await disconnectDatabase();
