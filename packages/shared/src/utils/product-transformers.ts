/**
 * Transforma un producto crudo de la API al formato esperado por las tablas de administración (Tienda y Restaurante).
 */
export function formatProductForTable(product: any) {
    // Calcular stock total sumando todas las variantes
    const totalStock = product.variants ? product.variants.reduce((sum: number, variant: any) => {
        if (variant.stock === -1) return Infinity; // Ilimitado
        return sum + (Number(variant.stock) || 0);
    }, 0) : 0;

    // Obtener el precio mínimo entre el precio base y las variantes
    const minPrice = product.variants && product.variants.length > 0 ? Math.min(
        Number(product.basePrice),
        ...product.variants.map((v: any) => Number(v.price))
    ) : Number(product.basePrice);

    return {
        id: product.id,
        name: product.name,
        image: (product.images && product.images[0]) || "/placeholder.jpg",
        type: product.productType,
        price: minPrice,
        stock: totalStock === Infinity ? "Ilimitado" : totalStock,
        published: product.published,
        isAvailable: product.isAvailable,
        createdAt: product.createdAt,
        // Mantener datos originales para el Quick View si es necesario
        originalData: product
    };
}
