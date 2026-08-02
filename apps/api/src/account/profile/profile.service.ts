import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../../common/enums';
import {
  RoleProfile,
  RoleProfileDocument,
} from '../../schemas/role-profile.schema';
import { UsersService } from '../../users/users.service';
import { UpdateMeDto } from './dto/update-me.dto';

const ROLE_FIELDS: Record<Role, (keyof RoleProfile)[]> = {
  [Role.ATHLETE]: ['bio', 'heightCm', 'weightKg'],
  [Role.COACH]: ['bio', 'yearsExperience', 'isVerifiedCoach'],
  [Role.CLUB_OWNER]: ['bio', 'businessName'],
  [Role.CLUB_STAFF]: ['bio', 'position'],
  [Role.ADMIN]: ['bio'],
};

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(RoleProfile.name)
    private readonly roleProfileModel: Model<RoleProfileDocument>,
    private readonly users: UsersService,
  ) {}

  async getMe(userId: string) {
    const user = await this.users.findById(userId);
    return this.users.toPublic(user);
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const user = await this.users.findById(userId);

    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;

    if (dto.code !== undefined && dto.code !== user.code) {
      const taken = await this.users
        .findByCode(dto.code)
        .then((u) => u && u._id.toString() !== userId);
      if (taken) throw new ConflictException('This code is already taken');
      user.code = dto.code;
    }

    await user.save();

    // If names just arrived and the handle is still the auto "user-xxxx" one, upgrade it.
    if (dto.code === undefined) {
      await this.users.refreshCodeIfAuto(user);
    }

    return this.users.toPublic(user);
  }

  async getRoleProfile(userId: string, roles: Role[], role: Role) {
    if (!roles.includes(role)) {
      throw new ForbiddenException(`You don't have the "${role}" role`);
    }

    const profile = await this.roleProfileModel
      .findOneAndUpdate(
        { userId, role },
        { $setOnInsert: { userId, role } },
        { new: true, upsert: true },
      )
      .lean();

    const fields = Object.fromEntries(
      ROLE_FIELDS[role].map((key) => [key, profile[key] ?? null]),
    );

    return {
      id: profile._id.toString(),
      role,
      ...fields,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
