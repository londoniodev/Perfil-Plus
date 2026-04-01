const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'apps', 'api', 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(srcDir);
let changedFiles = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content;

    // 1. Migrate this.prisma.secure -> this.prisma
    newContent = newContent.replace(/this\.prisma\.secure/g, 'this.prisma');
    // Also catch '(this.prisma.secure as any)'
    newContent = newContent.replace(/\(this\.prisma\.secure as any\)/g, '(this.prisma as any)');
    newContent = newContent.replace(/this\.prisma\._tenantClient/g, 'this.prisma');
    
    // 2. Migrate this.prisma.raw -> this.prisma.unscoped
    newContent = newContent.replace(/this\.prisma\.raw/g, 'this.prisma.unscoped');

    // For tests where they mock mockPrisma.secure -> mockPrisma
    newContent = newContent.replace(/mockPrisma\.secure/g, 'mockPrisma');

    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        changedFiles++;
        console.log(`Updated ${file}`);
    }
}

console.log(`Successfully updated ${changedFiles} files in apps/api/src.`);
