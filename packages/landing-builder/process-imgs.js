const sharp = require('sharp');
const path = require('path');

const inputDir = 'c:/Users/Pc/Desktop/ALVARO/REPOSITORIOS/Web Projects/packages/landing-builder/nuevas imagenes';
const outputDir = 'c:/Users/Pc/Desktop/ALVARO/REPOSITORIOS/Web Projects/packages/landing-builder/.local-landings/mauromera/home/assets';

const images = [
    { name: 'hero(1-1).jpg', output: 'hero-premium.webp', width: 1600 },
    { name: 'sobre mauro (4-5).jpg', output: 'sobre-mauro-premium.webp', width: 1200 }
];

async function process() {
    for (const img of images) {
        const inputPath = path.join(inputDir, img.name);
        const outputPath = path.join(outputDir, img.output);
        console.log(`Optimizing ${img.name}...`);
        await sharp(inputPath)
            .resize(img.width) // Resize for web
            .webp({ quality: 70, effort: 6 }) // Aggressive optimization
            .toFile(outputPath);
    }
    console.log('Done!');
}

process().catch(console.error);
