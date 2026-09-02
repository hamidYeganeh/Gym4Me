import { SetMetadata } from "@nestjs/common";
export const PERMISSION_KEY = "gym4me:permission";
export const RequirePermission = (permission: string) => SetMetadata(PERMISSION_KEY, permission);
