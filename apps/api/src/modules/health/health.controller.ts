import {
  Controller,
  Get,
  Req,
  Res,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Connection } from "mongoose";
import { success } from "../../common/response.js";
import { appConfig } from "../../config/app.config.js";
import { renderMetrics } from "../../observability/metrics.js";
@Controller("health")
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get("live") live(@Req() request: FastifyRequest) {
    return success(request, {
      status: "ok",
      service: "gym4me-api",
      uptime_seconds: Math.floor(process.uptime()),
    });
  }

  @Get() async ready(@Req() request: FastifyRequest) {
    const startedAt = Date.now();
    if (this.connection.readyState !== 1 || !this.connection.db)
      throw new ServiceUnavailableException("MongoDB is not ready");
    await this.connection.db.admin().ping();
    return success(request, {
      status: "ready",
      service: "gym4me-api",
      checks: { mongodb: { status: "up", latency_ms: Date.now() - startedAt } },
    });
  }

  @Get("metrics") metrics(@Req() request: FastifyRequest, @Res() response: FastifyReply) {
    const token = appConfig().METRICS_TOKEN;
    if (token && request.headers.authorization !== `Bearer ${token}`)
      throw new UnauthorizedException();
    return response.type("text/plain; version=0.0.4; charset=utf-8").send(renderMetrics());
  }
}
