import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StaffModule } from '../account/staff/staff.module';
import { Waitlist, WaitlistSchema } from '../schemas/waitlist.schema';
import {
  AccountWaitlistController,
  ClubWaitlistController,
} from './waitlist.controller';
import { WaitlistService } from './waitlist.service';
import { WaitlistWorker } from './waitlist.worker';

@Module({
  imports: [
    StaffModule,
    MongooseModule.forFeature([
      { name: Waitlist.name, schema: WaitlistSchema },
    ]),
  ],
  controllers: [AccountWaitlistController, ClubWaitlistController],
  providers: [WaitlistService, WaitlistWorker],
  exports: [WaitlistService],
})
export class WaitlistModule {}
