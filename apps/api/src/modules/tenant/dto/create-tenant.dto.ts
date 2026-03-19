import { IsNotEmpty, IsOptional, IsString, IsEmail, Matches, IsNumber, IsEnum } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  domain: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsNotEmpty()
  ownerEmail: string;

  @IsString()
  @IsNotEmpty()
  adminPassword: string;

  // --- Brand Settings (Opcionales, con defaults en DB) ---

  @IsOptional()
  @IsString()
  @Matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, {
    message: 'primaryColor debe ser un color HEX válido (#RGB o #RRGGBB)',
  })
  primaryColor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, {
    message: 'secondaryColor debe ser un color HEX válido (#RGB o #RRGGBB)',
  })
  secondaryColor?: string;

  @IsOptional()
  @IsNumber()
  borderRadius?: number;

  @IsOptional()
  @IsString()
  fontFamily?: string;

  @IsOptional()
  @IsString()
  layoutType?: 'CLASSIC' | 'INSTAGRAM' | 'MINIMAL';
}
