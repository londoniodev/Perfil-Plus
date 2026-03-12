import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  userId: string;

  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  vehicle?: string;
}
