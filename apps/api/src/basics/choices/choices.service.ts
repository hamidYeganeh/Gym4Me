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
import {
  ChoiceGroup,
  ChoiceGroupDocument,
  ChoiceOption,
} from '../../schemas/choice-group.schema';
import {
  CreateChoiceGroupDto,
  UpdateChoiceGroupDto,
} from './dto/choices.dto';

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
    return {
      items: items.map((g) => this.toPublic(g, /* activeOptionsOnly */ true)),
    };
  }

  async getPublic(key: string) {
    const group = await this.choiceModel.findOne({ key, isActive: true }).lean();
    if (!group) throw new NotFoundException('Choice group not found');
    return this.toPublic(group, true);
  }

  async listAdmin() {
    const items = await this.choiceModel.find().sort({ key: 1 });
    return { items: items.map((g) => this.toPublic(g, false)) };
  }

  async create(dto: CreateChoiceGroupDto, adminId: string, request: Request) {
    const exists = await this.choiceModel.exists({ key: dto.key });
    if (exists) throw new ConflictException('Choice key already exists');

    this.assertUniqueOptionValues(dto.options);

    const group = await this.choiceModel.create({
      key: dto.key,
      name: dto.name,
      description: dto.description,
      isSystem: dto.isSystem ?? false,
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
    options: { value: string; name: string; order?: number; isActive?: boolean }[],
  ): ChoiceOption[] {
    return options.map((o, i) => ({
      value: o.value,
      name: o.name,
      order: o.order ?? i,
      isActive: o.isActive ?? true,
    }));
  }

  private assertUniqueOptionValues(
    options: { value: string }[],
  ): void {
    const values = options.map((o) => o.value);
    if (new Set(values).size !== values.length) {
      throw new BadRequestException('Option values must be unique');
    }
  }

  private toPublic(
    group: ChoiceGroup & { _id?: unknown },
    activeOptionsOnly: boolean,
  ) {
    const options = (group.options ?? [])
      .filter((o) => (activeOptionsOnly ? o.isActive !== false : true))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((o) => ({
        name: o.name,
        value: o.value,
        ...(activeOptionsOnly
          ? {}
          : { order: o.order, isActive: o.isActive }),
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
