const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(filePath));
        } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
            results.push(filePath);
        }
    });
    return results;
}

const files = walk('apps/saas_dashboard/src');
let changed = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace href="/admin/..." with href="/..."
    content = content.replace(/href=\"\/admin\/([^\"]*)\"/g, 'href=\"/$1\"');
    // Replace href="/admin" with href="/"
    content = content.replace(/href=\"\/admin\"/g, 'href=\"/\"');

    // Replace router.push("/admin/...")
    content = content.replace(/router\.push\(\"\/admin\/([^\"]*)\"\)/g, 'router.push(\"/$1\")');
    // Replace router.push("/admin")
    content = content.replace(/router\.push\(\"\/admin\"\)/g, 'router.push(\"/\")');

    // Replace redirect("/admin/...")
    content = content.replace(/redirect\(\"\/admin\/([^\"]*)\"\)/g, 'redirect(\"/$1\")');
    // Replace redirect("/admin")
    content = content.replace(/redirect\(\"\/admin\"\)/g, 'redirect(\"/\")');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changed++;
        console.log('Updated: ' + file);
    }
});
console.log('Total files updated: ' + changed);
