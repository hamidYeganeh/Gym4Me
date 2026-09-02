import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { AuthGuard } from "./auth.guard.js";
import { PermissionGuard } from "./permission.guard.js";

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("JWT_ACCESS_SECRET"),
        signOptions: { expiresIn: config.getOrThrow<number>("ACCESS_TOKEN_TTL_SECONDS") },
      }),
    }),
  ],
  providers: [AuthGuard, PermissionGuard],
  exports: [JwtModule, AuthGuard, PermissionGuard],
})
export class SecurityModule {}
