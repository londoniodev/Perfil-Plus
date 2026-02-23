import { IsObject, IsOptional } from 'class-validator';

export class UpdateBrandingDto {
    /**
     * JSON libre que contiene colores, tipografías y logoUrl
     * Mapea al campo `design` en Prisma.
     */
    @IsObject()
    @IsOptional()
    design?: Record<string, any>;
}
