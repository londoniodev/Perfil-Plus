import { promises as fs } from 'fs';
import path from 'path';

const DIR = '../../apps/_template/src/components/storefronts/_legacy/deborahmoscoso';

async function processDirectory(dir) {
    const files = await fs.readdir(dir, { withFileTypes: true });
    
    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            await processDirectory(fullPath);
        } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
            let content = await fs.readFile(fullPath, 'utf8');
            let modified = false;

            if (content.includes('motion.')) {
                content = content.replace(/<motion\./g, '<');
                content = content.replace(/<\/motion\./g, '</');
                modified = true;
            }
            if (content.includes('import { motion }')) {
                // remove the import
                content = content.replace(/import\s*{\s*motion\s*}\s*from\s*['"]framer-motion['"];?/g, '');
                modified = true;
            }
            if (content.includes('import { motion,')) {
                content = content.replace(/motion,\s*/g, '');
                modified = true;
            }

            if (modified) {
                await fs.writeFile(fullPath, content, 'utf8');
                console.log(`✅ Stripped motion from ${file.name}`);
            }
        }
    }
}

processDirectory(path.resolve(process.cwd(), DIR)).catch(console.error);
