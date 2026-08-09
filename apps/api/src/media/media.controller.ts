import {
  BadRequestException,
  Controller,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { diskStorage } from 'multer';
import { readFileSync, renameSync } from 'fs';
import { join } from 'path';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OptionalAuth } from '../common/decorators/optional-auth.decorator';
import { Public } from '../common/decorators/public.decorator';
import type { JwtUser } from '../common/types';
import { randomToken } from '../common/utils/hash.util';
import {
  extensionForMime,
  sanitizeContentDispositionFilename,
  sniffAllowedMime,
} from '../common/utils/mime-sniff.util';
import { MediaService } from './media.service';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @ApiBearerAuth('access-token')
  @Throttle({ default: { limit: 30, ttl: 3_600_000 } })
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'jpeg / png / webp / pdf, max 8MB',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a media file' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOAD_DIR || './uploads',
        filename: (_req, _file, cb) =>
          cb(null, `media-${randomToken(16)}.bin`),
      }),
      // MIME is verified from magic bytes after write — do not trust client.
      fileFilter: (_req, _file, cb) => cb(null, true),
    }),
  )
  upload(
    @CurrentUser('sub') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 8 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
    @Req() request: Request,
  ) {
    const absolute = join(process.env.UPLOAD_DIR || './uploads', file.filename);
    const head = readFileSync(absolute).subarray(0, 32);
    const mime = sniffAllowedMime(head);
    if (!mime) {
      throw new BadRequestException('Only jpeg/png/webp/pdf allowed');
    }

    const ext = extensionForMime(mime);
    const finalName = `media-${randomToken(16)}${ext}`;
    const finalPath = join(process.env.UPLOAD_DIR || './uploads', finalName);
    renameSync(absolute, finalPath);
    file.filename = finalName;
    file.mimetype = mime;

    return this.media.create(file, userId, request, {
      mimeType: mime,
      originalName: sanitizeContentDispositionFilename(
        file.originalname || finalName,
      ),
    });
  }

  @Public()
  @OptionalAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Get media metadata' })
  getMeta(
    @Param('id') id: string,
    @CurrentUser() user?: JwtUser,
  ) {
    return this.media.getMeta(id, user ?? null);
  }

  @Public()
  @OptionalAuth()
  @Get(':id/file')
  @ApiOperation({ summary: 'Stream the media file' })
  async getFile(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user?: JwtUser,
  ) {
    const file = await this.media.openFile(id, user ?? null);
    const safeName = file.originalName
      ? sanitizeContentDispositionFilename(file.originalName)
      : undefined;
    res.set({
      'Content-Type': file.mimeType,
      'Content-Length': String(file.size),
      // Prefer attachment for PDFs; images can stay inline.
      ...(safeName
        ? {
            'Content-Disposition': `${
              file.mimeType === 'application/pdf' ? 'attachment' : 'inline'
            }; filename="${safeName}"`,
          }
        : {}),
      'X-Content-Type-Options': 'nosniff',
    });
    return new StreamableFile(file.stream);
  }
}
