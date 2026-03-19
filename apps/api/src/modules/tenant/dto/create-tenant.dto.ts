import { IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';

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
}
