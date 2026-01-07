import { IsString, IsOptional, IsBoolean, IsInt, Min, IsUrl } from 'class-validator';

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

export class UpdateThemeDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

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

export class UpdateCourseDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

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

export class UpdateLessonDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;

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
