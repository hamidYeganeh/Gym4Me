import { Type } from 'class-transformer';
import { IsDate, IsIn, IsString, Matches } from 'class-validator';

export class SubmitIdentityDto {
  @Matches(/^\d{10}$/, { message: 'nationalId must be 10 digits' })
  nationalId!: string;

  @Type(() => Date)
  @IsDate()
  birthDate!: Date;
}

export const KYC_DOCUMENT_TYPES = [
  'national_card',
  'selfie',
  'coach_certificate',
  'business_license',
] as const;

export class SubmitDocumentDto {
  @IsString()
  @IsIn(KYC_DOCUMENT_TYPES)
  documentType!: (typeof KYC_DOCUMENT_TYPES)[number];
}
