import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  ParseFilePipe,
  MaxFileSizeValidator,
  Post,
  Req,
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
import type { Request } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { randomToken } from '../../common/utils/hash.util';
import {
  KYC_DOCUMENT_TYPES,
  SubmitDocumentDto,
  SubmitIdentityDto,
} from './dto/kyc.dto';
import { KycService } from './kyc.service';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

@ApiTags('kyc')
@ApiBearerAuth('access-token')
@Controller('account/kyc')
export class KycController {
  constructor(private readonly kyc: KycService) {}

  @Get()
  @ApiOperation({ summary: 'Get KYC status for the current user' })
  status(@CurrentUser('sub') userId: string) {
    return this.kyc.status(userId);
  }

  @Throttle({ default: { limit: 5, ttl: 3_600_000 } })
  @Post('identity')
  @HttpCode(200)
  @ApiOperation({ summary: 'Submit national ID and birth date for KYC' })
  submitIdentity(
    @CurrentUser('sub') userId: string,
    @Body() dto: SubmitIdentityDto,
    @Req() request: Request,
  ) {
    return this.kyc.submitIdentity(userId, dto, request);
  }

  @Throttle({ default: { limit: 10, ttl: 3_600_000 } })
  @Post('documents')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['documentType', 'file'],
      properties: {
        documentType: {
          type: 'string',
          enum: [...KYC_DOCUMENT_TYPES],
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'jpeg / png / webp / pdf, max 5MB',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a KYC document' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOAD_DIR || './uploads',
        filename: (_req, file, cb) =>
          cb(null, `kyc-${randomToken(16)}${extname(file.originalname)}`),
      }),
      fileFilter: (_req, file, cb) =>
        ALLOWED_MIME.includes(file.mimetype)
          ? cb(null, true)
          : cb(new BadRequestException('Only jpeg/png/webp/pdf allowed'), false),
    }),
  )
  submitDocument(
    @CurrentUser('sub') userId: string,
    @Body() dto: SubmitDocumentDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
    @Req() request: Request,
  ) {
    return this.kyc.submitDocument(userId, dto.documentType, file, request);
  }

  @Get('documents')
  @ApiOperation({ summary: 'List uploaded KYC documents' })
  myDocuments(@CurrentUser('sub') userId: string) {
    return this.kyc.myDocuments(userId);
  }
}
