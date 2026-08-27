import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../common/enums';
import {
  FeatureFlag,
  FeatureFlagDocument,
  FeatureFlagRule,
  type AppPlatform,
  type FeatureFlagStatus,
  type ReleaseChannel,
} from '../schemas/feature-flag.schema';
import {
  MobileReleasePolicy,
  MobileReleasePolicyDocument,
} from '../schemas/mobile-release-policy.schema';
import {
  MobileBootstrapQueryDto,
  UpsertFeatureFlagDto,
  UpsertReleasePolicyDto,
  ListAppConfigQueryDto,
} from './dto/app-config.dto';
import { normalizeReleaseNotes } from './release-notes.util';
import { compareAppVersions, rolloutBucket } from './version.util';
import {
  paginatedResult,
  resolvePageSize,
} from '../common/utils/pagination.util';
import { createSearchFilter } from '../common/utils/list-query.util';

const DEFAULT_FLAGS = [
  ['athlete.self_tracking', 'ثبت دستی آب، خواب، پیاده‌روی و وزن'],
  ['athlete.personal_records', 'ثبت رکوردهای شخصی ورزشی'],
  ['athlete.workout_logging', 'ثبت اجرای جلسه تمرینی'],
  ['health.device_sync', 'همگام‌سازی Apple Health و Health Connect'],
] as const;

function toIso(value?: Date | string | null): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value.toISOString();
}

