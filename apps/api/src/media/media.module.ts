import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Media, MediaSchema } from '../schemas/media.schema';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MediaCleanupWorker } from './media-cleanup.worker';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Media.name, schema: MediaSchema }]),
  ],
  controllers: [MediaController],
  providers: [MediaService, MediaCleanupWorker],
  exports: [MediaService, MongooseModule],
})
export class MediaModule {}
