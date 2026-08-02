import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Role, User } from '../generated/prisma/client';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { AuthTokens, JwtPayload } from './types';

const sha256 = (value: string) =>
  createHash('sha256').update(value).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(dto.phone ? [{ phone: dto.phone }] : []),
          ...(dto.email ? [{ email: dto.email }] : []),
        ],
      },
    });
    if (existing) {
      throw new ConflictException('کاربری با این شماره یا ایمیل وجود دارد');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        gender: dto.gender,
        roles: [dto.role],
        wallet: { create: {} },
        ...(dto.role === Role.ATHLETE && { athleteProfile: { create: {} } }),
        ...(dto.role === Role.COACH && { coachProfile: { create: {} } }),
      },
    });

    const tokens = await this.issueTokens(user);
    return { user: this.toSafeUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: dto.identifier }, { email: dto.identifier }],
      },
    });
    if (!user) throw new UnauthorizedException('اطلاعات ورود نادرست است');
    if (user.status === 'BLOCKED') {
      throw new UnauthorizedException('حساب شما مسدود شده است');
    }

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException('اطلاعات ورود نادرست است');

    const tokens = await this.issueTokens(user);
    return { user: this.toSafeUser(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: sha256(refreshToken) },
      include: { user: true },
    });
    if (
      !stored ||
      stored.revokedAt ||
      stored.expiresAt < new Date() ||
      stored.user.status === 'BLOCKED' ||
      stored.user.status === 'DELETED'
    ) {
      throw new UnauthorizedException('توکن نامعتبر است');
    }

    // rotation: revoke used token, issue a fresh pair
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.issueTokens(stored.user);
    return { user: this.toSafeUser(stored.user), ...tokens };
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: sha256(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { success: true };
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: user.id, roles: user.roles };

    const accessToken = await this.jwt.signAsync(
      { ...payload },
      {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: (this.config.get<string>('JWT_ACCESS_TTL') ??
          '900s') as JwtSignOptions['expiresIn'],
      },
    );

    const refreshToken = randomBytes(48).toString('base64url');
    const ttlDays = Number(this.config.get('JWT_REFRESH_TTL_DAYS') ?? 30);
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: sha256(refreshToken),
        expiresAt: new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  private toSafeUser(user: User) {
    const { passwordHash: _passwordHash, ...safe } = user;
    return safe;
  }
}