type LeanFeatureFlag = {
  _id: { toString(): string };
  key: string;
  status?: FeatureFlagStatus;
  enabled?: boolean;
  rolloutPercentage: number;
  platforms: AppPlatform[];
  channels: ReleaseChannel[];
  minimumAppVersion?: string;
  maximumAppVersion?: string;
  rules?: FeatureFlagRule[];
  defaultVariant?: string;
  payload?: Record<string, unknown>;
  description?: string;
  exposureEndsAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

type LeanReleasePolicy = {
  _id: { toString(): string };
  platform: AppPlatform;
  channel: ReleaseChannel;
  latestAppVersion: string;
  minimumSupportedAppVersion: string;
  recommendedApiVersion: string;
  updateUrl?: string;
  releaseNotes?: { title: string; features: string[] };
  enabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

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
    const now = new Date();
    const [flags, policy] = await Promise.all([
      this.featureFlagModel
        .find({
          $or: [
            { status: 'active' },
            { status: { $exists: false }, enabled: true },
          ],
          platforms: query.platform,
          channels: channel,
          $and: [
            {
              $or: [
                { exposureEndsAt: { $exists: false } },
                { exposureEndsAt: null },
                { exposureEndsAt: { $gt: now } },
              ],
            },
          ],
        })
        .sort({ key: 1 })
        .lean<LeanFeatureFlag[]>(),
      this.releasePolicyModel
        .findOne({ platform: query.platform, channel, enabled: true })
        .lean<LeanReleasePolicy | null>(),
    ]);

    const features = Object.fromEntries(
      flags.map((flag) => {
        const resolved = this.resolveFlagEvaluation(flag, query, channel);
        return [
          flag.key,
          {
            enabled: resolved.enabled,
            variant: resolved.variant,
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
    const releaseNotes = normalizeReleaseNotes(policy?.releaseNotes);

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
        releaseNotes,
      },
      features,
    };
  }

  async listFeatureFlags(query: ListAppConfigQueryDto = {}) {
    await this.ensureDefaultFlags();
    const { page, pageSize } = resolvePageSize(query);
    const filter = {
      ...createSearchFilter(query.search, ['key', 'description']),
    };
    const [items, count] = await Promise.all([
      this.featureFlagModel
        .find(filter)
        .sort({ key: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean<LeanFeatureFlag[]>(),
      this.featureFlagModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.serializeFeatureFlag(item)),
      count,
      page,
      pageSize,
    );
  }

  async upsertFeatureFlag(
    key: string,
    dto: UpsertFeatureFlagDto,
    adminId: string,
  ) {
    const before = await this.featureFlagModel
      .findOne({ key })
      .lean<LeanFeatureFlag | null>();
    const { reason, exposureEndsAt, ...fields } = dto;
    const item = await this.featureFlagModel.findOneAndUpdate(
      { key },
      {
        $set: {
          ...fields,
          minimumAppVersion: fields.minimumAppVersion || undefined,
          maximumAppVersion: fields.maximumAppVersion || undefined,
          description: fields.description?.trim() || undefined,
          defaultVariant: fields.defaultVariant?.trim() || undefined,
          rules: fields.rules ?? [],
          payload: fields.payload ?? {},
          exposureEndsAt: exposureEndsAt ? new Date(exposureEndsAt) : undefined,
        },
        $unset: {
          enabled: 1,
          ...(exposureEndsAt ? {} : { exposureEndsAt: 1 }),
        },
        $setOnInsert: { key },
      },
      { upsert: true, returnDocument: 'after', runValidators: true },
    );
    const after = item.toObject() as LeanFeatureFlag;
    this.audit.log({
      action: AuditAction.APP_CONFIG_UPDATED,
      actorId: adminId,
      metadata: {
        kind: 'feature_flag',
        key,
        reason: reason.trim(),
        before: before ? this.serializeFeatureFlag(before) : null,
        after: this.serializeFeatureFlag(after),
      },
    });
    return this.serializeFeatureFlag(after);
  }

  async listReleasePolicies(query: ListAppConfigQueryDto = {}) {
    const { page, pageSize } = resolvePageSize(query);
    const filter = {
      ...createSearchFilter(query.search, [
        'platform',
        'channel',
        'latestAppVersion',
      ]),
    };
    const [items, count] = await Promise.all([
      this.releasePolicyModel
        .find(filter)
        .sort({ platform: 1, channel: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean<LeanReleasePolicy[]>(),
      this.releasePolicyModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.serializeReleasePolicy(item)),
      count,
      page,
      pageSize,
    );
  }

  async upsertReleasePolicy(dto: UpsertReleasePolicyDto, adminId: string) {
    const channel = dto.channel ?? 'production';
    const before = await this.releasePolicyModel
      .findOne({ platform: dto.platform, channel })
      .lean<LeanReleasePolicy | null>();
    const { reason, releaseNotes: releaseNotesInput, ...fields } = dto;
    const releaseNotes = normalizeReleaseNotes(releaseNotesInput);
    const item = await this.releasePolicyModel.findOneAndUpdate(
      { platform: dto.platform, channel },
      {
        $set: {
          ...fields,
          channel,
          updateUrl: fields.updateUrl?.trim() || undefined,
          ...(releaseNotes ? { releaseNotes } : {}),
        },
        ...(releaseNotes ? {} : { $unset: { releaseNotes: 1 } }),
      },
      { upsert: true, returnDocument: 'after', runValidators: true },
    );
    const after = item.toObject() as LeanReleasePolicy;
    this.audit.log({
      action: AuditAction.APP_CONFIG_UPDATED,
      actorId: adminId,
      metadata: {
        kind: 'release_policy',
        platform: dto.platform,
        channel,
        reason: reason.trim(),
        before: before ? this.serializeReleasePolicy(before) : null,
        after: this.serializeReleasePolicy(after),
      },
    });
    return this.serializeReleasePolicy(after);
  }

  async archiveExpiredFeatureFlags(adminId: string, reason: string) {
    const now = new Date();
    const expired = await this.featureFlagModel
      .find({
        status: 'active',
        exposureEndsAt: { $lte: now },
      })
      .lean<LeanFeatureFlag[]>();
    if (expired.length === 0) {
      return { archived: 0, keys: [] as string[] };
    }
    const keys = expired.map((flag) => flag.key);
    await this.featureFlagModel.updateMany(
      { key: { $in: keys } },
      { $set: { status: 'archived' } },
    );
    this.audit.log({
      action: AuditAction.APP_CONFIG_UPDATED,
      actorId: adminId,
      metadata: {
        kind: 'feature_flag_cleanup',
        keys,
        reason: reason.trim(),
        exposureEndsAtBefore: now.toISOString(),
      },
    });
    return { archived: keys.length, keys };
  }

  private resolveFlagEvaluation(
    flag: LeanFeatureFlag,
    query: MobileBootstrapQueryDto,
    channel: ReleaseChannel,
  ) {
    const matchingRule = (flag.rules ?? []).find((rule) => {
      if (!rule.platforms.includes(query.platform)) return false;
      if (!rule.channels.includes(channel)) return false;
      const withinMinimum =
        !rule.minAppVersion ||
        compareAppVersions(query.appVersion, rule.minAppVersion) >= 0;
      const withinMaximum =
        !rule.maxAppVersion ||
        compareAppVersions(query.appVersion, rule.maxAppVersion) <= 0;
      return withinMinimum && withinMaximum;
    });

    const minimumAppVersion =
      matchingRule?.minAppVersion ?? flag.minimumAppVersion;
    const maximumAppVersion =
      matchingRule?.maxAppVersion ?? flag.maximumAppVersion;
    const rolloutPercentage =
      matchingRule?.rolloutPercentage ?? flag.rolloutPercentage;
    const variant = matchingRule?.variant ?? flag.defaultVariant ?? 'on';

    const withinMinimum =
      !minimumAppVersion ||
      compareAppVersions(query.appVersion, minimumAppVersion) >= 0;
    const withinMaximum =
      !maximumAppVersion ||
      compareAppVersions(query.appVersion, maximumAppVersion) <= 0;
    const inRollout = this.isInRollout(
      flag.key,
      rolloutPercentage,
      query.installationId,
    );
    const enabled =
      withinMinimum && withinMaximum && inRollout && variant !== 'off';

    return { enabled, variant };
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

  private serializeFeatureFlag(item: LeanFeatureFlag) {
    const status =
      item.status ??
      (item.enabled === true
        ? 'active'
        : item.enabled === false
          ? 'paused'
          : 'draft');
    return {
      id: item._id.toString(),
      key: item.key,
      status,
      rolloutPercentage: item.rolloutPercentage,
      platforms: item.platforms,
      channels: item.channels,
      minimumAppVersion: item.minimumAppVersion ?? null,
      maximumAppVersion: item.maximumAppVersion ?? null,
      rules: (item.rules ?? []).map((rule) => ({
        platforms: rule.platforms,
        channels: rule.channels,
        minAppVersion: rule.minAppVersion ?? null,
        maxAppVersion: rule.maxAppVersion ?? null,
        rolloutPercentage: rule.rolloutPercentage,
        variant: rule.variant,
      })),
      defaultVariant: item.defaultVariant ?? null,
      payload: item.payload ?? {},
      description: item.description ?? null,
      exposureEndsAt: toIso(item.exposureEndsAt),
      createdAt: toIso(item.createdAt),
      updatedAt: toIso(item.updatedAt),
    };
  }

  private serializeReleasePolicy(item: LeanReleasePolicy) {
    return {
      id: item._id.toString(),
      platform: item.platform,
      channel: item.channel,
      latestAppVersion: item.latestAppVersion,
      minimumSupportedAppVersion: item.minimumSupportedAppVersion,
      recommendedApiVersion: item.recommendedApiVersion,
      updateUrl: item.updateUrl ?? null,
      releaseNotes: normalizeReleaseNotes(item.releaseNotes),
      enabled: item.enabled,
      createdAt: toIso(item.createdAt),
      updatedAt: toIso(item.updatedAt),
    };
  }

  private async ensureDefaultFlags() {
    await Promise.all([
      this.featureFlagModel.updateMany(
        { status: { $exists: false }, enabled: true },
        { $set: { status: 'active' }, $unset: { enabled: 1 } },
      ),
      this.featureFlagModel.updateMany(
        { status: { $exists: false }, enabled: false },
        { $set: { status: 'paused' }, $unset: { enabled: 1 } },
      ),
      this.featureFlagModel.updateMany(
        { status: { $exists: false } },
        { $set: { status: 'draft' }, $unset: { enabled: 1 } },
      ),
    ]);

    await this.featureFlagModel.bulkWrite(
      DEFAULT_FLAGS.map(([key, description]) => ({
        updateOne: {
          filter: { key },
          update: {
            $setOnInsert: {
              key,
              description,
              status:
                key === 'health.device_sync'
                  ? ('paused' as const)
                  : ('active' as const),
              rolloutPercentage: 100,
              platforms: ['ios', 'android', 'web'] as AppPlatform[],
              channels: [
                'production',
                'beta',
                'development',
              ] as ReleaseChannel[],
              rules: [],
              defaultVariant: 'on',
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
