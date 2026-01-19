import { IsString, MaxLength, MinLength, IsOptional } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    description?: string;
}

