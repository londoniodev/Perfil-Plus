import { IsString, IsOptional, IsBoolean, IsArray, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
    @IsString()
    @MinLength(5)
    @MaxLength(200)
    title: string;

    @IsString()
    @MinLength(10)
    @MaxLength(500)
    excerpt: string;

    @IsString()
    @MinLength(100)
    content: string;

    @IsOptional()
    @IsString()
    coverImage?: string;

    @IsBoolean()
    published: boolean;

    @IsBoolean()
    isPremium: boolean;

    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tagIds?: string[];
}
