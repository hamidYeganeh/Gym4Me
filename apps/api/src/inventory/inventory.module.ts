import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OutboxModule } from '../outbox/outbox.module';
import {
  ClubInventoryItem,
  ClubInventoryItemSchema,
} from '../schemas/club-inventory-item.schema';
import { Club, ClubSchema } from '../schemas/club.schema';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [
    OutboxModule,
    MongooseModule.forFeature([
      { name: ClubInventoryItem.name, schema: ClubInventoryItemSchema },
      { name: Club.name, schema: ClubSchema },
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
