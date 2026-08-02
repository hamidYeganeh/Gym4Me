import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RoleProfile,
  RoleProfileSchema,
} from '../../schemas/role-profile.schema';
import { UsersModule } from '../../users/users.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RoleProfile.name, schema: RoleProfileSchema },
    ]),
    UsersModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
