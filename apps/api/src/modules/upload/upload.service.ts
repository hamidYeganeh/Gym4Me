import { Inject, Injectable } from "@nestjs/common";
import { createHash, randomUUID } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, stat, unlink } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pipeline } from "node:stream/promises";
import { Transform, type TransformCallback } from "node:stream";
import type { MultipartFile } from "@fastify/multipart";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { ApiError } from "../../common/api-error.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { OrganizationAccessService } from "../organization/organization-access.service.js";
import { PERMISSIONS } from "../../security/rbac.js";

const allowed = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
const extensions: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

function matchesMime(buffer: Buffer, mime: string) {
  if (mime === "application/pdf") return buffer.subarray(0, 5).toString() === "%PDF-";
  if (mime === "image/jpeg")
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mime === "image/png")
    return buffer
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mime === "image/webp")
    return (
      buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP"
    );
  return false;
}

class MagicByteValidator extends Transform {
  private header = Buffer.alloc(0);
  private checked = false;
  constructor(private readonly mime: string) {
    super();
  }
  override _transform(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback) {
    if (!this.checked) {
      this.header = Buffer.concat([
        this.header,
        chunk.subarray(0, Math.max(0, 12 - this.header.length)),
      ]);
      if (this.header.length >= 12) {
        this.checked = true;
        if (!matchesMime(this.header, this.mime))
          return callback(
            new ApiError(
              "UPLOAD_CONTENT_INVALID",
              "محتوای فایل با نوع اعلام‌شده مطابقت ندارد.",
              422,
            ),
          );
      }
    }
    callback(null, chunk);
  }
  override _flush(callback: TransformCallback) {
    if (!this.checked && !matchesMime(this.header, this.mime))
      return callback(
        new ApiError("UPLOAD_CONTENT_INVALID", "محتوای فایل با نوع اعلام‌شده مطابقت ندارد.", 422),
      );
    callback();
  }
}

