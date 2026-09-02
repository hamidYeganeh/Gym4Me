import { ArgumentsHost, Catch, type ExceptionFilter, HttpException } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { ApiError } from "./api-error.js";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<FastifyReply>();
    const request = host.switchToHttp().getRequest<FastifyRequest>();
    if (error instanceof ZodError)
      return response.status(422).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "داده‌های ورودی معتبر نیستند.",
          details: { issues: error.issues },
          request_id: request.id,
        },
      });
    if (error instanceof ApiError)
      return response.status(error.status).send({
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
          request_id: request.id,
        },
      });
    if (error instanceof HttpException)
      return response
        .status(error.getStatus())
        .send({ error: { code: "HTTP_ERROR", message: error.message, request_id: request.id } });
    request.log.error(error);
    return response.status(500).send({
      error: {
        code: "INTERNAL_ERROR",
        message: "خطای غیرمنتظره‌ای رخ داد.",
        request_id: request.id,
      },
    });
  }
}
