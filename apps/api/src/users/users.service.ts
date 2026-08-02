import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMeDto } from './dto/update-me.dto';

const SAFE_USER_SELECT = {
  id: true,
  phone: true,
  email: true,
  fullName: true,
  avatarUrl: true,
  gender: true,
  birthDate: true,
  status: true,
  roles: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...SAFE_USER_SELECT,
        athleteProfile: {
          include: {
            level: true,
            sports: { include: { sport: true } },
            goals: { include: { goalType: true } },
          },
        },
        coachProfile: {
          include: {
            sports: { include: { sport: true } },
            specialties: { include: { specialty: true } },
          },
        },
        wallet: { select: { balance: true } },
      },
    });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    return user;
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName,
        avatarUrl: dto.avatarUrl,
        gender: dto.gender,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      },
      select: SAFE_USER_SELECT,
    });
  }
}
