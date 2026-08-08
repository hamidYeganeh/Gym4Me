import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Public } from '../common/decorators/public.decorator';
import { FaqService } from './faq.service';
import { ListFaqQueryDto } from './dto/support.dto';

@ApiTags('support')
@Controller('support')
export class SupportController {
  constructor(
    private readonly faq: FaqService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Get('faq')
  @ApiOperation({ summary: 'List published FAQ items' })
  listFaq(@Query() query: ListFaqQueryDto) {
    return this.faq.listPublished(query.audience);
  }

  @Public()
  @Get('contact')
  @ApiOperation({ summary: 'Support contact channels' })
  contact() {
    return {
      phone: this.config.get<string>('SUPPORT_PHONE') ?? null,
      email: this.config.get<string>('SUPPORT_EMAIL') ?? null,
      telegram: this.config.get<string>('SUPPORT_TELEGRAM') ?? null,
      workingHours: this.config.get<string>('SUPPORT_WORKING_HOURS') ?? null,
    };
  }
}
