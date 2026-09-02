import "reflect-metadata";
import type { IncomingMessage } from "node:http";
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module.js";
import { appConfig } from "./config/app.config.js";
import { observeHttp } from "./observability/metrics.js";

const config = appConfig();
const allowedOrigins = new Set(
  config.CORS_ALLOWED_ORIGINS.split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter({
    trustProxy: config.TRUST_PROXY,
    bodyLimit: config.REQUEST_BODY_LIMIT_BYTES,
    genReqId: (request: IncomingMessage) =>
      typeof request.headers["x-request-id"] === "string" &&
      /^[a-zA-Z0-9._:-]{8,128}$/.test(request.headers["x-request-id"])
        ? request.headers["x-request-id"]
        : crypto.randomUUID(),
  }),
);
await app.register(helmet, {
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "same-site" },
});
await app.register(multipart, {
  limits: { files: 1, fileSize: 15 * 1024 * 1024, fields: 10 },
});
app.enableCors({
  origin: (origin, callback) => callback(null, !origin || allowedOrigins.has(origin)),
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});
app.setGlobalPrefix("api/v1");
const fastify = app.getHttpAdapter().getInstance();
fastify.addHook("onRequest", async (request: any) => {
  request.metricsStartedAt = process.hrtime.bigint();
});
fastify.addHook("onResponse", async (request: any, reply: any) => {
  const started = request.metricsStartedAt as bigint | undefined;
  observeHttp(
    request.method,
    request.routeOptions?.url ?? request.url,
    reply.statusCode,
    started ? Number(process.hrtime.bigint() - started) / 1e9 : 0,
  );
});
if (config.SWAGGER_ENABLED ?? config.NODE_ENV !== "production") {
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle("Gym4Me API").setVersion("1.0.0").addBearerAuth().build(),
  );
  SwaggerModule.setup("docs", app, document);
}
app.enableShutdownHooks();
await app.listen(config.API_PORT, config.API_HOST);
