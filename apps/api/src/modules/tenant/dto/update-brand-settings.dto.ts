import {
  IsString,
  IsNumber,
  IsOptional,
  Matches,
  Min,
  Max,
  IsEnum,
} from 'class-validator';

enum LayoutType {
  CLASSIC = 'CLASSIC',
  INSTAGRAM = 'INSTAGRAM',
  MINIMAL = 'MINIMAL',
}

/**
 * DTO para actualizar BrandSettings (Motor de Marca Blanca)
 * Valida los campos antes de llegar al servicio.
 * La validación Zod compartida se usa en el Frontend; aquí usamos class-validator
 * para mantener el patrón NestJS.
 */
export class UpdateBrandSettingsDto {
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message:
      'primaryColor debe ser un HEX válido de 6 caracteres (ej. #09090b)',
  })
  primaryColor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message:
      'secondaryColor debe ser un HEX válido de 6 caracteres (ej. #f4f4f5)',
  })
  secondaryColor?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'borderRadius mínimo es 0' })
  @Max(2, { message: 'borderRadius máximo es 2' })
  borderRadius?: number;

  @IsOptional()
  @IsString()
  fontFamily?: string;

  @IsOptional()
  @IsEnum(LayoutType, {
    message: 'layoutType debe ser CLASSIC, INSTAGRAM o MINIMAL',
  })
  layoutType?: LayoutType;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;
}
