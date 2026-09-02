import { Module } from "@nestjs/common";
import {
  CoachCatalogController,
  CoachSelfController,
  AdminCoachController,
  CoachingController,
} from "./coach.controller.js";
import { CoachService } from "./coach.service.js";
import { CoachingService } from "./coaching.service.js";
@Module({
  controllers: [
    CoachCatalogController,
    CoachSelfController,
    AdminCoachController,
    CoachingController,
  ],
  providers: [CoachService, CoachingService],
  exports: [CoachService],
})
export class CoachModule {}
