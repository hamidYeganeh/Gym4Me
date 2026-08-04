import { Module } from '@nestjs/common';
import { UsersModule } from '../../users/users.module';
import { ProfileModule } from '../profile/profile.module';
import { RoleMembershipService } from './role-membership.service';
import { RolesController } from './roles.controller';

@Module({
  imports: [UsersModule, ProfileModule],
  controllers: [RolesController],
  providers: [RoleMembershipService],
  exports: [RoleMembershipService],
})
export class RolesModule {}
