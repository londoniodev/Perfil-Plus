import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { DriverStatus } from '@alvarosky/database';

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

  @IsInt()
  @Min(1)
  @IsOptional()
  maxCapacity?: number;
}
