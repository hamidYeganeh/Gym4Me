import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../common/enums';
import {
  FeatureFlag,
  FeatureFlagDocument,
} from '../schemas/feature-flag.schema';
import {
  MobileReleasePolicy,
  MobileReleasePolicyDocument,
} from '../schemas/mobile-release-policy.schema';
import {
  MobileBootstrapQueryDto,
  UpsertFeatureFlagDto,
  UpsertReleasePolicyDto,
} from './dto/app-config.dto';
import { compareAppVersions, rolloutBucket } from './version.util';

const DEFAULT_FLAGS = [
  ['athlete.self_tracking', 'ثبت دستی آب، خواب، پیاده‌روی و وزن'],
  ['athlete.personal_records', 'ثبت رکوردهای شخصی ورزشی'],
  ['athlete.workout_logging', 'ثبت اجرای جلسه تمرینی'],
  ['health.device_sync', 'همگام‌سازی Apple Health و Health Connect'],
] as const;

@Injectable()
export class AppConfigService {
  constructor(
    @InjectModel(FeatureFlag.name)
    private readonly featureFlagModel: Model<FeatureFlagDocument>,
    @InjectModel(MobileReleasePolicy.name)
    private readonly releasePolicyModel: Model<MobileReleasePolicyDocument>,
    private readonly audit: AuditService,
  ) {}

  async bootstrap(query: MobileBootstrapQueryDto) {
    await this.ensureDefaultFlags();
    const channel = query.channel ?? 'production';
    const [flags, policy] = await Promise.all([
      this.featureFlagModel
        .find({
          enabled: true,
          platforms: query.platform,
          channels: channel,
        })
        .sort({ key: 1 })
        .lean(),
      this.releasePolicyModel
        .findOne({ platform: query.platform, channel, enabled: true })
        .lean(),
    ]);

    const features = Object.fromEntries(
      flags.map((flag) => {
        const withinMinimum =
          !flag.minimumAppVersion ||
          compareAppVersions(query.appVersion, flag.minimumAppVersion) >= 0;
        const withinMaximum =
          !flag.maximumAppVersion ||
          compareAppVersions(query.appVersion, flag.maximumAppVersion) <= 0;
        const inRollout = this.isInRollout(
          flag.key,
          flag.rolloutPercentage,
          query.installationId,
        );
        return [
          flag.key,
          {
            enabled: withinMinimum && withinMaximum && inRollout,
            payload: flag.payload ?? {},
          },
        ];
      }),
    );

    const latestVersion = policy?.latestAppVersion ?? query.appVersion;
    const minimumVersion =
      policy?.minimumSupportedAppVersion ?? query.appVersion;
    const updateRequired =
      compareAppVersions(query.appVersion, minimumVersion) < 0;
    const updateAvailable =
      compareAppVersions(query.appVersion, latestVersion) < 0;

    return {
      schemaVersion: 1,
      serverTime: new Date().toISOString(),
      cacheTtlSeconds: 300,
      api: {
        currentVersion: '1',
        recommendedVersion: policy?.recommendedApiVersion ?? '1',
      },
      compatibility: {
        supported: !updateRequired,
        updateRequired,
        updateAvailable,
        minimumAppVersion: minimumVersion,
        latestAppVersion: latestVersion,
        updateUrl: policy?.updateUrl ?? null,
      },
      features,
    };
  }

  async listFeatureFlags() {
    await this.ensureDefaultFlags();
    return this.featureFlagModel.find().sort({ key: 1 }).lean();
  }

  async upsertFeatureFlag(
    key: string,
    dto: UpsertFeatureFlagDto,
    adminId: string,
  ) {
    const item = await this.featureFlagModel.findOneAndUpdate(
      { key },
      {
        $set: {
          ...dto,
          minimumAppVersion: dto.minimumAppVersion || undefined,
          maximumAppVersion: dto.maximumAppVersion || undefined,
          description: dto.description?.trim() || undefined,
          payload: dto.payload ?? {},
        },
        $setOnInsert: { key },
      },
      { upsert: true, new: true, runValidators: true },
    );
    this.audit.log({
      action: AuditAction.APP_CONFIG_UPDATED,
      actorId: adminId,
      metadata: { kind: 'feature_flag', key },
    });
    return item.toObject();
  }

  listReleasePolicies() {
    return this.releasePolicyModel.find().sort({ platform: 1, channel: 1 }).lean();
  }

  async upsertReleasePolicy(dto: UpsertReleasePolicyDto, adminId: string) {
    const channel = dto.channel ?? 'production';
    const item = await this.releasePolicyModel.findOneAndUpdate(
      { platform: dto.platform, channel },
      {
        $set: {
          ...dto,
          channel,
          updateUrl: dto.updateUrl?.trim() || undefined,
        },
      },
      { upsert: true, new: true, runValidators: true },
    );
    this.audit.log({
      action: AuditAction.APP_CONFIG_UPDATED,
      actorId: adminId,
      metadata: {
        kind: 'release_policy',
        platform: dto.platform,
        channel,
      },
    });
    return item.toObject();
  }

  private isInRollout(
    key: string,
    percentage: number,
    installationId?: string,
  ) {
    if (percentage >= 100) return true;
    if (percentage <= 0 || !installationId) return false;
    return rolloutBucket(`${key}:${installationId}`) < percentage;
  }

  private async ensureDefaultFlags() {
    await this.featureFlagModel.bulkWrite(
      DEFAULT_FLAGS.map(([key, description]) => ({
        updateOne: {
          filter: { key },
          update: {
            $setOnInsert: {
              key,
              description,
              enabled: key !== 'health.device_sync',
              rolloutPercentage: 100,
              platforms: ['ios', 'android', 'web'],
              channels: ['production', 'beta', 'development'],
              payload: {},
            },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );
  }
}

