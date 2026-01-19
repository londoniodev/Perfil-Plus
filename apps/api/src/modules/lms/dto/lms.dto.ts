import { IsString, IsOptional, IsBoolean, IsInt, Min, IsUrl } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

// ==================== THEME DTOs ====================
export class CreateThemeDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsOptional()
    @IsUrl()
    coverImage?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    order?: number;

    @IsOptional()
    @IsBoolean()
    published?: boolean;
}

export class UpdateThemeDto extends PartialType(CreateThemeDto) { }

// ==================== COURSE DTOs ====================
export class CreateCourseDto {
    @IsString()
    themeId: string;

    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsOptional()
    @IsUrl()
    coverImage?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    order?: number;

    @IsOptional()
    @IsBoolean()
    isFree?: boolean;

    @IsOptional()
    @IsBoolean()
    published?: boolean;
}

export class UpdateCourseDto extends PartialType(CreateCourseDto) { }

// ==================== LESSON DTOs ====================
export class CreateLessonDto {
    @IsString()
    courseId: string;

    @IsString()
    title: string;

    @IsString()
    content: string;

    @IsOptional()
    @IsUrl()
    videoUrl?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    duration?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    order?: number;

    @IsOptional()
    @IsBoolean()
    published?: boolean;
}

export class UpdateLessonDto extends PartialType(CreateLessonDto) { }

export class CreateLessonAttachmentDto {
    @IsString()
    name: string;

    @IsString()
    fileUrl: string;

    @IsString()
    fileType: string;

    @IsInt()
    @Min(0)
    fileSize: number;
}

// ==================== PROGRESS DTOs ====================
export class UpdateProgressDto {
    @IsOptional()
    @IsBoolean()
    completed?: boolean;

    @IsOptional()
    @IsInt()
    @Min(0)
    watchedTime?: number;
}