@Injectable()
export class UploadService {
  private readonly root = resolve(process.env.UPLOAD_STORAGE_PATH ?? "./var/uploads");
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    private readonly access: OrganizationAccessService,
  ) {}

  async store(userId: string, file: MultipartFile, query: any) {
    if (!allowed.has(file.mimetype))
      throw new ApiError("UPLOAD_MIME_NOT_ALLOWED", "فقط PDF، JPG، PNG و WEBP مجاز است.", 422);
    if (query.organization_id)
      await this.access.assertOrganization(
        userId,
        query.organization_id,
        PERMISSIONS.ORGANIZATION_PROFILE_READ,
      );
    const now = new Date();
    const relative = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}${extensions[file.mimetype]}`;
    const absolute = resolve(this.root, relative);
    if (!absolute.startsWith(`${this.root}/`))
      throw new ApiError("UPLOAD_PATH_INVALID", "مسیر فایل معتبر نیست.", 500);
    await mkdir(dirname(absolute), { recursive: true });
    const checksum = createHash("sha256");
    file.file.on("data", (chunk) => checksum.update(chunk));
    try {
      await pipeline(
        file.file,
        new MagicByteValidator(file.mimetype),
        createWriteStream(absolute, { flags: "wx", mode: 0o600 }),
      );
    } catch (error) {
      await unlink(absolute).catch(() => undefined);
      if ((file.file as any).truncated)
        throw new ApiError("UPLOAD_TOO_LARGE", "حجم فایل بیشتر از ۱۵ مگابایت است.", 413);
      throw error;
    }
    if ((file.file as any).truncated) {
      await unlink(absolute).catch(() => undefined);
      throw new ApiError("UPLOAD_TOO_LARGE", "حجم فایل بیشتر از ۱۵ مگابایت است.", 413);
    }
    const metadata = await stat(absolute);
    if (!metadata.size) {
      await unlink(absolute).catch(() => undefined);
      throw new ApiError("UPLOAD_EMPTY", "فایل خالی قابل ذخیره نیست.", 422);
    }
    const asset = await this.models.Asset.create({
      ownerUserId: objectIdFrom(userId),
      ...(query.organization_id ? { organizationId: objectIdFrom(query.organization_id) } : {}),
      profile: {
        originalName: file.filename,
        mimeType: file.mimetype,
        sizeBytes: metadata.size,
        purpose: query.purpose,
      },
      storage: { provider: "local", path: relative, checksumSha256: checksum.digest("hex") },
      access: { visibility: query.visibility },
      status: "active",
      createdBy: objectIdFrom(userId),
    });
    const baseUrl = (
      process.env.PUBLIC_API_URL ?? `http://localhost:${process.env.API_PORT ?? 4000}/api/v1`
    ).replace(/\/$/, "");
    const stored = asset.toObject() as any;
    return {
      ...stored,
      file: {
        url:
          query.visibility === "public"
            ? `${baseUrl}/catalog/assets/${asset._id}/content`
            : `${baseUrl}/uploads/${asset._id}/content`,
        mime_type: file.mimetype,
        size_bytes: metadata.size,
        checksum_sha256: stored.storage?.checksumSha256,
      },
    };
  }

  private async canRead(userId: string, asset: any) {
    if (asset.access?.visibility === "public" || String(asset.ownerUserId) === userId) return true;
    if (asset.access?.visibility === "organization" && asset.organizationId) {
      try {
        await this.access.assertOrganization(
          userId,
          String(asset.organizationId),
          PERMISSIONS.ORGANIZATION_PROFILE_READ,
        );
        return true;
      } catch {
        return false;
      }
    }
    const assignments = (await this.models.RoleAssignment.find({
      userId: objectIdFrom(userId),
      status: "active",
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    }).lean()) as any[];
    const globalRoleIds = assignments
      .filter((item) => item.scope?.type === "global")
      .map((item) => item.roleId);
    return Boolean(
      await this.models.Role.exists({
        _id: { $in: globalRoleIds },
        status: "active",
        permissions: { $elemMatch: { code: PERMISSIONS.ALL, effect: "allow" } },
      }),
    );
  }

  async metadata(userId: string, id: string) {
    const asset = (await this.models.Asset.findOne({
      _id: objectIdFrom(id),
      status: "active",
    }).lean()) as any;
    if (!asset) throw new ApiError("ASSET_NOT_FOUND", "فایل پیدا نشد.", 404);
    if (!(await this.canRead(userId, asset)))
      throw new ApiError("ASSET_FORBIDDEN", "به این فایل دسترسی ندارید.", 403);
    return asset;
  }

  async content(userId: string, id: string) {
    const asset = (await this.models.Asset.findOne({
      _id: objectIdFrom(id),
      status: "active",
    }).lean()) as any;
    if (!asset) throw new ApiError("ASSET_NOT_FOUND", "فایل پیدا نشد.", 404);
    if (!(await this.canRead(userId, asset)))
      throw new ApiError("ASSET_FORBIDDEN", "به این فایل دسترسی ندارید.", 403);
    const absolute = resolve(this.root, asset.storage?.path ?? "");
    if (!absolute.startsWith(`${this.root}/`))
      throw new ApiError("ASSET_PATH_INVALID", "مسیر فایل معتبر نیست.", 500);
    try {
      await stat(absolute);
    } catch {
      throw new ApiError("ASSET_CONTENT_MISSING", "محتوای فایل در Storage پیدا نشد.", 404);
    }
    return { asset, stream: createReadStream(absolute) };
  }

  async publicContent(id: string) {
    const asset = (await this.models.Asset.findOne({
      _id: objectIdFrom(id),
      status: "active",
      "access.visibility": "public",
    }).lean()) as any;
    if (!asset) throw new ApiError("ASSET_NOT_FOUND", "فایل عمومی پیدا نشد.", 404);
    const absolute = resolve(this.root, asset.storage?.path ?? "");
    if (!absolute.startsWith(`${this.root}/`))
      throw new ApiError("ASSET_PATH_INVALID", "مسیر فایل معتبر نیست.", 500);
    try {
      await stat(absolute);
    } catch {
      throw new ApiError("ASSET_CONTENT_MISSING", "محتوای فایل در Storage پیدا نشد.", 404);
    }
    return { asset, stream: createReadStream(absolute) };
  }
}
