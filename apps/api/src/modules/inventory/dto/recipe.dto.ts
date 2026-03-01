import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RecipeIngredientDto {
    @IsString()
    inventoryItemId: string;

    @IsNumber()
    @Min(0.001)
    quantity: number;

    @IsNumber()
    @IsOptional()
    @Min(1)
    wasteFactor?: number;
}

export class CreateRecipeDto {
    @IsString()
    productId: string;

    @IsInt()
    @IsOptional()
    @Min(1)
    yield?: number;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RecipeIngredientDto)
    ingredients: RecipeIngredientDto[];
}

export class UpdateRecipeDto {
    @IsInt()
    @IsOptional()
    @Min(1)
    yield?: number;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RecipeIngredientDto)
    @IsOptional()
    ingredients?: RecipeIngredientDto[];
}
