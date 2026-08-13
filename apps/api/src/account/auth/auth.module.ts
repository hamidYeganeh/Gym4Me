import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import {
  ImpersonationSession,
  ImpersonationSessionSchema,
} from '../../schemas/impersonation-session.schema';
import {
  RefreshToken,
  RefreshTokenSchema,
} from '../../schemas/refresh-token.schema';
import { UsersModule } from '../../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenService } from './token.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_ACCESS_TTL', '900s'),
          algorithm: 'HS256',
        },
      }),
    }),
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: ImpersonationSession.name, schema: ImpersonationSessionSchema },
    ]),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, TokenService, JwtStrategy],
  exports: [AuthService, OtpService, TokenService],
})
export class AuthModule {}
