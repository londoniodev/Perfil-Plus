const fs = require('fs');
const path = require('path');

const directory = 'c:/Users/Pc/Desktop/ALVARO/REPOSITORIOS/Web Projects/apps/saas_dashboard/src';

function walk(dir, callback) {
    fs.readdirSync(dir).forEach( f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
};

const patterns = [
    // Remove property from object literal (with trailing comma)
    /['"]x-tenant-id['"]:\s*[^,}\n]+,\s*/g,
    // Remove property from object literal (not trailing)
    /,\s*['"]x-tenant-id['"]:\s*[^}\n]+/g,
    // Handle single property objects: headers: { 'x-tenant-id': ... } -> headers: {}
    /headers:\s*{\s*['"]x-tenant-id['"]:\s*[^}\n]+\s*}/g,
    // Handle specific cases in AuthContext or others
    /const headers: HeadersInit = { 'x-tenant-id': TENANT_ID };/g
];

walk(directory, (filePath) => {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        patterns.forEach(pattern => {
            if (pattern.source === 'headers:\\s*{\\s*[\'"]x-tenant-id[\'"]:\\s*[^}\\n]+\\s*}') {
                content = content.replace(pattern, 'headers: {}');
            } else if (pattern.source === 'const headers: HeadersInit = { \'x-tenant-id\': TENANT_ID };') {
                 content = content.replace(pattern, 'const headers: HeadersInit = {};');
            } else {
                content = content.replace(pattern, '');
            }
        });

        if (content !== originalContent) {
            console.log(`Updated: ${filePath}`);
            fs.writeFileSync(filePath, content, 'utf8');
        }
    }
});
