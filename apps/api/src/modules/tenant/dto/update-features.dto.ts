import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class UpdateFeaturesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  features: string[];
}
