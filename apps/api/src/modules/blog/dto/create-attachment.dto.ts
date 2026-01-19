import { IsString, IsInt, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateAttachmentDto {
    @IsString()
    name: string;

    @IsString()
    fileUrl: string;

    @IsString()
    fileType: string;

    @IsInt()
    @Min(0)
    fileSize: number;

    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;
}

