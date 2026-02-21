export interface PublicCategory {
    id: string
    name: string
    slug: string
}

export interface PublicProduct {
    id: string;
    name: string;
    basePrice: number;
    description?: string;
    images?: string[];
    categoryId?: string;
    categories?: PublicCategory[]; // typed nested Category objects
    variants?: ProductVariant[];
    modifierGroups?: ModifierGroup[];
    likesCount?: number;
    comments?: ProductComment[];
}

export interface ProductVariant {
    id: string;
    name: string;
    price: number;
    sku?: string;
}

export interface ModifierGroup {
    id: string;
    name: string;
    minSelections: number;
    maxSelections: number;
    modifiers: Modifier[];
}

export interface Modifier {
    id: string;
    name: string;
    price: number;
}

export interface ProductComment {
    id: string;
    userName: string;
    content: string;
    createdAt: string;
}

export interface ClientOrderItem {
    product: PublicProduct;
    variantId: string;
    quantity: number;
    modifiers: SelectedModifier[];
}

export interface SelectedModifier {
    modifierId: string;
    modifierName?: string;
    priceAdjustment: number;
    quantity: number;
}
