import { IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@alvarosky/database';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  avatar?: string;
}
