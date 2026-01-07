/**
 * Script para optimizar los logos de clientes
 * - Reduce el tamaño a max 150px de altura
 * - Quita el fondo negro (convierte negro a transparente)
 * - Convierte a WebP con calidad 80%
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, '../public/clients_logo');
const outputDir = path.join(__dirname, '../public/clients_logo_optimized');

// Crear carpeta de salida si no existe
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function optimizeLogo(inputPath, outputPath) {
    const filename = path.basename(inputPath);

    try {
        // Leer la imagen y obtener metadata
        const image = sharp(inputPath);
        const metadata = await image.metadata();

        // Redimensionar manteniendo aspect ratio con max altura de 300px
        const resizedImage = image.resize({
            height: 300,
            fit: 'inside',
            withoutEnlargement: true
        });

        // Obtener raw pixels para manipular el fondo
        const { data, info } = await resizedImage
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        // Convertir negro/casi-negro a transparente
        // Threshold para considerar como negro: RGB < 30
        const threshold = 30;
        const pixels = new Uint8Array(data);

        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];

            // Si es negro o muy oscuro, hacer transparente
            if (r < threshold && g < threshold && b < threshold) {
                pixels[i + 3] = 0; // Alpha = 0 (transparente)
            }
        }

        // Guardar como WebP con fondo transparente
        await sharp(Buffer.from(pixels), {
            raw: {
                width: info.width,
                height: info.height,
                channels: 4
            }
        })
            .webp({ quality: 90 })
            .toFile(outputPath);

        const inputStats = fs.statSync(inputPath);
        const outputStats = fs.statSync(outputPath);
        const reduction = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

        console.log(`✓ ${filename} -> ${path.basename(outputPath)} (${reduction}% reduction)`);

    } catch (error) {
        console.error(`✗ Error processing ${filename}:`, error.message);
    }
}

async function main() {
    console.log('🚀 Starting logo optimization...\n');

    const files = fs.readdirSync(inputDir).filter(f =>
        f.toLowerCase().endsWith('.png') ||
        f.toLowerCase().endsWith('.jpg') ||
        f.toLowerCase().endsWith('.jpeg')
    );

    console.log(`Found ${files.length} images to process\n`);

    for (const file of files) {
        const inputPath = path.join(inputDir, file);
        const outputFilename = path.parse(file).name + '.webp';
        const outputPath = path.join(outputDir, outputFilename);
        await optimizeLogo(inputPath, outputPath);
    }

    console.log('\n✅ Optimization complete!');

    // Mostrar resumen
    const inputTotal = files.reduce((acc, f) =>
        acc + fs.statSync(path.join(inputDir, f)).size, 0
    );
    const outputFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.webp'));
    const outputTotal = outputFiles.reduce((acc, f) =>
        acc + fs.statSync(path.join(outputDir, f)).size, 0
    );

    console.log(`\n📊 Summary:`);
    console.log(`   Input: ${(inputTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Output: ${(outputTotal / 1024).toFixed(2)} KB`);
    console.log(`   Total reduction: ${((1 - outputTotal / inputTotal) * 100).toFixed(1)}%`);
}

main().catch(console.error);
