import { IsString, IsOptional, IsEnum } from 'class-validator';
import { DriverStatus } from '@prisma/client';

export class UpdateDriverDto {
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  vehicle?: string;

  @IsEnum(DriverStatus)
  @IsOptional()
  status?: DriverStatus;
}
