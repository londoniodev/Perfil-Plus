const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function processFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

    let content = fs.readFileSync(filePath, 'utf-8');

    // Check if the file imports TENANT_ID
    if (!content.includes('TENANT_ID')) return;
    if (!content.includes('import') || !content.includes('@/lib/config')) return;

    // 1. Remove TENANT_ID from the import statement
    content = content.replace(/,\s*TENANT_ID/, '');
    content = content.replace(/TENANT_ID\s*,/, '');
    content = content.replace(/{\s*TENANT_ID\s*}/, '{}');

    // 2. Add full import for useTenant if not present
    if (!content.includes('useTenant')) {
        const importMatch = content.match(/import\s+.*[;'"]/);
        if (importMatch) {
            // insert right after the first import match
            content = content.replace(importMatch[0], `${importMatch[0]}\nimport { useTenant } from "@/app/providers";`);
        }
    }

    // 3. To find where to insert `const { tenantId } = useTenant();`, we'll find the first `export function` or `export const` or `export default function` that contains a component definition.
    // This is simple: find `export function ComponentName(` or `export default function ComponentName(`
    // or const ComponentName = () => {
    // and inject it right after the { 

    const componentRegex = /(export\s+(?:default\s+)?function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*(?::\s*[A-Za-z<>]+\s*)?{)|(export\s+const\s+[A-Za-z0-9_]+\s*=\s*(?:React\.forwardRef)?\s*\([^)]*\)\s*(?::\s*[A-Za-z<>]+\s*)?=>\s*{)/;

    const match = content.match(componentRegex);
    if (match) {
        content = content.replace(match[0], `${match[0]}\n    const { tenantId } = useTenant();\n`);
    } else {
        console.log(`Could not find component signature in ${filePath}`);
    }

    // 4. Replace all TENANT_ID with tenantId
    content = content.replace(/\bTENANT_ID\b/g, 'tenantId');

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${filePath}`);
}

walkDir(path.join(__dirname, '../apps/_template/src/components'), processFile);
