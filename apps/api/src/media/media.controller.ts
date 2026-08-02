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
import { extname } from 'path';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { randomToken } from '../common/utils/hash.util';
import { MediaService } from './media.service';

const ALLOWED_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
];

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
          description: 'jpeg / png / webp / svg / pdf, max 8MB',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a media file' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOAD_DIR || './uploads',
        filename: (_req, file, cb) =>
          cb(null, `media-${randomToken(16)}${extname(file.originalname)}`),
      }),
      fileFilter: (_req, file, cb) =>
        ALLOWED_MIME.includes(file.mimetype)
          ? cb(null, true)
          : cb(
              new BadRequestException('Only jpeg/png/webp/svg/pdf allowed'),
              false,
            ),
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
    return this.media.create(file, userId, request);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get media metadata' })
  getMeta(@Param('id') id: string) {
    return this.media.getMeta(id);
  }

  @Public()
  @Get(':id/file')
  @ApiOperation({ summary: 'Stream the media file' })
  async getFile(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.media.openFile(id);
    res.set({
      'Content-Type': file.mimeType,
      'Content-Length': String(file.size),
      ...(file.originalName
        ? {
            'Content-Disposition': `inline; filename="${file.originalName}"`,
          }
        : {}),
    });
    return new StreamableFile(file.stream);
  }
}
