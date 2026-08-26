import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import {
  FeatureFlagKeyParamDto,
  ArchiveExpiredFeatureFlagsDto,
  ListAppConfigQueryDto,
  MobileBootstrapQueryDto,
  UpsertFeatureFlagDto,
  UpsertReleasePolicyDto,
} from './dto/app-config.dto';
import { AppConfigService } from './app-config.service';

@ApiTags('app-config')
@Controller({ path: 'app-config', version: VERSION_NEUTRAL })
export class PublicAppConfigController {
  constructor(private readonly appConfig: AppConfigService) {}

  @Public()
  @Get('bootstrap')
  @ApiOperation({
    summary: 'Resolve release compatibility and remote feature manifest',
  })
  bootstrap(@Query() query: MobileBootstrapQueryDto) {
    return this.appConfig.bootstrap(query);
  }
}

@ApiTags('admin-app-config')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin/app-config')
export class AdminAppConfigController {
  constructor(private readonly appConfig: AppConfigService) {}

  @Get('feature-flags')
  listFeatureFlags(@Query() query: ListAppConfigQueryDto) {
    return this.appConfig.listFeatureFlags(query);
  }

  @Put('feature-flags/:key')
  upsertFeatureFlag(
    @Param() params: FeatureFlagKeyParamDto,
    @Body() dto: UpsertFeatureFlagDto,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.appConfig.upsertFeatureFlag(params.key, dto, adminId);
  }

  @Get('release-policies')
  listReleasePolicies(@Query() query: ListAppConfigQueryDto) {
    return this.appConfig.listReleasePolicies(query);
  }

  @Put('release-policies')
  upsertReleasePolicy(
    @Body() dto: UpsertReleasePolicyDto,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.appConfig.upsertReleasePolicy(dto, adminId);
  }

  @Put('feature-flags/archive-expired')
  @ApiOperation({ summary: 'Archive feature flags past exposureEndsAt' })
  archiveExpiredFeatureFlags(
    @Body() dto: ArchiveExpiredFeatureFlagsDto,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.appConfig.archiveExpiredFeatureFlags(adminId, dto.reason);
  }
}
