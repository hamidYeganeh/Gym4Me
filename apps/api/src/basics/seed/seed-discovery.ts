/**
 * Idempotent seed/migration for typed discovery pages.
 * Existing admin sections are preserved and missing defaults are appended once.
 *
 * Run:
 *   npm run db:seed:discovery -w api
 */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppModule } from '../../app.module';
import { Role } from '../../common/enums';
import { normalizeIranPhone } from '../../common/utils/phone.util';
import { DISCOVERY_SCHEMA_VERSION } from '../../discovery/discovery.constants';
import {
  appendMissingDiscoverySeedSections,
  DISCOVERY_SEED_PAGE_KEYS,
  DISCOVERY_SEED_PAGES,
} from '../../discovery/discovery.seed-pages';
import type { DiscoverySectionDefinition } from '../../discovery/discovery.types';
import {
  DiscoveryPage,
  type DiscoveryPageDocument,
  DiscoveryPageRevision,
  type DiscoveryPageRevisionDocument,
} from '../../schemas/discovery-page.schema';
import { UsersService } from '../../users/users.service';

const SEED_ADMIN_PHONE = '09121111111';

function cloneSections(pageKey: (typeof DISCOVERY_SEED_PAGE_KEYS)[number]) {
  return JSON.parse(
    JSON.stringify(DISCOVERY_SEED_PAGES[pageKey]),
  ) as DiscoverySectionDefinition[];
}

function plainSections(value: unknown): DiscoverySectionDefinition[] {
  return JSON.parse(
    JSON.stringify(value ?? []),
  ) as DiscoverySectionDefinition[];
}

async function seed() {
  const nodeEnv = (process.env.NODE_ENV ?? 'development').toLowerCase();
  if (nodeEnv === 'production' && process.env.ALLOW_DISCOVERY_SEED !== 'true') {
    throw new Error(
      'Refusing discovery seed in production without ALLOW_DISCOVERY_SEED=true',
    );
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const log = new Logger('SeedDiscovery');

  try {
    const users = app.get(UsersService);
    const pageModel = app.get<Model<DiscoveryPageDocument>>(
      getModelToken(DiscoveryPage.name),
    );
    const revisionModel = app.get<Model<DiscoveryPageRevisionDocument>>(
      getModelToken(DiscoveryPageRevision.name),
    );

    const admin = await users.findByPhone(normalizeIranPhone(SEED_ADMIN_PHONE));
    if (!admin?.roles.includes(Role.ADMIN)) {
      throw new Error(
        `Seed admin ${SEED_ADMIN_PHONE} is missing; run db:seed first`,
      );
    }

    let created = 0;
    let migrated = 0;
    let skipped = 0;

    for (const pageKey of DISCOVERY_SEED_PAGE_KEYS) {
      const existing = await pageModel.findOne({ pageKey });
      const hasContent = Boolean(
        existing &&
        (existing.publishedRevision > 0 ||
          existing.draftSections.length > 0 ||
          existing.publishedSections.length > 0),
      );
      if (
        existing &&
        hasContent &&
        Number(existing.schemaVersion) >= DISCOVERY_SCHEMA_VERSION
      ) {
        skipped += 1;
        log.log(`${pageKey}: skipped (seed migration already applied)`);
        continue;
      }

      const now = new Date();
      const seededSections = cloneSections(pageKey);
      const publishedBase = existing
        ? plainSections(existing.publishedSections)
        : [];
      const draftBase = existing?.draftSections.length
        ? plainSections(existing.draftSections)
        : publishedBase;
      const publishedSections = appendMissingDiscoverySeedSections(
        publishedBase,
        seededSections,
      );
      const draftSections = appendMissingDiscoverySeedSections(
        draftBase,
        seededSections,
      );
      const page =
        existing ??
        new pageModel({
          pageKey,
          draftSections: [],
          publishedSections: [],
          publishedRevision: 0,
        });
      page.schemaVersion = DISCOVERY_SCHEMA_VERSION;
      page.draftSections = plainSections(draftSections) as never;
      page.publishedSections = plainSections(publishedSections) as never;
      page.publishedRevision = existing
        ? Math.max(1, existing.publishedRevision + 1)
        : 1;
      page.publishedAt = now;
      page.updatedBy = new Types.ObjectId(admin._id);
      await page.save();

      await revisionModel.updateOne(
        { pageKey, revision: page.publishedRevision },
        {
          $setOnInsert: {
            pageKey,
            revision: page.publishedRevision,
            schemaVersion: DISCOVERY_SCHEMA_VERSION,
            sections: plainSections(publishedSections),
            publishedBy: new Types.ObjectId(admin._id),
            publishedAt: now,
          },
        },
        { upsert: true },
      );

      if (existing) {
        migrated += 1;
        log.log(
          `${pageKey}: migrated and published revision ${page.publishedRevision}`,
        );
      } else {
        created += 1;
        log.log(`${pageKey}: created and published revision 1`);
      }
    }

    log.log(
      `Discovery seed complete: created=${created} migrated=${migrated} skipped=${skipped}`,
    );
  } finally {
    await app.close();
  }
}

seed().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
