import { Inject, Injectable } from "@nestjs/common";
import { type DatabaseModels, objectIdFrom } from "../../database/index.js";
import { ApiError } from "../../common/api-error.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { AuditService } from "../audit/audit.service.js";
import { flattenPatch, toStorage } from "../organization/entity-mapper.js";

const configurationModels = {
  "entity-types": "EntityTypeDefinition",
  "field-groups": "FieldGroupDefinition",
  "field-definitions": "FieldDefinition",
  forms: "FormDefinition",
  taxonomies: "Taxonomy",
  "taxonomy-terms": "TaxonomyTerm",
  workflows: "WorkflowDefinition",
  "feature-flags": "FeatureFlag",
  "system-settings": "SystemSetting",
} as const;
export type ConfigurationResource = keyof typeof configurationModels;

@Injectable()
export class MetaService {
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    private readonly audit: AuditService,
  ) {}

  private model(resource: ConfigurationResource) {
    return this.models[configurationModels[resource]] as any;
  }

  async configurationList(resource: ConfigurationResource, query: any) {
    const filter: any = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.entity_type_id ? { entityTypeId: objectIdFrom(query.entity_type_id) } : {}),
      ...(query.taxonomy_id ? { taxonomyId: objectIdFrom(query.taxonomy_id) } : {}),
      ...(query.search
        ? {
            $or: [
              { code: { $regex: query.search, $options: "i" } },
              { "labels.fa": { $regex: query.search, $options: "i" } },
              { "labels.fa-IR": { $regex: query.search, $options: "i" } },
            ],
          }
        : {}),
    };
    const model = this.model(resource);
    const [items, total] = await Promise.all([
      model
        .find(filter)
        .sort({ displayOrder: 1, createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      model.countDocuments(filter),
    ]);
    return { items, total };
  }

  private normalizeConfiguration(resource: ConfigurationResource, body: Record<string, unknown>) {
    const mapped = toStorage(body) as Record<string, unknown>;
    const result = { ...mapped } as Record<string, unknown>;
    for (const key of ["entityTypeId", "fieldGroupId", "taxonomyId", "parentId"]) {
      if (typeof result[key] === "string") result[key] = objectIdFrom(result[key] as string);
    }
    for (const protectedKey of ["_id", "createdAt", "updatedAt", "createdBy", "updatedBy", "__v"])
      delete result[protectedKey];
    if (resource === "taxonomy-terms" && result.parentId) result.path ??= [];
    return result;
  }

  async createConfiguration(
    resource: ConfigurationResource,
    body: Record<string, unknown>,
    actor: string,
    requestId: string,
  ) {
    const model = this.model(resource);
    const data = this.normalizeConfiguration(resource, body);
    const item = await model.create({
      ...data,
      status: data.status ?? "active",
      createdBy: objectIdFrom(actor),
    });
    await this.audit.record({
      actorUserId: actor,
      action: `configuration.${resource}.created`,
      entityType: resource,
      entityId: String(item._id),
      after: item.toObject(),
      requestId,
    });
    return item.toObject();
  }

  async updateConfiguration(
    resource: ConfigurationResource,
    id: string,
    body: Record<string, unknown>,
    actor: string,
    requestId: string,
  ) {
    const model = this.model(resource);
    const before = await model.findById(id).lean();
    if (!before) throw new ApiError("CONFIGURATION_NOT_FOUND", "رکورد تنظیمات پیدا نشد.", 404);
    const patch = flattenPatch(this.normalizeConfiguration(resource, body));
    const item = await model
      .findByIdAndUpdate(
        id,
        {
          $set: { ...patch, updatedBy: objectIdFrom(actor) },
          ...(resource === "entity-types" ? { $inc: { schemaVersion: 1 } } : {}),
        },
        { returnDocument: "after", runValidators: true },
      )
      .lean();
    await this.audit.record({
      actorUserId: actor,
      action: `configuration.${resource}.updated`,
      entityType: resource,
      entityId: id,
      before,
      after: item,
      requestId,
    });
    return item;
  }

  async archiveConfiguration(
    resource: ConfigurationResource,
    id: string,
    actor: string,
    requestId: string,
  ) {
    const model = this.model(resource);
    const before = await model.findById(id).lean();
    if (!before) throw new ApiError("CONFIGURATION_NOT_FOUND", "رکورد تنظیمات پیدا نشد.", 404);
    const item = await model
      .findByIdAndUpdate(
        id,
        { $set: { status: "archived", updatedBy: objectIdFrom(actor) } },
        { returnDocument: "after" },
      )
      .lean();
    await this.audit.record({
      actorUserId: actor,
      action: `configuration.${resource}.archived`,
      entityType: resource,
      entityId: id,
      before,
      after: item,
      requestId,
    });
    return item;
  }
  async entitySchema(code: string) {
    const entity = (await this.models.EntityTypeDefinition.findOne({
      code,
      status: "active",
    }).lean()) as any;
    if (!entity) throw new ApiError("ENTITY_SCHEMA_NOT_FOUND", "Schema موردنظر پیدا نشد.", 404);
    const [groups, fields] = await Promise.all([
      this.models.FieldGroupDefinition.find({ entityTypeId: entity._id, status: "active" })
        .sort({ displayOrder: 1 })
        .lean(),
      this.models.FieldDefinition.find({ entityTypeId: entity._id, status: "active" })
        .sort({ "display.order": 1 })
        .lean(),
    ]);
    return { entity_type: entity.code, version: entity.schemaVersion, groups, fields };
  }
  async form(code: string) {
    const form = await this.models.FormDefinition.findOne({ code, status: "active" }).lean();
    if (!form) throw new ApiError("FORM_NOT_FOUND", "فرم موردنظر پیدا نشد.", 404);
    return form;
  }
  async taxonomy(code: string) {
    const taxonomy = (await this.models.Taxonomy.findOne({ code, status: "active" }).lean()) as any;
    if (!taxonomy) throw new ApiError("TAXONOMY_NOT_FOUND", "دسته‌بندی موردنظر پیدا نشد.", 404);
    const terms = await this.models.TaxonomyTerm.find({
      taxonomyId: taxonomy._id,
      status: "active",
    })
      .sort({ displayOrder: 1 })
      .lean();
    return { taxonomy, terms };
  }
  async sportCatalog(includeInactive = false) {
    const taxonomy = (await this.models.Taxonomy.findOne({
      code: "sports",
      status: "active",
    }).lean()) as any;
    if (!taxonomy) throw new ApiError("SPORT_CATALOG_NOT_FOUND", "فهرست ورزش‌ها پیدا نشد.", 404);
    const terms = (await this.models.TaxonomyTerm.find({
      taxonomyId: taxonomy._id,
      ...(includeInactive ? {} : { status: "active" }),
    })
      .sort({ displayOrder: 1, "labels.fa-IR": 1 })
      .lean()) as any[];
    const byParent = new Map<string, any[]>();
    for (const term of terms) {
      const key = term.parentId ? String(term.parentId) : "root";
      byParent.set(key, [...(byParent.get(key) ?? []), term]);
    }
    const present = (term: any) => ({
      id: String(term._id),
      code: term.code,
      label: term.labels?.["fa-IR"] ?? term.labels?.fa ?? term.code,
      labels: term.labels ?? {},
      icon: term.customData?.icon,
      level: term.customData?.level,
      display_order: term.displayOrder ?? 0,
      status: term.status,
    });
    const categories = (byParent.get("root") ?? [])
      .filter((term) => term.customData?.level === "category")
      .map((category) => ({
        ...present(category),
        sports: (byParent.get(String(category._id)) ?? [])
          .filter((term) => term.customData?.level === "sport")
          .map((sport) => ({
            ...present(sport),
            branches: (byParent.get(String(sport._id)) ?? [])
              .filter((term) => term.customData?.level === "branch")
              .map(present),
          })),
      }));
    return { categories, total_terms: terms.length };
  }
  async createSportTerm(body: any, userId: string) {
    const taxonomy = (await this.models.Taxonomy.findOne({
      code: "sports",
      status: "active",
    })) as any;
    if (!taxonomy) throw new ApiError("SPORT_CATALOG_NOT_FOUND", "فهرست ورزش‌ها پیدا نشد.", 404);
    const duplicate = await this.models.TaxonomyTerm.exists({
      taxonomyId: taxonomy._id,
      code: body.code,
    });
    if (duplicate)
      throw new ApiError("SPORT_CODE_EXISTS", "این کد قبلاً در فهرست ورزش‌ها ثبت شده است.", 409);

    let parent: any = null;
    if (body.level !== "category") {
      if (!body.parent_id)
        throw new ApiError("SPORT_PARENT_REQUIRED", "انتخاب سطح والد الزامی است.", 422);
      parent = await this.models.TaxonomyTerm.findOne({
        _id: objectIdFrom(body.parent_id),
        taxonomyId: taxonomy._id,
        status: { $in: ["active", "inactive"] },
      });
      const expectedParent = body.level === "sport" ? "category" : "sport";
      if (!parent || parent.customData?.level !== expectedParent)
        throw new ApiError("SPORT_PARENT_INVALID", "سطح والد انتخاب‌شده معتبر نیست.", 422);
    }
    if (body.level === "category" && body.parent_id)
      throw new ApiError(
        "SPORT_PARENT_NOT_ALLOWED",
        "دسته‌بندی ورزش نمی‌تواند والد داشته باشد.",
        422,
      );

    return this.models.TaxonomyTerm.create({
      taxonomyId: taxonomy._id,
      ...(parent ? { parentId: parent._id } : {}),
      code: body.code,
      labels: {
        "fa-IR": body.label_fa,
        fa: body.label_fa,
        ...(body.label_en ? { en: body.label_en } : {}),
      },
      path: [...(parent?.path ?? []), body.code],
      displayOrder: body.display_order ?? 0,
      customData: { level: body.level, ...(body.icon ? { icon: body.icon } : {}) },
      status: "active",
      createdBy: objectIdFrom(userId),
    });
  }
  async updateSportTerm(termId: string, body: any, userId: string) {
    const taxonomy = await this.models.Taxonomy.findOne({ code: "sports" });
    const term = await this.models.TaxonomyTerm.findOne({
      _id: objectIdFrom(termId),
      taxonomyId: taxonomy?._id,
    });
    if (!term) throw new ApiError("SPORT_TERM_NOT_FOUND", "رشته ورزشی پیدا نشد.", 404);
    const current = term.toObject() as any;
    const labels = { ...(current.labels ?? {}) };
    if (body.label_fa) Object.assign(labels, { "fa-IR": body.label_fa, fa: body.label_fa });
    if (body.label_en) labels.en = body.label_en;
    const customData = { ...(current.customData ?? {}) };
    if (body.icon !== undefined) {
      if (body.icon === null) delete customData.icon;
      else customData.icon = body.icon;
    }
    term.set({
      ...(body.label_fa || body.label_en ? { labels } : {}),
      ...(body.icon !== undefined ? { customData } : {}),
      ...(body.display_order !== undefined ? { displayOrder: body.display_order } : {}),
      ...(body.status ? { status: body.status } : {}),
      updatedBy: objectIdFrom(userId),
    });
    await term.save();
    return term;
  }
  async archiveSportTerm(termId: string, userId: string) {
    const taxonomy = await this.models.Taxonomy.findOne({ code: "sports" });
    const term = (await this.models.TaxonomyTerm.findOne({
      _id: objectIdFrom(termId),
      taxonomyId: taxonomy?._id,
    }).lean()) as any;
    if (!term) throw new ApiError("SPORT_TERM_NOT_FOUND", "رشته ورزشی پیدا نشد.", 404);
    const result = await this.models.TaxonomyTerm.updateMany(
      { taxonomyId: taxonomy?._id, path: term.code },
      { $set: { status: "inactive", updatedBy: objectIdFrom(userId), updatedAt: new Date() } },
    );
    return { archived: result.modifiedCount, root_id: termId };
  }
  createEntity(body: any, userId: string) {
    return this.models.EntityTypeDefinition.create({
      code: body.code,
      module: body.module,
      storageCollection: body.storage_collection,
      labels: body.labels,
      capabilities: body.capabilities ?? {},
      settings: body.settings ?? {},
      status: "active",
      createdBy: objectIdFrom(userId),
    });
  }
  createGroup(body: any, userId: string) {
    return this.models.FieldGroupDefinition.create({
      entityTypeId: objectIdFrom(body.entity_type_id),
      code: body.code,
      labels: body.labels,
      descriptions: body.descriptions ?? {},
      layoutConfig: body.layout_config ?? {},
      displayOrder: body.display_order ?? 0,
      status: "active",
      createdBy: objectIdFrom(userId),
    });
  }
  createField(body: any, userId: string) {
    return this.models.FieldDefinition.create({
      entityTypeId: objectIdFrom(body.entity_type_id),
      ...(body.field_group_id ? { fieldGroupId: objectIdFrom(body.field_group_id) } : {}),
      key: body.key,
      labels: body.labels,
      dataType: body.data_type,
      required: body.required ?? false,
      defaultValue: body.default_value,
      rules: {
        validation: body.validation_rules ?? {},
        visibility: body.visibility_rules ?? {},
        permission: body.permission_rules ?? {},
      },
      display: { config: body.display_config ?? {}, order: body.display_order ?? 0 },
      search: body.search_config ?? {},
      status: "active",
      createdBy: objectIdFrom(userId),
    });
  }
}
