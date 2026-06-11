import test from 'node:test';
import assert from 'node:assert';
import { formatProductForTable } from '../utils/product-transformers';

test('formatProductForTable', async (t) => {
    await t.test('formats a basic product with no variants', () => {
        const product = {
            id: '1',
            name: 'Basic Product',
            basePrice: '10.50',
            productType: 'PHYSICAL',
            published: true,
            isAvailable: true,
            createdAt: '2023-01-01T00:00:00.000Z',
        };

        const result = formatProductForTable(product);

        assert.strictEqual(result.id, '1');
        assert.strictEqual(result.name, 'Basic Product');
        assert.strictEqual(result.price, 10.5);
        assert.strictEqual(result.stock, 0); // No variants -> 0 stock
        assert.strictEqual(result.type, 'PHYSICAL');
        assert.strictEqual(result.published, true);
        assert.strictEqual(result.isAvailable, true);
        assert.strictEqual(result.createdAt, '2023-01-01T00:00:00.000Z');
        assert.strictEqual(result.image, 'https://placehold.co/600x400/27272a/ffffff?text=Sin+Imagen');
        assert.deepStrictEqual(result.originalData, product);
    });

    await t.test('formats a product with specific stock in variants', () => {
        const product = {
            id: '2',
            name: 'Stock Product',
            basePrice: 15,
            variants: [
                { stockControl: true, stock: 5, price: 20 },
                { stockControl: true, stock: '10', price: 15 },
                { stockControl: true, stock: null, price: 18 } // should be treated as 0
            ]
        };

        const result = formatProductForTable(product);

        assert.strictEqual(result.stock, 15); // 5 + 10 + 0
        assert.strictEqual(result.price, 15); // Math.min(15, 20, 15, 18)
    });

    await t.test('formats a product with unlimited stock variants', () => {
        const product = {
            id: '3',
            name: 'Unlimited Product',
            basePrice: 10,
            variants: [
                { stockControl: true, stock: 5, price: 10 },
                { stockControl: false, stock: 0, price: 10 }, // Unlimited
                { stockControl: true, stock: 10, price: 10 }
            ]
        };

        const result = formatProductForTable(product);

        assert.strictEqual(result.stock, 'Ilimitado');
    });

    await t.test('calculates the minimum price among basePrice and variants', () => {
        const product = {
            id: '4',
            name: 'Price Product',
            basePrice: 50,
            variants: [
                { price: 60, stockControl: true, stock: 1 },
                { price: 40, stockControl: true, stock: 1 }, // min is here
                { price: 55, stockControl: true, stock: 1 }
            ]
        };

        const result = formatProductForTable(product);

        assert.strictEqual(result.price, 40);
    });

    await t.test('uses the first image if images array is present and not empty', () => {
        const product = {
            id: '5',
            name: 'Image Product',
            basePrice: 10,
            images: ['https://example.com/image1.png', 'https://example.com/image2.png']
        };

        const result = formatProductForTable(product);

        assert.strictEqual(result.image, 'https://example.com/image1.png');
    });

    await t.test('uses placeholder if images array is empty', () => {
        const product = {
            id: '6',
            name: 'No Image Product',
            basePrice: 10,
            images: []
        };

        const result = formatProductForTable(product);

        assert.strictEqual(result.image, 'https://placehold.co/600x400/27272a/ffffff?text=Sin+Imagen');
    });
});
