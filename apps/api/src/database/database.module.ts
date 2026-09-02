import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { getConnectionToken, MongooseModule } from "@nestjs/mongoose";
import type { Connection } from "mongoose";
import { DATABASE_MODELS } from "./database.constants.js";
import { registerModels } from "./index.js";

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>("MONGODB_URI"),
      }),
    }),
  ],
  providers: [
    {
      provide: DATABASE_MODELS,
      inject: [getConnectionToken()],
      useFactory: (connection: Connection) => registerModels(connection),
    },
  ],
  exports: [DATABASE_MODELS],
})
export class DatabaseModule {}
