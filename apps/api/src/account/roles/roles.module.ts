import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsModule } from '../../notifications/notifications.module';
import {
  RoleRequest,
  RoleRequestSchema,
} from '../../schemas/role-request.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { UsersModule } from '../../users/users.module';
import { ProfileModule } from '../profile/profile.module';
import { RoleMembershipService } from './role-membership.service';
import { RolesController } from './roles.controller';

@Module({
  imports: [
    UsersModule,
    ProfileModule,
    NotificationsModule,
    MongooseModule.forFeature([
      { name: RoleRequest.name, schema: RoleRequestSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [RolesController],
  providers: [RoleMembershipService],
  exports: [RoleMembershipService],
})
export class RolesModule {}
