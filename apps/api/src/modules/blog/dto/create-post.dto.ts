import { IsString, IsOptional, IsBoolean, IsArray, MaxLength, MinLength, IsInt, Min } from 'class-validator';

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

    // SEO fields
    @IsOptional()
    @IsString()
    @MaxLength(70)
    metaTitle?: string;

    @IsOptional()
    @IsString()
    @MaxLength(160)
    metaDescription?: string;

    // Calculated field (optional, will be auto-calculated)
    @IsOptional()
    @IsInt()
    @Min(0)
    readingTime?: number;
}

