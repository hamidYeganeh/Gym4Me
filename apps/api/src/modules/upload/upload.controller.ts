import { Controller, Get, Param, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import type { FastifyReply } from "fastify";
import type { MultipartFile } from "@fastify/multipart";
import { success } from "../../common/response.js";
import { ApiError } from "../../common/api-error.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import { UploadService } from "./upload.service.js";
import { objectId, uploadQuerySchema } from "./schemas/upload.schemas.js";

function sendContent(reply: FastifyReply, asset: any, stream: NodeJS.ReadableStream) {
  reply.header("content-type", asset.profile?.mimeType ?? "application/octet-stream");
  reply.header("content-length", String(asset.profile?.sizeBytes ?? ""));
  reply.header(
    "content-disposition",
    `${asset.profile?.mimeType === "application/pdf" ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(asset.profile?.originalName ?? "file")}`,
  );
  reply.header("x-content-type-options", "nosniff");
  reply.header(
    "cache-control",
    asset.access?.visibility === "public" ? "public, max-age=86400" : "private, no-store",
  );
  return reply.send(stream);
}

@ApiTags("Uploads")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("uploads")
export class UploadController {
  constructor(private readonly service: UploadService) {}
  @Post() @ApiConsumes("multipart/form-data") async upload(
    @Req() req: AuthenticatedRequest,
    @Query() raw: unknown,
  ) {
    const file = await (
      req as AuthenticatedRequest & { file(): Promise<MultipartFile | undefined> }
    ).file();
    if (!file) throw new ApiError("UPLOAD_FILE_REQUIRED", "انتخاب فایل الزامی است.", 422);
    return success(req, await this.service.store(req.auth.sub, file, uploadQuerySchema.parse(raw)));
  }
  @Get(":assetId") async metadata(
    @Req() req: AuthenticatedRequest,
    @Param("assetId") id: string,
  ) {
    return success(req, await this.service.metadata(req.auth.sub, objectId.parse(id)));
  }
  @Get(":assetId/content") async content(
    @Req() req: AuthenticatedRequest,
    @Res() reply: FastifyReply,
    @Param("assetId") id: string,
  ) {
    const { asset, stream } = await this.service.content(req.auth.sub, objectId.parse(id));
    return sendContent(reply, asset, stream);
  }
}

@ApiTags("Catalog / Assets")
@Controller("catalog/assets")
export class PublicAssetController {
  constructor(private readonly service: UploadService) {}
  @Get(":assetId/content") async content(@Res() reply: FastifyReply, @Param("assetId") id: string) {
    const { asset, stream } = await this.service.publicContent(objectId.parse(id));
    return sendContent(reply, asset, stream);
  }
}
