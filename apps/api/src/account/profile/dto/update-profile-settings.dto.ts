import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

const UNITS_EXAMPLE = {
  distance_unit: 'km',
  height_unit: 'cm',
  weight_unit: 'kg',
};

export class ProfileSettingsDto {
  @ApiProperty({
    description: 'Display unit preferences keyed by choice-group key.',
    type: 'object',
    additionalProperties: { type: 'string' },
    example: UNITS_EXAMPLE,
  })
  units!: Record<string, string>;
}

export class UpdateProfileSettingsDto {
  @ApiPropertyOptional({
    description: 'Partial map of unit choice-group key → option value.',
    type: 'object',
    additionalProperties: { type: 'string' },
    example: { height_unit: 'ft_in' },
  })
  @IsOptional()
  @IsObject()
  units?: Record<string, string>;
}
