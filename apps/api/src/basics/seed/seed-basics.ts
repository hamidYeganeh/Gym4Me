/**
 * Idempotent seed for choices, Iran locations, sports tree, common refs,
 * and a default platform admin.
 * Run: npm run db:seed -w api
 */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { Role } from '../../common/enums';
import { normalizeIranPhone } from '../../common/utils/phone.util';
import { UsersService } from '../../users/users.service';
import { ChoicesService } from '../choices/choices.service';
import { LocationService } from '../location/location.service';
import { RefService } from '../ref/ref.service';
import { SportService } from '../sport/sport.service';
import { GamificationService } from '../../gamification/gamification.service';

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
  const gamification = app.get(GamificationService);
  const users = app.get(UsersService);

  const choiceSeed = await choices.seedDefaults();
  log.log(
    `choices: created=${choiceSeed.created.length} updated=${choiceSeed.updated.length} skipped=${choiceSeed.skipped.length}`,
  );

  const locationSeed = await locations.seedDefaults();
  log.log(
    `locations: created=${locationSeed.created.length} updated=${locationSeed.updated.length} skipped=${locationSeed.skipped.length}`,
  );

  const sportSeed = await sports.seedDefaults();
  log.log(
    `sports: created=${sportSeed.created.length} updated=${sportSeed.updated.length} skipped=${sportSeed.skipped.length}`,
  );

  const refSeed = await refs.seedDefaults();
  log.log(
    `refs: created=${refSeed.created.length} updated=${refSeed.updated.length} skipped=${refSeed.skipped.length}`,
  );

  const achievementSeed = await gamification.adminSeedAchievementDefaults();
  log.log(
    `achievements: created=${achievementSeed.created.length} updated=${achievementSeed.updated.length} skipped=${achievementSeed.skipped.length}`,
  );

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
