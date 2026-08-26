import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import {
  ArchiveInventoryItemQueryDto,
  CreateInventoryItemDto,
  ListInventoryQueryDto,
  UpdateInventoryItemDto,
} from './dto/inventory.dto';
import { InventoryService } from './inventory.service';

@ApiTags('club-inventory')
@ApiBearerAuth('access-token')
@Roles(Role.CLUB_OWNER)
@Controller('account/clubs/:clubId/inventory')
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'List club inventory and maintenance state' })
  list(
    @CurrentUser('sub') ownerId: string,
    @Param('clubId') clubId: string,
    @Query() query: ListInventoryQueryDto,
  ) {
    return this.inventory.list(ownerId, clubId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create an idempotent inventory item' })
  create(
    @CurrentUser('sub') ownerId: string,
    @Param('clubId') clubId: string,
    @Body() dto: CreateInventoryItemDto,
  ) {
    return this.inventory.create(ownerId, clubId, dto);
  }

  @Patch(':itemId')
  @ApiOperation({ summary: 'Update inventory using optimistic concurrency' })
  update(
    @CurrentUser('sub') ownerId: string,
    @Param('clubId') clubId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateInventoryItemDto,
  ) {
    return this.inventory.update(ownerId, clubId, itemId, dto);
  }

  @Delete(':itemId')
  @ApiOperation({ summary: 'Archive inventory item without deleting history' })
  archive(
    @CurrentUser('sub') ownerId: string,
    @Param('clubId') clubId: string,
    @Param('itemId') itemId: string,
    @Query() query: ArchiveInventoryItemQueryDto,
  ) {
    return this.inventory.archive(
      ownerId,
      clubId,
      itemId,
      query.expectedVersion,
    );
  }
}
