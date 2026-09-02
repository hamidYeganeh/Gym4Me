import { Module } from "@nestjs/common";
import { MetaController } from "./meta.controller.js";
import { MetaService } from "./meta.service.js";
import { AuditModule } from "../audit/audit.module.js";
@Module({ imports: [AuditModule], controllers: [MetaController], providers: [MetaService] })
export class MetaModule {}
