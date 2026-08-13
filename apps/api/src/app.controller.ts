import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health / ping' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Database and external-provider readiness' })
  getReadiness() {
    const readiness = this.appService.getReadiness();
    if (!readiness.ready) {
      throw new ServiceUnavailableException(readiness);
    }
    return readiness;
  }
}
