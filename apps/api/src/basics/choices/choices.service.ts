import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { Request } from 'express';
import { AuditService } from '../../audit/audit.service';
import { AuditAction } from '../../common/enums';
import { asSinglePageResult } from '../../common/utils/pagination.util';
import {
  ChoiceGroup,
  ChoiceGroupDocument,
  ChoiceOption,
} from '../../schemas/choice-group.schema';
import { DEFAULT_CHOICE_GROUPS } from './choice-defaults';
import { CreateChoiceGroupDto, UpdateChoiceGroupDto } from './dto/choices.dto';

@Injectable()
export class ChoicesService {
  constructor(
    @InjectModel(ChoiceGroup.name)
    private readonly choiceModel: Model<ChoiceGroupDocument>,
    private readonly audit: AuditService,
  ) {}

  async listPublic() {
    const items = await this.choiceModel
      .find({ isActive: true })
      .sort({ key: 1 })
      .lean();
    return asSinglePageResult(
      items.map((g) => this.toPublic(g, /* activeOptionsOnly */ true)),
    );
  }

  async getPublic(key: string) {
    const group = await this.choiceModel
      .findOne({ key, isActive: true })
      .lean();
    if (!group) throw new NotFoundException('Choice group not found');
    return this.toPublic(group, true);
  }

  async listUnitGroups() {
    const items = await this.choiceModel
      .find({ isActive: true, key: /_unit$/ })
      .sort({ key: 1 })
      .lean();
    return items.map((group) => this.toPublic(group, true));
  }

  async listAdmin() {
    const items = await this.choiceModel.find().sort({ key: 1 });
    return asSinglePageResult(items.map((g) => this.toPublic(g, false)));
  }

  async create(dto: CreateChoiceGroupDto, adminId: string, request: Request) {
    const exists = await this.choiceModel.exists({ key: dto.key });
    if (exists) throw new ConflictException('Choice key already exists');

    this.assertUniqueOptionValues(dto.options);

    const group = await this.choiceModel.create({
      key: dto.key,
      name: dto.name,
      description: dto.description,
      isSystem: false,
      options: this.normalizeOptions(dto.options),
      isActive: dto.isActive ?? true,
    });

    this.audit.log({
      action: AuditAction.CHOICE_CREATED,
      actorId: adminId,
      metadata: { key: group.key },
      request,
    });

    return this.toPublic(group, false);
  }

  async update(
    key: string,
    dto: UpdateChoiceGroupDto,
    adminId: string,
    request: Request,
  ) {
    const group = await this.choiceModel.findOne({ key });
    if (!group) throw new NotFoundException('Choice group not found');

    if (dto.name !== undefined) group.name = dto.name;
    if (dto.description !== undefined) group.description = dto.description;
    if (dto.isActive !== undefined) group.isActive = dto.isActive;

    if (dto.options) {
      this.assertUniqueOptionValues(dto.options);
      if (group.isSystem) {
        // System option values are locked — only labels/order/isActive may change.
        const existingValues = new Set(group.options.map((o) => o.value));
        const incomingValues = new Set(dto.options.map((o) => o.value));
        if (
          existingValues.size !== incomingValues.size ||
          [...existingValues].some((v) => !incomingValues.has(v))
        ) {
          throw new BadRequestException(
            'Cannot add/remove option values on a system choice group',
          );
        }
      }
      group.options = this.normalizeOptions(dto.options);
    }

    await group.save();

    this.audit.log({
      action: AuditAction.CHOICE_UPDATED,
      actorId: adminId,
      metadata: { key: group.key },
      request,
    });

    return this.toPublic(group, false);
  }

  async remove(key: string, adminId: string, request: Request) {
    const group = await this.choiceModel.findOne({ key });
    if (!group) throw new NotFoundException('Choice group not found');
    if (group.isSystem) {
      throw new BadRequestException('Cannot delete a system choice group');
    }

    await group.deleteOne();

    this.audit.log({
      action: AuditAction.CHOICE_DELETED,
      actorId: adminId,
      metadata: { key },
      request,
    });

    return { success: true };
  }

  /**
   * Idempotent: create missing default groups, lock system flags, and
   * append any missing default option values without overwriting labels.
   */
  async seedDefaults(adminId?: string, request?: Request) {
    const created: string[] = [];
    const updated: string[] = [];
    const skipped: string[] = [];

    for (const seed of DEFAULT_CHOICE_GROUPS) {
      const existing = await this.choiceModel.findOne({ key: seed.key });
      if (!existing) {
        await this.choiceModel.create({
          key: seed.key,
          name: seed.name,
          description: seed.description,
          isSystem: seed.isSystem,
          options: this.normalizeOptions(seed.options),
          isActive: true,
        });
        created.push(seed.key);
        continue;
      }

      let changed = false;
      if (seed.isSystem && !existing.isSystem) {
        existing.isSystem = true;
        changed = true;
      }

      const existingValues = new Set(existing.options.map((option) => option.value));
      const missing = seed.options.filter(
        (option) => !existingValues.has(option.value),
      );
      if (missing.length > 0) {
        existing.options = [
          ...existing.options,
          ...this.normalizeOptions(missing),
        ];
        changed = true;
      }

      if (!changed) {
        skipped.push(seed.key);
        continue;
      }

      await existing.save();
      updated.push(seed.key);
    }

    if (adminId && request) {
      this.audit.log({
        action: AuditAction.CHOICE_DEFAULTS_SEEDED,
        actorId: adminId,
        metadata: { created, updated, skipped },
        request,
      });
    }

    return { created, updated, skipped };
  }

  /** Used by the seed script — upserts without overwriting admin edits to names. */
  async upsertSeed(dto: CreateChoiceGroupDto) {
    const existing = await this.choiceModel.findOne({ key: dto.key });
    if (existing) return existing;
    return this.choiceModel.create({
      key: dto.key,
      name: dto.name,
      description: dto.description,
      isSystem: dto.isSystem ?? false,
      options: this.normalizeOptions(dto.options),
      isActive: true,
    });
  }

  private normalizeOptions(
    options: {
      value: string;
      name: string;
      description?: string;
      order?: number;
      isActive?: boolean;
    }[],
  ): ChoiceOption[] {
    return options.map((o, i) => ({
      value: o.value,
      name: o.name,
      ...(o.description?.trim()
        ? { description: o.description.trim() }
        : {}),
      order: o.order ?? i,
      isActive: o.isActive ?? true,
    }));
  }

  private assertUniqueOptionValues(options: { value: string }[]): void {
    const values = options.map((o) => o.value);
    if (new Set(values).size !== values.length) {
      throw new BadRequestException('Option values must be unique');
    }
  }

  private toPublic(
    group: ChoiceGroup & { _id?: unknown },
    activeOptionsOnly: boolean,
  ) {
    const includeInactiveOptions =
      !activeOptionsOnly || group.key.endsWith('_unit');
    const options = (group.options ?? [])
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .filter((o) => includeInactiveOptions || o.isActive !== false)
      .map((o) => ({
        name: o.name,
        value: o.value,
        description: o.description ?? null,
        isActive: o.isActive !== false,
        ...(activeOptionsOnly ? {} : { order: o.order }),
      }));

    return {
      name: group.name,
      value: group.key,
      description: group.description ?? null,
      isSystem: group.isSystem,
      options,
      ...(activeOptionsOnly ? {} : { isActive: group.isActive }),
    };
  }
}
